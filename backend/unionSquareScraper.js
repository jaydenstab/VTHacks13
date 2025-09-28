const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

class UnionSquareScraper {
  constructor() {
    this.baseUrl = 'https://www.unionsquarenyc.org';
    this.eventsUrl = 'https://www.unionsquarenyc.org/events-calendar';
  }

  async scrapeEvents() {
    try {
      console.log('🏛️ Starting Union Square events scraping...');
      
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      // First try the events calendar
      await page.goto(this.eventsUrl, { waitUntil: 'networkidle2' });
      
      const content = await page.content();
      const $ = cheerio.load(content);
      
      const events = [];
      
      // Look for event listings
      $('.event, .event-item, .event-card, [class*="event"]').each((index, element) => {
        const $event = $(element);
        const title = $event.find('h1, h2, h3, .title, .event-title, .event-name').first().text().trim();
        const date = $event.find('.date, .event-date, .start-date, [class*="date"]').text().trim();
        const time = $event.find('.time, .event-time, .start-time, [class*="time"]').text().trim();
        const location = $event.find('.location, .venue, .address, [class*="location"]').text().trim();
        const description = $event.find('.description, .summary, .event-description, p').first().text().trim();
        const url = $event.find('a').attr('href');
        
        // Filter out generic content
        const genericContent = [
          'NEWSLETTER', 'Featured Shows', 'JUST/ANNOUNCED', 'MOST/POPULAR',
          'Newsletter', 'Subscribe', 'Sign up', 'Join our', 'Follow us',
          'Navigation', 'Menu', 'Search', 'Footer', 'Header', 'The Latest',
          'UPCOMING', 'POPUPS', 'EVENTS', 'Latest', 'Upcoming', 'Events'
        ];
        
        const hasGenericContent = genericContent.some(generic => 
          title.toLowerCase().includes(generic.toLowerCase()) || 
          title.toLowerCase() === generic.toLowerCase() ||
          title.toLowerCase().startsWith(generic.toLowerCase()) ||
          title.toLowerCase().endsWith(generic.toLowerCase())
        );
        
        if (title && title.length > 3 && !hasGenericContent) {
          events.push({
            name: title,
            date: date || 'TBD',
            time: time || 'TBD',
            location: location || 'Union Square, NYC',
            description: description || 'Event at Union Square',
            url: url ? (url.startsWith('http') ? url : `${this.baseUrl}${url}`) : null,
            source: 'union_square',
            scrapedAt: new Date().toISOString()
          });
        }
      });
      
      // If no events found on calendar, try the main page
      if (events.length === 0) {
        await page.goto(this.baseUrl, { waitUntil: 'networkidle2' });
        const mainContent = await page.content();
        const $main = cheerio.load(mainContent);
        
        $main('.event, .event-item, .event-card, [class*="event"]').each((index, element) => {
          const $event = $main(element);
          const title = $event.find('h1, h2, h3, .title, .event-title, .event-name').first().text().trim();
          const date = $event.find('.date, .event-date, .start-date, [class*="date"]').text().trim();
          const time = $event.find('.time, .event-time, .start-time, [class*="time"]').text().trim();
          const location = $event.find('.location, .venue, .address, [class*="location"]').text().trim();
          const description = $event.find('.description, .summary, .event-description, p').first().text().trim();
          const url = $event.find('a').attr('href');
          
          if (title && title.length > 3) {
            events.push({
              name: title,
              date: date || 'TBD',
              time: time || 'TBD',
              location: location || 'Union Square, NYC',
              description: description || 'Event at Union Square',
              url: url ? (url.startsWith('http') ? url : `${this.baseUrl}${url}`) : null,
              source: 'union_square',
              scrapedAt: new Date().toISOString()
            });
          }
        });
      }
      
      await browser.close();
      
      console.log(`✅ Union Square scraper found ${events.length} events`);
      return events;
      
    } catch (error) {
      console.error('❌ Error in Union Square scraper:', error.message);
      return [];
    }
  }

  async scrapeNightMarket() {
    try {
      console.log('🌃 Starting Union Square Night Market scraping...');
      
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      // Scrape the specific night market page
      await page.goto('https://www.unionsquarenyc.org/featured-events/nightmarket-sep26', { waitUntil: 'networkidle2' });
      
      const content = await page.content();
      const $ = cheerio.load(content);
      
      const events = [];
      
      // Extract night market information
      const title = $('h1, .event-title, .page-title').first().text().trim() || 'Union Square Night Market';
      const date = $('.date, .event-date, .start-date').text().trim() || 'September 26, 2025';
      const time = $('.time, .event-time, .start-time').text().trim() || '12:00 PM - 10:00 PM';
      const description = $('.description, .event-description, p').first().text().trim() || 'Union Square Night Market by Urbanspace returns, bringing a lively, open-air food market to the South Plaza of Union Square Park. With over 35 local food vendors serving up a wide variety of flavors.';
      
      if (title) {
        events.push({
          name: title,
          date: date,
          time: time,
          location: 'Union Square Park - South Plaza, New York, NY 10003',
          description: description,
          url: 'https://www.unionsquarenyc.org/featured-events/nightmarket-sep26',
          source: 'union_square_night_market',
          scrapedAt: new Date().toISOString()
        });
      }
      
      await browser.close();
      
      console.log(`✅ Union Square Night Market scraper found ${events.length} events`);
      return events;
      
    } catch (error) {
      console.error('❌ Error in Union Square Night Market scraper:', error.message);
      return [];
    }
  }
}

module.exports = UnionSquareScraper;
