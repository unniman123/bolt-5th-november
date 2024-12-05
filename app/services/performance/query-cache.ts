import { Observable } from '@nativescript/core';

export class QueryCache extends Observable {
    private static instance: QueryCache;
    private cache: Map<string, { data: any; timestamp: number }> = new Map();
    private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

    private constructor() {
        super();
    }

    static getInstance(): QueryCache {
        if (!QueryCache.instance) {
            QueryCache.instance = new QueryCache();
        }
        return QueryCache.instance;
    }

    async get<T>(key: string): Promise<T | null> {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.DEFAULT_TTL) {
            return cached.data as T;
        }
        return null;
    }

    set(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });

        // Schedule cleanup
        setTimeout(() => {
            this.cache.delete(key);
        }, ttl);
    }

    invalidate(pattern: string): void {
        for (const key of this.cache.keys()) {
            if (key.includes(pattern)) {
                this.cache.delete(key);
            }
        }
    }
}