const HTML_TAG_RE = /<[^>]*>/g;
const SCRIPT_RE = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
const ON_ATTR_RE = /\bon\w+\s*=\s*["'][^"']*["']/gi;
const JS_PROTOCOL_RE = /javascript\s*:/gi;
const DATA_ATTR_RE = /data\s*:\s*text\/html/gi;

export function sanitize(input: string): string {
  let cleaned = input;
  cleaned = cleaned.replace(SCRIPT_RE, "");
  cleaned = cleaned.replace(ON_ATTR_RE, "");
  cleaned = cleaned.replace(JS_PROTOCOL_RE, "blocked:");
  cleaned = cleaned.replace(DATA_ATTR_RE, "");
  cleaned = cleaned.replace(HTML_TAG_RE, "");
  return cleaned.trim();
}

export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  fields: (keyof T)[]
): T {
  const result = { ...obj };
  for (const field of fields) {
    const value = result[field];
    if (typeof value === "string") {
      result[field] = sanitize(value) as T[keyof T];
    }
  }
  return result;
}
