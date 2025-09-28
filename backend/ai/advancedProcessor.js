const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Advanced AI Event Processor with multiple AI capabilities
 */
class AdvancedAIProcessor {
  constructor() {
    this.model = genAI.getGenerativeModel({ model: "gemini-pro" });
    this.userPreferences = new Map();
    this.eventHistory = [];
    this.trendingEvents = [];
  }

  /**
   * Extract and enhance event data with AI analysis
   */
  async processEvent(rawText, userContext = {}) {
    try {
      const prompt = `You are an advanced AI event analyst for NYC. Analyze this event text and provide comprehensive insights:

Event Text: ${rawText}

User Context: ${JSON.stringify(userContext)}

Please return a detailed JSON analysis with these fields:
{
  "eventName": "string",
  "description": "string", 
  "address": "string",
  "startTime": "string",
  "endTime": "string",
  "price": "string",
  "category": "string from: Music, Art, Food & Drink, Comedy, Free, Sports, Technology, Business, Education, Health, Other",
  "subcategory": "string (e.g., Jazz, Contemporary Art, Food Truck, Stand-up Comedy)",
  "vibe": "string from: Chill, High-Energy, Professional, Casual, Romantic, Family-Friendly, Trendy, Underground",
  "ageGroup": "string from: All Ages, 18+, 21+, Family, Senior",
  "accessibility": "string from: Wheelchair Accessible, Limited Access, Not Specified",
  "dressCode": "string from: Casual, Smart Casual, Formal, Dressy Casual, No Dress Code",
  "weatherDependent": "boolean",
  "indoorOutdoor": "string from: Indoor, Outdoor, Both",
  "capacity": "string from: Small (1-50), Medium (51-200), Large (201-1000), Very Large (1000+)",
  "socialMedia": "array of social media handles mentioned",
  "hashtags": "array of relevant hashtags",
  "keywords": "array of key terms for search",
  "sentiment": "string from: Positive, Neutral, Negative",
  "trendingScore": "number 0-100 (how trendy/popular this event type is)",
  "exclusivity": "string from: Public, Invite Only, VIP, Members Only",
  "duration": "string (estimated event duration)",
  "recurring": "boolean (is this a recurring event)",
  "recurrencePattern": "string (if recurring: Daily, Weekly, Monthly, etc.)",
  "aiInsights": "string (AI-generated insights about this event)",
  "recommendationScore": "number 0-100 (how likely users would enjoy this)",
  "similarEvents": "array of event types this is similar to",
  "bestTimeToAttend": "string (optimal time to arrive)",
  "proTips": "array of tips for attending this event"
}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean and parse JSON response
      let jsonText = text.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/, '').replace(/\n?```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/, '').replace(/\n?```$/, '');
      }
      
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }
      
      const eventData = JSON.parse(jsonText);
      
      // Add AI-generated enhancements
      eventData.aiGenerated = true;
      eventData.processedAt = new Date().toISOString();
      eventData.uniqueId = this.generateUniqueId();
      
      // Store in event history for learning
      this.eventHistory.push(eventData);
      
      return eventData;
      
    } catch (error) {
      console.error('Advanced AI processing error:', error);
      return this.getFallbackEventData(rawText);
    }
  }

  /**
   * Generate personalized event recommendations
   */
  async generateRecommendations(userId, preferences = {}) {
    try {
      const userHistory = this.getUserHistory(userId);
      const prompt = `Based on this user's event history and preferences, generate personalized event recommendations:

User History: ${JSON.stringify(userHistory)}
User Preferences: ${JSON.stringify(preferences)}
Available Events: ${JSON.stringify(this.trendingEvents.slice(0, 10))}

Return a JSON array of recommended events with:
{
  "recommendations": [
    {
      "eventId": "string",
      "reason": "string (why this event is recommended)",
      "confidence": "number 0-100",
      "personalizedInsights": "string",
      "bestForUser": "string (what makes this perfect for this user)",
      "alternatives": "array of similar events"
    }
  ],
  "aiInsights": "string (overall insights about user preferences)",
  "trendingCategories": "array of trending categories for this user",
  "personalizedTips": "array of tips for discovering great events"
}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return JSON.parse(this.cleanJsonResponse(text));
      
    } catch (error) {
      console.error('Recommendation generation error:', error);
      return { recommendations: [], aiInsights: "Unable to generate recommendations at this time." };
    }
  }

  /**
   * Analyze event trends and patterns
   */
  async analyzeTrends() {
    try {
      const prompt = `Analyze these NYC events and identify trends:

Events: ${JSON.stringify(this.eventHistory.slice(-50))}

Return JSON with:
{
  "trendingCategories": ["array of trending categories"],
  "popularTimes": "object with popular time slots",
  "priceTrends": "object with price analysis",
  "locationHotspots": "array of popular areas",
  "emergingTrends": "array of new/emerging event types",
  "seasonalPatterns": "object with seasonal trends",
  "vibeAnalysis": "object with popular vibes",
  "aiPredictions": "array of predictions for upcoming trends",
  "recommendations": "array of recommendations for event organizers"
}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return JSON.parse(this.cleanJsonResponse(text));
      
    } catch (error) {
      console.error('Trend analysis error:', error);
      return { trendingCategories: [], aiPredictions: [] };
    }
  }

  /**
   * Generate smart event descriptions
   */
  async generateSmartDescription(eventData) {
    try {
      const prompt = `Create an engaging, AI-generated description for this NYC event:

Event: ${JSON.stringify(eventData)}

Write a compelling description that:
- Captures the essence and vibe of the event
- Uses engaging, social media-friendly language
- Includes relevant hashtags and keywords
- Highlights what makes this event special
- Encourages attendance with excitement

Return JSON with:
{
  "shortDescription": "string (1-2 sentences)",
  "longDescription": "string (detailed description)",
  "socialMediaPost": "string (Instagram/Twitter ready)",
  "hashtags": "array of relevant hashtags",
  "callToAction": "string (encouraging action)",
  "keyHighlights": "array of key selling points"
}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return JSON.parse(this.cleanJsonResponse(text));
      
    } catch (error) {
      console.error('Description generation error:', error);
      return { shortDescription: eventData.description || "An exciting event in NYC" };
    }
  }

  /**
   * Analyze user behavior and preferences
   */
  async analyzeUserBehavior(userId) {
    const userHistory = this.getUserHistory(userId);
    
    try {
      const prompt = `Analyze this user's event preferences and behavior:

User History: ${JSON.stringify(userHistory)}

Return JSON with:
{
  "preferredCategories": "array of favorite categories",
  "preferredTimes": "array of preferred time slots",
  "preferredVibes": "array of preferred vibes",
  "priceRange": "object with preferred price range",
  "locationPreferences": "array of preferred areas",
  "personalityInsights": "string (AI analysis of user personality)",
  "recommendationStrategy": "string (how to best recommend events)",
  "growthOpportunities": "array of new categories to try",
  "loyaltyScore": "number 0-100 (how engaged this user is)"
}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return JSON.parse(this.cleanJsonResponse(text));
      
    } catch (error) {
      console.error('User behavior analysis error:', error);
      return { preferredCategories: [], personalityInsights: "Analysis unavailable" };
    }
  }

  /**
   * Generate event insights and analytics
   */
  async generateEventInsights(eventId) {
    const event = this.eventHistory.find(e => e.uniqueId === eventId);
    if (!event) return null;

    try {
      const prompt = `Analyze this event and provide comprehensive insights:

Event: ${JSON.stringify(event)}

Return JSON with:
{
  "popularityScore": "number 0-100",
  "competitiveness": "string (how competitive to get tickets)",
  "bestAttendanceTime": "string (optimal time to arrive)",
  "crowdPrediction": "string (expected crowd size and type)",
  "weatherImpact": "string (how weather affects this event)",
  "transportationTips": "array of transportation recommendations",
  "nearbyAttractions": "array of nearby places to visit",
  "costAnalysis": "object with cost breakdown",
  "socialMediaPotential": "string (how shareable this event is)",
  "networkingOpportunities": "string (networking potential)",
  "safetyConsiderations": "array of safety tips",
  "accessibilityNotes": "string (accessibility information)",
  "culturalSignificance": "string (cultural importance)",
  "futurePredictions": "string (predictions about similar events)"
}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return JSON.parse(this.cleanJsonResponse(text));
      
    } catch (error) {
      console.error('Event insights generation error:', error);
      return { popularityScore: 50, crowdPrediction: "Moderate attendance expected" };
    }
  }

  // Helper methods
  cleanJsonResponse(text) {
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/, '').replace(/\n?```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/, '').replace(/\n?```$/, '');
    }
    
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }
    
    return jsonText;
  }

  generateUniqueId() {
    return 'event_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  getUserHistory(userId) {
    // In a real app, this would query a database
    return this.eventHistory.filter(event => event.userId === userId);
  }

  getFallbackEventData(rawText) {
    return {
      eventName: 'Event',
      description: rawText.substring(0, 200),
      address: null,
      startTime: null,
      endTime: null,
      price: 'Unknown',
      category: 'Other',
      subcategory: 'General',
      vibe: 'Casual',
      ageGroup: 'All Ages',
      accessibility: 'Not Specified',
      dressCode: 'No Dress Code',
      weatherDependent: false,
      indoorOutdoor: 'Indoor',
      capacity: 'Medium (51-200)',
      socialMedia: [],
      hashtags: [],
      keywords: [],
      sentiment: 'Neutral',
      trendingScore: 50,
      exclusivity: 'Public',
      duration: '2-3 hours',
      recurring: false,
      recurrencePattern: null,
      aiInsights: 'Basic event information extracted',
      recommendationScore: 50,
      similarEvents: [],
      bestTimeToAttend: 'On time',
      proTips: [],
      aiGenerated: false,
      processedAt: new Date().toISOString(),
      uniqueId: this.generateUniqueId()
    };
  }
}

module.exports = { AdvancedAIProcessor };
