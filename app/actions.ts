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
  // JSON.stringify transforme les "undefined" des tableaux en "null",
  // ce que Prisma 7 exige (il refuse les "undefined" dans un tableau).
  const safeContent = JSON.parse(JSON.stringify(content));
  await prisma.page.update({
    where: { id },
    data: { content: safeContent },
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

export async function updatePageStatus(id: string, status: string) {
  await prisma.page.update({
    where: { id },
    data: { status },
  });
  // On rafraîchit la barre latérale pour mettre à jour les pastilles de couleur
  revalidatePath("/");
}

export async function createPageWithDetails(
  title: string,
  icon: string,
  status: string
) {
  const user = await prisma.user.upsert({
    where: { email: "test@exemple.com" },
    update: {},
    create: { email: "test@exemple.com", name: "Moi" },
  });

  const page = await prisma.page.create({
    data: {
      title: title.trim() || "Nouvelle page",
      icon: icon || null,
      status: status || "todo",
      userId: user.id,
    },
  });

  revalidatePath("/");
  return page.id; // on renvoie l'id pour pouvoir ouvrir la page juste après
}

export async function deletePage(id: string) {
  await prisma.page.delete({
    where: { id },
  });
  revalidatePath("/");
}

export async function deletePages(ids: string[]) {
  await prisma.page.deleteMany({
    where: { id: { in: ids } },
  });
  revalidatePath("/");
}

 export async function createSubPage(parentId: string) {
  const user = await prisma.user.upsert({
    where: { email: "test@exemple.com" },
    update: {},
    create: { email: "test@exemple.com", name: "Moi" },
  });

  const page = await prisma.page.create({
    data: {
      title: "Sous-page",
      userId: user.id,
      parentId, // c'est ça qui la rattache à sa page parente
    },
  });

  revalidatePath("/");
  return page.id;
}