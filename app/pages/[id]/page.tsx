import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

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

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <Link href="/">← Retour</Link>
      <h1>{page.title}</h1>
    </main>
  );
}