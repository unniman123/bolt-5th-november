-- Analytics tables
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_name TEXT NOT NULL,
    user_id UUID REFERENCES profiles(id),
    properties JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS performance_metrics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type TEXT NOT NULL,
    data JSONB NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS health_check (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    service TEXT NOT NULL,
    status TEXT NOT NULL,
    latency INTEGER NOT NULL,
    error TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_analytics_events_name ON analytics_events(event_name);
CREATE INDEX idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_timestamp ON analytics_events(timestamp);

CREATE INDEX idx_performance_metrics_type ON performance_metrics(type);
CREATE INDEX idx_performance_metrics_timestamp ON performance_metrics(timestamp);

CREATE INDEX idx_health_check_service ON health_check(service);
CREATE INDEX idx_health_check_status ON health_check(status);
CREATE INDEX idx_health_check_timestamp ON health_check(timestamp);

-- Create function to clean up old data
CREATE OR REPLACE FUNCTION cleanup_analytics_data() RETURNS void AS $$
BEGIN
    -- Keep last 30 days of analytics events
    DELETE FROM analytics_events
    WHERE timestamp < NOW() - INTERVAL '30 days';
    
    -- Keep last 7 days of performance metrics
    DELETE FROM performance_metrics
    WHERE timestamp < NOW() - INTERVAL '7 days';
    
    -- Keep last 24 hours of health checks
    DELETE FROM health_check
    WHERE timestamp < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup job
SELECT cron.schedule(
    'cleanup_analytics_data',
    '0 0 * * *', -- Run daily at midnight
    $$SELECT cleanup_analytics_data()$$
);