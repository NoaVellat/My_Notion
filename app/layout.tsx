import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Sidebar from "./Sidebar";
import AgentPanel from "./AgentPanel";
import "./globals.css";
import AnimatedBackground from "./AnimatedBackground";
import ThemeProvider from "./ThemeProvider";
import ThemeController from "./ThemeController";
import {
  Space_Grotesk,
  Sora,
  Quicksand,
  JetBrains_Mono,
  Playfair_Display,
} from "next/font/google";

// Une police par thème (voir themes.ts). Toutes sont exposées en variables CSS
// sur <html> ; ThemeController choisit laquelle est active selon la page.
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });
const quicksand = Quicksand({ subsets: ["latin"], variable: "--font-round" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
const serif = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });

const fontVars = [grotesk, sora, quicksand, mono, serif]
  .map((f) => f.variable)
  .join(" ");

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
    where: { userId: user.id, parentId: null },
    orderBy: { createdAt: "desc" },
    include: {
      children: {
        orderBy: { createdAt: "asc" },
        select: { id: true, title: true, icon: true, status: true },
      },
    },
  });

  return (
    <html lang="fr" className={fontVars}>
      <body className="antialiased">
        <ThemeProvider>
          <ThemeController />
          <AnimatedBackground />
          <div className="flex min-h-screen">
            <Sidebar pages={pages} />
            <div
              className="flex-1"
              style={{ perspective: "1200px", overflow: "hidden", isolation: "isolate" }}
            >
              {children}
            </div>
            <AgentPanel />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}