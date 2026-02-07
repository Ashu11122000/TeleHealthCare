const cache = new Map();

// Set cache with TTL (ms)
export function setCache(key, value, ttlMs = 60_000) {
    cache.set(key, {
        value,
        expiresAt: Date.now() + ttlMs
    });
}

// Get Cache Value (auto-expire)
export function getCache(key) {
    const entry = cache.get(key);
    if(!entry) {
        return null;
    }

    if(Date.now() > entry.expiresAt) {
        cache.delete(key);
        return null;
    }

    return entry.value;
}

// Clear all cache (admin/testing)
export function clearCache() {
    cache.clear();
}