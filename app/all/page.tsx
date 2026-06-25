import { prisma } from "@/lib/prisma";
import AllPagesList from "@/app/AllPagesList";

export default async function AllPages() {
  const user = await prisma.user.upsert({
    where: { email: "test@exemple.com" },
    update: {},
    create: { email: "test@exemple.com", name: "Moi" },
  });

  const pages = await prisma.page.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, icon: true, status: true },
  });

  return (
    <div>
      <div className="bg-gradient-to-r from-indigo-500 to-violet-600 px-10 py-10">
        <h1
          className="text-4xl font-bold text-white"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Toutes mes pages
        </h1>
        <p className="mt-2 text-base text-white/80">
          Coche des pages pour les supprimer en lot.
        </p>
      </div>
      <div className="mx-auto max-w-4xl px-10 py-10">
        <AllPagesList pages={pages} />
      </div>
    </div>
  );
}