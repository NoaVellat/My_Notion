import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@/app/generated/prisma/client";
import type Anthropic from "@anthropic-ai/sdk";

const DEMO_EMAIL = "test@exemple.com";

const STATUS_LABEL: Record<string, string> = {
  todo: "À faire",
  doing: "En cours",
  done: "Fini",
};

async function demoUser() {
  return prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {},
    create: { email: DEMO_EMAIL, name: "Moi" },
  });
}

// Transforme du texte simple (avec quelques marques markdown) en blocs BlockNote.
function textToBlocks(text: string): Prisma.InputJsonValue {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const blocks = lines.map((raw) => {
    const line = raw.trimEnd();
    const block = (
      type: "paragraph" | "heading" | "bulletListItem",
      content: string,
      props: Record<string, unknown> = {}
    ) => ({
      type,
      props,
      content: content ? [{ type: "text", text: content, styles: {} }] : [],
    });

    if (line.startsWith("### ")) return block("heading", line.slice(4), { level: 3 });
    if (line.startsWith("## ")) return block("heading", line.slice(3), { level: 2 });
    if (line.startsWith("# ")) return block("heading", line.slice(2), { level: 1 });
    if (line.startsWith("- ") || line.startsWith("* "))
      return block("bulletListItem", line.slice(2));
    return block("paragraph", line);
  });

  return (blocks.length > 0 ? blocks : [{ type: "paragraph", props: {}, content: [] }]) as Prisma.InputJsonValue;
}

// Les outils exposés à Claude (schémas JSON bruts — pas de dépendance supplémentaire).
export const agentTools: Anthropic.Tool[] = [
  {
    name: "list_pages",
    description:
      "Liste toutes les pages existantes de l'espace de travail (id, titre, statut, icône, parent). À appeler pour connaître l'état actuel avant de modifier ou organiser.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "create_page",
    description:
      "Crée une nouvelle page. Renvoie son id, à réutiliser pour écrire du contenu ou la ranger. Pour une sous-page, fournis parentId (l'id d'une page existante).",
    input_schema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Titre de la page" },
        icon: { type: "string", description: "Un emoji représentant la page, ex: 🚀" },
        status: {
          type: "string",
          enum: ["todo", "doing", "done"],
          description: "Colonne du Kanban : todo (À faire), doing (En cours), done (Fini)",
        },
        parentId: {
          type: "string",
          description: "Id de la page parente, pour créer une sous-page (optionnel)",
        },
      },
      required: ["title"],
    },
  },
  {
    name: "write_page_content",
    description:
      "Écrit (remplace) le contenu d'une page. 'content' est du texte simple : '# Titre', '## Sous-titre', '- puce' sont reconnus.",
    input_schema: {
      type: "object",
      properties: {
        pageId: { type: "string", description: "Id de la page à remplir" },
        content: { type: "string", description: "Le contenu en texte simple / markdown léger" },
      },
      required: ["pageId", "content"],
    },
  },
  {
    name: "set_page_status",
    description: "Déplace une page dans une colonne du Kanban en changeant son statut.",
    input_schema: {
      type: "object",
      properties: {
        pageId: { type: "string" },
        status: { type: "string", enum: ["todo", "doing", "done"] },
      },
      required: ["pageId", "status"],
    },
  },
  {
    name: "delete_page",
    description: "Supprime une page (et ses sous-pages). À utiliser avec parcimonie.",
    input_schema: {
      type: "object",
      properties: { pageId: { type: "string" } },
      required: ["pageId"],
    },
  },
];

export type ToolOutcome = { result: unknown; label: string };

// Exécute un outil et renvoie le résultat (pour Claude) + un libellé lisible (pour l'UI).
export async function runAgentTool(
  name: string,
  input: Record<string, unknown>
): Promise<ToolOutcome> {
  const user = await demoUser();

  switch (name) {
    case "list_pages": {
      const pages = await prisma.page.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "asc" },
        select: { id: true, title: true, icon: true, status: true, parentId: true },
      });
      return { result: { pages }, label: `🔍 Lecture de l'espace (${pages.length} page${pages.length > 1 ? "s" : ""})` };
    }

    case "create_page": {
      const title = String(input.title ?? "").trim() || "Nouvelle page";
      const status = ["todo", "doing", "done"].includes(String(input.status))
        ? String(input.status)
        : "todo";
      const parentId = input.parentId ? String(input.parentId) : null;
      const page = await prisma.page.create({
        data: {
          title,
          icon: input.icon ? String(input.icon) : null,
          status,
          parentId,
          userId: user.id,
        },
      });
      revalidatePath("/");
      const kind = parentId ? "Sous-page" : "Page";
      return {
        result: { ok: true, pageId: page.id, title },
        label: `✅ ${kind} « ${page.icon ?? "📄"} ${title} » créée`,
      };
    }

    case "write_page_content": {
      const pageId = String(input.pageId);
      const page = await prisma.page.findUnique({ where: { id: pageId }, select: { title: true } });
      if (!page) return { result: { ok: false, error: "Page introuvable" }, label: "⚠️ Page introuvable" };
      await prisma.page.update({
        where: { id: pageId },
        data: { content: textToBlocks(String(input.content ?? "")) },
      });
      revalidatePath(`/pages/${pageId}`);
      return { result: { ok: true }, label: `✍️ Contenu écrit dans « ${page.title} »` };
    }

    case "set_page_status": {
      const pageId = String(input.pageId);
      const status = String(input.status);
      const page = await prisma.page.findUnique({ where: { id: pageId }, select: { title: true } });
      if (!page) return { result: { ok: false, error: "Page introuvable" }, label: "⚠️ Page introuvable" };
      await prisma.page.update({ where: { id: pageId }, data: { status } });
      revalidatePath("/");
      return {
        result: { ok: true },
        label: `📋 « ${page.title} » → ${STATUS_LABEL[status] ?? status}`,
      };
    }

    case "delete_page": {
      const pageId = String(input.pageId);
      const page = await prisma.page.findUnique({ where: { id: pageId }, select: { title: true } });
      if (!page) return { result: { ok: false, error: "Page introuvable" }, label: "⚠️ Page introuvable" };
      await prisma.page.delete({ where: { id: pageId } });
      revalidatePath("/");
      return { result: { ok: true }, label: `🗑 « ${page.title} » supprimée` };
    }

    default:
      return { result: { ok: false, error: `Outil inconnu: ${name}` }, label: `⚠️ Outil inconnu: ${name}` };
  }
}
