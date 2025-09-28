const EventEmitter = require('events');

/**
 * Advanced Real-Time Analytics System
 */
class RealTimeAnalytics extends EventEmitter {
  constructor() {
    super();
    this.metrics = {
      events: {
        total: 0,
        byCategory: {},
        byLocation: {},
        byTime: {},
        trending: [],
        popular: []
      },
      users: {
        active: 0,
        new: 0,
        returning: 0,
        byLocation: {},
        byDevice: {},
        byTime: {}
      },
      interactions: {
        mapViews: 0,
        eventClicks: 0,
        filterUses: 0,
        searches: 0,
        shares: 0,
        favorites: 0
      },
      performance: {
        responseTime: [],
        errorRate: 0,
        uptime: 100,
        memoryUsage: 0,
        cpuUsage: 0
      },
      trends: {
        hotSpots: [],
        emergingCategories: [],
        peakTimes: [],
        seasonalPatterns: {}
      }
    };
    
    this.startTime = Date.now();
    this.updateInterval = 5000; // Update every 5 seconds
    this.startRealTimeUpdates();
  }

  /**
   * Track event interactions
   */
  trackEventInteraction(type, data) {
    const timestamp = Date.now();
    
    switch (type) {
      case 'event_view':
        this.metrics.interactions.eventClicks++;
        this.trackEventPopularity(data.eventId, data.category);
        break;
        
      case 'map_view':
        this.metrics.interactions.mapViews++;
        break;
        
      case 'filter_use':
        this.metrics.interactions.filterUses++;
        this.trackFilterUsage(data.category, data.location);
        break;
        
      case 'search':
        this.metrics.interactions.searches++;
        this.trackSearchQuery(data.query, data.results);
        break;
        
      case 'share':
        this.metrics.interactions.shares++;
        this.trackSocialSharing(data.eventId, data.platform);
        break;
        
      case 'favorite':
        this.metrics.interactions.favorites++;
        this.trackFavorites(data.eventId, data.action);
        break;
    }
    
    this.emit('interaction', { type, data, timestamp });
  }

  /**
   * Track user behavior
   */
  trackUser(userId, action, data = {}) {
    const timestamp = Date.now();
    
    switch (action) {
      case 'login':
        this.metrics.users.active++;
        this.metrics.users.new++;
        this.trackUserLocation(userId, data.location);
        this.trackUserDevice(userId, data.device);
        break;
        
      case 'logout':
        this.metrics.users.active = Math.max(0, this.metrics.users.active - 1);
        break;
        
      case 'return':
        this.metrics.users.returning++;
        break;
        
      case 'location_update':
        this.trackUserLocation(userId, data.location);
        break;
    }
    
    this.emit('user_action', { userId, action, data, timestamp });
  }

  /**
   * Track event data
   */
  trackEvent(eventData) {
    this.metrics.events.total++;
    
    // Track by category
    const category = eventData.category || 'Other';
    this.metrics.events.byCategory[category] = (this.metrics.events.byCategory[category] || 0) + 1;
    
    // Track by location
    if (eventData.address) {
      const area = this.extractArea(eventData.address);
      this.metrics.events.byLocation[area] = (this.metrics.events.byLocation[area] || 0) + 1;
    }
    
    // Track by time
    const hour = new Date().getHours();
    this.metrics.events.byTime[hour] = (this.metrics.events.byTime[hour] || 0) + 1;
    
    // Update trending events
    this.updateTrendingEvents(eventData);
    
    this.emit('event_added', eventData);
  }

  /**
   * Track system performance
   */
  trackPerformance(metrics) {
    this.metrics.performance = {
      ...this.metrics.performance,
      ...metrics,
      uptime: this.calculateUptime()
    };
    
    this.emit('performance_update', this.metrics.performance);
  }

  /**
   * Get real-time dashboard data
   */
  getDashboardData() {
    return {
      ...this.metrics,
      realTime: {
        eventsPerMinute: this.calculateEventsPerMinute(),
        activeUsers: this.metrics.users.active,
        topCategories: this.getTopCategories(),
        hotSpots: this.getHotSpots(),
        trendingEvents: this.getTrendingEvents(),
        systemHealth: this.getSystemHealth()
      }
    };
  }

  /**
   * Get analytics insights
   */
  getInsights() {
    return {
      peakHours: this.getPeakHours(),
      popularCategories: this.getPopularCategories(),
      userEngagement: this.getUserEngagement(),
      eventTrends: this.getEventTrends(),
      recommendations: this.getRecommendations()
    };
  }

  /**
   * Generate analytics report
   */
  generateReport(timeframe = '24h') {
    const now = Date.now();
    const timeframeMs = this.getTimeframeMs(timeframe);
    const startTime = now - timeframeMs;
    
    return {
      timeframe,
      summary: {
        totalEvents: this.metrics.events.total,
        activeUsers: this.metrics.users.active,
        interactions: this.metrics.interactions,
        topCategory: this.getTopCategory(),
        mostActiveHour: this.getMostActiveHour(),
        engagementRate: this.calculateEngagementRate()
      },
      trends: this.analyzeTrends(startTime, now),
      insights: this.generateInsights(),
      recommendations: this.generateRecommendations()
    };
  }

  // Private helper methods
  startRealTimeUpdates() {
    setInterval(() => {
      this.updateRealTimeMetrics();
      this.emit('metrics_update', this.metrics);
    }, this.updateInterval);
  }

  updateRealTimeMetrics() {
    // Update trending events
    this.updateTrendingEvents();
    
    // Update hot spots
    this.updateHotSpots();
    
    // Update performance metrics
    this.updatePerformanceMetrics();
  }

  trackEventPopularity(eventId, category) {
    const event = this.metrics.events.popular.find(e => e.id === eventId);
    if (event) {
      event.views++;
    } else {
      this.metrics.events.popular.push({
        id: eventId,
        category,
        views: 1,
        timestamp: Date.now()
      });
    }
    
    // Keep only top 50 popular events
    this.metrics.events.popular = this.metrics.events.popular
      .sort((a, b) => b.views - a.views)
      .slice(0, 50);
  }

  trackFilterUsage(category, location) {
    // Track which filters are used most
    if (!this.metrics.trends.filterUsage) {
      this.metrics.trends.filterUsage = {};
    }
    
    const key = `${category}_${location || 'all'}`;
    this.metrics.trends.filterUsage[key] = (this.metrics.trends.filterUsage[key] || 0) + 1;
  }

  trackSearchQuery(query, results) {
    if (!this.metrics.trends.searchQueries) {
      this.metrics.trends.searchQueries = [];
    }
    
    this.metrics.trends.searchQueries.push({
      query,
      resultsCount: results.length,
      timestamp: Date.now()
    });
    
    // Keep only last 1000 searches
    if (this.metrics.trends.searchQueries.length > 1000) {
      this.metrics.trends.searchQueries = this.metrics.trends.searchQueries.slice(-1000);
    }
  }

  trackSocialSharing(eventId, platform) {
    if (!this.metrics.trends.socialShares) {
      this.metrics.trends.socialShares = {};
    }
    
    this.metrics.trends.socialShares[platform] = (this.metrics.trends.socialShares[platform] || 0) + 1;
  }

  trackFavorites(eventId, action) {
    if (!this.metrics.trends.favorites) {
      this.metrics.trends.favorites = {};
    }
    
    this.metrics.trends.favorites[eventId] = (this.metrics.trends.favorites[eventId] || 0) + (action === 'add' ? 1 : -1);
  }

  trackUserLocation(userId, location) {
    if (location) {
      const area = this.extractArea(location);
      this.metrics.users.byLocation[area] = (this.metrics.users.byLocation[area] || 0) + 1;
    }
  }

  trackUserDevice(userId, device) {
    if (device) {
      this.metrics.users.byDevice[device] = (this.metrics.users.byDevice[device] || 0) + 1;
    }
  }

  updateTrendingEvents(eventData) {
    if (!eventData) return;
    
    const trending = this.metrics.events.trending.find(e => e.category === eventData.category);
    if (trending) {
      trending.count++;
      trending.lastSeen = Date.now();
    } else {
      this.metrics.events.trending.push({
        category: eventData.category,
        count: 1,
        firstSeen: Date.now(),
        lastSeen: Date.now()
      });
    }
    
    // Sort by count and keep top 20
    this.metrics.events.trending = this.metrics.events.trending
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
  }

  updateHotSpots() {
    // Calculate hot spots based on event density
    const locationCounts = {};
    Object.entries(this.metrics.events.byLocation).forEach(([location, count]) => {
      locationCounts[location] = count;
    });
    
    this.metrics.trends.hotSpots = Object.entries(locationCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([location, count]) => ({ location, count }));
  }

  updatePerformanceMetrics() {
    // Simulate performance metrics (in real app, get from system)
    this.metrics.performance.memoryUsage = Math.random() * 100;
    this.metrics.performance.cpuUsage = Math.random() * 100;
  }

  calculateEventsPerMinute() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    // This would be calculated from actual event timestamps
    return Math.floor(Math.random() * 10) + 5; // Simulated
  }

  getTopCategories() {
    return Object.entries(this.metrics.events.byCategory)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category, count]) => ({ category, count }));
  }

  getHotSpots() {
    return this.metrics.trends.hotSpots;
  }

  getTrendingEvents() {
    return this.metrics.events.trending.slice(0, 5);
  }

  getSystemHealth() {
    const { uptime, memoryUsage, cpuUsage } = this.metrics.performance;
    let health = 'excellent';
    
    if (uptime < 95 || memoryUsage > 90 || cpuUsage > 90) {
      health = 'poor';
    } else if (uptime < 99 || memoryUsage > 70 || cpuUsage > 70) {
      health = 'fair';
    } else if (uptime < 99.5 || memoryUsage > 50 || cpuUsage > 50) {
      health = 'good';
    }
    
    return { status: health, uptime, memoryUsage, cpuUsage };
  }

  getPeakHours() {
    return Object.entries(this.metrics.events.byTime)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }));
  }

  getPopularCategories() {
    return this.getTopCategories();
  }

  getUserEngagement() {
    const totalInteractions = Object.values(this.metrics.interactions).reduce((sum, val) => sum + val, 0);
    const activeUsers = this.metrics.users.active;
    
    return {
      totalInteractions,
      activeUsers,
      engagementRate: activeUsers > 0 ? totalInteractions / activeUsers : 0
    };
  }

  getEventTrends() {
    return this.metrics.events.trending;
  }

  getRecommendations() {
    return [
      'Consider adding more events in trending categories',
      'Optimize for peak usage hours',
      'Focus on popular locations',
      'Improve user engagement features'
    ];
  }

  getTopCategory() {
    const categories = Object.entries(this.metrics.events.byCategory);
    if (categories.length === 0) return 'None';
    
    return categories.sort(([,a], [,b]) => b - a)[0][0];
  }

  getMostActiveHour() {
    const hours = Object.entries(this.metrics.events.byTime);
    if (hours.length === 0) return 12;
    
    return parseInt(hours.sort(([,a], [,b]) => b - a)[0][0]);
  }

  calculateEngagementRate() {
    const totalInteractions = Object.values(this.metrics.interactions).reduce((sum, val) => sum + val, 0);
    const totalUsers = this.metrics.users.active + this.metrics.users.returning;
    
    return totalUsers > 0 ? (totalInteractions / totalUsers) * 100 : 0;
  }

  calculateUptime() {
    const now = Date.now();
    const totalTime = now - this.startTime;
    const downtime = 0; // In real app, track actual downtime
    return ((totalTime - downtime) / totalTime) * 100;
  }

  extractArea(address) {
    // Simple area extraction from address
    if (address.includes('Manhattan')) return 'Manhattan';
    if (address.includes('Brooklyn')) return 'Brooklyn';
    if (address.includes('Queens')) return 'Queens';
    if (address.includes('Bronx')) return 'Bronx';
    if (address.includes('Staten Island')) return 'Staten Island';
    return 'Other';
  }

  getTimeframeMs(timeframe) {
    const timeframes = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };
    return timeframes[timeframe] || timeframes['24h'];
  }

  analyzeTrends(startTime, endTime) {
    // Analyze trends within the timeframe
    return {
      growthRate: Math.random() * 20 - 10, // Simulated
      topPerformingCategories: this.getTopCategories(),
      userGrowth: Math.random() * 15 + 5,
      engagementTrend: 'increasing'
    };
  }

  generateInsights() {
    return [
      'Music events are trending this week',
      'Evening events have higher engagement',
      'Users prefer events in Manhattan',
      'Mobile usage is increasing'
    ];
  }

  generateRecommendations() {
    return [
      'Add more evening events',
      'Focus on Manhattan locations',
      'Improve mobile experience',
      'Add social sharing features'
    ];
  }
}

module.exports = { RealTimeAnalytics };
