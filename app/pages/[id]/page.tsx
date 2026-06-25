import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { updatePageTitle } from "@/app/actions";
import EditorWrapper from "@/app/EditorWrapper";
import StatusSelector from "@/app/StatusSelector";
import DeletePageButton from "@/app/DeletePageButton";
import SubPageButton from "@/app/SubPageButton";

export default async function PageDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const page = await prisma.page.findUnique({
    where: { id },
    include: { parent: true },
  });

  if (!page) {
    notFound();
  }

  async function handleRename(formData: FormData) {
    "use server";
    const newTitle = formData.get("title") as string;
    await updatePageTitle(id, newTitle);
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-16 md:px-12 md:py-20">
      <div className="flex items-center justify-between gap-3">
        {/* Fil d'Ariane : si la page a un parent, on l'affiche */}
       <div className="flex flex-wrap items-center gap-1 text-sm text-[var(--text-muted)]">
          <Link href="/" className="transition hover:text-white">
            Accueil
          </Link>
          {page.parent && (
            <>
              <span>›</span>
              <Link
                href={`/pages/${page.parent.id}`}
                className="transition hover:text-white"
              >
                {page.parent.icon ?? "📄"} {page.parent.title}
              </Link>
            </>
          )}
          <span>›</span>
          <span className="text-white">{page.icon ?? "📄"} {page.title}</span>
        </div>
        <DeletePageButton pageId={page.id} />
      </div>

      <div className="mt-8 flex items-start gap-3">
        <span className="text-4xl leading-none md:text-5xl">{page.icon ?? "📄"}</span>
        <form action={handleRename} className="flex flex-1 items-center gap-2 md:gap-3">
          <input
            type="text"
            name="title"
            defaultValue={page.title}
            placeholder="Sans titre"
            className="w-full min-w-0 border-none bg-transparent text-2xl font-bold text-white outline-none placeholder:text-[var(--text-muted)] md:text-4xl"
          />
          <button
            type="submit"
            className="shrink-0 rounded-md bg-stone-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-stone-700"
          >
            Enregistrer
          </button>
        </form>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <StatusSelector pageId={page.id} current={page.status} />
        <SubPageButton parentId={page.id} />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl bg-white p-2 text-stone-800 shadow-lg md:p-4">
        <EditorWrapper pageId={page.id} initialContent={page.content} />
      </div>
    </main>
  );
}