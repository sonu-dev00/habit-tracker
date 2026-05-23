"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  BarChart3,
  Brain,
  TicketCheck,
  Flag,
  DollarSign,
  History,
  Shield,
  Sparkles,
  X,
  LogOut,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { Avatar } from "@/components/ui/avatar";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/ai-monitor", label: "AI Monitor", icon: Brain },
  { href: "/admin/support-tickets", label: "Support Tickets", icon: TicketCheck },
  { href: "/admin/feature-flags", label: "Feature Flags", icon: Flag },
  { href: "/admin/revenue", label: "Revenue", icon: DollarSign },
  { href: "/admin/audit-log", label: "Audit Log", icon: History },
  { href: "/admin/security", label: "Security", icon: Shield },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (session?.user?.role !== "ADMIN" && status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setSidebarOpen(false);
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setSidebarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen]);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          <span className="text-gray-400 text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  if (session?.user?.role !== "ADMIN") return null;

  const sidebarContent = (
    <div
      ref={sidebarRef}
      className={cn(
        "flex h-full flex-col bg-gray-950/90 backdrop-blur-xl border-r border-white/10",
        "w-64 md:w-60 lg:w-64"
      )}
    >
      <div className="flex h-16 items-center justify-between gap-2 border-b border-white/10 px-5">
        <Link href="/admin" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-[#39ff14] bg-clip-text text-transparent">
              HabitForge
            </span>
            <span className="block text-[10px] text-gray-500 uppercase tracking-wider">Admin</span>
          </div>
        </Link>
        <button
          onClick={() => setSidebarOpen(false)}
          className="flex md:hidden h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:text-gray-100 hover:bg-white/5 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "text-white"
                  : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="admin-sidebar-active"
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
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-3">
          <Avatar
            src={session?.user?.image}
            name={session?.user?.name || "Admin"}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-200 truncate">
              {session?.user?.name || "Admin"}
            </p>
            <p className="text-[11px] text-blue-400">Administrator</p>
          </div>
        </div>
        <div className="flex items-center gap-1 mt-2">
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors flex-1"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950">
      <aside className="hidden md:flex h-screen flex-col fixed left-0 top-0 z-30">
        {sidebarContent}
      </aside>

      <AnimatePresence>
        {sidebarOpen && (
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

      <div className="flex flex-1 flex-col md:pl-64">
        <header className="flex h-16 items-center gap-4 border-b border-white/10 bg-gray-950/80 backdrop-blur-xl px-4 lg:px-6 sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex md:hidden h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:text-gray-100 hover:bg-white/5 transition-colors"
          >
            <LayoutDashboard className="h-4 w-4" />
          </button>
          <div className="flex-1" />
          <Link
            href="/dashboard"
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            Back to App
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="relative">
            <div className="pointer-events-none fixed inset-0">
              <div className="absolute top-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[120px]" />
              <div className="absolute bottom-[-10%] right-[-10%] h-[400px] w-[400px] rounded-full bg-purple-500/5 blur-[120px]" />
            </div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative p-4 lg:p-6"
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
