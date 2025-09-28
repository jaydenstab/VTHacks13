const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

class BingFoodEventsScraper {
  constructor() {
    this.baseUrl = 'https://www.bing.com/search?pglt=425&q=free+food+events+nyc&cvid=8a3f1c917418470caa5e3132d0c07c87&gs_lcrp=EgRlZGdlKgkIABBFGDsY-QcyCQgAEEUYOxj5BzIGCAEQABhAMgYIAhBFGDsyBggDEEUYOTIGCAQQABhAMgYIBRAAGEAyBggGEAAYQDIGCAcQABhAMgYICBBFGDzSAQgxODQxajBqMagCALACAA&FORM=ANNTA1&PC=U531';
  }

  async scrapeEvents() {
    try {
      console.log('🍽️ Starting Bing food events scraping...');
      
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      await page.goto(this.baseUrl, { waitUntil: 'networkidle2' });
      
      // Wait for search results to load
      await page.waitForSelector('.b_algo', { timeout: 10000 });
      
      const content = await page.content();
      const $ = cheerio.load(content);
      
      const events = [];
      
      // Extract search results
      $('.b_algo').each((index, element) => {
        const $element = $(element);
        const title = $element.find('h2 a').text().trim();
        const url = $element.find('h2 a').attr('href');
        const description = $element.find('.b_caption p').text().trim();
        
        if (title && url && description) {
          events.push({
            title,
            url,
            description,
            source: 'bing_search',
            scrapedAt: new Date().toISOString()
          });
        }
      });
      
      await browser.close();
      
      console.log(`✅ Bing scraper found ${events.length} food event sources`);
      return events;
      
    } catch (error) {
      console.error('❌ Error in Bing food events scraper:', error.message);
      return [];
    }
  }

  async scrapeDetailedEvents() {
    try {
      const searchResults = await this.scrapeEvents();
      const detailedEvents = [];
      
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      for (const result of searchResults.slice(0, 15)) { // Limit to first 15 results
        try {
          const page = await browser.newPage();
          await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
          
          await page.goto(result.url, { waitUntil: 'networkidle2', timeout: 10000 });
          
          const content = await page.content();
          const $ = cheerio.load(content);
          
          // Look for event information
          const eventElements = $('[class*="event"], [class*="Event"], .event-item, .event-card, .event-listing');
          
          eventElements.each((index, element) => {
            const $event = $(element);
            const eventName = $event.find('h1, h2, h3, .title, .event-title').first().text().trim();
            const eventDate = $event.find('.date, .event-date, [class*="date"]').text().trim();
            const eventLocation = $event.find('.location, .venue, .address, [class*="location"]').text().trim();
            const eventDescription = $event.find('.description, .summary, p').first().text().trim();
            
            // Filter out generic content
            const genericContent = [
              'NEWSLETTER', 'Featured Shows', 'JUST/ANNOUNCED', 'MOST/POPULAR',
              'Newsletter', 'Subscribe', 'Sign up', 'Join our', 'Follow us',
              'Navigation', 'Menu', 'Search', 'Footer', 'Header', 'The Latest',
              'UPCOMING', 'POPUPS', 'EVENTS', 'Latest', 'Upcoming', 'Events'
            ];
            
            const hasGenericContent = genericContent.some(generic => 
              eventName.toLowerCase().includes(generic.toLowerCase()) || 
              eventName.toLowerCase() === generic.toLowerCase() ||
              eventName.toLowerCase().startsWith(generic.toLowerCase()) ||
              eventName.toLowerCase().endsWith(generic.toLowerCase())
            );
            
            if (eventName && eventName.length > 3 && !hasGenericContent) {
              detailedEvents.push({
                name: eventName,
                date: eventDate || 'TBD',
                location: eventLocation || 'NYC',
                description: eventDescription || result.description,
                url: result.url,
                source: 'bing_food_events',
                scrapedAt: new Date().toISOString()
              });
            }
          });
          
          await page.close();
        } catch (pageError) {
          console.error(`Error scraping ${result.url}:`, pageError.message);
        }
      }
      
      await browser.close();
      
      console.log(`✅ Bing detailed scraper found ${detailedEvents.length} events`);
      return detailedEvents;
      
    } catch (error) {
      console.error('❌ Error in Bing detailed events scraper:', error.message);
      return [];
    }
  }
}

module.exports = BingFoodEventsScraper;
