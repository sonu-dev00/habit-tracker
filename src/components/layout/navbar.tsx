"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Menu,
  Search,
  Bell,
  Settings,
  ChevronRight,
  Sparkles,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { NotificationDropdown } from "@/components/ui/notification-dropdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const breadcrumbLabels: Record<string, string> = {
  dashboard: "Dashboard",
  habits: "Habits",
  analytics: "Analytics",
  "ai-chat": "AI Chat",
  pomodoro: "Focus Timer",
  settings: "Settings",
  profile: "Profile",
};

interface NavbarProps {
  onMenuClick: () => void;
  onSearchOpen?: () => void;
  user?: { name: string; email: string; image?: string | null };
}

export function Navbar({ onMenuClick, onSearchOpen, user }: NavbarProps) {
  const pathname = usePathname();
  const [searchOpen] = useState(false);

  const handleSignOut = useCallback(async () => {
    await signOut({ callbackUrl: "/" });
  }, []);

  const segments = pathname.split("/").filter(Boolean);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/10 bg-gray-950/80 backdrop-blur-xl px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="flex md:hidden h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:text-gray-100 hover:bg-white/5 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden md:flex items-center gap-1.5 text-sm text-gray-400">
          {segments.map((seg, i) => {
            const label = breadcrumbLabels[seg] || seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
            const href = "/" + segments.slice(0, i + 1).join("/");
            const isLast = i === segments.length - 1;
            return (
              <span key={seg} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-gray-600" />}
                {isLast ? (
                  <span className="text-gray-100 font-medium">{label}</span>
                ) : (
                  <Link href={href} className="hover:text-gray-200 transition-colors">
                    {label}
                  </Link>
                )}
              </span>
            );
          })}
        </div>

        <div className="flex md:hidden items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-400" />
          <span className="text-sm font-semibold bg-gradient-to-r from-blue-400 via-purple-400 to-[#39ff14] bg-clip-text text-transparent">
            HabitForge
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className={cn(
          "hidden md:flex items-center",
          searchOpen && "flex"
        )}>
          <button
            onClick={onSearchOpen}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 py-1.5 px-3 text-sm text-gray-500 hover:text-gray-300 hover:border-white/20 transition-all w-56 lg:w-72"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left">Search...</span>
            <kbd className="hidden lg:inline-flex items-center gap-1 rounded border border-white/10 bg-white/10 px-1.5 py-0.5 text-[10px] font-mono text-gray-600">
              ⌘K
            </kbd>
          </button>
        </div>

        <div className="hidden md:flex">
          <NotificationDropdown />
        </div>

        <Link
          href="/settings"
          className="h-9 w-9 p-0 hidden md:inline-flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-100 hover:bg-white/5 transition-all"
        >
          <Settings className="h-4 w-4" />
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-1 focus:outline-none">
              <Avatar
                src={user?.image}
                name={user?.name || "User"}
                size="sm"
                className="ring-2 ring-white/10 hover:ring-blue-500/50 transition-all cursor-pointer"
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-3 py-2">
              <p className="text-sm font-medium text-gray-100">{user?.name || "User"}</p>
              <p className="text-xs text-gray-500">{user?.email || ""}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
