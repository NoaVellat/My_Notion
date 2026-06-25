"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { updatePageStatus } from "./actions";

type Page = {
  id: string;
  title: string;
  icon: string | null;
  status: string;
};

const COLUMNS = [
  {
    value: "todo",
    label: "À faire",
    colBg: "bg-blue-100",
    headBar: "bg-blue-500",
    ring: "ring-blue-400",
    border: "border-blue-500",
    chip: "bg-blue-100",
  },
  {
    value: "doing",
    label: "En cours",
    colBg: "bg-amber-100",
    headBar: "bg-amber-500",
    ring: "ring-amber-400",
    border: "border-amber-500",
    chip: "bg-amber-100",
  },
  {
    value: "done",
    label: "Fini",
    colBg: "bg-emerald-100",
    headBar: "bg-emerald-500",
    ring: "ring-emerald-400",
    border: "border-emerald-500",
    chip: "bg-emerald-100",
  },
];

export default function Board({ initialPages }: { initialPages: Page[] }) {
  const [pages, setPages] = useState(initialPages);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const router = useRouter();

  function handleDrop(pageId: string | null, newStatus: string) {
    setDragOverCol(null);
    setDraggingId(null);
    if (!pageId) return;
    setPages((prev) =>
      prev.map((p) => (p.id === pageId ? { ...p, status: newStatus } : p))
    );
    updatePageStatus(pageId, newStatus);
  }

  return (
    <div className="scrollbar-slim flex snap-x snap-mandatory gap-4 overflow-x-auto p-4 md:snap-none md:p-8">
      {COLUMNS.map((col, i) => {
        const cards = pages.filter((p) => p.status === col.value);
        const isOver = dragOverCol === col.value;
        return (
          <motion.div
            key={col.value}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, type: "spring", stiffness: 300, damping: 24 }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverCol(col.value);
            }}
            onDragLeave={() =>
              setDragOverCol((c) => (c === col.value ? null : c))
            }
            onDrop={() => handleDrop(draggingId, col.value)}
            className={`flex w-[78vw] max-w-72 shrink-0 snap-start flex-col rounded-2xl p-3 transition-all sm:w-72 ${col.colBg} ${
              isOver ? `ring-4 ${col.ring} shadow-xl` : "shadow-sm"
            }`}
          >
            <div
              className={`mb-3 flex items-center justify-between rounded-xl px-3 py-2 ${col.headBar}`}
            >
              <span className="text-sm font-semibold text-white">
                {col.label}
              </span>
              <span className="rounded-full bg-white/25 px-2 py-0.5 text-xs font-semibold text-white">
                {cards.length}
              </span>
            </div>

            <div className="flex min-h-[60px] flex-col gap-2">
              <AnimatePresence>
                {cards.map((p) => (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{
                      opacity: draggingId === p.id ? 0.4 : 1,
                      y: 0,
                      scale: 1,
                    }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    whileHover={{ y: -6, scale: 1.05, rotate: -1.5 }}
                    whileTap={{ scale: 0.96 }}
                    draggable
                    onDragStart={() => setDraggingId(p.id)}
                    onDragEnd={() => {
                      setDraggingId(null);
                      setDragOverCol(null);
                    }}
                    onClick={() => router.push(`/pages/${p.id}`)}
                    className={`flex cursor-grab items-center gap-3 rounded-xl border-l-4 bg-white p-3 text-sm text-stone-700 shadow-sm active:cursor-grabbing ${col.border}`}
                  >
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-lg ${col.chip}`}
                    >
                      {p.icon ?? "📄"}
                    </span>
                    <span className="truncate font-medium">{p.title}</span>
                  </motion.div>
                ))}
              </AnimatePresence>

              {cards.length === 0 && (
                <p className="px-1 py-4 text-center text-xs text-stone-500">
                  Glisse une page ici
                </p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}