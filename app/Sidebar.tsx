"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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
function PageRow({
  page,
  depth,
  onNavigate,
}: {
  page: Page;
  depth: number;
  onNavigate: () => void;
}) {
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
          onClick={onNavigate}
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
              <PageRow
                key={child.id}
                page={child}
                depth={depth + 1}
                onNavigate={onNavigate}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Le contenu interne, partagé entre la version bureau et le tiroir mobile.
function SidebarContent({
  pages,
  onNavigate,
}: {
  pages: Page[];
  onNavigate: () => void;
}) {
  const pathname = usePathname();

  function navClass(active: boolean) {
    return `flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition active:scale-[0.97] ${
      active
        ? "bg-white/10 font-medium text-white shadow-sm"
        : "text-[var(--text-muted)] hover:bg-white/5 hover:text-white"
    }`;
  }

  return (
    <>
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
        <Link href="/" onClick={onNavigate} className={navClass(pathname === "/")}>
          <span className="text-base leading-none">🏠</span>
          Accueil
        </Link>
        <Link
          href="/board"
          onClick={onNavigate}
          className={navClass(pathname === "/board")}
        >
          <span className="text-base leading-none">📋</span>
          Tableau
        </Link>
        <Link
          href="/all"
          onClick={onNavigate}
          className={navClass(pathname === "/all")}
        >
          <span className="text-base leading-none">🗂</span>
          Toutes mes pages
        </Link>
      </nav>

      <p className="mt-4 px-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
        Pages
      </p>

      <nav className="mt-1 flex flex-col gap-0.5">
        {pages.length === 0 ? (
          <div className="mt-1 rounded-lg border border-dashed border-white/15 px-3 py-4 text-center">
            <p className="text-sm font-medium text-white">Aucune page</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Clique sur « Nouvelle page » pour commencer ✨
            </p>
          </div>
        ) : (
          pages.map((p) => (
            <PageRow key={p.id} page={p} depth={0} onNavigate={onNavigate} />
          ))
        )}
      </nav>
    </>
  );
}

export default function Sidebar({ pages }: { pages: Page[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [prevPath, setPrevPath] = useState(pathname);

  // Sur mobile, on referme le tiroir dès qu'on change de page.
  // (Ajustement d'état pendant le rendu, motif recommandé par React.)
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setOpen(false);
  }

  // On empêche le défilement de l'arrière-plan quand le tiroir est ouvert.
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  return (
    <>
      {/* Bouton hamburger : visible seulement sur mobile, fixé en haut à gauche */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={open}
        className="fixed left-3 top-3 z-50 flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] text-lg text-white shadow-lg backdrop-blur-xl md:hidden"
      >
        {open ? "✕" : "☰"}
      </button>

      {/* Version bureau : barre latérale classique, masquée sur mobile */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-[var(--surface-border)] bg-[var(--surface)] p-2 backdrop-blur-xl transition-colors duration-700 md:flex">
        <SidebarContent pages={pages} onNavigate={() => {}} />
      </aside>

      {/* Version mobile : tiroir animé + voile semi-transparent */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="scrollbar-slim fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col overflow-y-auto border-r border-[var(--surface-border)] bg-[var(--surface)] p-2 pt-16 backdrop-blur-xl md:hidden"
            >
              <SidebarContent pages={pages} onNavigate={() => setOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
