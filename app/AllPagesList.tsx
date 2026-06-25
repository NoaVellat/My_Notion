"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { deletePages } from "./actions";
import CreatePageModal from "./CreatePageModal";

type Page = {
  id: string;
  title: string;
  icon: string | null;
  status: string;
};

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  todo: { label: "À faire", color: "bg-blue-100 text-blue-700" },
  doing: { label: "En cours", color: "bg-amber-100 text-amber-700" },
  done: { label: "Fini", color: "bg-emerald-100 text-emerald-700" },
};

export default function AllPagesList({ pages }: { pages: Page[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === pages.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(pages.map((p) => p.id)));
    }
  }

  async function handleDelete() {
    setLoading(true);
    await deletePages(Array.from(selected));
    setSelected(new Set());
    setConfirming(false);
    setLoading(false);
    router.refresh();
  }

  const allChecked = pages.length > 0 && selected.size === pages.length;

  // État vide : une invitation soignée plutôt qu'une page blanche.
  if (pages.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 22 }}
        className="flex flex-col items-center rounded-2xl border border-dashed border-white/20 bg-white/5 px-6 py-14 text-center backdrop-blur-sm"
      >
        <div className="text-5xl">🗂️</div>
        <h2 className="mt-4 text-xl font-semibold text-white">
          Aucune page pour l&apos;instant
        </h2>
        <p className="mt-2 max-w-sm text-sm text-[var(--text-muted)]">
          Crée ta première page pour commencer à écrire et l&apos;organiser sur
          le tableau.
        </p>
        <div className="mt-6">
          <CreatePageModal />
        </div>
      </motion.div>
    );
  }

  return (
    <div>
      {/* Barre du haut : tout sélectionner + compteur */}
      <div className="flex items-center justify-between border-b border-white/20 pb-3">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-white">
          <input
            type="checkbox"
            checked={allChecked}
            onChange={toggleAll}
            className="h-4 w-4 accent-[var(--accent)]"
          />
          Tout sélectionner
        </label>
        <span className="text-sm text-[var(--text-muted)]">
          {pages.length} page{pages.length > 1 ? "s" : ""}
        </span>
      </div>

      {/* La liste */}
      <div className="mt-2 flex flex-col">
        {pages.map((p) => {
          const isChecked = selected.has(p.id);
          const status = STATUS_LABEL[p.status] ?? STATUS_LABEL.todo;
          return (
            <div
              key={p.id}
              className={`flex items-center gap-4 rounded-lg px-3 py-4 transition ${
                isChecked ? "bg-white/20" : "hover:bg-white/10"
              }`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => toggle(p.id)}
                className="h-5 w-5 shrink-0 accent-[var(--accent)]"
              />
              <button
                onClick={() => router.push(`/pages/${p.id}`)}
                className="flex flex-1 items-center gap-3 text-left"
              >
                <span className="shrink-0 text-2xl">{p.icon ?? "📄"}</span>
                <span className="truncate text-lg font-medium text-white">
                  {p.title}
                </span>
              </button>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${status.color}`}
              >
                {status.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Barre d'actions flottante */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-4 rounded-full bg-stone-900 px-5 py-3 text-white shadow-2xl"
          >
            <span className="text-sm font-medium">
              {selected.size} sélectionnée{selected.size > 1 ? "s" : ""}
            </span>
            <button
              onClick={() => setSelected(new Set())}
              className="text-sm text-stone-300 transition hover:text-white"
            >
              Annuler
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setConfirming(true)}
              className="rounded-full bg-red-500 px-4 py-1.5 text-sm font-medium transition hover:bg-red-600"
            >
              🗑 Supprimer
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* La confirmation */}
      <AnimatePresence>
        {confirming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirming(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
            >
              <div className="text-4xl">🗑</div>
              <h2 className="mt-3 text-lg font-bold text-stone-900">
                Supprimer {selected.size} page{selected.size > 1 ? "s" : ""} ?
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                Cette action est définitive. Les sous-pages éventuelles seront
                aussi supprimées.
              </p>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => setConfirming(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-stone-500 transition hover:bg-stone-100"
                >
                  Annuler
                </button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleDelete}
                  disabled={loading}
                  className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-red-600 disabled:opacity-60"
                >
                  {loading ? "Suppression…" : "Supprimer"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}