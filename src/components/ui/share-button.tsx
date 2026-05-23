"use client";

import { useState } from "react";
import { Share2, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ShareButton({ habitId }: { habitId: string }) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habitId }),
      });
      const json = await res.json();
      if (json.success) {
        await navigator.clipboard.writeText(json.data.shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleShare}
      disabled={loading}
      className={cn(
        "rounded-lg p-1.5 text-gray-500 hover:text-gray-200 hover:bg-white/5 transition-colors",
        copied && "text-emerald-400"
      )}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
    </button>
  );
}
