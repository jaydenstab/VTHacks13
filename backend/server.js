const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { scrapeTheSkint } = require('./scraper');
const { extractEventData } = require('./aiProcessor');
const { geocodeAddress } = require('./geocoder');

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

// Main events endpoint
app.get('/api/events', async (req, res) => {
  try {
    console.log('Starting event scraping and processing...');
    
    // Step 1: Scrape raw data from The Skint
    const rawEventTexts = await scrapeTheSkint();
    console.log(`Scraped ${rawEventTexts.length} raw event texts`);
    
    // Step 2: Process each event with AI
    const processedEvents = [];
    for (let i = 0; i < rawEventTexts.length; i++) {
      try {
        const eventData = await extractEventData(rawEventTexts[i]);
        if (eventData && eventData.eventName) {
          // Step 3: Geocode the address
          const coordinates = await geocodeAddress(eventData.address);
          if (coordinates) {
            processedEvents.push({
              id: `event_${i + 1}`,
              name: eventData.eventName,
              description: eventData.description || 'No description available',
              address: eventData.address,
              startTime: eventData.startTime,
              price: eventData.price,
              category: eventData.category,
              latitude: coordinates.latitude,
              longitude: coordinates.longitude
            });
          }
        }
      } catch (error) {
        console.error(`Error processing event ${i + 1}:`, error.message);
        // Continue processing other events
      }
    }
    
    console.log(`Successfully processed ${processedEvents.length} events`);
    res.json(processedEvents);
    
  } catch (error) {
    console.error('Error in /api/events:', error);
    res.status(500).json({ 
      error: 'Failed to fetch events', 
      message: error.message 
    });
  }
});

// Fallback endpoint with dummy data for testing
app.get('/api/events/dummy', (req, res) => {
  const dummyEvents = [
    {
      id: 'dummy_1',
      name: 'Jazz Night at Blue Note',
      description: 'An evening of smooth jazz featuring local artists',
      address: '131 W 3rd St, New York, NY 10012',
      startTime: '8:00 PM',
      price: '$25',
      category: 'Music',
      latitude: 40.7306,
      longitude: -74.0023
    },
    {
      id: 'dummy_2',
      name: 'Art Gallery Opening',
      description: 'Contemporary art exhibition opening reception',
      address: '123 Spring St, New York, NY 10012',
      startTime: '6:00 PM',
      price: 'Free',
      category: 'Art',
      latitude: 40.7256,
      longitude: -73.9943
    },
    {
      id: 'dummy_3',
      name: 'Food Truck Festival',
      description: 'Local food trucks serving diverse cuisines',
      address: 'Union Square, New York, NY 10003',
      startTime: '12:00 PM',
      price: 'Varies',
      category: 'Food & Drink',
      latitude: 40.7356,
      longitude: -73.9906
    }
  ];
  
  res.json(dummyEvents);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api/events`);
});
