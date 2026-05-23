"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <html>
      <body className="bg-gray-950">
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <AlertTriangle className="h-12 w-12 text-red-400 mb-4" />
          <h1 className="text-xl font-bold text-gray-100 mb-2">Unexpected Error</h1>
          <p className="text-sm text-gray-500 mb-6 max-w-md text-center">
            Something went wrong. Please try refreshing the page.
          </p>
          <div className="flex items-center gap-3">
            <Button variant="primary" icon={RotateCcw} onClick={reset}>
              Try again
            </Button>
            <Button variant="ghost" onClick={() => window.location.href = "/"}>
              Go home
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
