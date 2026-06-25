"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { updatePageStatus } from "./actions";

const STATUSES = [
  { value: "todo", label: "À faire", active: "bg-blue-500 text-white shadow" },
  { value: "doing", label: "En cours", active: "bg-amber-500 text-white shadow" },
  { value: "done", label: "Fini", active: "bg-emerald-500 text-white shadow" },
];

export default function StatusSelector({
  pageId,
  current,
}: {
  pageId: string;
  current: string;
}) {
  const [status, setStatus] = useState(current);

  function choose(value: string) {
    setStatus(value);
    updatePageStatus(pageId, value);
  }

  return (
    <div className="flex gap-2">
      {STATUSES.map((s) => (
        <motion.button
          key={s.value}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => choose(s.value)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition ${
            status === s.value ? s.active : "text-stone-500 hover:bg-stone-100"
          }`}
        >
          {s.label}
        </motion.button>
      ))}
    </div>
  );
}