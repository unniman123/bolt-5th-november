import { Observable } from '@nativescript/core';
import { supabase } from '../supabase';

interface HealthCheck {
  service: string;
  status: 'healthy' | 'unhealthy';
  latency: number;
  error?: string;
}

export class HealthChecker extends Observable {
  private static instance: HealthChecker;
  private healthStatus: Map<string, HealthCheck> = new Map();

  private constructor() {
    super();
    this.startHealthChecks();
  }

  static getInstance(): HealthChecker {
    if (!HealthChecker.instance) {
      HealthChecker.instance = new HealthChecker();
    }
    return HealthChecker.instance;
  }

  async checkHealth(): Promise<Map<string, HealthCheck>> {
    await Promise.all([
      this.checkDatabase(),
      this.checkAuth(),
      this.checkStorage()
    ]);

    return this.healthStatus;
  }

  private async checkDatabase(): Promise<void> {
    const start = Date.now();
    try {
      const { data, error } = await supabase
        .from('health_check')
        .select('count')
        .single();

      this.healthStatus.set('database', {
        service: 'database',
        status: error ? 'unhealthy' : 'healthy',
        latency: Date.now() - start,
        error: error?.message
      });
    } catch (error) {
      this.healthStatus.set('database', {
        service: 'database',
        status: 'unhealthy',
        latency: Date.now() - start,
        error: error.message
      });
    }
  }

  private async checkAuth(): Promise<void> {
    const start = Date.now();
    try {
      const { data, error } = await supabase.auth.getSession();

      this.healthStatus.set('auth', {
        service: 'auth',
        status: error ? 'unhealthy' : 'healthy',
        latency: Date.now() - start,
        error: error?.message
      });
    } catch (error) {
      this.healthStatus.set('auth', {
        service: 'auth',
        status: 'unhealthy',
        latency: Date.now() - start,
        error: error.message
      });
    }
  }

  private async checkStorage(): Promise<void> {
    const start = Date.now();
    try {
      const { data, error } = await supabase.storage.listBuckets();

      this.healthStatus.set('storage', {
        service: 'storage',
        status: error ? 'unhealthy' : 'healthy',
        latency: Date.now() - start,
        error: error?.message
      });
    } catch (error) {
      this.healthStatus.set('storage', {
        service: 'storage',
        status: 'unhealthy',
        latency: Date.now() - start,
        error: error.message
      });
    }
  }

  private startHealthChecks(): void {
    setInterval(() => {
      this.checkHealth();
    }, 300000); // Check every 5 minutes
  }
}