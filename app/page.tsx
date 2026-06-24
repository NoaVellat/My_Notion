import { createPage } from "./actions";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-12 text-center">
      <div className="text-5xl">👋</div>
      <h1 className="mt-4 text-2xl font-bold text-stone-900">
        Bienvenue dans My Notion
      </h1>
      <p className="mt-2 text-stone-500">
        Choisis une page à gauche, ou commence une nouvelle page.
      </p>

      <form action={createPage} className="mt-6">
        <button
          type="submit"
          className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-stone-700"
        >
          + Créer une page
        </button>
      </form>
    </main>
  );
}