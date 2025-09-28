const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

class OhMyRocknessScraper {
  constructor() {
    this.baseUrl = 'https://www.ohmyrockness.com';
    this.showsUrl = 'https://www.ohmyrockness.com/shows';
  }

  async scrapeShows() {
    try {
      console.log('🎵 Starting Oh My Rockness shows scraping...');
      
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      await page.goto(this.showsUrl, { waitUntil: 'networkidle2' });
      
      // Wait for shows to load
      await page.waitForSelector('.show, .event, [class*="show"], [class*="event"]', { timeout: 10000 });
      
      const content = await page.content();
      const $ = cheerio.load(content);
      
      const shows = [];
      
      // Extract show information
      $('.show, .event, [class*="show"], [class*="event"]').each((index, element) => {
        const $show = $(element);
        const title = $show.find('h1, h2, h3, .title, .show-title, .event-title, .artist-name').first().text().trim();
        const date = $show.find('.date, .show-date, .event-date, .start-date, [class*="date"]').text().trim();
        const time = $show.find('.time, .show-time, .event-time, .start-time, [class*="time"]').text().trim();
        const venue = $show.find('.venue, .location, .club, .theater, [class*="venue"], [class*="location"]').text().trim();
        const price = $show.find('.price, .cost, .ticket-price, [class*="price"]').text().trim();
        const description = $show.find('.description, .summary, .show-description, p').first().text().trim();
        const url = $show.find('a').attr('href');
        
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
          shows.push({
            name: title,
            date: date || 'TBD',
            time: time || 'TBD',
            venue: venue || 'NYC Venue',
            price: price || 'Check venue for pricing',
            description: description || 'Live music show',
            url: url ? (url.startsWith('http') ? url : `${this.baseUrl}${url}`) : null,
            source: 'oh_my_rockness',
            scrapedAt: new Date().toISOString()
          });
        }
      });
      
      // If no shows found with those selectors, try alternative selectors
      if (shows.length === 0) {
        $('article, .listing, .item, .card').each((index, element) => {
          const $item = $(element);
          const title = $item.find('h1, h2, h3, h4, .title, .name, .artist').first().text().trim();
          const date = $item.find('.date, .when, .day, .month').text().trim();
          const time = $item.find('.time, .hour, .start').text().trim();
          const venue = $item.find('.venue, .location, .where, .club').text().trim();
          const price = $item.find('.price, .cost, .ticket').text().trim();
          const description = $item.find('.description, .summary, p').first().text().trim();
          const url = $item.find('a').attr('href');
          
          if (title && title.length > 3) {
            shows.push({
              name: title,
              date: date || 'TBD',
              time: time || 'TBD',
              venue: venue || 'NYC Venue',
              price: price || 'Check venue for pricing',
              description: description || 'Live music show',
              url: url ? (url.startsWith('http') ? url : `${this.baseUrl}${url}`) : null,
              source: 'oh_my_rockness',
              scrapedAt: new Date().toISOString()
            });
          }
        });
      }
      
      await browser.close();
      
      console.log(`✅ Oh My Rockness scraper found ${shows.length} shows`);
      return shows;
      
    } catch (error) {
      console.error('❌ Error in Oh My Rockness scraper:', error.message);
      return [];
    }
  }

  async scrapeUpcomingShows() {
    try {
      console.log('🎵 Starting Oh My Rockness upcoming shows scraping...');
      
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      // Try different sections of the site
      const urls = [
        this.showsUrl,
        `${this.baseUrl}/upcoming`,
        `${this.baseUrl}/tonight`,
        `${this.baseUrl}/this-week`
      ];
      
      const allShows = [];
      
      for (const url of urls) {
        try {
          await page.goto(url, { waitUntil: 'networkidle2', timeout: 10000 });
          
          const content = await page.content();
          const $ = cheerio.load(content);
          
          // Look for any show listings
          $('article, .show, .event, .listing, .item, .card, [class*="show"], [class*="event"]').each((index, element) => {
            const $item = $(element);
            const title = $item.find('h1, h2, h3, h4, .title, .name, .artist, .show-title').first().text().trim();
            const date = $item.find('.date, .when, .day, .month, .show-date').text().trim();
            const time = $item.find('.time, .hour, .start, .show-time').text().trim();
            const venue = $item.find('.venue, .location, .where, .club, .theater').text().trim();
            const price = $item.find('.price, .cost, .ticket, .ticket-price').text().trim();
            const description = $item.find('.description, .summary, p').first().text().trim();
            const url = $item.find('a').attr('href');
            
            if (title && title.length > 3) {
              allShows.push({
                name: title,
                date: date || 'TBD',
                time: time || 'TBD',
                venue: venue || 'NYC Venue',
                price: price || 'Check venue for pricing',
                description: description || 'Live music show',
                url: url ? (url.startsWith('http') ? url : `${this.baseUrl}${url}`) : null,
                source: 'oh_my_rockness',
                scrapedAt: new Date().toISOString()
              });
            }
          });
        } catch (pageError) {
          console.error(`Error scraping ${url}:`, pageError.message);
        }
      }
      
      await browser.close();
      
      // Remove duplicates based on name and date
      const uniqueShows = allShows.filter((show, index, self) => 
        index === self.findIndex(s => s.name === show.name && s.date === show.date)
      );
      
      console.log(`✅ Oh My Rockness upcoming shows scraper found ${uniqueShows.length} shows`);
      return uniqueShows;
      
    } catch (error) {
      console.error('❌ Error in Oh My Rockness upcoming shows scraper:', error.message);
      return [];
    }
  }
}

module.exports = OhMyRocknessScraper;
