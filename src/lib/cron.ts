import { prisma } from "@/lib/prisma";
import { sendWeeklyReviewEmail } from "@/lib/email";

type CronHandler = () => Promise<void>;

interface CronJob {
  name: string;
  schedule: string;
  handler: CronHandler;
  enabled: boolean;
}

const cronJobs: CronJob[] = [];

function defineCronJob(name: string, schedule: string, handler: CronHandler, enabled = true): CronJob {
  const job: CronJob = { name, schedule, handler, enabled };
  cronJobs.push(job);
  return job;
}

// ── Daily Jobs ──

const resetDailyChallenges = defineCronJob(
  "reset_daily_challenges",
  "0 0 * * *",
  async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.dailyChallenge.updateMany({
      where: { date: { lt: today } },
      data: { isActive: false },
    });

    await prisma.userDailyChallenge.deleteMany({
      where: { completed: false, challenge: { date: { lt: today } } },
    });

    console.log("[Cron] Daily challenges reset");
  },
);

const sendDailyReminders = defineCronJob(
  "send_daily_reminders",
  "0 8 * * *",
  async () => {
    const users = await prisma.user.findMany({
      where: {
        habits: { some: { isArchived: false } },
        notifications: { none: { type: "daily_reminder", createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } },
      },
      select: { id: true, email: true, name: true },
      take: 100,
    });

    for (const user of users) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: "daily_reminder",
          title: "Time to complete your habits!",
          message: `Hi ${user.name || "there"}! You have habits to complete today.`,
        },
      });
    }

    console.log(`[Cron] Daily reminders sent to ${users.length} users`);
  },
);

const calculateStreaks = defineCronJob(
  "calculate_streaks",
  "0 1 * * *",
  async () => {
    const users = await prisma.user.findMany({
      select: { id: true },
    });

    for (const user of users) {
      const data = await prisma.userHabitData.findUnique({
        where: { userId: user.id },
      });

      if (!data) continue;

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(23, 59, 59, 999);

      const hasCompletionToday = await prisma.habitCompletion.findFirst({
        where: {
          userId: user.id,
          date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      });

      if (!hasCompletionToday && data.lastCompletionDate) {
        const lastDate = new Date(data.lastCompletionDate);
        const diffDays = Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays > 1) {
          await prisma.userHabitData.update({
            where: { userId: user.id },
            data: { streak: 0 },
          });
        }
      }
    }

    console.log("[Cron] Streaks calculated");
  },
);

// ── Weekly Jobs ──

const sendWeeklyReviewEmails = defineCronJob(
  "send_weekly_review_emails",
  "0 9 * * 1",
  async () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const users = await prisma.user.findMany({
      where: {
        email: { not: null },
        subscription: { plan: { not: "FREE" } },
      },
      select: {
        id: true,
        email: true,
        name: true,
        _count: { select: { completions: { where: { date: { gte: weekAgo } } } } },
        userHabitData: { select: { streak: true, xp: true } },
        habits: { where: { isArchived: false }, select: { id: true } },
      },
      take: 50,
    });

    for (const user of users) {
      if (!user.email) continue;

      const xpEarned = user.userHabitData?.xp || 0;
      const level = Math.floor(xpEarned / 100) + 1;

      await sendWeeklyReviewEmail(user.email, user.name || "User", {
        completions: user._count.completions,
        streak: user.userHabitData?.streak || 0,
        totalHabits: user.habits.length,
        xpEarned,
        level,
      });
    }

    console.log(`[Cron] Weekly reviews sent to ${users.length} users`);
  },
);

const cleanupOldSessions = defineCronJob(
  "cleanup_old_sessions",
  "0 3 * * 1",
  async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await prisma.session.deleteMany({
      where: { expires: { lt: thirtyDaysAgo } },
    });

    console.log("[Cron] Old sessions cleaned up");
  },
);

const generateWeeklyAnalytics = defineCronJob(
  "generate_weekly_analytics",
  "0 4 * * 1",
  async () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({
      where: { completions: { some: { date: { gte: weekAgo } } } },
    });
    const totalCompletions = await prisma.habitCompletion.count({
      where: { date: { gte: weekAgo } },
    });

    console.log("[Cron] Weekly analytics:", {
      totalUsers,
      activeUsers,
      totalCompletions,
      engagementRate: activeUsers / totalUsers,
    });
  },
);

// ── Monthly Jobs ──

const resetMonthlyStats = defineCronJob(
  "reset_monthly_stats",
  "0 0 1 * *",
  async () => {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    await prisma.auditLog.create({
      data: {
        action: "MONTHLY_STATS_RESET",
        entity: "System",
        metadata: { resetDate: new Date().toISOString() },
      },
    });

    console.log("[Cron] Monthly stats reset");
  },
);

const cleanupOldAuditLogs = defineCronJob(
  "cleanup_old_audit_logs",
  "0 2 1 * *",
  async () => {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    await prisma.auditLog.deleteMany({
      where: { createdAt: { lt: ninetyDaysAgo } },
    });

    console.log("[Cron] Old audit logs cleaned up");
  },
);

const generateRevenueReports = defineCronJob(
  "generate_revenue_reports",
  "0 5 1 * *",
  async () => {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const startOfMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
    const endOfMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);

    const payments = await prisma.paymentHistory.findMany({
      where: {
        createdAt: { gte: startOfMonth, lte: endOfMonth },
        status: "succeeded",
      },
    });

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const revenueByPlan = payments.reduce(
      (acc, p) => {
        acc[p.plan] = (acc[p.plan] || 0) + p.amount;
        return acc;
      },
      {} as Record<string, number>,
    );

    console.log("[Cron] Monthly revenue report:", {
      month: startOfMonth.toISOString().slice(0, 7),
      totalRevenue,
      revenueByPlan,
      transactionCount: payments.length,
    });
  },
);

export function startCronJobs(): void {
  if (process.env.NODE_ENV === "production" || process.env.RUN_CRON === "true") {
    const enabled = cronJobs.filter((j) => j.enabled);
    console.log(`[Cron] ${enabled.length} jobs registered`);

    for (const job of enabled) {
      const [minute, hour, dayOfMonth, month, dayOfWeek] = job.schedule.split(" ");
      const ms = parseCronToMs(minute, hour, dayOfMonth, month, dayOfWeek);

      if (ms > 0) {
        setTimeout(() => {
          job.handler().catch((err) => console.error(`[Cron] ${job.name} failed:`, err));
          setInterval(() => {
            job.handler().catch((err) => console.error(`[Cron] ${job.name} failed:`, err));
          }, ms);
        }, ms);
      }
    }
  }
}

function parseCronToMs(minute: string, hour: string, _dayOfMonth: string, _month: string, _dayOfWeek: string): number {
  if (minute === "*" && hour === "*") return 60_000;
  if (minute !== "*" && hour === "*") return 60_000 * 60;
  if (minute !== "*" && hour !== "*") return 60_000 * 60 * 24;
  return 60_000 * 60;
}

export type { CronJob, CronHandler };
