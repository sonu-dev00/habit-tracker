import { Queue as BullQueue, Worker, Job } from "bullmq";

const connection = {
  url: process.env.REDIS_URL || "redis://localhost:6379",
};

const QUEUE_NAMES = ["email", "analytics", "ai", "cleanup"] as const;
type QueueName = typeof QUEUE_NAMES[number];

const queues = new Map<QueueName, BullQueue>();

function getQueue(name: QueueName): BullQueue {
  if (!queues.has(name)) {
    queues.set(name, new BullQueue(name, { connection }));
  }
  return queues.get(name)!;
}

export async function addJob(queue: string, type: string, data: Record<string, unknown>): Promise<string> {
  const q = getQueue(queue as QueueName);
  const job = await q.add(type, data);
  return job.id ?? "";
}

type EmailJobData = { type: string; to: string; name?: string; plan?: string; token?: string; stats?: Record<string, unknown> };
type AnalyticsJobData = { event: string; userId: string; properties?: Record<string, unknown>; timestamp: Date };
type AIJobData = { type: string; userId: string; payload: Record<string, unknown> };
type CleanupJobData = { target: string; olderThanDays: number };

const handlers = new Map<string, Map<string, (data: Record<string, unknown>) => Promise<void>>>();

export function registerHandler(queue: QueueName, type: string, handler: (data: Record<string, unknown>) => Promise<void>): void {
  if (!handlers.has(queue)) handlers.set(queue, new Map());
  handlers.get(queue)!.set(type, handler);
}

export function startWorkers(): void {
  for (const name of QUEUE_NAMES) {
    const typeHandlers = handlers.get(name);
    if (!typeHandlers || typeHandlers.size === 0) continue;

    new Worker(
      name,
      async (job: Job) => {
        const handler = typeHandlers.get(job.name);
        if (handler) {
          await handler(job.data);
        }
      },
      { connection },
    );
  }
}

export { getQueue };
export type { QueueName, EmailJobData, AnalyticsJobData, AIJobData, CleanupJobData };
