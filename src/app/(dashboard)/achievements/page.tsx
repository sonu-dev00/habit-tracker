"use client";

import { motion } from "framer-motion";
import { AchievementsGrid } from "@/components/ui/achievements";

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.06 } } },
  item: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
  },
};

export default function AchievementsPage() {
  return (
    <motion.div variants={stagger.container} initial="initial" animate="animate" className="space-y-6">
      <motion.div variants={stagger.item}>
        <h1 className="text-2xl font-bold text-gray-100">Achievements</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Complete habits, build streaks, and earn XP to unlock achievements
        </p>
      </motion.div>
      <motion.div variants={stagger.item}>
        <AchievementsGrid />
      </motion.div>
    </motion.div>
  );
}
