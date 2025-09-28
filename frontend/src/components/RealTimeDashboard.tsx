import React, { useState, useEffect, useRef } from 'react';

interface DashboardMetrics {
  events: {
    total: number;
    byCategory: { [key: string]: number };
    byLocation: { [key: string]: number };
    trending: Array<{ category: string; count: number }>;
  };
  users: {
    active: number;
    new: number;
    returning: number;
    byLocation: { [key: string]: number };
  };
  interactions: {
    mapViews: number;
    eventClicks: number;
    filterUses: number;
    searches: number;
  };
  performance: {
    responseTime: number;
    uptime: number;
    memoryUsage: number;
    cpuUsage: number;
  };
  trends: {
    hotSpots: Array<{ location: string; count: number }>;
    peakTimes: Array<{ hour: number; count: number }>;
  };
}

interface RealTimeDashboardProps {
  onMetricClick?: (metric: string, data: any) => void;
}

const RealTimeDashboard: React.FC<RealTimeDashboardProps> = ({ onMetricClick }) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const [isLive, setIsLive] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    initializeDashboard();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const initializeDashboard = async () => {
    try {
      // Simulate initial data load
      const initialMetrics = await loadDashboardData();
      setMetrics(initialMetrics);
      setLoading(false);
      
      // Start real-time updates
      if (isLive) {
        startRealTimeUpdates();
      }
    } catch (error) {
      console.error('Error initializing dashboard:', error);
      setLoading(false);
    }
  };

  const loadDashboardData = async (): Promise<DashboardMetrics> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      events: {
        total: 1247,
        byCategory: {
          'Music': 312,
          'Art': 189,
          'Food & Drink': 267,
          'Comedy': 156,
          'Free': 203,
          'Other': 120
        },
        byLocation: {
          'Manhattan': 456,
          'Brooklyn': 389,
          'Queens': 234,
          'Bronx': 98,
          'Staten Island': 70
        },
        trending: [
          { category: 'Music', count: 45 },
          { category: 'Art', count: 32 },
          { category: 'Food & Drink', count: 28 }
        ]
      },
      users: {
        active: 1247,
        new: 89,
        returning: 1158,
        byLocation: {
          'Manhattan': 456,
          'Brooklyn': 389,
          'Queens': 234
        }
      },
      interactions: {
        mapViews: 3456,
        eventClicks: 1234,
        filterUses: 567,
        searches: 890
      },
      performance: {
        responseTime: 145,
        uptime: 99.9,
        memoryUsage: 67.8,
        cpuUsage: 23.4
      },
      trends: {
        hotSpots: [
          { location: 'East Village', count: 89 },
          { location: 'Williamsburg', count: 76 },
          { location: 'SoHo', count: 65 }
        ],
        peakTimes: [
          { hour: 19, count: 234 },
          { hour: 20, count: 267 },
          { hour: 21, count: 198 }
        ]
      }
    };
  };

  const startRealTimeUpdates = () => {
    // Simulate WebSocket connection
    const updateMetrics = () => {
      setMetrics(prevMetrics => {
        if (!prevMetrics) return prevMetrics;
        
        return {
          ...prevMetrics,
          events: {
            ...prevMetrics.events,
            total: prevMetrics.events.total + Math.floor(Math.random() * 3),
            byCategory: Object.fromEntries(
              Object.entries(prevMetrics.events.byCategory).map(([key, value]) => [
                key,
                value + Math.floor(Math.random() * 2)
              ])
            )
          },
          users: {
            ...prevMetrics.users,
            active: prevMetrics.users.active + Math.floor(Math.random() * 5) - 2
          },
          interactions: {
            ...prevMetrics.interactions,
            mapViews: prevMetrics.interactions.mapViews + Math.floor(Math.random() * 10),
            eventClicks: prevMetrics.interactions.eventClicks + Math.floor(Math.random() * 5)
          }
        };
      });
      
      if (isLive) {
        animationRef.current = requestAnimationFrame(updateMetrics);
      }
    };
    
    updateMetrics();
  };

  const toggleLiveUpdates = () => {
    setIsLive(!isLive);
    if (!isLive) {
      startRealTimeUpdates();
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Music': '#FF3B30',
      'Art': '#007AFF',
      'Food & Drink': '#34C759',
      'Comedy': '#FF9500',
      'Free': '#FFCC00',
      'Other': '#AF52DE'
    };
    return colors[category] || '#8E8E93';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getPerformanceColor = (value: number, type: 'uptime' | 'memory' | 'cpu') => {
    if (type === 'uptime') {
      if (value >= 99.5) return '#34C759';
      if (value >= 99) return '#FF9500';
      return '#FF3B30';
    }
    
    if (type === 'memory' || type === 'cpu') {
      if (value <= 50) return '#34C759';
      if (value <= 80) return '#FF9500';
      return '#FF3B30';
    }
    
    return '#8E8E93';
  };

  if (loading) {
    return (
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '40px',
        textAlign: 'center',
        border: '1px solid rgba(0, 0, 0, 0.1)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #e5e5e7',
          borderTop: '3px solid #007AFF',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px auto'
        }} />
        <h3 style={{ color: '#1d1d1f', margin: '0 0 8px 0' }}>Loading Dashboard</h3>
        <p style={{ color: '#86868b', margin: '0' }}>Initializing real-time analytics...</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '40px',
        textAlign: 'center',
        border: '1px solid rgba(0, 0, 0, 0.1)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
        <h3 style={{ color: '#1d1d1f', margin: '0 0 8px 0' }}>No Data Available</h3>
        <p style={{ color: '#86868b', margin: '0' }}>Unable to load dashboard metrics</p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      padding: '24px',
      border: '1px solid rgba(0, 0, 0, 0.1)',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#1d1d1f',
            margin: '0 0 8px 0',
            letterSpacing: '-0.5px'
          }}>
            Real-Time Dashboard
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#86868b',
            margin: '0'
          }}>
            Live analytics and insights
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Timeframe Selector */}
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            style={{
              background: 'rgba(0, 0, 0, 0.05)',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '14px',
              color: '#1d1d1f',
              cursor: 'pointer'
            }}
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          
          {/* Live Toggle */}
          <button
            onClick={toggleLiveUpdates}
            style={{
              background: isLive ? '#34C759' : 'rgba(0, 0, 0, 0.05)',
              color: isLive ? '#ffffff' : '#1d1d1f',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: isLive ? '#ffffff' : '#FF3B30',
              animation: isLive ? 'pulse 2s infinite' : 'none'
            }} />
            {isLive ? 'Live' : 'Paused'}
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <MetricCard
          title="Total Events"
          value={formatNumber(metrics.events.total)}
          change="+12%"
          trend="up"
          color="#007AFF"
          onClick={() => onMetricClick?.('events', metrics.events)}
        />
        <MetricCard
          title="Active Users"
          value={formatNumber(metrics.users.active)}
          change="+8%"
          trend="up"
          color="#34C759"
          onClick={() => onMetricClick?.('users', metrics.users)}
        />
        <MetricCard
          title="Map Views"
          value={formatNumber(metrics.interactions.mapViews)}
          change="+23%"
          trend="up"
          color="#FF9500"
          onClick={() => onMetricClick?.('interactions', metrics.interactions)}
        />
        <MetricCard
          title="Uptime"
          value={`${metrics.performance.uptime}%`}
          change="+0.1%"
          trend="up"
          color={getPerformanceColor(metrics.performance.uptime, 'uptime')}
          onClick={() => onMetricClick?.('performance', metrics.performance)}
        />
      </div>

      {/* Charts and Visualizations */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* Events by Category */}
        <ChartCard
          title="Events by Category"
          data={Object.entries(metrics.events.byCategory)}
          type="bar"
          getColor={getCategoryColor}
          onClick={(item) => onMetricClick?.('category', item)}
        />
        
        {/* Hot Spots */}
        <ChartCard
          title="Popular Locations"
          data={metrics.trends.hotSpots}
          type="list"
          getColor={() => '#007AFF'}
          onClick={(item) => onMetricClick?.('location', item)}
        />
      </div>

      {/* Performance Metrics */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.02)',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid rgba(0, 0, 0, 0.05)'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#1d1d1f',
          margin: '0 0 16px 0'
        }}>
          System Performance
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '16px'
        }}>
          <PerformanceMetric
            label="Response Time"
            value={`${metrics.performance.responseTime}ms`}
            color={metrics.performance.responseTime < 200 ? '#34C759' : '#FF9500'}
          />
          <PerformanceMetric
            label="Memory Usage"
            value={`${metrics.performance.memoryUsage}%`}
            color={getPerformanceColor(metrics.performance.memoryUsage, 'memory')}
          />
          <PerformanceMetric
            label="CPU Usage"
            value={`${metrics.performance.cpuUsage}%`}
            color={getPerformanceColor(metrics.performance.cpuUsage, 'cpu')}
          />
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

// Metric Card Component
const MetricCard: React.FC<{
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  color: string;
  onClick?: () => void;
}> = ({ title, value, change, trend, color, onClick }) => (
  <div
    onClick={onClick}
    style={{
      background: 'rgba(255, 255, 255, 0.8)',
      border: '1px solid rgba(0, 0, 0, 0.1)',
      borderRadius: '12px',
      padding: '20px',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.2s ease'
    }}
    onMouseEnter={(e) => {
      if (onClick) {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
      }
    }}
    onMouseLeave={(e) => {
      if (onClick) {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }
    }}
  >
    <h4 style={{
      fontSize: '14px',
      fontWeight: '500',
      color: '#86868b',
      margin: '0 0 8px 0',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    }}>
      {title}
    </h4>
    <div style={{
      fontSize: '28px',
      fontWeight: '700',
      color: '#1d1d1f',
      margin: '0 0 8px 0',
      letterSpacing: '-0.5px'
    }}>
      {value}
    </div>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      fontSize: '14px',
      fontWeight: '500',
      color: trend === 'up' ? '#34C759' : '#FF3B30'
    }}>
      <span>{trend === 'up' ? '↗' : '↘'}</span>
      <span>{change}</span>
    </div>
  </div>
);

// Chart Card Component
const ChartCard: React.FC<{
  title: string;
  data: any[];
  type: 'bar' | 'list';
  getColor: (item: any) => string;
  onClick?: (item: any) => void;
}> = ({ title, data, type, getColor, onClick }) => (
  <div style={{
    background: 'rgba(255, 255, 255, 0.8)',
    border: '1px solid rgba(0, 0, 0, 0.1)',
    borderRadius: '12px',
    padding: '20px'
  }}>
    <h3 style={{
      fontSize: '16px',
      fontWeight: '600',
      color: '#1d1d1f',
      margin: '0 0 16px 0'
    }}>
      {title}
    </h3>
    
    {type === 'bar' ? (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {data.map(([key, value], index) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '2px',
              background: getColor(key)
            }} />
            <span style={{
              fontSize: '14px',
              color: '#1d1d1f',
              minWidth: '80px'
            }}>
              {key}
            </span>
            <div style={{
              flex: 1,
              height: '8px',
              background: 'rgba(0, 0, 0, 0.1)',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                background: getColor(key),
                width: `${(value / Math.max(...data.map(([,v]) => v))) * 100}%`,
                transition: 'width 0.3s ease'
              }} />
            </div>
            <span style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#1d1d1f',
              minWidth: '40px',
              textAlign: 'right'
            }}>
              {value}
            </span>
          </div>
        ))}
      </div>
    ) : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {data.map((item, index) => (
          <div
            key={index}
            onClick={() => onClick?.(item)}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 12px',
              background: 'rgba(0, 0, 0, 0.02)',
              borderRadius: '8px',
              cursor: onClick ? 'pointer' : 'default',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (onClick) {
                e.currentTarget.style.background = 'rgba(0, 122, 255, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (onClick) {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.02)';
              }
            }}
          >
            <span style={{ fontSize: '14px', color: '#1d1d1f' }}>
              {item.location || item.category}
            </span>
            <span style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#1d1d1f'
            }}>
              {item.count}
            </span>
          </div>
        ))}
      </div>
    )}
  </div>
);

// Performance Metric Component
const PerformanceMetric: React.FC<{
  label: string;
  value: string;
  color: string;
}> = ({ label, value, color }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{
      fontSize: '24px',
      fontWeight: '700',
      color: color,
      margin: '0 0 4px 0'
    }}>
      {value}
    </div>
    <div style={{
      fontSize: '12px',
      color: '#86868b',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    }}>
      {label}
    </div>
  </div>
);

export default RealTimeDashboard;
