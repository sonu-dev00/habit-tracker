"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: LucideIcon;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, icon: Icon, type, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-1.5 block text-sm font-medium text-gray-300">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <Icon className="h-4 w-4 text-gray-500" />
            </div>
          )}
          <input
            ref={ref}
            type={type}
            className={cn(
              "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-gray-100 placeholder:text-gray-500",
              "transition-colors duration-200",
              "hover:border-white/20",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-white/[0.02]",
              Icon && "pl-10",
              error && "border-red-500/50 focus-visible:ring-red-500/50 focus-visible:border-red-500/50",
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-red-400">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-xs text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
