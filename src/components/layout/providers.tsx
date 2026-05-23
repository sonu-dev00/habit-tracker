"use client";

import { type ReactNode, useEffect, useState, lazy, Suspense } from "react";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { ToastProvider } from "@/components/ui/toast";
import { CookieConsent } from "@/components/ui/cookie-consent";
import { PWARegister } from "@/components/ui/pwa-register";
import { useThemeStore } from "@/store";

const ReactQueryDevtools = lazy(() =>
  import("@tanstack/react-query-devtools").then((m) => ({ default: m.ReactQueryDevtools }))
);

export function Providers({ children }: { children: ReactNode }) {
  const { theme } = useThemeStore();
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
            gcTime: 5 * 60 * 1000,
          },
        },
      })
  );

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <TooltipPrimitive.Provider delayDuration={400}>
          <ToastProvider>
            {children}
            <PWARegister />
            <CookieConsent />
          </ToastProvider>
        </TooltipPrimitive.Provider>
      </SessionProvider>
      {process.env.NODE_ENV === "development" && (
        <Suspense fallback={null}>
          <ReactQueryDevtools />
        </Suspense>
      )}
    </QueryClientProvider>
  );
}
