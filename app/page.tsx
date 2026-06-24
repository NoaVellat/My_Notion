import { prisma } from "@/lib/prisma";
import { createPage } from "./actions";
import Link from "next/link";

export default async function Home() {
  const user = await prisma.user.upsert({
    where: { email: "test@exemple.com" },
    update: {},
    create: { email: "test@exemple.com", name: "Moi" },
  });

  const pages = await prisma.page.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Mes pages</h1>

      <form action={createPage}>
        <button type="submit">+ Nouvelle page</button>
      </form>

      <ul>
        {pages.map((p) => (
          <li key={p.id}>
            <Link href={`/pages/${p.id}`}>{p.title}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}