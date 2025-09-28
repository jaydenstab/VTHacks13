const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

/**
 * Reddit API-based event scraper using the official Reddit API
 * This is the proper, ethical way to get Reddit data
 */
class RedditAPIScraper {
    constructor() {
        this.baseURL = 'https://www.reddit.com';
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    }

    /**
     * Fetch posts from r/nyc using Reddit's JSON API
     * This gets the actual post data without needing JavaScript
     */
    async fetchRedditPosts() {
        try {
            console.log('📡 Fetching posts from r/nyc via Reddit API...');
            
            // Reddit's JSON API endpoint - no authentication needed for public data
            const response = await axios.get(`${this.baseURL}/r/nyc.json`, {
                headers: {
                    'User-Agent': 'WhatsUpNYC-EventBot/1.0 (Educational Purpose)'
                }
            });
            
            const posts = response.data.data.children.map(child => child.data);
            console.log(`✅ Fetched ${posts.length} posts from Reddit API`);
            
            return posts;
        } catch (error) {
            console.error('❌ Error fetching Reddit posts:', error.message);
            throw error;
        }
    }

    /**
     * Analyze posts with Gemini to extract event information
     */
    async extractEventsFromPosts(posts) {
        try {
            console.log('🧠 Analyzing posts with Gemini AI...');
            
            // Prepare post data for analysis
            const postData = posts.slice(0, 25).map(post => ({
                title: post.title,
                selftext: post.selftext,
                author: post.author,
                created_utc: new Date(post.created_utc * 1000).toISOString(),
                url: `https://reddit.com${post.permalink}`,
                score: post.score,
                num_comments: post.num_comments
            }));

            const prompt = `You are an expert data extraction bot specializing in finding ACTUAL EVENTS posted on Reddit. Analyze the following Reddit posts from r/nyc.

CRITICAL: Only extract posts that are clearly about specific, dateable events that people can attend. Examples:
- Concerts, shows, performances
- Meetups, gatherings, social events  
- Festivals, fairs, markets
- Free classes, workshops, talks
- Sports events, games
- Community events, fundraisers

DO NOT extract:
- General news articles
- Political discussions
- Random questions or complaints
- Discussion threads
- "Things to do" lists (unless they contain specific events)
- General advice or help requests

For each ACTUAL EVENT you find, extract:
- event_title: The specific event name/title
- potential_date: Specific date mentioned
- potential_location: Specific venue or location
- potential_time: Specific time mentioned
- reddit_url: The Reddit URL
- confidence: Your confidence (1-10) that this is a real event

Return ONLY a JSON array of actual events. If no real events are found, return an empty array [].

Reddit posts to analyze:
${JSON.stringify(postData, null, 2)}`;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            // Parse the JSON response from Gemini
            try {
                let jsonText = text.trim();
                if (jsonText.startsWith('```json')) {
                    jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
                } else if (jsonText.startsWith('```')) {
                    jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
                }
                
                const events = JSON.parse(jsonText);
                return events;
            } catch (parseError) {
                console.error('Error parsing Gemini response as JSON:', parseError);
                console.log('Raw Gemini response:', text);
                return [];
            }
        } catch (error) {
            console.error('Error analyzing posts with Gemini:', error.message);
            throw error;
        }
    }

    /**
     * Main execution function
     */
    async scrapeEvents() {
        try {
            console.log('🤖 Starting Reddit API Event Scraper...\n');
            
            // Check if GEMINI_API_KEY is set
            if (!process.env.GEMINI_API_KEY) {
                throw new Error('GEMINI_API_KEY is not set in environment variables');
            }
            
            // Step 1: Fetch posts from Reddit API
            const posts = await this.fetchRedditPosts();
            
            // Step 2: Analyze posts with Gemini
            const events = await this.extractEventsFromPosts(posts);
            
            console.log(`\n✅ Successfully extracted ${events.length} events`);
            console.log('\n📋 Extracted Events:');
            console.log(JSON.stringify(events, null, 2));
            
            return events;
        } catch (error) {
            console.error('❌ Scraper execution failed:', error.message);
            throw error;
        }
    }
}

// Run the scraper if this script is executed directly
if (require.main === module) {
    const scraper = new RedditAPIScraper();
    scraper.scrapeEvents();
}

module.exports = RedditAPIScraper;
