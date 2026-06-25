"use client";

import { motion } from "motion/react";
import { usePathname } from "next/navigation";

export default function Template({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{
        clipPath: "inset(0 100% 0 0)",
        rotateY: 12,
        scale: 1.08,
        filter: "brightness(2) blur(10px)",
        opacity: 0.6,
      }}
      animate={{
        clipPath: "inset(0 0% 0 0)",
        rotateY: 0,
        scale: 1,
        filter: "brightness(1) blur(0px)",
        opacity: 1,
      }}
      transition={{
        duration: 0.9,
        ease: [0.83, 0, 0.17, 1],
        filter: { duration: 1.1 },
      }}
      style={{ transformOrigin: "center", transformPerspective: 1400 }}
      className="min-h-screen"
    >
      {children}
    </motion.div>
  );
}