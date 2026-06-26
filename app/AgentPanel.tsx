"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";

type LogItem = { kind: "action" | "message" | "error"; text: string };

const SUGGESTIONS = [
  "Prépare-moi un espace pour organiser un voyage au Japon",
  "Crée un espace pour lancer un podcast",
  "Range mes pages sur le tableau Kanban",
];

export default function AgentPanel() {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState<LogItem[]>([]);
  const router = useRouter();
  const logEndRef = useRef<HTMLDivElement>(null);

  function pushLog(item: LogItem) {
    setLog((prev) => [...prev, item]);
    // Laisse le DOM se mettre à jour avant de scroller en bas.
    requestAnimationFrame(() =>
      logEndRef.current?.scrollIntoView({ behavior: "smooth" })
    );
  }

  async function run(message: string) {
    const text = message.trim();
    if (!text || running) return;
    setRunning(true);
    setLog([{ kind: "message", text: `Toi : ${text}` }]);
    setPrompt("");

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null);
        pushLog({ kind: "error", text: data?.error ?? "L'agent n'a pas pu démarrer." });
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const evt = JSON.parse(line);
          if (evt.type === "action") pushLog({ kind: "action", text: evt.label });
          else if (evt.type === "message") pushLog({ kind: "message", text: evt.text });
          else if (evt.type === "error") pushLog({ kind: "error", text: evt.text });
          else if (evt.type === "done") router.refresh();
        }
      }
    } catch {
      pushLog({ kind: "error", text: "Connexion interrompue avec l'agent." });
    } finally {
      setRunning(false);
      router.refresh();
    }
  }

  return (
    <>
      {/* Lanceur flottant */}
      <motion.button
        type="button"
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Ouvrir l'agent IA"
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
      >
        <span className="text-base leading-none">✨</span>
        <span className="hidden sm:inline">Agent IA</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-none"
            />
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className="fixed inset-x-3 bottom-3 z-50 flex max-h-[80vh] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:inset-x-auto sm:right-5 sm:bottom-20 sm:w-[26rem]"
            >
              {/* En-tête */}
              <div className="flex items-center justify-between bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] px-4 py-3 text-white">
                <div className="flex items-center gap-2">
                  <span className="text-lg leading-none">✨</span>
                  <div>
                    <p className="text-sm font-semibold leading-tight">Agent IA</p>
                    <p className="text-xs text-white/80 leading-tight">
                      Décris un objectif, il construit ton espace
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Fermer"
                  className="rounded-lg px-2 py-1 text-white/80 transition hover:bg-white/15 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Journal des actions */}
              <div className="flex-1 overflow-y-auto px-4 py-3 text-sm text-stone-700">
                {log.length === 0 ? (
                  <div className="py-2">
                    <p className="text-stone-500">
                      Essaie l&apos;une de ces idées :
                    </p>
                    <div className="mt-2 flex flex-col gap-2">
                      {SUGGESTIONS.map((s) => (
                        <button
                          key={s}
                          onClick={() => run(s)}
                          disabled={running}
                          className="rounded-lg border border-stone-200 px-3 py-2 text-left text-stone-700 transition hover:border-[var(--accent)] hover:bg-stone-50 disabled:opacity-50"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {log.map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={
                          item.kind === "error"
                            ? "rounded-lg bg-red-50 px-3 py-2 text-red-700"
                            : item.kind === "message"
                              ? "px-1 py-1 text-stone-800"
                              : "rounded-lg bg-stone-50 px-3 py-1.5 font-medium text-stone-700"
                        }
                      >
                        {item.text}
                      </motion.div>
                    ))}
                    {running && (
                      <div className="flex items-center gap-2 px-1 py-1 text-stone-400">
                        <motion.span
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.1, repeat: Infinity }}
                        >
                          ●
                        </motion.span>
                        L&apos;agent travaille…
                      </div>
                    )}
                    <div ref={logEndRef} />
                  </div>
                )}
              </div>

              {/* Saisie */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  run(prompt);
                }}
                className="flex items-center gap-2 border-t border-stone-100 p-3"
              >
                <input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={running}
                  placeholder="Que veux-tu créer ?"
                  className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-800 outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={running || !prompt.trim()}
                  className="rounded-lg bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:shadow-md disabled:opacity-50"
                >
                  {running ? "…" : "Go"}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
