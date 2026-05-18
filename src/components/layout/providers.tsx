"use client";

import { type ReactNode, useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { ToastProvider } from "@/components/ui/toast";
import { useThemeStore } from "@/store";

export function Providers({ children }: { children: ReactNode }) {
  const { theme } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  return (
    <SessionProvider>
      <TooltipPrimitive.Provider delayDuration={400}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </TooltipPrimitive.Provider>
    </SessionProvider>
  );
}
