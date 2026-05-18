import { type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center font-medium rounded-full transition-colors",
  {
    variants: {
      variant: {
        default: "bg-white/10 text-gray-300",
        success: "bg-emerald-500/15 text-emerald-400",
        warning: "bg-amber-500/15 text-amber-400",
        error: "bg-red-500/15 text-red-400",
        info: "bg-blue-500/15 text-blue-400",
        brand: "bg-gradient-to-r from-blue-600/30 to-purple-600/30 text-blue-300",
      },
      size: {
        sm: "px-2 py-0.5 text-[11px]",
        md: "px-2.5 py-1 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant, size, className }))}
      {...props}
    />
  );
}
