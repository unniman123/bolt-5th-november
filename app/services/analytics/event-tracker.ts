import { Observable } from '@nativescript/core';
import { supabase } from '../supabase';

export interface AnalyticsEvent {
  eventName: string;
  userId?: string;
  properties?: Record<string, any>;
  timestamp?: string;
}

export class EventTracker extends Observable {
  private static instance: EventTracker;
  private readonly BATCH_SIZE = 10;
  private eventQueue: AnalyticsEvent[] = [];

  private constructor() {
    super();
    this.setupPeriodicFlush();
  }

  static getInstance(): EventTracker {
    if (!EventTracker.instance) {
      EventTracker.instance = new EventTracker();
    }
    return EventTracker.instance;
  }

  async trackEvent(event: AnalyticsEvent): Promise<void> {
    this.eventQueue.push({
      ...event,
      timestamp: new Date().toISOString()
    });

    if (this.eventQueue.length >= this.BATCH_SIZE) {
      await this.flushEvents();
    }
  }

  private async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      const { error } = await supabase
        .from('analytics_events')
        .insert(events);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to flush analytics events:', error);
      // Re-queue failed events
      this.eventQueue = [...events, ...this.eventQueue];
    }
  }

  private setupPeriodicFlush(): void {
    setInterval(() => {
      this.flushEvents();
    }, 30000); // Flush every 30 seconds
  }
}