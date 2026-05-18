import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import crypto from "crypto";

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
  if (isYesterday(d)) return "yesterday";
  return format(d, "MMM d, yyyy");
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

export function generateReferralCode(length: number = 8): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join("");
}

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString("hex");
const ALGORITHM = "aes-256-gcm";

export function encrypt(text: string): string {
  const key = Buffer.from(ENCRYPTION_KEY.padEnd(64, "0").slice(0, 64), "hex");
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

export function decrypt(encryptedText: string): string {
  const key = Buffer.from(ENCRYPTION_KEY.padEnd(64, "0").slice(0, 64), "hex");
  const parts = encryptedText.split(":");
  if (parts.length !== 3) throw new Error("Invalid encrypted text format");
  const [ivHex, authTagHex, encrypted] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export function randomId(): string {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}
