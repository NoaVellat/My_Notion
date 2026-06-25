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
      <div className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] px-6 py-8 pl-16 transition-colors duration-700 md:px-10 md:py-10 md:pl-10">
        <h1 className="text-2xl font-bold text-white md:text-4xl">
          Toutes mes pages
        </h1>
        <p className="mt-2 text-sm text-white/80 md:text-base">
          Coche des pages pour les supprimer a la suite.
        </p>
      </div>
      <div className="mx-auto max-w-4xl px-4 py-6 md:px-10 md:py-10">
        <AllPagesList pages={pages} />
      </div>
    </div>
  );
}