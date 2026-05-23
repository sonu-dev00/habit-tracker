"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/15 mb-4">
        <AlertTriangle className="h-6 w-6 text-red-400" />
      </div>
      <h2 className="text-lg font-semibold text-gray-100 mb-1">Something went wrong</h2>
      <p className="text-sm text-gray-500 mb-4 text-center max-w-sm">
        {error.message || "An unexpected error occurred"}
      </p>
      <Button variant="primary" icon={RotateCcw} onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
