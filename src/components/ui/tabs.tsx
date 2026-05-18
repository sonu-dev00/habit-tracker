"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface Tab {
  value: string;
  label: string;
  icon?: LucideIcon;
}

export interface TabsProps {
  tabs: Tab[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children?: ReactNode;
  className?: string;
}

export function Tabs({
  tabs,
  defaultValue,
  value,
  onValueChange,
  children,
  className,
}: TabsProps) {
  return (
    <TabsPrimitive.Root
      defaultValue={defaultValue ?? tabs[0]?.value}
      value={value}
      onValueChange={onValueChange}
      className={cn("", className)}
    >
      <TabsPrimitive.List className="inline-flex items-center gap-1 rounded-xl bg-white/5 p-1 border border-white/10">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <TabsPrimitive.Trigger
              key={tab.value}
              value={tab.value}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
                "text-gray-400 hover:text-gray-200",
                "data-[state=active]:bg-white/10 data-[state=active]:text-gray-100 data-[state=active]:shadow-sm",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-1 focus-visible:ring-offset-gray-950"
              )}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {tab.label}
            </TabsPrimitive.Trigger>
          );
        })}
      </TabsPrimitive.List>
      {children}
    </TabsPrimitive.Root>
  );
}

export function TabContent({
  value,
  children,
  className,
}: {
  value: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <TabsPrimitive.Content
      value={value}
      className={cn("mt-4 focus-visible:outline-none", className)}
    >
      {children}
    </TabsPrimitive.Content>
  );
}
