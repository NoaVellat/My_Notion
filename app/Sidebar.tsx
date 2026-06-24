"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createPage } from "./actions";

type Page = {
  id: string;
  title: string;
  icon: string | null;
};

export default function Sidebar({ pages }: { pages: Page[] }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 flex-col border-r border-stone-200 bg-stone-100 p-2">
      <div className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-stone-200">
        <span className="flex h-6 w-6 items-center justify-center rounded bg-stone-800 text-xs font-semibold text-white">
          M
        </span>
        <span className="text-sm font-medium text-stone-800">My Notion</span>
      </div>

      <form action={createPage} className="mt-1">
        <button
          type="submit"
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-stone-500 hover:bg-stone-200 hover:text-stone-800"
        >
          <span className="text-base leading-none">+</span>
          Nouvelle page
        </button>
      </form>

      <p className="mt-4 px-2 text-xs font-semibold uppercase tracking-wider text-stone-400">
        Pages
      </p>

      <nav className="mt-1 flex flex-col gap-px">
        {pages.length === 0 && (
          <p className="px-2 py-1.5 text-sm text-stone-400">Aucune page</p>
        )}
        {pages.map((p) => {
          const isActive = pathname === `/pages/${p.id}`;
          return (
            <Link
              key={p.id}
              href={`/pages/${p.id}`}
              className={`flex items-center gap-2 truncate rounded-md px-2 py-1.5 text-sm transition ${
                isActive
                  ? "bg-stone-200 font-medium text-stone-900"
                  : "text-stone-600 hover:bg-stone-200 hover:text-stone-900"
              }`}
            >
              <span className="text-base leading-none">{p.icon ?? "📄"}</span>
              <span className="truncate">{p.title}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}