import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Sidebar from "./Sidebar";
import "./globals.css";
import AnimatedBackground from "./AnimatedBackground";
import { Space_Grotesk } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

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
    <html lang="fr" className={spaceGrotesk.variable}>
      <body className="text-stone-800 antialiased">
        <AnimatedBackground />
        <div className="flex min-h-screen">
          <Sidebar pages={pages} />
         <div
            className="flex-1"
            style={{ perspective: "1200px", overflow: "hidden", isolation: "isolate" }}
          >
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}