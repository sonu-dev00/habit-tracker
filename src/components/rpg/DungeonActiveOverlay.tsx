"use client";

import { useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Swords, Skull } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/ui/progress-ring";
import { useDungeonStore } from "@/store";

export function DungeonActiveOverlay() {
  const {
    isRunning,
    remainingTime,
    totalDuration,
    bossPhase,
    bossHealth,
    tick,
    cancelDungeon,
  } = useDungeonStore();

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      tick();
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, tick]);

  const progress = useMemo(() => {
    if (totalDuration === 0) return 0;
    return Math.round(((totalDuration - remainingTime) / totalDuration) * 100);
  }, [remainingTime, totalDuration]);

  const formattedTime = useMemo(() => {
    const mins = Math.floor(remainingTime / 60);
    const secs = remainingTime % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, [remainingTime]);

  const handleCancel = useCallback(() => {
    cancelDungeon();
  }, [cancelDungeon]);

  return (
    <AnimatePresence>
      {isRunning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label="Dungeon in progress"
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
            className="relative flex flex-col items-center gap-6"
            aria-hidden={!isRunning}
          >
            <div className="rpg-panel-glow relative overflow-hidden border-2 border-white/10 p-8">
              {bossPhase && (
                <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 via-transparent to-red-800/5 pointer-events-none" />
              )}

              <div className="relative flex flex-col items-center gap-6">
                <div className="flex items-center gap-2">
                  <Swords
                    className={cn(
                      "h-5 w-5",
                      bossPhase ? "text-red-400 animate-pulse-glow" : "text-blue-400"
                    )}
                  />
                  <h2 className="text-lg font-bold text-gray-100">
                    {bossPhase ? "Dungeon Boss" : "Dungeon Run"}
                  </h2>
                </div>

                <div className="relative">
                  <ProgressRing
                    progress={progress}
                    size={160}
                    strokeWidth={8}
                    color={bossPhase ? "#ef4444" : "#3b82f6"}
                    label="Progress"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold tabular-nums text-gray-100">
                      {formattedTime}
                    </span>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {bossPhase ? (
                    <motion.div
                      key="boss"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="w-full space-y-3"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Skull className="h-5 w-5 text-red-400 animate-pulse-glow" />
                        <span className="text-sm font-bold text-red-400">
                          BOSS ENCOUNTER
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>Boss Health</span>
                          <span>{bossHealth}%</span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-white/10">
                          <motion.div
                            animate={{ width: `${bossHealth}%` }}
                            transition={{ duration: 0.3 }}
                            className="h-full rounded-full bg-gradient-to-r from-red-500 to-rose-600 shadow-lg shadow-red-500/25"
                          />
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="progress"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center"
                    >
                      <p className="text-sm text-gray-400">{progress}% complete</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button
                  variant="danger"
                  size="md"
                  icon={X}
                  onClick={handleCancel}
                >
                  Cancel Run
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
