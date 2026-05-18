"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:scale-[1.02] active:scale-[0.98]",
        secondary:
          "bg-white/5 backdrop-blur-xl border border-white/10 text-gray-100 hover:bg-white/10 hover:border-white/20 active:bg-white/[0.08]",
        ghost:
          "text-gray-400 hover:text-gray-100 hover:bg-white/5 active:bg-white/[0.08]",
        danger:
          "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/25 hover:shadow-red-600/40 hover:scale-[1.02] active:scale-[0.98]",
        success:
          "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 hover:scale-[1.02] active:scale-[0.98]",
        outline:
          "border border-white/10 bg-transparent text-gray-100 hover:bg-white/5 hover:border-white/20 active:bg-white/[0.08]",
      },
      size: {
        xs: "h-7 px-2.5 text-xs",
        sm: "h-8 px-3.5 text-sm",
        md: "h-10 px-5 text-sm",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  icon?: LucideIcon;
  children?: ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      loading = false,
      disabled,
      icon: Icon,
      children,
      onClick,
      type = "button",
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || loading}
        onClick={onClick}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : Icon ? (
          <Icon className="h-4 w-4" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
