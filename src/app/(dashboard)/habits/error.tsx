"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw } from "lucide-react";
import Link from "next/link";

export default function HabitsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Habits error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-24">
      <AlertTriangle className="h-10 w-10 text-red-400 mb-4" />
      <h2 className="text-lg font-semibold text-gray-100 mb-1">Failed to load habits</h2>
      <p className="text-sm text-gray-500 mb-4">{error.message}</p>
      <div className="flex items-center gap-3">
        <Button variant="primary" icon={RotateCcw} onClick={reset}>
          Retry
        </Button>
        <Link href="/dashboard">
          <Button variant="ghost">Go to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
