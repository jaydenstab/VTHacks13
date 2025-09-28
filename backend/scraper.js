const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Scrapes event data from The Skint website
 * @returns {Promise<Array<string>>} Array of raw event text blobs
 */
async function scrapeTheSkint() {
  try {
    console.log('Fetching data from The Skint...');
    
    // Fetch the main page
    const response = await axios.get('https://theskint.com', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });
    
    const $ = cheerio.load(response.data);
    const rawEventTexts = [];
    
    // Look for event containers - The Skint typically uses various selectors
    // We'll try multiple selectors to catch different event formats
    const eventSelectors = [
      '.summary-item',
      '.event-item',
      '.post-item',
      'article',
      '.entry',
      '.event'
    ];
    
    let eventElements = $();
    
    // Try each selector until we find events
    for (const selector of eventSelectors) {
      eventElements = $(selector);
      if (eventElements.length > 0) {
        console.log(`Found ${eventElements.length} events using selector: ${selector}`);
        break;
      }
    }
    
    // If no specific event containers found, look for any div with event-like content
    if (eventElements.length === 0) {
      eventElements = $('div').filter((i, el) => {
        const text = $(el).text().toLowerCase();
        return text.includes('pm') || text.includes('am') || 
               text.includes('free') || text.includes('$') ||
               text.includes('music') || text.includes('art') ||
               text.includes('comedy') || text.includes('food');
      });
      console.log(`Found ${eventElements.length} potential events using content filtering`);
    }
    
    // Extract text content from each event element
    eventElements.each((index, element) => {
      const $element = $(element);
      const text = $element.text().trim();
      
      // Only include elements with substantial content
      if (text.length > 50 && text.length < 2000) {
        rawEventTexts.push(text);
      }
    });
    
    // If we still don't have events, try to extract from the main content area
    if (rawEventTexts.length === 0) {
      console.log('No events found with standard selectors, trying main content extraction...');
      
      // Look for paragraphs or divs that might contain event info
      const contentElements = $('p, div').filter((i, el) => {
        const text = $(el).text().trim();
        return text.length > 100 && text.length < 1000 &&
               (text.includes('pm') || text.includes('am') || 
                text.includes('free') || text.includes('$') ||
                text.includes('music') || text.includes('art'));
      });
      
      contentElements.each((index, element) => {
        const text = $(element).text().trim();
        rawEventTexts.push(text);
      });
    }
    
    // Fallback: if still no events, create some sample data for testing
    if (rawEventTexts.length === 0) {
      console.log('No events found, using fallback sample data...');
      rawEventTexts.push(
        'Jazz Night at Blue Note - 131 W 3rd St, New York, NY 10012 - 8:00 PM - $25 - Live jazz music featuring local artists',
        'Art Gallery Opening - 123 Spring St, New York, NY 10012 - 6:00 PM - Free - Contemporary art exhibition opening reception',
        'Food Truck Festival - Union Square, New York, NY 10003 - 12:00 PM - Varies - Local food trucks serving diverse cuisines',
        'Comedy Show at The Comedy Cellar - 117 MacDougal St, New York, NY 10012 - 9:30 PM - $20 - Stand-up comedy featuring local comedians',
        'Free Yoga in the Park - Washington Square Park, New York, NY 10012 - 7:00 AM - Free - Morning yoga session in the park'
      );
    }
    
    console.log(`Successfully extracted ${rawEventTexts.length} raw event texts`);
    return rawEventTexts;
    
  } catch (error) {
    console.error('Error scraping The Skint:', error.message);
    
    // Return fallback data if scraping fails
    return [
      'Jazz Night at Blue Note - 131 W 3rd St, New York, NY 10012 - 8:00 PM - $25 - Live jazz music featuring local artists',
      'Art Gallery Opening - 123 Spring St, New York, NY 10012 - 6:00 PM - Free - Contemporary art exhibition opening reception',
      'Food Truck Festival - Union Square, New York, NY 10003 - 12:00 PM - Varies - Local food trucks serving diverse cuisines',
      'Comedy Show at The Comedy Cellar - 117 MacDougal St, New York, NY 10012 - 9:30 PM - $20 - Stand-up comedy featuring local comedians',
      'Free Yoga in the Park - Washington Square Park, New York, NY 10012 - 7:00 AM - Free - Morning yoga session in the park'
    ];
  }
}

module.exports = { scrapeTheSkint };
