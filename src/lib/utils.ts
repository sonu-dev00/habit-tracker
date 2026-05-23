import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isToday } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, pattern: string = "PPP"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, pattern);
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isToday(d)) return formatDistanceToNow(d, { addSuffix: true });
  return format(d, "MMM d, yyyy");
}

export function randomId(): string {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}
