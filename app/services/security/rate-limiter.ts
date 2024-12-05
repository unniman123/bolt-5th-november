export class RateLimiter {
    private static instance: RateLimiter;
    private requests: Map<string, { count: number; timestamp: number }> = new Map();
    private readonly WINDOW_MS = 60000; // 1 minute
    private readonly MAX_REQUESTS = 60; // 60 requests per minute

    private constructor() {}

    static getInstance(): RateLimiter {
        if (!RateLimiter.instance) {
            RateLimiter.instance = new RateLimiter();
        }
        return RateLimiter.instance;
    }

    async checkLimit(key: string): Promise<boolean> {
        const now = Date.now();
        const windowStart = now - this.WINDOW_MS;

        // Clean up old entries
        this.requests.forEach((value, k) => {
            if (value.timestamp < windowStart) {
                this.requests.delete(k);
            }
        });

        const request = this.requests.get(key) || { count: 0, timestamp: now };

        if (request.timestamp < windowStart) {
            request.count = 1;
            request.timestamp = now;
        } else {
            request.count++;
        }

        this.requests.set(key, request);
        return request.count <= this.MAX_REQUESTS;
    }

    getRemainingRequests(key: string): number {
        const request = this.requests.get(key);
        if (!request) return this.MAX_REQUESTS;
        return Math.max(0, this.MAX_REQUESTS - request.count);
    }
}