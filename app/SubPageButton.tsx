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
      className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white transition hover:bg-white/20"
    >
      + Sous-page
    </motion.button>
  );
}