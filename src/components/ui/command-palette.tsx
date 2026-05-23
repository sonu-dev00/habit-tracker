"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, LayoutDashboard, CheckSquare, BarChart3, MessageSquare, Timer, BookTemplate, Trophy, Sparkles, CreditCard, Medal, LifeBuoy, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const PAGES = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/habits", label: "Habits", icon: CheckSquare },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/ai-chat", label: "AI Coach", icon: MessageSquare },
  { href: "/pomodoro", label: "Focus Timer", icon: Timer },
  { href: "/achievements", label: "Achievements", icon: Trophy },
  { href: "/templates", label: "Templates", icon: BookTemplate },
  { href: "/leaderboard", label: "Leaderboard", icon: Medal },
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/support", label: "Support", icon: LifeBuoy },
  { href: "/settings", label: "Settings", icon: Sparkles },
];

interface HabitResult {
  id: string;
  name: string;
  category: string;
  streak: number;
}

export function CommandPalette({ open: externalOpen, onClose }: { open: boolean; onClose: () => void }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [habits, setHabits] = useState<HabitResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const open = externalOpen || internalOpen;

  const close = useCallback(() => {
    setInternalOpen(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (externalOpen) {
          onClose();
        } else {
          setInternalOpen((prev) => !prev);
        }
      } else if (e.key === "/" && !externalOpen && !internalOpen) {
        e.preventDefault();
        setInternalOpen(true);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [externalOpen, internalOpen, onClose]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setHabits([]);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      setHabits([]);
      return;
    }
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/habits?search=${encodeURIComponent(query)}&limit=10`);
        const json = await res.json();
        setHabits((json.data ?? []).map((h: any) => ({
          id: h.id,
          name: h.name,
          category: h.category,
          streak: h.streak ?? 0,
        })));
      } catch {
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(timeout);
  }, [query]);

  const filteredPages = query.trim()
    ? PAGES.filter((p) => p.label.toLowerCase().includes(query.toLowerCase()))
    : PAGES;

  const results = [...filteredPages, ...habits];
  const totalItems = results.length;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, totalItems - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && results[selectedIndex]) {
        navigate(results[selectedIndex]);
      }
    },
    [results, selectedIndex, totalItems]
  );

  const navigate = useCallback(
    (item: (typeof results)[number]) => {
      if ("href" in item) {
        router.push(item.href);
      } else {
        router.push(`/habits`);
      }
      close();
    },
    [router, close]
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={close}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed left-1/2 top-[15%] z-50 w-full max-w-lg -translate-x-1/2 rounded-2xl border border-white/10 bg-gray-900/95 backdrop-blur-xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
              <Search className="h-4 w-4 text-gray-500 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setSelectedIndex(0)}
                onKeyDown={handleKeyDown}
                placeholder="Search pages or habits..."
                className="flex-1 bg-transparent text-sm text-gray-100 placeholder:text-gray-500 outline-none"
              />
              <kbd className="hidden sm:inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-gray-500 font-mono">
                ESC
              </kbd>
            </div>

            <div className="max-h-72 overflow-y-auto p-2">
              {loading && (
                <div className="flex items-center justify-center py-6">
                  <div className="h-5 w-5 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
                </div>
              )}

              {!loading && results.length === 0 && query.trim() && (
                <div className="flex flex-col items-center py-6 text-center">
                  <Search className="h-6 w-6 text-gray-600 mb-2" />
                  <p className="text-sm text-gray-500">No results for &quot;{query}&quot;</p>
                </div>
              )}

              {!loading && results.length > 0 && (
                <div className="space-y-0.5">
                  {filteredPages.length > 0 && (
                    <>
                      <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                        Pages
                      </div>
                      {filteredPages.map((page, idx) => {
                        const Icon = page.icon;
                        const isSelected = selectedIndex === idx;
                        return (
                          <button
                            key={page.href}
                            onClick={() => navigate(page)}
                            onMouseEnter={() => setSelectedIndex(idx)}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                              isSelected ? "bg-blue-500/15 text-blue-300" : "text-gray-300 hover:bg-white/5"
                            )}
                          >
                            <Icon className="h-4 w-4 shrink-0" />
                            <span className="flex-1">{page.label}</span>
                            <ArrowRight className="h-3 w-3 text-gray-600" />
                          </button>
                        );
                      })}
                    </>
                  )}

                  {habits.length > 0 && (
                    <>
                      <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500 mt-1">
                        Habits
                      </div>
                      {habits.map((habit, idx) => {
                        const globalIdx = filteredPages.length + idx;
                        const isSelected = selectedIndex === globalIdx;
                        return (
                          <button
                            key={habit.id}
                            onClick={() => navigate(habit)}
                            onMouseEnter={() => setSelectedIndex(globalIdx)}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                              isSelected ? "bg-blue-500/15 text-blue-300" : "text-gray-300 hover:bg-white/5"
                            )}
                          >
                            <CheckSquare className="h-4 w-4 shrink-0 text-gray-500" />
                            <span className="flex-1 truncate">{habit.name}</span>
                            <span className="text-[11px] text-gray-600">{habit.category}</span>
                          </button>
                        );
                      })}
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-3 border-t border-white/10 px-4 py-2">
              <div className="flex items-center gap-1.5 text-[10px] text-gray-600">
                <kbd className="rounded border border-white/10 bg-white/5 px-1 py-0.5 font-mono">↑↓</kbd>
                <span>Navigate</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-gray-600">
                <kbd className="rounded border border-white/10 bg-white/5 px-1 py-0.5 font-mono">↵</kbd>
                <span>Open</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-gray-600">
                <kbd className="rounded border border-white/10 bg-white/5 px-1 py-0.5 font-mono">⌘K</kbd>
                <span>Toggle</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
