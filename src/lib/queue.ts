type QueueHandler<T = any> = (job: T) => Promise<void>;

interface QueueJob<T = any> {
  id: string;
  type: string;
  data: T;
  createdAt: Date;
}

interface EmailJobData {
  type: "welcome" | "password_reset" | "subscription" | "weekly_review" | "deletion";
  to: string;
  name?: string;
  plan?: string;
  token?: string;
  stats?: {
    completions: number;
    streak: number;
    totalHabits: number;
    xpEarned: number;
    level: number;
  };
}

interface AnalyticsJobData {
  event: string;
  userId: string;
  properties?: Record<string, unknown>;
  timestamp: Date;
}

interface AIJobData {
  type: "coaching" | "analysis" | "suggestion";
  userId: string;
  payload: Record<string, unknown>;
}

interface CleanupJobData {
  target: "sessions" | "audit_logs" | "temp_data" | "notifications";
  olderThanDays: number;
}

class Queue<T = any> {
  private name: string;
  private handlers: Map<string, QueueHandler<T>> = new Map();
  private jobs: QueueJob<T>[] = [];
  private processing = false;

  constructor(name: string) {
    this.name = name;
  }

  process(type: string, handler: QueueHandler<T>): void {
    this.handlers.set(type, handler);
  }

  async add(type: string, data: T): Promise<string> {
    const id = `${this.name}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    this.jobs.push({ id, type, data, createdAt: new Date() });
    if (!this.processing) {
      this.processing = true;
      setImmediate(() => this.processQueue());
    }
    return id;
  }

  private async processQueue(): Promise<void> {
    while (this.jobs.length > 0) {
      const job = this.jobs.shift()!;
      const handler = this.handlers.get(job.type);
      if (handler) {
        try {
          await handler(job.data);
        } catch (error) {
          console.error(`[Queue:${this.name}] Job ${job.id} failed:`, error);
        }
      }
    }
    this.processing = false;
  }

  get length(): number {
    return this.jobs.length;
  }
}

export const emailQueue = new Queue<EmailJobData>("email");
export const analyticsQueue = new Queue<AnalyticsJobData>("analytics");
export const aiQueue = new Queue<AIJobData>("ai");
export const cleanupQueue = new Queue<CleanupJobData>("cleanup");

export async function addJob(
  queue: string,
  type: string,
  data: Record<string, unknown>,
): Promise<string> {
  const queues: Record<string, Queue<any>> = {
    email: emailQueue,
    analytics: analyticsQueue,
    ai: aiQueue,
    cleanup: cleanupQueue,
  };

  const q = queues[queue];
  if (!q) {
    throw new Error(`Unknown queue: ${queue}`);
  }

  return q.add(type, data);
}

export async function processJobs(): Promise<void> {
  const queues = [emailQueue, analyticsQueue, aiQueue, cleanupQueue];
  await Promise.all(queues.map((q) => q.length));
}

export type { QueueJob, EmailJobData, AnalyticsJobData, AIJobData, CleanupJobData };
