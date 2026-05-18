import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
});

export const createHabitSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  category: z.enum(["HEALTH", "FITNESS", "MIND", "WORK", "LEARNING", "SOCIAL", "FINANCE", "CREATIVE", "SPIRITUAL", "OTHER"]),
  priority: z.enum(["ESSENTIAL", "IMPORTANT", "NORMAL", "BONUS"]),
  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY"]),
  xpReward: z.number().int().min(1).max(100).default(5),
  timeToComplete: z.number().int().min(1).max(120).default(5),
  reminderTime: z.string().optional(),
  isPinned: z.boolean().default(false),
});

export const updateHabitSchema = createHabitSchema.partial().extend({
  isArchived: z.boolean().optional(),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  image: z.string().url().optional(),
  twoFactorEnabled: z.boolean().optional(),
});

export const analyticsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  category: z.string().optional(),
  period: z.enum(["day", "week", "month", "year"]).default("week"),
});

export const feedbackSchema = z.object({
  type: z.enum(["feature", "bug", "improvement", "general"]),
  message: z.string().min(10, "Message must be at least 10 characters").max(1000),
});

export const adminActionSchema = z.object({
  action: z.enum(["ban", "unban", "delete", "promote", "demote"]),
  userId: z.string().min(1),
  reason: z.string().optional(),
});
