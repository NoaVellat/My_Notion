"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { createPage } from "./actions";

type Page = {
  id: string;
  title: string;
  icon: string | null;
  status: string;
  children?: Page[];
};

function dotColor(status: string) {
  if (status === "doing") return "bg-amber-500";
  if (status === "done") return "bg-emerald-500";
  return "bg-blue-500";
}

// Une ligne de page, qui sait afficher ses sous-pages
function PageRow({ page, depth }: { page: Page; depth: number }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = pathname === `/pages/${page.id}`;
  const hasChildren = page.children && page.children.length > 0;

  return (
    <div>
      <div
        className={`flex items-center gap-1 rounded-lg pr-2 text-sm transition ${
          isActive
            ? "bg-white/10 font-medium text-white shadow-sm"
            : "text-[var(--text-muted)] hover:bg-white/5 hover:text-white"
        }`}
        style={{ paddingLeft: `${depth * 14 + 4}px` }}
      >
        {/* La flèche pour déplier (seulement s'il y a des enfants) */}
        {hasChildren ? (
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[var(--text-muted)] hover:bg-white/10"
          >
            <motion.span animate={{ rotate: open ? 90 : 0 }} className="text-xs">
              ▶
            </motion.span>
          </button>
        ) : (
          <span className="w-5 shrink-0" />
        )}

        <Link
          href={`/pages/${page.id}`}
          className="flex flex-1 items-center gap-2 truncate py-1.5"
        >
          <span className="text-base leading-none">{page.icon ?? "📄"}</span>
          <span className="flex-1 truncate">{page.title}</span>
          <span className={`h-2 w-2 shrink-0 rounded-full ${dotColor(page.status)}`} />
        </Link>
      </div>

      {/* Les sous-pages, affichées quand c'est déplié */}
      <AnimatePresence>
        {open && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {page.children!.map((child) => (
              <PageRow key={child.id} page={child} depth={depth + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Sidebar({ pages }: { pages: Page[] }) {
  const pathname = usePathname();

  function navClass(active: boolean) {
    return `flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition active:scale-[0.97] ${
      active
        ? "bg-white/10 font-medium text-white shadow-sm"
        : "text-[var(--text-muted)] hover:bg-white/5 hover:text-white"
    }`;
  }

  return (
    <aside className="flex w-64 flex-col border-r border-[var(--surface-border)] bg-[var(--surface)] p-2 backdrop-blur-xl transition-colors duration-700">
      <div className="flex items-center gap-2 rounded-lg px-2 py-1.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] text-xs font-bold text-white shadow-sm">
          M
        </span>
        <span className="text-sm font-semibold text-white">My Notion</span>
      </div>

      <form action={createPage} className="mt-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          type="submit"
          className="flex w-full items-center gap-2 rounded-lg bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] px-2 py-1.5 text-sm font-medium text-white shadow-sm transition hover:shadow-md"
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

      <p className="mt-4 px-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
        Pages
      </p>

      <nav className="mt-1 flex flex-col gap-0.5">
        {pages.length === 0 && (
          <p className="px-2 py-1.5 text-sm text-[var(--text-muted)]">Aucune page</p>
        )}
        {pages.map((p) => (
          <PageRow key={p.id} page={p} depth={0} />
        ))}
      </nav>
    </aside>
  );
}