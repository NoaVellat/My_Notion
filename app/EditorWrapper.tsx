"use client";

import dynamic from "next/dynamic";

// ssr: false = "ne rends jamais ça côté serveur, seulement dans le navigateur"
const Editor = dynamic(() => import("./Editor"), {
  ssr: false,
  loading: () => <p className="text-stone-400">Chargement de l'éditeur…</p>,
});

export default function EditorWrapper({
  pageId,
  initialContent,
}: {
  pageId: string;
  initialContent: unknown;
}) {
  return <Editor pageId={pageId} initialContent={initialContent} />;
}