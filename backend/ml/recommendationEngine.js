/**
 * Advanced Machine Learning Recommendation Engine
 */
class MLRecommendationEngine {
  constructor() {
    this.userProfiles = new Map();
    this.eventFeatures = new Map();
    this.interactionMatrix = new Map();
    this.collaborativeFilter = new CollaborativeFilter();
    this.contentBasedFilter = new ContentBasedFilter();
    this.hybridRecommender = new HybridRecommender();
    this.realTimeProcessor = new RealTimeProcessor();
  }

  /**
   * Train the recommendation models
   */
  async trainModels(trainingData) {
    console.log('Training ML recommendation models...');
    
    try {
      // Prepare training data
      const { users, events, interactions } = this.prepareTrainingData(trainingData);
      
      // Train collaborative filtering model
      await this.collaborativeFilter.train(users, events, interactions);
      
      // Train content-based filtering model
      await this.contentBasedFilter.train(events);
      
      // Train hybrid model
      await this.hybridRecommender.train(
        this.collaborativeFilter,
        this.contentBasedFilter
      );
      
      console.log('ML models trained successfully');
      return true;
      
    } catch (error) {
      console.error('Error training ML models:', error);
      return false;
    }
  }

  /**
   * Get personalized recommendations for a user
   */
  async getRecommendations(userId, options = {}) {
    try {
      const {
        limit = 10,
        categories = [],
        location = null,
        timeRange = null,
        excludeSeen = true
      } = options;

      // Get user profile
      const userProfile = this.getUserProfile(userId);
      
      // Get available events
      const availableEvents = await this.getAvailableEvents({
        categories,
        location,
        timeRange,
        excludeSeen: excludeSeen ? userId : null
      });

      // Generate recommendations using multiple approaches
      const recommendations = await Promise.all([
        this.collaborativeFilter.recommend(userId, availableEvents, limit),
        this.contentBasedFilter.recommend(userProfile, availableEvents, limit),
        this.hybridRecommender.recommend(userId, availableEvents, limit),
        this.realTimeProcessor.getTrendingRecommendations(availableEvents, limit)
      ]);

      // Combine and rank recommendations
      const combinedRecommendations = this.combineRecommendations(recommendations);
      
      // Apply diversity and freshness filters
      const finalRecommendations = this.applyFilters(combinedRecommendations, {
        diversity: true,
        freshness: true,
        location: location,
        categories: categories
      });

      return finalRecommendations.slice(0, limit);

    } catch (error) {
      console.error('Error generating recommendations:', error);
      return this.getFallbackRecommendations(limit);
    }
  }

  /**
   * Update user preferences based on interactions
   */
  updateUserPreferences(userId, interaction) {
    const userProfile = this.getUserProfile(userId);
    
    switch (interaction.type) {
      case 'view':
        this.updateViewPreference(userProfile, interaction.eventId);
        break;
      case 'click':
        this.updateClickPreference(userProfile, interaction.eventId);
        break;
      case 'favorite':
        this.updateFavoritePreference(userProfile, interaction.eventId);
        break;
      case 'share':
        this.updateSharePreference(userProfile, interaction.eventId);
        break;
      case 'attend':
        this.updateAttendancePreference(userProfile, interaction.eventId);
        break;
    }
    
    this.userProfiles.set(userId, userProfile);
  }

  /**
   * Get similar users for collaborative filtering
   */
  getSimilarUsers(userId, limit = 10) {
    const userProfile = this.getUserProfile(userId);
    const similarities = [];
    
    for (const [otherUserId, otherProfile] of this.userProfiles) {
      if (otherUserId === userId) continue;
      
      const similarity = this.calculateUserSimilarity(userProfile, otherProfile);
      similarities.push({ userId: otherUserId, similarity });
    }
    
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  /**
   * Get similar events for content-based filtering
   */
  getSimilarEvents(eventId, limit = 10) {
    const eventFeatures = this.eventFeatures.get(eventId);
    if (!eventFeatures) return [];
    
    const similarities = [];
    
    for (const [otherEventId, otherFeatures] of this.eventFeatures) {
      if (otherEventId === eventId) continue;
      
      const similarity = this.calculateEventSimilarity(eventFeatures, otherFeatures);
      similarities.push({ eventId: otherEventId, similarity });
    }
    
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  /**
   * Predict user rating for an event
   */
  predictRating(userId, eventId) {
    const userProfile = this.getUserProfile(userId);
    const eventFeatures = this.eventFeatures.get(eventId);
    
    if (!eventFeatures) return 0.5;
    
    // Use collaborative filtering prediction
    const cfPrediction = this.collaborativeFilter.predictRating(userId, eventId);
    
    // Use content-based filtering prediction
    const cbPrediction = this.contentBasedFilter.predictRating(userProfile, eventFeatures);
    
    // Combine predictions
    return (cfPrediction * 0.6) + (cbPrediction * 0.4);
  }

  /**
   * Get explanation for a recommendation
   */
  getRecommendationExplanation(userId, eventId) {
    const userProfile = this.getUserProfile(userId);
    const eventFeatures = this.eventFeatures.get(eventId);
    
    const explanations = [];
    
    // Similar users explanation
    const similarUsers = this.getSimilarUsers(userId, 3);
    if (similarUsers.length > 0) {
      explanations.push({
        type: 'similar_users',
        text: `Users with similar tastes also liked this event`,
        users: similarUsers.map(u => u.userId)
      });
    }
    
    // Category preference explanation
    if (userProfile.preferredCategories.includes(eventFeatures.category)) {
      explanations.push({
        type: 'category_preference',
        text: `You often attend ${eventFeatures.category} events`
      });
    }
    
    // Location preference explanation
    if (userProfile.preferredLocations.includes(eventFeatures.area)) {
      explanations.push({
        type: 'location_preference',
        text: `You frequently attend events in ${eventFeatures.area}`
      });
    }
    
    // Time preference explanation
    if (userProfile.preferredTimes.includes(eventFeatures.timeSlot)) {
      explanations.push({
        type: 'time_preference',
        text: `You prefer events at this time`
      });
    }
    
    return explanations;
  }

  // Private helper methods
  prepareTrainingData(data) {
    const users = [];
    const events = [];
    const interactions = [];
    
    // Process user data
    for (const [userId, profile] of this.userProfiles) {
      users.push({
        id: userId,
        preferences: profile.preferences,
        demographics: profile.demographics,
        behavior: profile.behavior
      });
    }
    
    // Process event data
    for (const [eventId, features] of this.eventFeatures) {
      events.push({
        id: eventId,
        features: features,
        metadata: features.metadata
      });
    }
    
    // Process interaction data
    for (const [key, interaction] of this.interactionMatrix) {
      interactions.push(interaction);
    }
    
    return { users, events, interactions };
  }

  getUserProfile(userId) {
    if (!this.userProfiles.has(userId)) {
      this.userProfiles.set(userId, this.createDefaultUserProfile(userId));
    }
    return this.userProfiles.get(userId);
  }

  createDefaultUserProfile(userId) {
    return {
      id: userId,
      preferences: {
        categories: [],
        locations: [],
        times: [],
        vibes: [],
        priceRange: { min: 0, max: 100 }
      },
      demographics: {
        age: null,
        gender: null,
        location: null
      },
      behavior: {
        totalInteractions: 0,
        averageSessionTime: 0,
        preferredDevice: 'desktop',
        lastActive: Date.now()
      },
      history: {
        viewed: [],
        clicked: [],
        favorited: [],
        shared: [],
        attended: []
      }
    };
  }

  updateViewPreference(profile, eventId) {
    profile.history.viewed.push({
      eventId,
      timestamp: Date.now()
    });
    profile.behavior.totalInteractions++;
  }

  updateClickPreference(profile, eventId) {
    profile.history.clicked.push({
      eventId,
      timestamp: Date.now()
    });
    profile.behavior.totalInteractions++;
  }

  updateFavoritePreference(profile, eventId) {
    profile.history.favorited.push({
      eventId,
      timestamp: Date.now()
    });
    profile.behavior.totalInteractions++;
  }

  updateSharePreference(profile, eventId) {
    profile.history.shared.push({
      eventId,
      timestamp: Date.now()
    });
    profile.behavior.totalInteractions++;
  }

  updateAttendancePreference(profile, eventId) {
    profile.history.attended.push({
      eventId,
      timestamp: Date.now()
    });
    profile.behavior.totalInteractions++;
  }

  calculateUserSimilarity(profile1, profile2) {
    // Jaccard similarity for categorical preferences
    const categories1 = new Set(profile1.preferences.categories);
    const categories2 = new Set(profile2.preferences.categories);
    const categoryIntersection = new Set([...categories1].filter(x => categories2.has(x)));
    const categoryUnion = new Set([...categories1, ...categories2]);
    const categorySimilarity = categoryIntersection.size / categoryUnion.size;
    
    // Cosine similarity for numerical preferences
    const locations1 = new Set(profile1.preferences.locations);
    const locations2 = new Set(profile2.preferences.locations);
    const locationIntersection = new Set([...locations1].filter(x => locations2.has(x)));
    const locationUnion = new Set([...locations1, ...locations2]);
    const locationSimilarity = locationIntersection.size / locationUnion.size;
    
    // Weighted combination
    return (categorySimilarity * 0.6) + (locationSimilarity * 0.4);
  }

  calculateEventSimilarity(features1, features2) {
    // Category similarity
    const categorySim = features1.category === features2.category ? 1 : 0;
    
    // Location similarity
    const locationSim = features1.area === features2.area ? 1 : 0;
    
    // Time similarity
    const timeSim = features1.timeSlot === features2.timeSlot ? 1 : 0;
    
    // Vibe similarity
    const vibeSim = features1.vibe === features2.vibe ? 1 : 0;
    
    // Price similarity (normalized)
    const priceDiff = Math.abs(features1.price - features2.price);
    const maxPrice = Math.max(features1.price, features2.price);
    const priceSim = maxPrice > 0 ? 1 - (priceDiff / maxPrice) : 1;
    
    // Weighted combination
    return (categorySim * 0.3) + (locationSim * 0.2) + (timeSim * 0.2) + (vibeSim * 0.2) + (priceSim * 0.1);
  }

  combineRecommendations(recommendations) {
    const combined = new Map();
    
    recommendations.forEach(recList => {
      recList.forEach((rec, index) => {
        const eventId = rec.eventId || rec.id;
        const score = rec.score || (1 / (index + 1));
        
        if (combined.has(eventId)) {
          combined.get(eventId).score += score;
          combined.get(eventId).sources.push(rec.source || 'unknown');
        } else {
          combined.set(eventId, {
            eventId,
            score,
            sources: [rec.source || 'unknown'],
            metadata: rec.metadata || {}
          });
        }
      });
    });
    
    return Array.from(combined.values())
      .sort((a, b) => b.score - a.score);
  }

  applyFilters(recommendations, filters) {
    let filtered = [...recommendations];
    
    if (filters.diversity) {
      filtered = this.applyDiversityFilter(filtered);
    }
    
    if (filters.freshness) {
      filtered = this.applyFreshnessFilter(filtered);
    }
    
    if (filters.location) {
      filtered = filtered.filter(rec => 
        rec.metadata.location === filters.location
      );
    }
    
    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter(rec => 
        filters.categories.includes(rec.metadata.category)
      );
    }
    
    return filtered;
  }

  applyDiversityFilter(recommendations) {
    const diversified = [];
    const usedCategories = new Set();
    
    for (const rec of recommendations) {
      if (!usedCategories.has(rec.metadata.category)) {
        diversified.push(rec);
        usedCategories.add(rec.metadata.category);
      }
    }
    
    return diversified;
  }

  applyFreshnessFilter(recommendations) {
    const now = Date.now();
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
    
    return recommendations.filter(rec => 
      rec.metadata.createdAt > oneWeekAgo
    );
  }

  async getAvailableEvents(filters) {
    // This would query the actual event database
    // For now, return mock data
    return [];
  }

  getFallbackRecommendations(limit) {
    return Array.from({ length: limit }, (_, i) => ({
      eventId: `fallback_${i}`,
      score: 0.5,
      sources: ['fallback'],
      metadata: {
        category: 'Other',
        location: 'NYC',
        name: `Fallback Event ${i + 1}`
      }
    }));
  }
}

/**
 * Collaborative Filtering Implementation
 */
class CollaborativeFilter {
  constructor() {
    this.userItemMatrix = new Map();
    this.itemSimilarity = new Map();
    this.isTrained = false;
  }

  async train(users, events, interactions) {
    console.log('Training collaborative filtering model...');
    
    // Build user-item matrix
    this.buildUserItemMatrix(users, events, interactions);
    
    // Calculate item similarities
    this.calculateItemSimilarities();
    
    this.isTrained = true;
    console.log('Collaborative filtering model trained');
  }

  async recommend(userId, availableEvents, limit) {
    if (!this.isTrained) return [];
    
    const userRatings = this.userItemMatrix.get(userId) || new Map();
    const recommendations = [];
    
    for (const event of availableEvents) {
      const eventId = event.id;
      if (userRatings.has(eventId)) continue; // Skip already rated items
      
      const score = this.predictRating(userId, eventId);
      recommendations.push({
        eventId,
        score,
        source: 'collaborative',
        metadata: event
      });
    }
    
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  predictRating(userId, eventId) {
    const userRatings = this.userItemMatrix.get(userId) || new Map();
    const eventSimilarities = this.itemSimilarity.get(eventId) || new Map();
    
    let weightedSum = 0;
    let similaritySum = 0;
    
    for (const [ratedEventId, rating] of userRatings) {
      const similarity = eventSimilarities.get(ratedEventId) || 0;
      weightedSum += rating * similarity;
      similaritySum += Math.abs(similarity);
    }
    
    return similaritySum > 0 ? weightedSum / similaritySum : 0.5;
  }

  buildUserItemMatrix(users, events, interactions) {
    this.userItemMatrix.clear();
    
    for (const interaction of interactions) {
      const { userId, eventId, rating } = interaction;
      
      if (!this.userItemMatrix.has(userId)) {
        this.userItemMatrix.set(userId, new Map());
      }
      
      this.userItemMatrix.get(userId).set(eventId, rating);
    }
  }

  calculateItemSimilarities() {
    this.itemSimilarity.clear();
    
    const allEvents = new Set();
    for (const userRatings of this.userItemMatrix.values()) {
      for (const eventId of userRatings.keys()) {
        allEvents.add(eventId);
      }
    }
    
    for (const eventId1 of allEvents) {
      this.itemSimilarity.set(eventId1, new Map());
      
      for (const eventId2 of allEvents) {
        if (eventId1 === eventId2) continue;
        
        const similarity = this.calculateItemSimilarity(eventId1, eventId2);
        this.itemSimilarity.get(eventId1).set(eventId2, similarity);
      }
    }
  }

  calculateItemSimilarity(eventId1, eventId2) {
    const commonUsers = this.getCommonUsers(eventId1, eventId2);
    
    if (commonUsers.length === 0) return 0;
    
    let sum1 = 0, sum2 = 0, sum1Sq = 0, sum2Sq = 0, pSum = 0;
    
    for (const userId of commonUsers) {
      const rating1 = this.userItemMatrix.get(userId).get(eventId1);
      const rating2 = this.userItemMatrix.get(userId).get(eventId2);
      
      sum1 += rating1;
      sum2 += rating2;
      sum1Sq += rating1 * rating1;
      sum2Sq += rating2 * rating2;
      pSum += rating1 * rating2;
    }
    
    const num = pSum - (sum1 * sum2 / commonUsers.length);
    const den = Math.sqrt((sum1Sq - sum1 * sum1 / commonUsers.length) * (sum2Sq - sum2 * sum2 / commonUsers.length));
    
    return den === 0 ? 0 : num / den;
  }

  getCommonUsers(eventId1, eventId2) {
    const users1 = new Set();
    const users2 = new Set();
    
    for (const [userId, ratings] of this.userItemMatrix) {
      if (ratings.has(eventId1)) users1.add(userId);
      if (ratings.has(eventId2)) users2.add(userId);
    }
    
    return [...users1].filter(userId => users2.has(userId));
  }
}

/**
 * Content-Based Filtering Implementation
 */
class ContentBasedFilter {
  constructor() {
    this.eventFeatures = new Map();
    this.userProfiles = new Map();
    this.isTrained = false;
  }

  async train(events) {
    console.log('Training content-based filtering model...');
    
    // Extract features from events
    for (const event of events) {
      this.eventFeatures.set(event.id, this.extractFeatures(event));
    }
    
    this.isTrained = true;
    console.log('Content-based filtering model trained');
  }

  async recommend(userProfile, availableEvents, limit) {
    if (!this.isTrained) return [];
    
    const recommendations = [];
    
    for (const event of availableEvents) {
      const eventFeatures = this.eventFeatures.get(event.id);
      if (!eventFeatures) continue;
      
      const score = this.calculateContentSimilarity(userProfile, eventFeatures);
      recommendations.push({
        eventId: event.id,
        score,
        source: 'content',
        metadata: event
      });
    }
    
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  predictRating(userProfile, eventFeatures) {
    return this.calculateContentSimilarity(userProfile, eventFeatures);
  }

  extractFeatures(event) {
    return {
      category: event.features?.category || 'Other',
      subcategory: event.features?.subcategory || 'General',
      vibe: event.features?.vibe || 'Casual',
      price: event.features?.price || 0,
      location: event.features?.location || 'NYC',
      timeSlot: event.features?.timeSlot || 'evening',
      ageGroup: event.features?.ageGroup || 'All Ages',
      accessibility: event.features?.accessibility || 'Not Specified',
      indoorOutdoor: event.features?.indoorOutdoor || 'Indoor',
      capacity: event.features?.capacity || 'Medium',
      hashtags: event.features?.hashtags || [],
      keywords: event.features?.keywords || []
    };
  }

  calculateContentSimilarity(userProfile, eventFeatures) {
    let similarity = 0;
    let weightSum = 0;
    
    // Category preference
    if (userProfile.preferences.categories.includes(eventFeatures.category)) {
      similarity += 0.3;
    }
    weightSum += 0.3;
    
    // Location preference
    if (userProfile.preferences.locations.includes(eventFeatures.location)) {
      similarity += 0.2;
    }
    weightSum += 0.2;
    
    // Time preference
    if (userProfile.preferences.times.includes(eventFeatures.timeSlot)) {
      similarity += 0.2;
    }
    weightSum += 0.2;
    
    // Vibe preference
    if (userProfile.preferences.vibes.includes(eventFeatures.vibe)) {
      similarity += 0.15;
    }
    weightSum += 0.15;
    
    // Price preference
    const priceInRange = eventFeatures.price >= userProfile.preferences.priceRange.min &&
                        eventFeatures.price <= userProfile.preferences.priceRange.max;
    if (priceInRange) {
      similarity += 0.15;
    }
    weightSum += 0.15;
    
    return weightSum > 0 ? similarity / weightSum : 0.5;
  }
}

/**
 * Hybrid Recommender System
 */
class HybridRecommender {
  constructor() {
    this.cfWeight = 0.6;
    this.cbWeight = 0.4;
    this.isTrained = false;
  }

  async train(collaborativeFilter, contentBasedFilter) {
    this.collaborativeFilter = collaborativeFilter;
    this.contentBasedFilter = contentBasedFilter;
    this.isTrained = true;
    console.log('Hybrid recommender trained');
  }

  async recommend(userId, availableEvents, limit) {
    if (!this.isTrained) return [];
    
    const userProfile = this.getUserProfile(userId);
    
    const [cfRecs, cbRecs] = await Promise.all([
      this.collaborativeFilter.recommend(userId, availableEvents, limit),
      this.contentBasedFilter.recommend(userProfile, availableEvents, limit)
    ]);
    
    // Combine recommendations
    const combined = new Map();
    
    cfRecs.forEach(rec => {
      const eventId = rec.eventId;
      const score = rec.score * this.cfWeight;
      
      if (combined.has(eventId)) {
        combined.get(eventId).score += score;
      } else {
        combined.set(eventId, {
          eventId,
          score,
          sources: ['collaborative'],
          metadata: rec.metadata
        });
      }
    });
    
    cbRecs.forEach(rec => {
      const eventId = rec.eventId;
      const score = rec.score * this.cbWeight;
      
      if (combined.has(eventId)) {
        combined.get(eventId).score += score;
        combined.get(eventId).sources.push('content');
      } else {
        combined.set(eventId, {
          eventId,
          score,
          sources: ['content'],
          metadata: rec.metadata
        });
      }
    });
    
    return Array.from(combined.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  getUserProfile(userId) {
    // This would get the actual user profile
    return {
      preferences: {
        categories: [],
        locations: [],
        times: [],
        vibes: [],
        priceRange: { min: 0, max: 100 }
      }
    };
  }
}

/**
 * Real-Time Recommendation Processor
 */
class RealTimeProcessor {
  constructor() {
    this.trendingEvents = [];
    this.popularEvents = [];
    this.recentEvents = [];
  }

  async getTrendingRecommendations(availableEvents, limit) {
    // Simulate trending events
    return availableEvents.slice(0, limit).map(event => ({
      eventId: event.id,
      score: Math.random() * 0.3 + 0.7, // High score for trending
      source: 'trending',
      metadata: event
    }));
  }
}

module.exports = { MLRecommendationEngine };
