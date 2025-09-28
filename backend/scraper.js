const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Scrapes event data from multiple NYC event sources
 * @returns {Promise<Array<string>>} Array of raw event text blobs
 */
async function scrapeNYCEvents() {
  try {
    console.log('🎯 Starting comprehensive NYC event scraping...');
    
    const allEvents = [];
    
    // Try to scrape from multiple sources
    const scrapers = [
      { name: 'NYC Parks', fn: scrapeNYCParks },
      { name: 'Brooklyn Museum', fn: scrapeBrooklynMuseum },
      { name: 'Central Park', fn: scrapeCentralPark },
      { name: 'NYC Public Library', fn: scrapeNYCPublicLibrary },
      { name: 'Time Out NYC', fn: scrapeTimeOutNYC },
      { name: 'NYC Go', fn: scrapeNYCGo },
      { name: 'Eventbrite NYC', fn: scrapeEventbriteNYC },
      { name: 'Eventbrite Free Food', fn: scrapeEventbriteFreeFood }
    ];
    
    for (const scraper of scrapers) {
      try {
        console.log(`🔍 Scraping ${scraper.name}...`);
        const events = await scraper.fn();
        if (events && events.length > 0) {
          allEvents.push(...events);
          console.log(`✅ Found ${events.length} events from ${scraper.name}`);
        } else {
          console.log(`⚠️ No events found from ${scraper.name}`);
        }
      } catch (error) {
        console.error(`❌ Error scraping ${scraper.name}:`, error.message);
      }
    }
    
    // If we got real scraped data, use it
    if (allEvents.length > 0) {
      console.log(`🎉 Successfully scraped ${allEvents.length} real events from multiple sources`);
      return allEvents;
    } else {
      console.log('⚠️ No real events scraped, using fallback data');
      const fallbackEvents = getFallbackEvents();
      console.log(`📝 Loaded ${fallbackEvents.length} curated NYC events`);
      return fallbackEvents;
    }
    
  } catch (error) {
    console.error('Error in comprehensive event scraping:', error.message);
    console.log('🔄 Falling back to curated events...');
    return getFallbackEvents();
  }
}

/**
 * Scrapes event data from NYC Parks official events
 * @returns {Promise<Array<string>>} Array of raw event text blobs
 */
async function scrapeNYCParks() {
  try {
    console.log('Fetching data from NYC Parks...');
    
    const response = await axios.get('https://www.nycgovparks.org/events', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 15000
    });
    
    const $ = cheerio.load(response.data);
    const events = [];
    
    // Look for event listings in various possible selectors
    const eventSelectors = [
      '.event-item',
      '.event-card',
      '.event-listing',
      '.calendar-event',
      '.program-item',
      'article',
      '.event'
    ];
    
    let eventElements = $();
    
    for (const selector of eventSelectors) {
      eventElements = $(selector);
      if (eventElements.length > 0) {
        console.log(`Found ${eventElements.length} events using selector: ${selector}`);
        break;
      }
    }
    
    // If no specific selectors work, look for content that looks like events
    if (eventElements.length === 0) {
      eventElements = $('div, article, section, p').filter((i, el) => {
        const text = $(el).text().toLowerCase();
        return (text.includes('pm') || text.includes('am') || text.includes('free') || text.includes('$')) &&
               (text.includes('park') || text.includes('recreation') || text.includes('fitness') || text.includes('yoga') || text.includes('music') || text.includes('event') || text.includes('class') || text.includes('workshop')) &&
               text.length > 50 && text.length < 1000 &&
               !text.includes('search') && !text.includes('menu') && !text.includes('navigation');
      });
    }
    
    eventElements.each((index, element) => {
      const $element = $(element);
      const text = $element.text().trim();
      
      // Better filtering for actual event content - exclude generic lists and guides
      const genericContent = [
        'Things to do', 'Best things', 'Top things', 'Guide to', 'Complete guide',
        'Ultimate guide', 'Everything you need', 'Must-see', 'Must-visit',
        'Local guide', 'Tourist guide', 'Visitor guide', 'NYC guide',
        'Activities & Amenities', 'Park Features', 'Search', 'Menu', 'Navigation', 'Footer',
        '100 best', '80 best', '50 best', '25 best', '10 best', '5 best',
        'attractions that should be on your list', 'locals and tourists',
        'Experience the absolute best', 'Discover the New York attractions',
        'locals love including', 'Complete guide to', 'Ultimate guide to',
        'Everything you need to know', 'Must-see attractions', 'Must-visit places',
        'Best of NYC', 'Top attractions', 'NYC attractions', 'New York attractions',
        'heritage', 'outdoor', 'cultural', 'entertainment', 'dining', 'shopping',
        'nightlife', 'family', 'romantic', 'budget', 'luxury', 'hidden gems'
      ];
      
      const hasGenericContent = genericContent.some(generic => 
        text.toLowerCase().includes(generic.toLowerCase())
      );
      
      // Additional checks for generic content
      const isGenericList = text.toLowerCase().includes('best things') || 
                           text.toLowerCase().includes('top things') ||
                           text.toLowerCase().includes('attractions that should be') ||
                           text.toLowerCase().includes('locals and tourists') ||
                           text.toLowerCase().includes('experience the absolute best') ||
                           text.toLowerCase().includes('discover the new york attractions') ||
                           text.toLowerCase().includes('locals love including') ||
                           text.toLowerCase().includes('complete guide to') ||
                           text.toLowerCase().includes('ultimate guide to') ||
                           text.toLowerCase().includes('everything you need to know') ||
                           text.toLowerCase().includes('must-see attractions') ||
                           text.toLowerCase().includes('must-visit places') ||
                           text.toLowerCase().includes('best of nyc') ||
                           text.toLowerCase().includes('top attractions') ||
                           text.toLowerCase().includes('nyc attractions') ||
                           text.toLowerCase().includes('new york attractions');
      
      if (text.length > 50 && text.length < 2000 && 
          !hasGenericContent && !isGenericList &&
          (text.includes('PM') || text.includes('AM') || text.includes('Free') || text.includes('$') || 
           text.includes('Event') || text.includes('Class') || text.includes('Workshop') || 
           text.includes('Concert') || text.includes('Exhibition') || text.includes('Tour') ||
           text.includes('Show') || text.includes('Performance') || text.includes('Lecture') ||
           text.includes('Workshop') || text.includes('Seminar') || text.includes('Meetup'))) {
        events.push(text);
      }
    });
    
    console.log(`Successfully extracted ${events.length} events from NYC Parks`);
    return events.slice(0, 15); // Limit to 15 events
    
  } catch (error) {
    console.error('Error scraping NYC Parks:', error.message);
    return [];
  }
}

/**
 * Scrapes event data from Brooklyn Museum
 * @returns {Promise<Array<string>>} Array of raw event text blobs
 */
async function scrapeBrooklynMuseum() {
  try {
    console.log('Fetching data from Brooklyn Museum...');
    
    const response = await axios.get('https://www.brooklynmuseum.org/events', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 15000
    });
    
    const $ = cheerio.load(response.data);
    const events = [];
    
    // Look for event listings
    const eventSelectors = [
      '.event-item',
      '.event-card',
      '.program-item',
      '.exhibition-item',
      'article',
      '.event'
    ];
    
    let eventElements = $();
    
    for (const selector of eventSelectors) {
      eventElements = $(selector);
      if (eventElements.length > 0) {
        console.log(`Found ${eventElements.length} events using selector: ${selector}`);
        break;
      }
    }
    
    // If no specific selectors work, look for content that looks like events
    if (eventElements.length === 0) {
      eventElements = $('div, article, section').filter((i, el) => {
        const text = $(el).text().toLowerCase();
        return (text.includes('pm') || text.includes('am') || text.includes('free') || text.includes('$')) &&
               (text.includes('museum') || text.includes('exhibition') || text.includes('art') || text.includes('gallery')) &&
               text.length > 100 && text.length < 2000;
      });
    }
    
    eventElements.each((index, element) => {
      const $element = $(element);
      const text = $element.text().trim();
      
      // Better filtering for actual event content - exclude generic lists and guides
      const genericContent = [
        'Things to do', 'Best things', 'Top things', 'Guide to', 'Complete guide',
        'Ultimate guide', 'Everything you need', 'Must-see', 'Must-visit',
        'Local guide', 'Tourist guide', 'Visitor guide', 'NYC guide',
        'Activities & Amenities', 'Park Features', 'Search', 'Menu', 'Navigation', 'Footer',
        '100 best', '80 best', '50 best', '25 best', '10 best', '5 best',
        'attractions that should be on your list', 'locals and tourists',
        'Experience the absolute best', 'Discover the New York attractions',
        'locals love including', 'Complete guide to', 'Ultimate guide to',
        'Everything you need to know', 'Must-see attractions', 'Must-visit places',
        'Best of NYC', 'Top attractions', 'NYC attractions', 'New York attractions',
        'heritage', 'outdoor', 'cultural', 'entertainment', 'dining', 'shopping',
        'nightlife', 'family', 'romantic', 'budget', 'luxury', 'hidden gems'
      ];
      
      const hasGenericContent = genericContent.some(generic => 
        text.toLowerCase().includes(generic.toLowerCase())
      );
      
      // Additional checks for generic content
      const isGenericList = text.toLowerCase().includes('best things') || 
                           text.toLowerCase().includes('top things') ||
                           text.toLowerCase().includes('attractions that should be') ||
                           text.toLowerCase().includes('locals and tourists') ||
                           text.toLowerCase().includes('experience the absolute best') ||
                           text.toLowerCase().includes('discover the new york attractions') ||
                           text.toLowerCase().includes('locals love including') ||
                           text.toLowerCase().includes('complete guide to') ||
                           text.toLowerCase().includes('ultimate guide to') ||
                           text.toLowerCase().includes('everything you need to know') ||
                           text.toLowerCase().includes('must-see attractions') ||
                           text.toLowerCase().includes('must-visit places') ||
                           text.toLowerCase().includes('best of nyc') ||
                           text.toLowerCase().includes('top attractions') ||
                           text.toLowerCase().includes('nyc attractions') ||
                           text.toLowerCase().includes('new york attractions');
      
      if (text.length > 50 && text.length < 2000 && 
          !hasGenericContent && !isGenericList &&
          (text.includes('PM') || text.includes('AM') || text.includes('Free') || text.includes('$') || 
           text.includes('Event') || text.includes('Class') || text.includes('Workshop') || 
           text.includes('Concert') || text.includes('Exhibition') || text.includes('Tour') ||
           text.includes('Show') || text.includes('Performance') || text.includes('Lecture') ||
           text.includes('Workshop') || text.includes('Seminar') || text.includes('Meetup'))) {
        events.push(text);
      }
    });
    
    console.log(`Successfully extracted ${events.length} events from Brooklyn Museum`);
    return events.slice(0, 15); // Limit to 15 events
    
  } catch (error) {
    console.error('Error scraping Brooklyn Museum:', error.message);
    return [];
  }
}

/**
 * Scrapes event data from Central Park events
 * @returns {Promise<Array<string>>} Array of raw event text blobs
 */
async function scrapeCentralPark() {
  try {
    console.log('Fetching data from Central Park...');
    
    const response = await axios.get('https://www.centralparknyc.org/events', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 15000
    });
    
    const $ = cheerio.load(response.data);
    const events = [];
    
    // Look for event listings
    const eventSelectors = [
      '.event-item',
      '.event-card',
      '.program-item',
      '.activity-item',
      'article',
      '.event'
    ];
    
    let eventElements = $();
    
    for (const selector of eventSelectors) {
      eventElements = $(selector);
      if (eventElements.length > 0) {
        console.log(`Found ${eventElements.length} events using selector: ${selector}`);
        break;
      }
    }
    
    // If no specific selectors work, look for content that looks like events
    if (eventElements.length === 0) {
      eventElements = $('div, article, section').filter((i, el) => {
        const text = $(el).text().toLowerCase();
        return (text.includes('pm') || text.includes('am') || text.includes('free') || text.includes('$')) &&
               (text.includes('central park') || text.includes('park') || text.includes('outdoor') || text.includes('nature')) &&
               text.length > 100 && text.length < 2000;
      });
    }
    
    eventElements.each((index, element) => {
      const $element = $(element);
      const text = $element.text().trim();
      
      if (text.length > 50 && text.length < 2000) {
        events.push(text);
      }
    });
    
    console.log(`Successfully extracted ${events.length} events from Central Park`);
    return events.slice(0, 15); // Limit to 15 events
    
  } catch (error) {
    console.error('Error scraping Central Park:', error.message);
    return [];
  }
}

/**
 * Scrapes event data from NYC Public Library
 * @returns {Promise<Array<string>>} Array of raw event text blobs
 */
async function scrapeNYCPublicLibrary() {
  try {
    console.log('Fetching data from NYC Public Library...');
    
    const response = await axios.get('https://www.nypl.org/events', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 15000
    });
    
    const $ = cheerio.load(response.data);
    const events = [];
    
    // Look for event listings
    const eventSelectors = [
      '.event-item',
      '.event-card',
      '.program-item',
      '.library-event',
      'article',
      '.event'
    ];
    
    let eventElements = $();
    
    for (const selector of eventSelectors) {
      eventElements = $(selector);
      if (eventElements.length > 0) {
        console.log(`Found ${eventElements.length} events using selector: ${selector}`);
        break;
      }
    }
    
    // If no specific selectors work, look for content that looks like events
    if (eventElements.length === 0) {
      eventElements = $('div, article, section').filter((i, el) => {
        const text = $(el).text().toLowerCase();
        return (text.includes('pm') || text.includes('am') || text.includes('free') || text.includes('$')) &&
               (text.includes('library') || text.includes('reading') || text.includes('book') || text.includes('author')) &&
               text.length > 100 && text.length < 2000;
      });
    }
    
    eventElements.each((index, element) => {
      const $element = $(element);
      const text = $element.text().trim();
      
      if (text.length > 50 && text.length < 2000) {
        events.push(text);
      }
    });
    
    console.log(`Successfully extracted ${events.length} events from NYC Public Library`);
    return events.slice(0, 15); // Limit to 15 events
    
  } catch (error) {
    console.error('Error scraping NYC Public Library:', error.message);
    return [];
  }
}

/**
 * Scrapes event data from Time Out NYC
 * @returns {Promise<Array<string>>} Array of raw event text blobs
 */
async function scrapeTimeOutNYC() {
  try {
    console.log('Fetching data from Time Out NYC...');
    
    const response = await axios.get('https://www.timeout.com/newyork/things-to-do', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 15000
    });
    
    const $ = cheerio.load(response.data);
    const events = [];
    
    // Look for event listings with more specific selectors
    const eventSelectors = [
      '.card',
      '.event-card',
      '.listing',
      '.article-card',
      '.feature-card',
      '.content-card',
      'article',
      '.event'
    ];
    
    let eventElements = $();
    
    for (const selector of eventSelectors) {
      eventElements = $(selector);
      if (eventElements.length > 0) {
        console.log(`Found ${eventElements.length} events using selector: ${selector}`);
        break;
      }
    }
    
    // If no specific selectors work, look for content that looks like events
    if (eventElements.length === 0) {
      eventElements = $('div, article, section').filter((i, el) => {
        const text = $(el).text().toLowerCase();
        return (text.includes('pm') || text.includes('am') || text.includes('free') || text.includes('$')) &&
               (text.includes('nyc') || text.includes('new york') || text.includes('manhattan') || text.includes('brooklyn')) &&
               text.length > 100 && text.length < 2000;
      });
    }
    
    eventElements.each((index, element) => {
      const $element = $(element);
      const text = $element.text().trim();
      
      if (text.length > 50 && text.length < 2000) {
        events.push(text);
      }
    });
    
    console.log(`Successfully extracted ${events.length} events from Time Out NYC`);
    return events.slice(0, 15); // Limit to 15 events
    
  } catch (error) {
    console.error('Error scraping Time Out NYC:', error.message);
    return [];
  }
}

/**
 * Scrapes event data from NYC Go
 * @returns {Promise<Array<string>>} Array of raw event text blobs
 */
async function scrapeNYCGo() {
  try {
    console.log('Fetching data from NYC Go...');
    
    const response = await axios.get('https://www.nycgo.com/events', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });
    
    const $ = cheerio.load(response.data);
    const events = [];
    
    // Look for event listings
    $('.event, .listing, .card').each((index, element) => {
      const text = $(element).text().trim();
      if (text.length > 50 && text.length < 1000) {
        events.push(text);
      }
    });
    
    return events.slice(0, 15); // Limit to 15 events
  } catch (error) {
    console.error('Error scraping NYC Go:', error.message);
    return [];
  }
}

/**
 * Scrapes event data from Eventbrite NYC
 * @returns {Promise<Array<string>>} Array of raw event text blobs
 */
async function scrapeEventbriteNYC() {
  try {
    console.log('Fetching data from Eventbrite NYC...');
    
    const response = await axios.get('https://www.eventbrite.com/d/ny--new-york/events/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 15000
    });
    
    const $ = cheerio.load(response.data);
    const events = [];
    
    // Look for event listings with more specific selectors
    const eventSelectors = [
      '.event-card',
      '.listing-card',
      '.event',
      '.card',
      '.event-item',
      '.listing-item',
      'article',
      '.event-listing'
    ];
    
    let eventElements = $();
    
    for (const selector of eventSelectors) {
      eventElements = $(selector);
      if (eventElements.length > 0) {
        console.log(`Found ${eventElements.length} events using selector: ${selector}`);
        break;
      }
    }
    
    // If no specific selectors work, look for content that looks like events
    if (eventElements.length === 0) {
      eventElements = $('div, article, section').filter((i, el) => {
        const text = $(el).text().toLowerCase();
        return (text.includes('pm') || text.includes('am') || text.includes('free') || text.includes('$')) &&
               (text.includes('nyc') || text.includes('new york') || text.includes('manhattan') || text.includes('brooklyn')) &&
               text.length > 100 && text.length < 2000;
      });
    }
    
    eventElements.each((index, element) => {
      const $element = $(element);
      const text = $element.text().trim();
      
      if (text.length > 50 && text.length < 2000) {
        events.push(text);
      }
    });
    
    console.log(`Successfully extracted ${events.length} events from Eventbrite NYC`);
    return events.slice(0, 15); // Limit to 15 events
    
  } catch (error) {
    console.error('Error scraping Eventbrite NYC:', error.message);
    return [];
  }
}

/**
 * Scrapes free food and drink events from Eventbrite NYC
 * @returns {Promise<Array<string>>} Array of raw event text blobs
 */
async function scrapeEventbriteFreeFood() {
  try {
    console.log('Fetching free food events from Eventbrite NYC...');
    
    const response = await axios.get('https://www.eventbrite.com/d/ny--new-york/free--food-and-drink--events/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 15000
    });
    
    const $ = cheerio.load(response.data);
    const events = [];
    
    // Look for event listings with more specific selectors
    const eventSelectors = [
      '.event-card',
      '.listing-card',
      '.event',
      '.card',
      '.event-item',
      '.listing-item',
      'article',
      '.event-listing'
    ];
    
    let eventElements = $();
    
    for (const selector of eventSelectors) {
      eventElements = $(selector);
      if (eventElements.length > 0) {
        console.log(`Found ${eventElements.length} events using selector: ${selector}`);
        break;
      }
    }
    
    // If no specific selectors work, look for content that looks like events
    if (eventElements.length === 0) {
      eventElements = $('div, article, section').filter((i, el) => {
        const text = $(el).text().toLowerCase();
        return (text.includes('pm') || text.includes('am') || text.includes('free') || text.includes('$')) &&
               (text.includes('food') || text.includes('drink') || text.includes('tasting') || text.includes('cooking') || text.includes('wine') || text.includes('beer')) &&
               text.length > 100 && text.length < 2000;
      });
    }
    
    eventElements.each((index, element) => {
      const $element = $(element);
      const text = $element.text().trim();
      
      if (text.length > 50 && text.length < 2000) {
        events.push(text);
      }
    });
    
    console.log(`Successfully extracted ${events.length} events from Eventbrite Free Food`);
    return events.slice(0, 15); // Limit to 15 events
    
  } catch (error) {
    console.error('Error scraping Eventbrite Free Food:', error.message);
    return [];
  }
}

/**
 * Returns fallback event data when scraping fails
 * @returns {Array<string>} Array of fallback event text blobs
 */
function getFallbackEvents() {
  // Get current date for realistic event dates
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  const formatDate = (date) => date.toISOString().split('T')[0];
  
  return [
    `NYC Parks Free Fitness Class - Central Park, New York, NY 10024 - ${formatDate(tomorrow)} 7:00 AM - Free - Morning fitness class in Central Park, all levels welcome`,
    `Brooklyn Museum Art Exhibition - 200 Eastern Pkwy, Brooklyn, NY 11238 - ${formatDate(tomorrow)} 10:00 AM - $16 - Contemporary art exhibition featuring local and international artists`,
    `NYC Public Library Author Talk - 476 5th Ave, New York, NY 10018 - ${formatDate(nextWeek)} 6:00 PM - Free - Author reading and book signing event`,
    `Central Park Summer Concert - Central Park, New York, NY 10024 - ${formatDate(nextWeek)} 7:00 PM - Free - Outdoor concert featuring local musicians`,
    `Brooklyn Bridge Park Yoga - Brooklyn Bridge Park, Brooklyn, NY 11201 - ${formatDate(tomorrow)} 8:00 AM - Free - Morning yoga session with stunning city views`,
    `NYC Parks Basketball Tournament - Prospect Park, Brooklyn, NY 11215 - ${formatDate(nextWeek)} 2:00 PM - Free - Community basketball tournament for all ages`,
    `Metropolitan Museum Free Admission - 1000 5th Ave, New York, NY 10028 - ${formatDate(tomorrow)} 10:00 AM - Free - Pay what you wish admission to world-class art collection`,
    `NYC Public Library Tech Workshop - 476 5th Ave, New York, NY 10018 - ${formatDate(nextWeek)} 2:00 PM - Free - Learn basic computer skills and digital literacy`,
    `Central Park Bird Watching - Central Park, New York, NY 10024 - ${formatDate(tomorrow)} 9:00 AM - Free - Guided bird watching tour with park rangers`,
    `Brooklyn Museum Family Day - 200 Eastern Pkwy, Brooklyn, NY 11238 - ${formatDate(nextWeek)} 11:00 AM - Free - Family-friendly activities and art workshops`,
    `NYC Parks Tennis Clinic - Flushing Meadows Park, Queens, NY 11368 - ${formatDate(nextWeek)} 4:00 PM - $10 - Tennis lessons for beginners and intermediate players`,
    `NYC Public Library Book Club - 476 5th Ave, New York, NY 10018 - ${formatDate(tomorrow)} 7:00 PM - Free - Monthly book discussion group`,
    `Central Park Photography Walk - Central Park, New York, NY 10024 - ${formatDate(nextWeek)} 10:00 AM - Free - Photography workshop exploring park landscapes`,
    `Brooklyn Museum Gallery Talk - 200 Eastern Pkwy, Brooklyn, NY 11238 - ${formatDate(tomorrow)} 3:00 PM - Free - Curator-led tour of current exhibitions`,
    `NYC Parks Community Garden Tour - Various locations, New York, NY - ${formatDate(nextWeek)} 1:00 PM - Free - Tour of community gardens across the city`
  ];
}

module.exports = { 
  scrapeNYCEvents, 
  scrapeNYCParks, 
  scrapeBrooklynMuseum, 
  scrapeCentralPark, 
  scrapeNYCPublicLibrary, 
  scrapeTimeOutNYC, 
  scrapeNYCGo,
  scrapeEventbriteNYC,
  scrapeEventbriteFreeFood
};

