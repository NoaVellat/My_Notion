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
     <div className="bg-gradient-to-r from-indigo-500 to-violet-600 px-8 py-6">
        <h1 className="text-2xl font-bold text-white">Tableau</h1>
        <p className="text-sm text-white/80">
          Glisse tes pages d'une colonne à l'autre.
        </p>
      </div>
      <Board initialPages={pages} />
    </div>
  );
}