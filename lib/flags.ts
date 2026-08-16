import { getFeatureFlag } from "./db";

const CACHE_MS = 5000;
const cache = new Map<string, { value: boolean; expiresAt: number }>();

export async function isFeatureLive(flagKey: string): Promise<boolean> {
  const cached = cache.get(flagKey);
  const now = Date.now();
  if (cached && cached.expiresAt > now) return cached.value;

  const value = await getFeatureFlag(flagKey);
  cache.set(flagKey, { value, expiresAt: now + CACHE_MS });
  return value;
}
