"use client";

import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-xl",
};

function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

const gradients = [
  "from-blue-600 to-purple-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-rose-600",
  "from-cyan-500 to-blue-600",
  "from-pink-500 to-purple-600",
  "from-amber-500 to-orange-600",
  "from-indigo-500 to-blue-600",
  "from-green-500 to-emerald-600",
];

function getGradient(name: string): string {
  return gradients[hashName(name) % gradients.length];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: keyof typeof sizeClasses;
  className?: string;
}

const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(
  ({ src, alt, name, size = "md", className }, ref) => {
    const initials = name ? getInitials(name) : "?";
    const gradient = name ? getGradient(name) : "from-gray-600 to-gray-700";

    return (
      <AvatarPrimitive.Root
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center overflow-hidden rounded-full",
          sizeClasses[size],
          className
        )}
      >
        <AvatarPrimitive.Image
          src={src ?? undefined}
          alt={alt ?? name ?? ""}
          className="h-full w-full rounded-full object-cover"
        />
        <AvatarPrimitive.Fallback
          className={cn(
            "flex h-full w-full items-center justify-center bg-gradient-to-br font-medium text-white",
            gradient
          )}
          delayMs={600}
        >
          {initials}
        </AvatarPrimitive.Fallback>
      </AvatarPrimitive.Root>
    );
  }
);

Avatar.displayName = "Avatar";

export { Avatar };
