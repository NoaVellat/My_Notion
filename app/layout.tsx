import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Sidebar from "./Sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "My Notion",
  description: "Mon clone de Notion",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
    <html lang="fr">
      <body className="bg-white text-stone-800 antialiased">
        <div className="flex min-h-screen">
          <Sidebar pages={pages} />
          <div className="flex-1">{children}</div>
        </div>
      </body>
    </html>
  );
}