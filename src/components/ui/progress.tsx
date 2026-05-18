"use client";

import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

export interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  label?: string;
}

export function Progress({
  value,
  max = 100,
  className,
  showLabel = false,
  label,
}: ProgressProps) {
  const clampedValue = Math.min(max, Math.max(0, value));
  const percentage = Math.round((clampedValue / max) * 100);

  return (
    <div className={cn("w-full", className)}>
      {(showLabel || label) && (
        <div className="mb-1.5 flex items-center justify-between">
          {label && (
            <span className="text-xs font-medium text-gray-400">{label}</span>
          )}
          {showLabel && (
            <span className="text-xs font-medium text-gray-400">
              {percentage}%
            </span>
          )}
        </div>
      )}
      <ProgressPrimitive.Root
        value={clampedValue}
        max={max}
        className="relative h-2 w-full overflow-hidden rounded-full bg-white/10"
      >
        <ProgressPrimitive.Indicator
          className="h-full w-full flex-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
          style={{ transform: `translateX(-${100 - percentage}%)` }}
        />
      </ProgressPrimitive.Root>
    </div>
  );
}
