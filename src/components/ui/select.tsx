"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDown, Check } from "lucide-react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function Select({
  options,
  value,
  onChange,
  placeholder = "Select...",
  className,
  disabled,
}: SelectProps) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={onChange} disabled={disabled}>
      <SelectPrimitive.Trigger
        className={cn(
          "inline-flex items-center justify-between gap-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-gray-100",
          "hover:border-white/20 transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50",
          "data-[placeholder]:text-gray-500",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={4}
          className={cn(
            "z-50 min-w-[8rem] overflow-hidden rounded-xl border border-white/10 bg-gray-900/95 backdrop-blur-xl shadow-2xl",
            "data-[state=open]:animate-in data-[state=closed]:animate-out"
          )}
        >
          <SelectPrimitive.Viewport className="p-1">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                className={cn(
                  "relative flex cursor-default select-none items-center rounded-lg px-8 py-2 text-sm text-gray-300",
                  "hover:bg-white/5 hover:text-gray-100",
                  "focus-visible:outline-none focus-visible:bg-white/5",
                  "data-[state=checked]:text-gray-100 data-[state=checked]:bg-white/5"
                )}
              >
                <span className="absolute left-2 flex items-center justify-center">
                  <SelectPrimitive.ItemIndicator>
                    <Check className="h-4 w-4 text-blue-400" />
                  </SelectPrimitive.ItemIndicator>
                </span>
                <SelectPrimitive.ItemText>
                  {option.label}
                </SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}

export {
  SelectPrimitive as SelectBase,
};
