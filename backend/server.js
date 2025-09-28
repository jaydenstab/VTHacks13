const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { scrapeNYCEvents } = require('./scraper');
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
    
    // Step 1: Scrape raw data from multiple NYC event sources
    const rawEventTexts = await scrapeNYCEvents();
    console.log(`Scraped ${rawEventTexts.length} raw event texts from multiple sources`);
    
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


app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api/events`);
});
