"use client";

import { Sparkles, Lock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ProGateProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProGate({ feature, children, fallback }: ProGateProps) {
  const { data: billing } = useQuery({
    queryKey: ["billing"],
    queryFn: async () => {
      const res = await fetch("/api/billing");
      const json = await res.json();
      return json.data;
    },
    staleTime: 60000,
  });

  const isPro = billing?.plan !== "FREE";

  if (isPro) return <>{children}</>;

  return (
    <>
      {fallback ?? (
        <div className="relative">
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-950/60 backdrop-blur-sm rounded-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 mb-3">
              <Lock className="h-5 w-5 text-white" />
            </div>
            <p className="text-sm font-medium text-gray-200 mb-1">Pro Feature</p>
            <p className="text-xs text-gray-500 mb-3">{feature} requires a Pro subscription</p>
            <Link href="/billing">
              <Button variant="primary" size="sm" icon={Sparkles}>
                Upgrade to Pro
              </Button>
            </Link>
          </div>
          <div className="opacity-30 pointer-events-none select-none">{children}</div>
        </div>
      )}
    </>
  );
}
