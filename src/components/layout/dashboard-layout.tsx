"use client";

import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";

interface DashboardLayoutProps {
  children: ReactNode;
  user?: {
    name: string;
    email: string;
    image?: string | null;
  };
  level?: number;
  xp?: number;
}

export function DashboardLayout({ children, user, level, xp }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        level={level}
        xp={xp}
      />

      <div className="flex flex-1 flex-col md:pl-64">
        <Navbar
          onMenuClick={() => setSidebarOpen(true)}
          user={user}
        />

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
