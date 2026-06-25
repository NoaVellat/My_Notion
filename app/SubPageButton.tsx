"use client";

import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { createSubPage } from "./actions";

export default function SubPageButton({ parentId }: { parentId: string }) {
  const router = useRouter();

  async function handleClick() {
    const id = await createSubPage(parentId);
    router.push(`/pages/${id}`);
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600 transition hover:bg-stone-200"
    >
      + Sous-page
    </motion.button>
  );
}