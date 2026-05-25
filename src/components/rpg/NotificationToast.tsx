"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  TrendingUp,
  Award,
  CheckCircle,
  Swords,
  X,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotificationStore } from "@/store";

const typeIcons: Record<string, LucideIcon> = {
  levelup: Zap,
  rankup: TrendingUp,
  achievement: Award,
  quest: CheckCircle,
  dungeon: Swords,
};

const typeColors: Record<string, string> = {
  levelup: "text-green-400",
  rankup: "text-purple-400",
  achievement: "text-blue-400",
  quest: "text-emerald-400",
  dungeon: "text-red-400",
};

const typeGlows: Record<string, string> = {
  levelup: "glow-green",
  rankup: "glow-purple",
  achievement: "glow-blue",
  quest: "glow-green",
  dungeon: "glow-red",
};

export function NotificationToast() {
  const { notifications, removeNotification } = useNotificationStore();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (notifications.length === 0) return;
    const timers = notifications.map((n) => {
      return setTimeout(() => {
        setDismissed((prev) => new Set(prev).add(n.id));
        setTimeout(() => removeNotification(n.id), 300);
      }, 4000);
    });
    return () => timers.forEach(clearTimeout);
  }, [notifications, removeNotification]);

  if (notifications.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed top-4 right-4 z-50 flex flex-col gap-2"
      role="alert"
      aria-live="polite"
    >
      <AnimatePresence mode="popLayout">
        {notifications.map((n) => {
          if (dismissed.has(n.id)) return null;
          const Icon = n.icon
            ? typeIcons[n.icon] ?? Sparkles
            : typeIcons[n.type] ?? Sparkles;
          const colorClass = n.color ?? typeColors[n.type] ?? "text-blue-400";
          const glowClass = typeGlows[n.type] ?? "glow-blue";

          return (
            <motion.div
              key={n.id}
              layout
              initial={{ opacity: 0, x: 80, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={cn(
                "pointer-events-auto w-80 overflow-hidden rounded-xl border border-white/10 bg-gray-900/90 backdrop-blur-xl shadow-2xl",
                glowClass
              )}
            >
              <div className="flex items-start gap-3 p-3">
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10",
                    colorClass
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-100">
                    {n.title}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400 line-clamp-2">
                    {n.description}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDismissed((prev) => new Set(prev).add(n.id));
                    setTimeout(() => removeNotification(n.id), 300);
                  }}
                  aria-label="Dismiss notification"
                  className="shrink-0 rounded-full p-1 text-gray-500 hover:bg-white/10 hover:text-gray-300 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
