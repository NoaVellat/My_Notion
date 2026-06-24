"use client";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import type { PartialBlock } from "@blocknote/core";
import { useRef } from "react";
import { updatePageContent } from "./actions";

export default function Editor({
  pageId,
  initialContent,
}: {
  pageId: string;
  initialContent: unknown;
}) {
  // Si la page a déjà du contenu sauvegardé, on le charge ; sinon on part vide
  const initial =
    Array.isArray(initialContent) && initialContent.length > 0
      ? (initialContent as PartialBlock[])
      : undefined;

  const editor = useCreateBlockNote({ initialContent: initial });

  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange() {
    // Debounce : on attend 1 seconde après la dernière frappe avant d'enregistrer
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      updatePageContent(pageId, editor.document);
    }, 1000);
  }

  return <BlockNoteView editor={editor} theme="light" onChange={handleChange} />;
}