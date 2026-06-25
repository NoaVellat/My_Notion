"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { createPage } from "./actions";

type Page = {
  id: string;
  title: string;
  icon: string | null;
  status: string;
};

function dotColor(status: string) {
  if (status === "doing") return "bg-amber-500";
  if (status === "done") return "bg-emerald-500";
  return "bg-blue-500";
}

export default function Sidebar({ pages }: { pages: Page[] }) {
  const pathname = usePathname();

  // Style commun aux liens de navigation, selon qu'ils sont actifs ou non
  function navClass(active: boolean) {
    return `flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition active:scale-[0.97] ${
      active
        ? "bg-white font-medium text-indigo-700 shadow-sm"
        : "text-stone-600 hover:bg-indigo-200/60"
    }`;
  }

  return (
    <aside className="flex w-64 flex-col border-r border-indigo-200 bg-indigo-100 p-2">
      <div className="flex items-center gap-2 rounded-lg px-2 py-1.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white shadow-sm">
          M
        </span>
        <span className="text-sm font-semibold text-stone-800">My Notion</span>
      </div>

      <form action={createPage} className="mt-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          type="submit"
          className="flex w-full items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 px-2 py-1.5 text-sm font-medium text-white shadow-sm shadow-indigo-500/30 transition hover:shadow-md"
        >
          <span className="text-base leading-none">+</span>
          Nouvelle page
        </motion.button>
      </form>

      <nav className="mt-3 flex flex-col gap-0.5">
        <Link href="/" className={navClass(pathname === "/")}>
          <span className="text-base leading-none">🏠</span>
          Accueil
        </Link>
        <Link href="/board" className={navClass(pathname === "/board")}>
          <span className="text-base leading-none">📋</span>
          Tableau
        </Link>
        <Link href="/all" className={navClass(pathname === "/all")}>
          <span className="text-base leading-none">🗂</span>
          Toutes mes pages
        </Link>
      </nav>

      <p className="mt-4 px-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
        Pages
      </p>

      <nav className="mt-1 flex flex-col gap-0.5">
        {pages.length === 0 && (
          <p className="px-2 py-1.5 text-sm text-stone-400">Aucune page</p>
        )}
        {pages.map((p, i) => {
          const isActive = pathname === `/pages/${p.id}`;
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link href={`/pages/${p.id}`} className={navClass(isActive)}>
                <span className="text-base leading-none">{p.icon ?? "📄"}</span>
                <span className="flex-1 truncate">{p.title}</span>
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${dotColor(p.status)}`}
                />
              </Link>
            </motion.div>
          );
        })}
      </nav>
    </aside>
  );
}