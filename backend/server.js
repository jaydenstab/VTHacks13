const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { scrapeNYCEvents } = require('./scraper');
const { extractEventData } = require('./aiProcessor');
const { geocodeAddress } = require('./geocoder');
const { validateEvents, removeDuplicates } = require('./utils/eventValidator');
const RedditAPIScraper = require('./reddit_api_scraper');
const BingFoodEventsScraper = require('./bingFoodEventsScraper');
const UnionSquareScraper = require('./unionSquareScraper');
const OhMyRocknessScraper = require('./ohMyRocknessScraper');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Hyperlocal Event Aggregator API is running' });
});

// New Reddit events endpoint using the working Reddit scraper
app.get('/api/events/reddit', async (req, res) => {
  try {
    console.log('🤖 Fetching events from Reddit r/nyc...');
    
    const redditScraper = new RedditAPIScraper();
    const redditEvents = await redditScraper.scrapeEvents();
    
    // Transform Reddit events to match your frontend format
    const transformedEvents = redditEvents.map((event, index) => ({
      id: `reddit_${Date.now()}_${index}`,
      name: event.event_title || 'Untitled Event',
      description: `Event found on Reddit r/nyc - ${event.event_title}`,
      address: event.potential_location || 'NYC',
      startTime: event.potential_time || 'TBD',
      date: event.potential_date || 'TBD',
      price: 'Check Reddit post for details',
      category: 'Community',
      latitude: 40.7128, // Default NYC coordinates
      longitude: -74.0060,
      website: event.reddit_url,
      source: 'reddit',
      confidence: event.confidence || 5,
      createdAt: new Date().toISOString()
    }));
    
    console.log(`✅ Reddit scraper found ${transformedEvents.length} events`);
    
    res.json({
      success: true,
      events: transformedEvents,
      count: transformedEvents.length,
      source: 'reddit',
      message: `Successfully scraped ${transformedEvents.length} events from Reddit r/nyc`
    });
    
  } catch (error) {
    console.error('❌ Error in Reddit events endpoint:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to fetch Reddit events'
    });
  }
});

// New Bing food events endpoint
app.get('/api/events/bing-food', async (req, res) => {
  try {
    console.log('🍽️ Fetching free food events from Bing search...');
    
    const bingScraper = new BingFoodEventsScraper();
    const bingEvents = await bingScraper.scrapeDetailedEvents();
    
    // Transform Bing events to match your frontend format
    const transformedEvents = bingEvents.map((event, index) => ({
      id: `bing_food_${Date.now()}_${index}`,
      name: event.name || 'Free Food Event',
      description: event.description || 'Free food event in NYC',
      address: event.location || 'NYC',
      startTime: event.time || 'TBD',
      date: event.date || 'TBD',
      price: 'Free',
      category: 'Food',
      latitude: 40.7128, // Default NYC coordinates
      longitude: -74.0060,
      website: event.url,
      source: 'bing_food_events',
      createdAt: new Date().toISOString()
    }));
    
    console.log(`✅ Bing food scraper found ${transformedEvents.length} events`);
    
    res.json({
      success: true,
      events: transformedEvents,
      count: transformedEvents.length,
      source: 'bing_food_events',
      message: `Successfully scraped ${transformedEvents.length} free food events from Bing search`
    });
    
  } catch (error) {
    console.error('❌ Error in Bing food events endpoint:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to fetch Bing food events'
    });
  }
});

// New Union Square events endpoint
app.get('/api/events/union-square', async (req, res) => {
  try {
    console.log('🏛️ Fetching events from Union Square NYC...');
    
    const unionSquareScraper = new UnionSquareScraper();
    const unionSquareEvents = await unionSquareScraper.scrapeEvents();
    const nightMarketEvents = await unionSquareScraper.scrapeNightMarket();
    
    const allEvents = [...unionSquareEvents, ...nightMarketEvents];
    
    // Transform Union Square events to match your frontend format
    const transformedEvents = allEvents.map((event, index) => ({
      id: `union_square_${Date.now()}_${index}`,
      name: event.name || 'Union Square Event',
      description: event.description || 'Event at Union Square',
      address: event.location || 'Union Square, NYC',
      startTime: event.time || 'TBD',
      date: event.date || 'TBD',
      price: 'Check event details',
      category: 'Community',
      latitude: 40.7359, // Union Square coordinates
      longitude: -73.9911,
      website: event.url,
      source: 'union_square',
      createdAt: new Date().toISOString()
    }));
    
    console.log(`✅ Union Square scraper found ${transformedEvents.length} events`);
    
    res.json({
      success: true,
      events: transformedEvents,
      count: transformedEvents.length,
      source: 'union_square',
      message: `Successfully scraped ${transformedEvents.length} events from Union Square NYC`
    });
    
  } catch (error) {
    console.error('❌ Error in Union Square events endpoint:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to fetch Union Square events'
    });
  }
});

// New Oh My Rockness shows endpoint
app.get('/api/events/oh-my-rockness', async (req, res) => {
  try {
    console.log('🎵 Fetching shows from Oh My Rockness...');
    
    const ohMyRocknessScraper = new OhMyRocknessScraper();
    const shows = await ohMyRocknessScraper.scrapeUpcomingShows();
    
    // Transform shows to match your frontend format
    const transformedEvents = shows.map((show, index) => ({
      id: `oh_my_rockness_${Date.now()}_${index}`,
      name: show.name || 'Live Music Show',
      description: show.description || 'Live music show in NYC',
      address: show.venue || 'NYC Venue',
      startTime: show.time || 'TBD',
      date: show.date || 'TBD',
      price: show.price || 'Check venue for pricing',
      category: 'Music',
      latitude: 40.7128, // Default NYC coordinates
      longitude: -74.0060,
      website: show.url,
      source: 'oh_my_rockness',
      createdAt: new Date().toISOString()
    }));
    
    console.log(`✅ Oh My Rockness scraper found ${transformedEvents.length} shows`);
    
    res.json({
      success: true,
      events: transformedEvents,
      count: transformedEvents.length,
      source: 'oh_my_rockness',
      message: `Successfully scraped ${transformedEvents.length} shows from Oh My Rockness`
    });
    
  } catch (error) {
    console.error('❌ Error in Oh My Rockness endpoint:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to fetch Oh My Rockness shows'
    });
  }
});

// Simple test endpoint without Reddit scraping
app.get('/api/events/simple', async (req, res) => {
  try {
    console.log('Starting simple event scraping (no Reddit)...');
    
    // Use fallback events for quick response
    const fallbackEvents = [
      {
        id: 'event_1',
        name: 'NYC Parks Free Fitness Class',
        description: 'Morning fitness class in Central Park, all levels welcome',
        address: 'Central Park, New York, NY 10024',
        startTime: '7:00 AM',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        price: 'Free',
        category: 'Fitness',
        latitude: 40.7829,
        longitude: -73.9654,
        website: null,
        source: 'curated-fallback'
      },
      {
        id: 'event_2',
        name: 'Brooklyn Museum Art Exhibition',
        description: 'Contemporary art exhibition featuring local and international artists',
        address: '200 Eastern Pkwy, Brooklyn, NY 11238',
        startTime: '10:00 AM',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        price: '$16',
        category: 'Art',
        latitude: 40.6712,
        longitude: -73.9631,
        website: null,
        source: 'curated-fallback'
      }
    ];
    
    console.log(`✅ Simple endpoint: ${fallbackEvents.length} events`);
    res.json({
      success: true,
      events: fallbackEvents,
      count: fallbackEvents.length,
      message: 'Simple events loaded successfully'
    });
    
  } catch (error) {
    console.error('❌ Error in simple events endpoint:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to load simple events'
    });
  }
});

// Main events endpoint with search functionality
app.get('/api/events', async (req, res) => {
  try {
    console.log('Starting event scraping and processing...');
    
    // Check if Reddit scraping is requested (default: true for real data)
    const includeReddit = req.query.reddit !== 'false';
    console.log(`Reddit scraping: ${includeReddit ? 'enabled' : 'disabled'}`);
    
    let allEvents = [];
    
    // Step 1: Get Bing food events
    try {
      console.log('🍽️ Fetching Bing food events...');
      const bingScraper = new BingFoodEventsScraper();
      const bingEvents = await bingScraper.scrapeDetailedEvents();
      
      const transformedBingEvents = bingEvents.map((event, index) => ({
        id: `bing_food_${Date.now()}_${index}`,
        name: event.name || 'Free Food Event',
        description: event.description || 'Free food event in NYC',
        address: event.location || 'NYC',
        startTime: event.time || 'TBD',
        date: event.date || 'TBD',
        price: 'Free',
        category: 'Food',
        latitude: 40.7128,
        longitude: -74.0060,
        website: event.url,
        source: 'bing_food_events',
        createdAt: new Date().toISOString()
      }));
      
      allEvents = [...allEvents, ...transformedBingEvents];
      console.log(`✅ Added ${transformedBingEvents.length} Bing food events`);
      console.log(`🔍 Debug: allEvents length after Bing: ${allEvents.length}`);
    } catch (bingError) {
      console.error('❌ Bing food scraping failed:', bingError.message);
    }
    
    // Step 2: Get Union Square events
    try {
      console.log('🏛️ Fetching Union Square events...');
      const unionSquareScraper = new UnionSquareScraper();
      const unionSquareEvents = await unionSquareScraper.scrapeEvents();
      const nightMarketEvents = await unionSquareScraper.scrapeNightMarket();
      
      const allUnionSquareEvents = [...unionSquareEvents, ...nightMarketEvents];
      const transformedUnionSquareEvents = allUnionSquareEvents.map((event, index) => ({
        id: `union_square_${Date.now()}_${index}`,
        name: event.name || 'Union Square Event',
        description: event.description || 'Event at Union Square',
        address: event.location || 'Union Square, NYC',
        startTime: event.time || 'TBD',
        date: event.date || 'TBD',
        price: 'Check event details',
        category: 'Community',
        latitude: 40.7359,
        longitude: -73.9911,
        website: event.url,
        source: 'union_square',
        createdAt: new Date().toISOString()
      }));
      
      allEvents = [...allEvents, ...transformedUnionSquareEvents];
      console.log(`✅ Added ${transformedUnionSquareEvents.length} Union Square events`);
    } catch (unionSquareError) {
      console.error('❌ Union Square scraping failed:', unionSquareError.message);
    }
    
    // Step 3: Get Oh My Rockness shows
    try {
      console.log('🎵 Fetching Oh My Rockness shows...');
      const ohMyRocknessScraper = new OhMyRocknessScraper();
      const shows = await ohMyRocknessScraper.scrapeUpcomingShows();
      
      const transformedShows = shows.map((show, index) => ({
        id: `oh_my_rockness_${Date.now()}_${index}`,
        name: show.name || 'Live Music Show',
        description: show.description || 'Live music show in NYC',
        address: show.venue || 'NYC Venue',
        startTime: show.time || 'TBD',
        date: show.date || 'TBD',
        price: show.price || 'Check venue for pricing',
        category: 'Music',
        latitude: 40.7128,
        longitude: -74.0060,
        website: show.url,
        source: 'oh_my_rockness',
        createdAt: new Date().toISOString()
      }));
      
      allEvents = [...allEvents, ...transformedShows];
      console.log(`✅ Added ${transformedShows.length} Oh My Rockness shows`);
    } catch (ohMyRocknessError) {
      console.error('❌ Oh My Rockness scraping failed:', ohMyRocknessError.message);
    }
    
    // Step 4: Get Reddit events if requested
    if (includeReddit) {
      try {
        console.log('🤖 Fetching Reddit events...');
        const redditScraper = new RedditAPIScraper();
        const redditEvents = await redditScraper.scrapeEvents();
        
        const transformedRedditEvents = redditEvents.map((event, index) => ({
          id: `reddit_${Date.now()}_${index}`,
          name: event.event_title || 'Untitled Event',
          description: `Event found on Reddit r/nyc - ${event.event_title}`,
          address: event.potential_location || 'NYC',
          startTime: event.potential_time || 'TBD',
          date: event.potential_date || 'TBD',
          price: 'Check Reddit post for details',
          category: 'Community',
          latitude: 40.7128,
          longitude: -74.0060,
          website: event.reddit_url,
          source: 'reddit',
          confidence: event.confidence || 5,
          createdAt: new Date().toISOString()
        }));
        
        allEvents = [...allEvents, ...transformedRedditEvents];
        console.log(`✅ Added ${transformedRedditEvents.length} Reddit events`);
      } catch (redditError) {
        console.error('❌ Reddit scraping failed:', redditError.message);
      }
    }
    
    // Step 2: Skip generic scraping to avoid generic content
    // We're already getting good events from specialized scrapers above
    console.log(`Skipping generic scraping to focus on specialized sources`);
    const rawProcessedEvents = [];
    
    // Step 3: Combine all events (specialized scrapers only)
    allEvents = [...allEvents, ...rawProcessedEvents];
    
    // Step 6: Skip validation for now to see raw events
    console.log(`🔍 Skipping validation to show raw events...`);
    console.log(`🔍 Debug: Total events before validation: ${allEvents.length}`);
    const validatedEvents = allEvents; // Skip validation
    
    // Step 7: Remove duplicates
    const uniqueEvents = removeDuplicates(validatedEvents);
    
    // Step 8: Apply search filter if provided
    let filteredEvents = uniqueEvents;
    const searchQuery = req.query.search;
    
    if (searchQuery && searchQuery.trim()) {
      const searchTerm = searchQuery.toLowerCase().trim();
      filteredEvents = uniqueEvents.filter(event => {
        if (!event.name) return false;
        return event.name.toLowerCase().includes(searchTerm);
      });
      console.log(`🔍 Search "${searchQuery}" returned ${filteredEvents.length} events out of ${uniqueEvents.length} total`);
    }
    
    console.log(`📊 Final result: ${filteredEvents.length} events (${uniqueEvents.length - filteredEvents.length} filtered by search)`);
    
    console.log(`Successfully processed ${filteredEvents.length} events from all sources`);
    res.json({
      events: filteredEvents,
      totalCount: filteredEvents.length,
      searchQuery: searchQuery || null,
      sources: ['bing_food_events', 'union_square', 'oh_my_rockness', 'reddit'],
      scrapedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in /api/events:', error);
    res.status(500).json({ 
      error: 'Failed to fetch events', 
      message: error.message 
    });
  }
});

// New endpoint for real-time events with better data quality
app.get('/api/events/realtime', async (req, res) => {
  try {
    console.log('Fetching real-time NYC events...');
    
    // Check if Reddit scraping is requested (default: false for faster response)
    const includeReddit = req.query.reddit === 'true';
    console.log(`Reddit scraping: ${includeReddit ? 'enabled' : 'disabled'}`);
    
    // Step 1: Scrape raw data from multiple NYC event sources
    const rawEventTexts = await scrapeNYCEvents();
    console.log(`Scraped ${rawEventTexts.length} raw event texts from multiple sources`);
    
    // Step 2: Process each event with AI
    const rawProcessedEvents = [];
    for (let i = 0; i < rawEventTexts.length; i++) {
      try {
        const eventData = await extractEventData(rawEventTexts[i]);
        if (eventData && eventData.eventName && eventData.eventName !== 'Unknown Event') {
          // Step 3: Geocode the address
          const coordinates = await geocodeAddress(eventData.address);
          if (coordinates) {
            rawProcessedEvents.push({
              id: `realtime_event_${i + 1}`,
              name: eventData.eventName,
              description: eventData.description || 'No description available',
              address: eventData.address,
              startTime: eventData.startTime,
              date: eventData.date,
              price: eventData.price,
              category: eventData.category,
              latitude: coordinates.latitude,
              longitude: coordinates.longitude,
              website: eventData.website || null,
              source: 'real-time-scraping',
              scrapedAt: new Date().toISOString()
            });
          }
        }
      } catch (error) {
        console.error(`Error processing event ${i + 1}:`, error.message);
        // Continue processing other events
      }
    }
    
    // Step 4: Skip validation for now to see raw events
    console.log(`🔍 Skipping validation to show raw events...`);
    const validatedEvents = rawProcessedEvents; // Skip validation
    
    // Step 5: Remove duplicates
    const uniqueEvents = removeDuplicates(validatedEvents);
    
    console.log(`📊 Final result: ${uniqueEvents.length} high-quality events`);
    const processedEvents = uniqueEvents;
    
    console.log(`Successfully processed ${processedEvents.length} real-time events`);
    res.json({
      events: processedEvents,
      totalCount: processedEvents.length,
      scrapedAt: new Date().toISOString(),
      sources: ['NYC Parks', 'Brooklyn Museum', 'Central Park', 'NYC Public Library', 'Time Out NYC', 'Eventbrite NYC', 'EventTicketsCenter']
    });
    
  } catch (error) {
    console.error('Error in /api/events/realtime:', error);
    res.status(500).json({ 
      error: 'Failed to fetch real-time events', 
      message: error.message 
    });
  }
});


app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api/events`);
});
