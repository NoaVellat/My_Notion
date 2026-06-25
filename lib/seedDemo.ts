import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";

const DEMO_EMAIL = "test@exemple.com";

// Petit helper pour fabriquer un bloc de texte BlockNote (texte simple)
function textBlock(
  type: "paragraph" | "heading" | "bulletListItem",
  text: string,
  props: Prisma.InputJsonObject = {}
): Prisma.InputJsonValue {
  return {
    type,
    props,
    content: [{ type: "text", text, styles: {} }],
  };
}

/**
 * Réinitialise la base de démonstration :
 * - garantit l'existence de l'utilisateur de démo,
 * - efface toutes ses pages,
 * - recrée un jeu de pages soigné qui met en valeur les fonctionnalités.
 */
export async function seedDemo() {
  // 1. L'utilisateur de démo
  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {},
    create: { email: DEMO_EMAIL, name: "Moi" },
  });

  // 2. On repart d'une base propre pour cet utilisateur
  await prisma.page.deleteMany({ where: { userId: user.id } });

  // 3. Le jeu de pages de démonstration

  // Page "Bienvenue 👋"
  const bienvenueContent: Prisma.InputJsonValue = [
    textBlock("heading", "Bienvenue dans cette démo 👋", { level: 1 }),
    textBlock(
      "paragraph",
      "Ceci est une démo bac à sable : tu peux tout tester librement. La base se réinitialise automatiquement chaque jour, donc n'aie pas peur de tout casser !"
    ),
  ];
  await prisma.page.create({
    data: {
      title: "Bienvenue 👋",
      icon: "👋",
      status: "done",
      content: bienvenueContent,
      userId: user.id,
    },
  });

  // Page "Projet portfolio" 🚀
  const projetContent: Prisma.InputJsonValue = [
    textBlock("heading", "Projet portfolio", { level: 2 }),
    textBlock("bulletListItem", "Soigner la page d'accueil"),
    textBlock("bulletListItem", "Ajouter une démo interactive"),
  ];
  const projet = await prisma.page.create({
    data: {
      title: "Projet portfolio",
      icon: "🚀",
      status: "doing",
      content: projetContent,
      userId: user.id,
    },
  });

  // Sous-page "Idées en vrac" 💡 (rattachée au projet -> démontre l'arborescence)
  await prisma.page.create({
    data: {
      title: "Idées en vrac",
      icon: "💡",
      status: "todo",
      parentId: projet.id,
      userId: user.id,
    },
  });

  // Page "À explorer plus tard" 📌
  await prisma.page.create({
    data: {
      title: "À explorer plus tard",
      icon: "📌",
      status: "todo",
      userId: user.id,
    },
  });

  return { ok: true };
}
