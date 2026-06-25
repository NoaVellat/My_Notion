"use client";

import { motion } from "motion/react";
import CreatePageModal from "./CreatePageModal";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-12 text-center">
      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="text-6xl"
      >
        👋
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-4 bg-gradient-to-r from-[var(--text)] via-white to-[var(--accent)] bg-clip-text text-3xl font-bold text-transparent drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]"
      >
        Bienvenue dans My Notion
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className="mt-2 text-[var(--text-muted)]"
      >
        Choisis une page à gauche, ou commence une nouvelle page.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.26 }}
        className="mt-8"
      >
        <CreatePageModal />
      </motion.div>
    </main>
  );
}