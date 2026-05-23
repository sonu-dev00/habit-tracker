export type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  requestId?: string;
  userId?: string;
  path?: string;
  method?: string;
  duration?: number;
  statusCode?: number;
  error?: string;
  [key: string]: unknown;
}

function formatLog(entry: LogEntry): string {
  const { level, message, timestamp, ...extras } = entry;
  const base = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  const extrasStr = Object.keys(extras).length > 0 ? ` ${JSON.stringify(extras)}` : "";
  return base + extrasStr;
}

function createEntry(level: LogLevel, message: string, meta?: Partial<LogEntry>): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  };
}

export const logger = {
  debug: (message: string, meta?: Partial<LogEntry>) => {
    if (process.env.NODE_ENV !== "production") {
      console.debug(formatLog(createEntry("debug", message, meta)));
    }
  },
  info: (message: string, meta?: Partial<LogEntry>) => {
    console.info(formatLog(createEntry("info", message, meta)));
  },
  warn: (message: string, meta?: Partial<LogEntry>) => {
    console.warn(formatLog(createEntry("warn", message, meta)));
  },
  error: (message: string, meta?: Partial<LogEntry>) => {
    console.error(formatLog(createEntry("error", message, meta)));
  },
};
