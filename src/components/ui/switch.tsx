"use client";

import * as SwitchPrimitive from "@radix-ui/react-switch";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps {
  label?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
}

const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ label, checked, onChange, disabled, className, id }, ref) => {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <SwitchPrimitive.Root
          ref={ref}
          id={id}
          checked={checked}
          onCheckedChange={onChange}
          disabled={disabled}
          className={cn(
            "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent",
            "transition-colors duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950",
            "disabled:cursor-not-allowed disabled:opacity-50",
            checked
              ? "bg-blue-600"
              : "bg-white/10 hover:bg-white/20"
          )}
        >
          <SwitchPrimitive.Thumb
            className={cn(
              "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-sm ring-0",
              "transition-transform duration-200",
              checked ? "translate-x-5" : "translate-x-0"
            )}
          />
        </SwitchPrimitive.Root>
        {label && (
          <label
            htmlFor={id}
            className="text-sm text-gray-300 cursor-pointer select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Switch.displayName = "Switch";

export { Switch };
