const CACHE_TTL = 24 * 60 * 60 * 1000;

interface CacheEntry {
  response: string;
  cachedAt: number;
}

function getKey(messages: { role: string; content: string }[]): string {
  const summary = messages.map((m) => `${m.role}:${m.content.slice(0, 100)}`).join("|");
  return `ai:${Buffer.from(summary).toString("base64").slice(0, 100)}`;
}

const memoryCache = new Map<string, CacheEntry>();

export async function getCachedResponse(messages: { role: string; content: string }[]): Promise<string | null> {
  const key = getKey(messages);
  const entry = memoryCache.get(key);
  if (entry && Date.now() - entry.cachedAt < CACHE_TTL) {
    return entry.response;
  }
  if (entry) memoryCache.delete(key);
  return null;
}

export async function setCachedResponse(messages: { role: string; content: string }[], response: string): Promise<void> {
  const key = getKey(messages);
  memoryCache.set(key, { response, cachedAt: Date.now() });

  if (memoryCache.size > 1000) {
    const oldest = [...memoryCache.entries()].sort(([, a], [, b]) => a.cachedAt - b.cachedAt)[0];
    if (oldest) memoryCache.delete(oldest[0]);
  }
}

export function clearCache(): void {
  memoryCache.clear();
}
