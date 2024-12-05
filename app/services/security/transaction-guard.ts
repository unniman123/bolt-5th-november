import { supabase } from '../supabase';

export class TransactionGuard {
    private static instance: TransactionGuard;
    private readonly LOCK_TIMEOUT = 30000; // 30 seconds

    private constructor() {}

    static getInstance(): TransactionGuard {
        if (!TransactionGuard.instance) {
            TransactionGuard.instance = new TransactionGuard();
        }
        return TransactionGuard.instance;
    }

    async executeTransaction<T>(
        operation: () => Promise<T>,
        lockKey: string
    ): Promise<T> {
        const lockId = await this.acquireLock(lockKey);
        try {
            return await operation();
        } finally {
            await this.releaseLock(lockKey, lockId);
        }
    }

    private async acquireLock(key: string): Promise<string> {
        const lockId = Math.random().toString(36).substring(7);
        const { error } = await supabase.rpc('acquire_lock', {
            p_key: key,
            p_lock_id: lockId,
            p_timeout: this.LOCK_TIMEOUT
        });

        if (error) throw new Error('Failed to acquire lock');
        return lockId;
    }

    private async releaseLock(key: string, lockId: string): Promise<void> {
        await supabase.rpc('release_lock', {
            p_key: key,
            p_lock_id: lockId
        });
    }
}