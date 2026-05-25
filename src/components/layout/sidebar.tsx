"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  LayoutDashboard,
  CheckSquare,
  BarChart3,
  MessageSquare,
  Timer,
  BookTemplate,
  Trophy,
  CreditCard,
  X,
  LogOut,
  Settings,
  Medal,
  LifeBuoy,
  User,
  Swords,
  ShoppingBag,
  TreePine,
  ScrollText,
  Users,
  Shield,
  Coins,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { RANKS } from "@/lib/rpg";
import type { PlayerProfile } from "@/types";

const rpgNavItems = [
  { href: "/profile", label: "Profile", icon: User },
  { href: "/quests", label: "Quests", icon: ScrollText },
  { href: "/dungeons", label: "Dungeons", icon: Swords },
  { href: "/shop", label: "Shop", icon: ShoppingBag },
  { href: "/skill-tree", label: "Skill Tree", icon: TreePine },
  { href: "/battle-pass", label: "Battle Pass", icon: Shield },
  { href: "/guild", label: "Guild", icon: Users },
];

const mainNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/habits", label: "Habits", icon: CheckSquare },
  { href: "/templates", label: "Templates", icon: BookTemplate },
  { href: "/achievements", label: "Achievements", icon: Trophy },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/ai-chat", label: "AI Coach", icon: MessageSquare },
  { href: "/pomodoro", label: "Focus Timer", icon: Timer },
  { href: "/leaderboard", label: "Leaderboard", icon: Medal },
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/support", label: "Support", icon: LifeBuoy },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user?: {
    name: string;
    email: string;
    image?: string | null;
  };
  level?: number;
  xp?: number;
  rpgProfile?: PlayerProfile;
}

export function Sidebar({ isOpen, onClose, user, level = 1, xp = 0, rpgProfile }: SidebarProps) {
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLDivElement>(null);

  const rankDef = useMemo(() => {
    const rank = rpgProfile?.rank ?? "E";
    return RANKS.find((r) => r.rank === rank) ?? RANKS[0];
  }, [rpgProfile?.rank]);

  const handleSignOut = useCallback(async () => {
    await signOut({ callbackUrl: "/" });
  }, []);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  function NavItem({ href, label, icon: Icon }: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }) {
    const isActive = pathname === href || pathname.startsWith(href + "/");
    return (
      <Link
        href={href}
        onClick={onClose}
        className={cn(
          "group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
          isActive
            ? "text-white"
            : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
        )}
      >
        {isActive && (
          <motion.div
            layoutId="sidebar-active"
            className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/20"
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          />
        )}
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-0.5 rounded-full bg-gradient-to-b from-blue-400 to-purple-500" />
        )}
        <Icon className={cn(
          "relative z-10 h-4 w-4 flex-shrink-0",
          isActive ? "text-blue-400" : "text-gray-500 group-hover:text-gray-300 transition-colors"
        )} />
        <span className="relative z-10">{label}</span>
      </Link>
    );
  }

  const sidebarContent = (
    <div
      ref={sidebarRef}
      className={cn(
        "flex h-full flex-col bg-gray-950/90 backdrop-blur-xl border-r border-white/10",
        "w-64 md:w-60 lg:w-64"
      )}
    >
      <div className="flex h-16 items-center justify-between gap-2 border-b border-white/10 px-5">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-[#39ff14] bg-clip-text text-transparent">
            HabitForge
          </span>
        </Link>
        <button
          onClick={onClose}
          className="flex md:hidden h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:text-gray-100 hover:bg-white/5 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-1">
        {mainNavItems.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}

        <div className="my-3 border-t border-white/5 pt-3">
          <span className="block px-3.5 pb-2 text-[10px] font-bold uppercase tracking-widest text-gray-600">
            RPG
          </span>
          {rpgNavItems.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </div>
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-3">
          <Avatar
            src={user?.image}
            name={user?.name || "User"}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-200 truncate">
              {user?.name || "User"}
            </p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <Badge
                variant="brand"
                size="sm"
                style={{ borderColor: `${rankDef.color}40`, color: rankDef.color }}
                className="border"
              >
                [{rankDef.rank}] Lvl {level}
              </Badge>
              {rpgProfile && (
                <span className="flex items-center gap-1 text-[11px] text-yellow-400/80">
                  <Coins className="h-3 w-3" />
                  {rpgProfile.coins.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 mt-2">
          <Link
            href="/settings"
            onClick={onClose}
            className="flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors flex-1"
          >
            <Settings className="h-3.5 w-3.5" />
            Settings
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors flex-1"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden md:flex h-screen flex-col fixed left-0 top-0 z-30">
        {sidebarContent}
      </aside>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-64 md:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
