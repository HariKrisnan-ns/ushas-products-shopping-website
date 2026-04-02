// Simple in-memory rate limiter
// For production at scale, replace with Redis (e.g. Upstash)

const rateLimitMap = new Map()

/**
 * Returns true if the request should be blocked (rate limit exceeded)
 * @param {string} key - unique key (e.g. userId or IP)
 * @param {number} limit - max requests allowed
 * @param {number} windowMs - time window in milliseconds
 */
export function isRateLimited(key, limit = 10, windowMs = 60_000) {
    const now = Date.now()
    const record = rateLimitMap.get(key)

    if (!record || now - record.startTime > windowMs) {
        // New window
        rateLimitMap.set(key, { count: 1, startTime: now })
        return false
    }

    if (record.count >= limit) {
        return true // Blocked
    }

    record.count++
    return false
}
