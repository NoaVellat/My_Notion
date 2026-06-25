import { prisma } from "@/lib/prisma";
import Board from "@/app/Board";

export default async function BoardPage() {
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
     <div className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] px-4 py-5 pl-16 transition-colors duration-700 md:px-8 md:py-6 md:pl-8">
        <h1 className="text-xl font-bold text-white md:text-2xl">Tableau</h1>
        <p className="text-sm text-white/80">
          Glisse tes pages d&apos;une colonne à l&apos;autre.
        </p>
      </div>
      <Board initialPages={pages} />
    </div>
  );
}