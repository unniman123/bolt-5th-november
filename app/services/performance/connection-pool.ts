import { Observable } from '@nativescript/core';
import { supabase } from '../supabase';

export class ConnectionPool extends Observable {
    private static instance: ConnectionPool;
    private readonly MAX_RETRIES = 3;
    private readonly RETRY_DELAY = 1000;
    private isConnected = false;

    private constructor() {
        super();
        this.setupConnectionMonitoring();
    }

    static getInstance(): ConnectionPool {
        if (!ConnectionPool.instance) {
            ConnectionPool.instance = new ConnectionPool();
        }
        return ConnectionPool.instance;
    }

    private setupConnectionMonitoring(): void {
        supabase.realtime.onOpen(() => {
            this.isConnected = true;
            this.notifyPropertyChange('connectionStatus', 'connected');
        });

        supabase.realtime.onClose(() => {
            this.isConnected = false;
            this.notifyPropertyChange('connectionStatus', 'disconnected');
            this.attemptReconnect();
        });
    }

    private async attemptReconnect(retries = 0): Promise<void> {
        if (retries >= this.MAX_RETRIES || this.isConnected) return;

        try {
            await supabase.realtime.connect();
        } catch (error) {
            console.error('Reconnection attempt failed:', error);
            setTimeout(() => {
                this.attemptReconnect(retries + 1);
            }, this.RETRY_DELAY * Math.pow(2, retries));
        }
    }

    async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
        for (let i = 0; i < this.MAX_RETRIES; i++) {
            try {
                return await operation();
            } catch (error) {
                if (i === this.MAX_RETRIES - 1) throw error;
                await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY * Math.pow(2, i)));
            }
        }
        throw new Error('Max retries exceeded');
    }
}