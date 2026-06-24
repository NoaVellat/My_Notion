"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createPage() {
  // Tant qu'on n'a pas d'authentification, on utilise un utilisateur de test fixe
  const user = await prisma.user.upsert({
    where: { email: "test@exemple.com" },
    update: {},
    create: { email: "test@exemple.com", name: "Moi" },
  });

  // On crée une nouvelle page reliée à cet utilisateur
  await prisma.page.create({
    data: {
      title: "Nouvelle page",
      userId: user.id,
    },
  });

  // On demande à Next.js de rafraîchir l'affichage de la page d'accueil
  revalidatePath("/");
}

export async function updatePageContent(id: string, content: unknown) {
  await prisma.page.update({
    where: { id },
    // content est le tableau de blocs JSON que l'éditeur nous donne
    data: { content: content as any },
  });
}

export async function updatePageTitle(id: string, title: string) {
  await prisma.page.update({
    where: { id },
    data: { title },
  });
  

  revalidatePath(`/pages/${id}`);
  revalidatePath("/");
}