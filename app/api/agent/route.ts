import Anthropic from "@anthropic-ai/sdk";
import { agentTools, runAgentTool } from "@/lib/agentTools";

// L'agent tourne côté serveur (Node) car il écrit dans la base via Prisma.
export const runtime = "nodejs";
export const maxDuration = 60;

const SYSTEM = `Tu es l'agent IA de « My Notion », un clone de Notion. Tu pilotes directement l'espace de travail de l'utilisateur grâce à tes outils : créer des pages et sous-pages, écrire leur contenu, et les ranger sur un tableau Kanban (le statut d'une page = sa colonne : "todo" = À faire, "doing" = En cours, "done" = Fini).

Règles :
- Réponds et écris TOUJOURS en français.
- C'est une démo bac à sable réinitialisée chaque jour : agis directement, ne demande jamais de confirmation.
- Avant de modifier des pages existantes, appelle list_pages pour connaître leur id et leur état.
- Donne des icônes (emoji) pertinentes aux pages que tu crées.
- Pour un espace de travail, crée une page principale puis des sous-pages cohérentes, écris un contenu utile et concret, et place chaque page dans la bonne colonne du Kanban.
- Ne fabrique pas d'id : utilise ceux renvoyés par create_page ou list_pages.
- Termine par UN court message (1 à 2 phrases) qui résume ce que tu as fait. Sois concis, n'expose pas ton raisonnement.`;

type StreamEvent =
  | { type: "action"; label: string }
  | { type: "message"; text: string }
  | { type: "error"; text: string }
  | { type: "done" };

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "Clé API manquante : ajoute ANTHROPIC_API_KEY dans .env.local." },
      { status: 500 }
    );
  }

  let prompt = "";
  try {
    const body = await request.json();
    prompt = String(body?.prompt ?? "").slice(0, 2000);
  } catch {
    return Response.json({ error: "Requête invalide." }, { status: 400 });
  }
  if (!prompt.trim()) {
    return Response.json({ error: "Message vide." }, { status: 400 });
  }

  const client = new Anthropic();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: StreamEvent) =>
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));

      try {
        const messages: Anthropic.MessageParam[] = [
          { role: "user", content: prompt },
        ];

        // Boucle agentique : on laisse Claude enchaîner les appels d'outils.
        for (let step = 0; step < 16; step++) {
          const response = await client.messages.create({
            model: "claude-opus-4-8",
            max_tokens: 2048,
            output_config: { effort: "low" },
            system: SYSTEM,
            tools: agentTools,
            messages,
          });

          messages.push({ role: "assistant", content: response.content });

          // On diffuse le texte éventuel de ce tour.
          for (const block of response.content) {
            if (block.type === "text" && block.text.trim()) {
              send({ type: "message", text: block.text });
            }
          }

          if (response.stop_reason !== "tool_use") break;

          // On exécute chaque outil demandé, en diffusant l'action vers l'UI.
          const toolResults: Anthropic.ToolResultBlockParam[] = [];
          for (const block of response.content) {
            if (block.type !== "tool_use") continue;
            const { result, label } = await runAgentTool(
              block.name,
              (block.input ?? {}) as Record<string, unknown>
            );
            send({ type: "action", label });
            toolResults.push({
              type: "tool_result",
              tool_use_id: block.id,
              content: JSON.stringify(result),
            });
          }
          messages.push({ role: "user", content: toolResults });
        }

        send({ type: "done" });
      } catch (err) {
        console.error("Agent error:", err);
        send({
          type: "error",
          text:
            err instanceof Anthropic.APIError
              ? `Erreur API (${err.status}) : ${err.message}`
              : "Une erreur est survenue pendant l'exécution de l'agent.",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
