const EventEmitter = require('events');
const WebSocket = require('ws');

/**
 * Advanced Real-Time Notification System
 */
class NotificationSystem extends EventEmitter {
  constructor() {
    super();
    this.connections = new Map(); // userId -> WebSocket
    this.userPreferences = new Map(); // userId -> preferences
    this.notificationQueue = [];
    this.isProcessing = false;
    this.analytics = {
      sent: 0,
      delivered: 0,
      clicked: 0,
      dismissed: 0
    };
  }

  /**
   * Add user connection
   */
  addConnection(userId, ws) {
    this.connections.set(userId, ws);
    
    ws.on('close', () => {
      this.connections.delete(userId);
    });
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        this.handleUserMessage(userId, message);
      } catch (error) {
        console.error('Error parsing user message:', error);
      }
    });
    
    // Send welcome notification
    this.sendNotification(userId, {
      type: 'welcome',
      title: 'Welcome to PulseNYC!',
      message: 'You\'re now connected to real-time event updates',
      priority: 'low',
      timestamp: Date.now()
    });
  }

  /**
   * Send notification to user
   */
  sendNotification(userId, notification) {
    const ws = this.connections.get(userId);
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      // Queue notification for later delivery
      this.queueNotification(userId, notification);
      return false;
    }

    try {
      const notificationData = {
        id: this.generateNotificationId(),
        userId,
        ...notification,
        timestamp: Date.now(),
        delivered: true
      };

      ws.send(JSON.stringify(notificationData));
      this.analytics.sent++;
      this.analytics.delivered++;
      
      this.emit('notification_sent', notificationData);
      return true;
      
    } catch (error) {
      console.error('Error sending notification:', error);
      this.queueNotification(userId, notification);
      return false;
    }
  }

  /**
   * Send broadcast notification to all users
   */
  broadcastNotification(notification, filter = null) {
    const sent = [];
    
    for (const [userId, ws] of this.connections) {
      if (filter && !filter(userId)) continue;
      
      if (this.sendNotification(userId, notification)) {
        sent.push(userId);
      }
    }
    
    return sent;
  }

  /**
   * Send targeted notification based on user preferences
   */
  sendTargetedNotification(notification, targeting) {
    const { categories, locations, userTypes, demographics } = targeting;
    const targetUsers = this.getTargetUsers(targeting);
    
    let sent = 0;
    for (const userId of targetUsers) {
      if (this.sendNotification(userId, notification)) {
        sent++;
      }
    }
    
    return sent;
  }

  /**
   * Send event-based notifications
   */
  sendEventNotification(event, notificationType) {
    const notifications = this.createEventNotifications(event, notificationType);
    
    for (const notification of notifications) {
      this.sendTargetedNotification(notification.notification, notification.targeting);
    }
  }

  /**
   * Send proximity-based notifications
   */
  sendProximityNotification(userId, nearbyEvents) {
    if (nearbyEvents.length === 0) return;
    
    const notification = {
      type: 'proximity',
      title: `${nearbyEvents.length} events near you!`,
      message: `Discover ${nearbyEvents.length} events happening nearby right now`,
      priority: 'medium',
      data: {
        events: nearbyEvents.slice(0, 3),
        totalCount: nearbyEvents.length
      },
      actions: [
        {
          type: 'view_events',
          label: 'View Events',
          action: 'open_map'
        }
      ]
    };
    
    this.sendNotification(userId, notification);
  }

  /**
   * Send personalized recommendations
   */
  sendRecommendationNotification(userId, recommendations) {
    if (recommendations.length === 0) return;
    
    const topRecommendation = recommendations[0];
    const notification = {
      type: 'recommendation',
      title: 'Recommended for you',
      message: `Based on your preferences: ${topRecommendation.name}`,
      priority: 'medium',
      data: {
        recommendations: recommendations.slice(0, 3),
        totalCount: recommendations.length
      },
      actions: [
        {
          type: 'view_recommendations',
          label: 'View All',
          action: 'open_recommendations'
        },
        {
          type: 'view_event',
          label: 'View Event',
          action: 'open_event',
          eventId: topRecommendation.id
        }
      ]
    };
    
    this.sendNotification(userId, notification);
  }

  /**
   * Send trending event notifications
   */
  sendTrendingNotification(trendingEvents) {
    const notification = {
      type: 'trending',
      title: 'Trending in NYC',
      message: `Check out what's trending: ${trendingEvents[0]?.name || 'New events'}`,
      priority: 'low',
      data: {
        events: trendingEvents.slice(0, 5),
        totalCount: trendingEvents.length
      },
      actions: [
        {
          type: 'view_trending',
          label: 'View Trending',
          action: 'open_trending'
        }
      ]
    };
    
    this.broadcastNotification(notification);
  }

  /**
   * Send weather-based notifications
   */
  sendWeatherNotification(weatherData, affectedEvents) {
    if (affectedEvents.length === 0) return;
    
    const notification = {
      type: 'weather',
      title: 'Weather Update',
      message: `${weatherData.condition} may affect ${affectedEvents.length} outdoor events`,
      priority: 'high',
      data: {
        weather: weatherData,
        affectedEvents: affectedEvents.slice(0, 3),
        totalCount: affectedEvents.length
      },
      actions: [
        {
          type: 'view_affected_events',
          label: 'View Events',
          action: 'open_weather_events'
        }
      ]
    };
    
    this.broadcastNotification(notification);
  }

  /**
   * Send price drop notifications
   */
  sendPriceDropNotification(userId, event, oldPrice, newPrice) {
    const notification = {
      type: 'price_drop',
      title: 'Price Drop Alert!',
      message: `${event.name} price dropped from ${oldPrice} to ${newPrice}`,
      priority: 'high',
      data: {
        event,
        oldPrice,
        newPrice,
        savings: this.calculateSavings(oldPrice, newPrice)
      },
      actions: [
        {
          type: 'view_event',
          label: 'View Event',
          action: 'open_event',
          eventId: event.id
        },
        {
          type: 'book_now',
          label: 'Book Now',
          action: 'book_event',
          eventId: event.id
        }
      ]
    };
    
    this.sendNotification(userId, notification);
  }

  /**
   * Send event reminder notifications
   */
  sendEventReminder(userId, event, reminderType) {
    const timeUntilEvent = this.calculateTimeUntilEvent(event.startTime);
    const reminderMessages = {
      '1hour': `Reminder: ${event.name} starts in 1 hour`,
      '1day': `Reminder: ${event.name} is tomorrow`,
      '1week': `Reminder: ${event.name} is next week`
    };
    
    const notification = {
      type: 'reminder',
      title: 'Event Reminder',
      message: reminderMessages[reminderType] || `Reminder: ${event.name}`,
      priority: 'medium',
      data: {
        event,
        reminderType,
        timeUntilEvent
      },
      actions: [
        {
          type: 'view_event',
          label: 'View Event',
          action: 'open_event',
          eventId: event.id
        },
        {
          type: 'add_to_calendar',
          label: 'Add to Calendar',
          action: 'add_calendar',
          eventId: event.id
        }
      ]
    };
    
    this.sendNotification(userId, notification);
  }

  /**
   * Handle user message
   */
  handleUserMessage(userId, message) {
    switch (message.type) {
      case 'notification_clicked':
        this.handleNotificationClick(userId, message.notificationId);
        break;
      case 'notification_dismissed':
        this.handleNotificationDismiss(userId, message.notificationId);
        break;
      case 'update_preferences':
        this.updateUserPreferences(userId, message.preferences);
        break;
      case 'subscribe_to_category':
        this.subscribeToCategory(userId, message.category);
        break;
      case 'unsubscribe_from_category':
        this.unsubscribeFromCategory(userId, message.category);
        break;
    }
  }

  /**
   * Handle notification click
   */
  handleNotificationClick(userId, notificationId) {
    this.analytics.clicked++;
    this.emit('notification_clicked', { userId, notificationId });
  }

  /**
   * Handle notification dismiss
   */
  handleNotificationDismiss(userId, notificationId) {
    this.analytics.dismissed++;
    this.emit('notification_dismissed', { userId, notificationId });
  }

  /**
   * Update user preferences
   */
  updateUserPreferences(userId, preferences) {
    this.userPreferences.set(userId, {
      ...this.userPreferences.get(userId),
      ...preferences
    });
    
    this.emit('preferences_updated', { userId, preferences });
  }

  /**
   * Subscribe user to category
   */
  subscribeToCategory(userId, category) {
    const preferences = this.userPreferences.get(userId) || {};
    const subscribedCategories = preferences.subscribedCategories || [];
    
    if (!subscribedCategories.includes(category)) {
      subscribedCategories.push(category);
      this.updateUserPreferences(userId, { subscribedCategories });
    }
  }

  /**
   * Unsubscribe user from category
   */
  unsubscribeFromCategory(userId, category) {
    const preferences = this.userPreferences.get(userId) || {};
    const subscribedCategories = preferences.subscribedCategories || [];
    
    const index = subscribedCategories.indexOf(category);
    if (index > -1) {
      subscribedCategories.splice(index, 1);
      this.updateUserPreferences(userId, { subscribedCategories });
    }
  }

  /**
   * Get analytics data
   */
  getAnalytics() {
    return {
      ...this.analytics,
      activeConnections: this.connections.size,
      queuedNotifications: this.notificationQueue.length,
      deliveryRate: this.analytics.sent > 0 ? (this.analytics.delivered / this.analytics.sent) * 100 : 0,
      clickRate: this.analytics.delivered > 0 ? (this.analytics.clicked / this.analytics.delivered) * 100 : 0
    };
  }

  // Private helper methods
  queueNotification(userId, notification) {
    this.notificationQueue.push({
      userId,
      notification,
      timestamp: Date.now(),
      retries: 0
    });
    
    if (!this.isProcessing) {
      this.processNotificationQueue();
    }
  }

  async processNotificationQueue() {
    this.isProcessing = true;
    
    while (this.notificationQueue.length > 0) {
      const queuedNotification = this.notificationQueue.shift();
      const { userId, notification, retries } = queuedNotification;
      
      if (retries < 3) {
        if (this.sendNotification(userId, notification)) {
          // Successfully sent
        } else {
          // Failed, requeue with retry
          this.notificationQueue.push({
            ...queuedNotification,
            retries: retries + 1
          });
        }
      }
      
      // Small delay between notifications
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    this.isProcessing = false;
  }

  createEventNotifications(event, notificationType) {
    const notifications = [];
    
    switch (notificationType) {
      case 'new_event':
        notifications.push({
          notification: {
            type: 'new_event',
            title: 'New Event Added',
            message: `${event.name} - ${event.category} event in ${event.area}`,
            priority: 'medium',
            data: { event }
          },
          targeting: {
            categories: [event.category],
            locations: [event.area]
          }
        });
        break;
        
      case 'event_updated':
        notifications.push({
          notification: {
            type: 'event_updated',
            title: 'Event Updated',
            message: `${event.name} has been updated`,
            priority: 'low',
            data: { event }
          },
          targeting: {
            userTypes: ['interested'] // Users who showed interest
          }
        });
        break;
        
      case 'event_cancelled':
        notifications.push({
          notification: {
            type: 'event_cancelled',
            title: 'Event Cancelled',
            message: `${event.name} has been cancelled`,
            priority: 'high',
            data: { event }
          },
          targeting: {
            userTypes: ['interested', 'registered']
          }
        });
        break;
    }
    
    return notifications;
  }

  getTargetUsers(targeting) {
    const targetUsers = new Set();
    
    for (const [userId, preferences] of this.userPreferences) {
      let matches = true;
      
      if (targeting.categories && targeting.categories.length > 0) {
        const userCategories = preferences.subscribedCategories || [];
        matches = matches && targeting.categories.some(cat => userCategories.includes(cat));
      }
      
      if (targeting.locations && targeting.locations.length > 0) {
        const userLocation = preferences.location;
        matches = matches && targeting.locations.includes(userLocation);
      }
      
      if (targeting.userTypes && targeting.userTypes.length > 0) {
        const userType = preferences.userType || 'new';
        matches = matches && targeting.userTypes.includes(userType);
      }
      
      if (matches) {
        targetUsers.add(userId);
      }
    }
    
    return Array.from(targetUsers);
  }

  generateNotificationId() {
    return 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  calculateSavings(oldPrice, newPrice) {
    const old = parseFloat(oldPrice.replace(/[^0-9.]/g, ''));
    const new_ = parseFloat(newPrice.replace(/[^0-9.]/g, ''));
    return old - new_;
  }

  calculateTimeUntilEvent(startTime) {
    const now = new Date();
    const eventTime = new Date(startTime);
    return eventTime - now;
  }
}

module.exports = { NotificationSystem };
