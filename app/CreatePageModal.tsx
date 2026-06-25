"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { createPageWithDetails } from "./actions";

const EMOJIS = ["📄", "📝", "✅", "💡", "🎯", "📌", "🚀", "⭐", "🔥", "❤️"];

const STATUSES = [
  { value: "todo", label: "À faire", active: "bg-blue-500 text-white" },
  { value: "doing", label: "En cours", active: "bg-amber-500 text-white" },
  { value: "done", label: "Fini", active: "bg-emerald-500 text-white" },
];

export default function CreatePageModal() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("📄");
  const [status, setStatus] = useState("todo");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleCreate() {
    setLoading(true);
    const id = await createPageWithDetails(title, icon, status);
    setOpen(false);
    setLoading(false);
    setTitle("");
    setIcon("📄");
    setStatus("todo");
    router.push(`/pages/${id}`);
  }

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/30 transition hover:shadow-xl hover:brightness-110"
      >
        + Créer une page
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            >
              <h2 className="text-lg font-bold text-stone-900">Nouvelle page</h2>
              <p className="mt-1 text-sm text-stone-500">
                Donne-lui un nom et un style.
              </p>

              <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-stone-400">
                Nom
              </label>
              <input
                autoFocus
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                }}
                placeholder="Sans titre"
                className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
              />

              <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-stone-400">
                Icône
              </label>
              <div className="mt-1 flex flex-wrap gap-1">
                {EMOJIS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setIcon(e)}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg transition ${
                      icon === e
                        ? "bg-indigo-100 ring-2 ring-indigo-400"
                        : "hover:bg-stone-100"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>

              <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-stone-400">
                Statut
              </label>
              <div className="mt-1 flex gap-2">
                {STATUSES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setStatus(s.value)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                      status === s.value
                        ? s.active
                        : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-stone-500 transition hover:bg-stone-100"
                >
                  Annuler
                </button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={handleCreate}
                  disabled={loading}
                  className="rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:shadow-md disabled:opacity-60"
                >
                  {loading ? "Création…" : "Créer la page"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}