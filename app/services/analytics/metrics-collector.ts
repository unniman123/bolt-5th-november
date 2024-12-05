import { Observable } from '@nativescript/core';
import { supabase } from '../supabase';

export interface PerformanceMetrics {
  screenLoadTime: number;
  apiLatency: number;
  memoryUsage: number;
  batteryLevel: number;
}

export class MetricsCollector extends Observable {
  private static instance: MetricsCollector;
  private metrics: PerformanceMetrics = {
    screenLoadTime: 0,
    apiLatency: 0,
    memoryUsage: 0,
    batteryLevel: 100
  };

  private constructor() {
    super();
    this.startCollection();
  }

  static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector();
    }
    return MetricsCollector.instance;
  }

  recordScreenLoad(screenName: string, loadTime: number): void {
    this.metrics.screenLoadTime = loadTime;
    this.saveMetrics('screen_load', { screenName, loadTime });
  }

  recordApiCall(endpoint: string, latency: number): void {
    this.metrics.apiLatency = latency;
    this.saveMetrics('api_latency', { endpoint, latency });
  }

  private async saveMetrics(type: string, data: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('performance_metrics')
        .insert([{
          type,
          data,
          timestamp: new Date().toISOString()
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to save metrics:', error);
    }
  }

  private startCollection(): void {
    setInterval(() => {
      this.collectSystemMetrics();
    }, 60000); // Collect every minute
  }

  private async collectSystemMetrics(): Promise<void> {
    // Collect system metrics
    const metrics = {
      memoryUsage: this.getMemoryUsage(),
      batteryLevel: await this.getBatteryLevel()
    };

    await this.saveMetrics('system', metrics);
  }

  private getMemoryUsage(): number {
    // Implementation depends on platform
    return process.memoryUsage().heapUsed / 1024 / 1024; // MB
  }

  private async getBatteryLevel(): Promise<number> {
    // Implementation depends on platform
    return 100; // Placeholder
  }
}