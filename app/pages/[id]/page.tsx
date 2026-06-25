import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { updatePageTitle } from "@/app/actions";
import EditorWrapper from "@/app/EditorWrapper";
import StatusSelector from "@/app/StatusSelector";
import DeletePageButton from "@/app/DeletePageButton";

export default async function PageDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const page = await prisma.page.findUnique({
    where: { id },
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
    <main className="mx-auto max-w-2xl px-12 py-20">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="text-sm text-stone-400 transition hover:text-stone-700"
        >
          ← Retour
        </Link>
        <DeletePageButton pageId={page.id} />
      </div>

      <div className="mt-8 flex items-start gap-3">
        <span className="text-5xl leading-none">{page.icon ?? "📄"}</span>
        <form action={handleRename} className="flex flex-1 items-center gap-3">
          <input
            type="text"
            name="title"
            defaultValue={page.title}
            placeholder="Sans titre"
            className="w-full border-none bg-transparent text-4xl font-bold text-stone-900 outline-none placeholder:text-stone-300"
          />
          <button
            type="submit"
            className="shrink-0 rounded-md bg-stone-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-stone-700"
          >
            Enregistrer
          </button>
        </form>
      </div>

      <div className="mt-4">
        <StatusSelector pageId={page.id} current={page.status} />
      </div>

      <div className="mt-6 border-t border-stone-100 pt-6">
        <EditorWrapper pageId={page.id} initialContent={page.content} />
      </div>
    </main>
  );
}