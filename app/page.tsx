"use client";

import Link from "next/link";
import { motion } from "motion/react";
import CreatePageModal from "./CreatePageModal";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 22 } },
};

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 py-16 text-center md:px-12">
      <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col items-center">
        {/* Badge "démo" */}
        <motion.span
          variants={item}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-medium text-indigo-100 backdrop-blur-sm"
        >
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Démo libre — tout est réinitialisé chaque jour
        </motion.span>

        <motion.div
          variants={item}
          whileHover={{ rotate: [0, -12, 12, 0] }}
          transition={{ duration: 0.6 }}
          className="text-6xl md:text-7xl"
        >
          👋
        </motion.div>

        <motion.h1
          variants={item}
          className="mt-4 bg-gradient-to-r from-[var(--text)] via-white to-[var(--accent)] bg-clip-text text-3xl font-bold text-transparent drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)] md:text-5xl"
        >
          Bienvenue dans My Notion
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-3 max-w-md text-base text-[var(--text-muted)] md:text-lg"
        >
          Voici mon Notion fais maison : crée des pages, écris librement avec un éditeur
          riche, organise tout sur un tableau Kanban — le tout dans une interface
          fluide et animée.
        </motion.p>

        <motion.div
          variants={item}
          className="mt-8 flex flex-col items-center gap-3 sm:flex-row"
        >
          <CreatePageModal />
          <Link
            href="/board"
            className="rounded-xl border border-white/15 bg-white/10 px-5 py-2.5 text-sm font-medium text-white shadow-sm backdrop-blur-sm transition hover:bg-white/20 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            📋 Voir le tableau
          </Link>
        </motion.div>

        <motion.div variants={item}>
          <Link
            href="/all"
            className="mt-5 inline-block text-sm text-[var(--text-muted)] underline-offset-4 transition hover:text-white hover:underline"
          >
            Ou parcourir toutes mes pages →
          </Link>
        </motion.div>
      </motion.div>
    </main>
  );
}
