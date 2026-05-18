"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
  delayDuration?: number;
}

export function Tooltip({
  content,
  children,
  side = "top",
  className,
  delayDuration = 400,
}: TooltipProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          {children}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            sideOffset={6}
            className={cn(
              "z-50 rounded-xl border border-white/10 bg-gray-900/95 backdrop-blur-xl px-3 py-2 text-xs text-gray-100 shadow-2xl",
              "data-[state=delayed-open]:animate-in data-[state=closed]:animate-out",
              className
            )}
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-gray-900" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
