// Load environment variables
require('dotenv').config();

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Extracts structured event data from raw text using Google Gemini AI
 * @param {string} rawText - Raw text containing event information
 * @returns {Promise<Object>} Structured event data object
 */
async function extractEventData(rawText) {
  try {
    // Pre-filter generic content that shouldn't be processed as events
    const genericContentPatterns = [
      'things to do',
      'best things',
      'top things',
      'guide to',
      'complete guide',
      'ultimate guide',
      'everything you need',
      'must-see',
      'must-visit',
      'local guide',
      'tourist guide',
      'visitor guide',
      'nyc guide',
      '100 best',
      '80 best',
      '50 best',
      '25 best',
      '10 best',
      '5 best',
      'attractions that should be on your list',
      'locals and tourists',
      'experience the absolute best',
      'discover the new york attractions',
      'locals love including',
      'complete guide to',
      'ultimate guide to',
      'everything you need to know',
      'must-see attractions',
      'must-visit places',
      'best of nyc',
      'top attractions',
      'nyc attractions',
      'new york attractions'
    ];
    
    const hasGenericContent = genericContentPatterns.some(pattern => 
      rawText.toLowerCase().includes(pattern.toLowerCase())
    );
    
    if (hasGenericContent) {
      console.log('❌ Skipping generic content that is not a real event');
      return null; // Return null to indicate this should be filtered out
    }
    
    // Special handling for Hamilton events to preserve multiple events
    if (rawText.includes('Hamilton') && rawText.includes('Richard Rodgers Theatre')) {
      return extractHamiltonEventData(rawText);
    }
    
    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not found, using fallback extraction');
      return extractEventDataFallback(rawText);
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `You are an expert event data extractor for NYC events. From the following text, extract structured event information.

REQUIREMENTS:
1. Extract Event Name, Address, Start Time, Date, Price, and Description
2. Assign ONE category from: ['Music', 'Art', 'Food & Drink', 'Comedy', 'Free', 'Sports', 'Education', 'Health', 'Technology', 'Business', 'Other']
3. For addresses, ensure they include "New York, NY" or "NYC" if missing
4. For prices, use "Free" if the event is free, otherwise use the exact price format (e.g., "$25", "$15-20")
5. For times, use 12-hour format (e.g., "8:00 PM", "2:00 PM")
6. For dates, use YYYY-MM-DD format. If no date is specified, use a future date within the next 30 days
7. Create a brief description (1-2 sentences) if none provided
8. Focus on REAL events happening in NYC - avoid generic or fake events
9. If the text contains multiple events, extract the first/main event only
10. Ensure all data is realistic and current

IMPORTANT: REJECT any content that appears to be:
- Generic "things to do" lists or guides
- "Best of NYC" or "Top attractions" content
- Tourist guides or general recommendations
- Content like "100 best things to do", "80 best attractions", etc.
- Generic categories like "heritage", "outdoor", "cultural" without specific event details

Only extract actual events with specific dates, times, and locations.

Text to analyze:
${rawText}

Return ONLY a JSON object with these exact keys:
{
  "eventName": "string",
  "address": "string", 
  "startTime": "string",
  "date": "string",
  "price": "string",
  "category": "string",
  "description": "string"
}

No additional text or formatting.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up the response to extract JSON
    let jsonText = text.trim();
    
    // Remove any markdown code blocks if present
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/, '').replace(/\n?```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/, '').replace(/\n?```$/, '');
    }
    
    // Try to find JSON object in the response
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }
    
    const eventData = JSON.parse(jsonText);
    
    // Validate and clean the extracted data
    return {
      eventName: eventData.eventName || 'Unknown Event',
      address: eventData.address || null,
      startTime: eventData.startTime || null,
      date: eventData.date || null,
      price: eventData.price || 'Unknown',
      category: eventData.category || 'Other',
      description: eventData.description || 'No description available'
    };
    
  } catch (error) {
    console.error('Error in AI processing:', error.message);
    console.log('Raw text that failed:', rawText);
    console.log('Falling back to text-based extraction...');
    
    // Fallback to rule-based extraction
    return extractEventDataFallback(rawText);
  }
}

/**
 * Special extraction for Hamilton events to preserve multiple events
 * @param {string} rawText - Raw text containing Hamilton event information
 * @returns {Object} Structured event data object
 */
function extractHamiltonEventData(rawText) {
  // Extract date and time from the text
  const dateMatch = rawText.match(/Date:\s*([^\n]+)/);
  const timeMatch = rawText.match(/Time:\s*([^\n]+)/);
  
  const date = dateMatch ? dateMatch[1].trim() : 'TBD';
  const time = timeMatch ? timeMatch[1].trim() : 'TBD';
  
  // Convert date to proper format if possible
  let formattedDate = date;
  if (date !== 'TBD') {
    try {
      // Handle formats like "Sep 28", "Oct 1", etc.
      const currentYear = new Date().getFullYear();
      const dateObj = new Date(`${date} ${currentYear}`);
      if (!isNaN(dateObj.getTime())) {
        formattedDate = dateObj.toISOString().split('T')[0];
      }
    } catch (error) {
      // Keep original date if conversion fails
    }
  }
  
  return {
    eventName: 'Hamilton',
    address: 'Richard Rodgers Theatre, 226 W 46th St, New York, NY 10036',
    startTime: time,
    date: formattedDate,
    price: 'Check website for pricing',
    category: 'Theater',
    description: 'Hamilton - Richard Rodgers Theatre - Broadway musical about Alexander Hamilton',
    website: 'https://www.eventticketscenter.com/hamilton-new-york-tickets/'
  };
}

/**
 * Fallback extraction method using simple text parsing
 * @param {string} rawText - Raw text containing event information
 * @returns {Object} Structured event data object
 */
function extractEventDataFallback(rawText) {
  // Pre-filter generic content in fallback as well
  const genericContentPatterns = [
    'things to do',
    'best things',
    'top things',
    'guide to',
    'complete guide',
    'ultimate guide',
    'everything you need',
    'must-see',
    'must-visit',
    'local guide',
    'tourist guide',
    'visitor guide',
    'nyc guide',
    '100 best',
    '80 best',
    '50 best',
    '25 best',
    '10 best',
    '5 best',
    'attractions that should be on your list',
    'locals and tourists',
    'experience the absolute best',
    'discover the new york attractions',
    'locals love including',
    'complete guide to',
    'ultimate guide to',
    'everything you need to know',
    'must-see attractions',
    'must-visit places',
    'best of nyc',
    'top attractions',
    'nyc attractions',
    'new york attractions'
  ];
  
  const hasGenericContent = genericContentPatterns.some(pattern => 
    rawText.toLowerCase().includes(pattern.toLowerCase())
  );
  
  if (hasGenericContent) {
    console.log('❌ Fallback: Skipping generic content that is not a real event');
    return null; // Return null to indicate this should be filtered out
  }
  
  const lines = rawText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  let eventName = 'Unknown Event';
  let address = null;
  let startTime = null;
  let price = 'Unknown';
  let category = 'Other';
  let description = rawText;
  
  // Detect category based on keywords in the text
  const categoryKeywords = {
    'Sports': ['run', 'running', 'race', 'marathon', 'fitness', 'workout', 'exercise', 'sports', 'athletic', 'training'],
    'Health': ['health', 'wellness', 'yoga', 'meditation', 'fitness', 'wellness', 'healthcare', 'medical'],
    'Education': ['workshop', 'class', 'learning', 'education', 'seminar', 'lecture', 'training', 'course', 'study'],
    'Art': ['art', 'exhibition', 'gallery', 'museum', 'painting', 'sculpture', 'creative', 'artistic', 'cultural'],
    'Music': ['music', 'concert', 'performance', 'band', 'singer', 'musical', 'orchestra', 'jazz', 'rock', 'classical'],
    'Theater': ['theater', 'theatre', 'broadway', 'play', 'drama', 'show', 'performance', 'stage', 'hamilton'],
    'Food': ['food', 'restaurant', 'dining', 'cuisine', 'cooking', 'chef', 'culinary', 'taste', 'eat', 'drink'],
    'Community': ['community', 'volunteer', 'charity', 'fundraising', 'social', 'meetup', 'networking', 'local'],
    'Free': ['free', 'complimentary', 'no cost', 'gratis', 'donation', 'volunteer']
  };
  
  const lowerText = rawText.toLowerCase();
  for (const [cat, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      category = cat;
      break;
    }
  }
  
  // Try to create a better description from the raw text
  if (rawText && rawText.length > 50) {
    // Extract meaningful description parts
    const descParts = [];
    
    // Look for description patterns
    const descPatterns = [
      /(?:NYRR|Brooklyn|Queens|Manhattan|Bronx|Staten Island)([^]+?)(?:Category|Free!|Must See|Event)/i,
      /(?:Free!|Must See|Event)([^]+?)(?:Category|$)/i,
      /(?:brings|offers|features|includes)([^]+?)(?:Category|Free!|Must See|Event)/i
    ];
    
    for (const pattern of descPatterns) {
      const match = rawText.match(pattern);
      if (match && match[1]) {
        const desc = match[1].trim();
        if (desc.length > 10 && desc.length < 200) {
          descParts.push(desc);
        }
      }
    }
    
    // If we found description parts, use them
    if (descParts.length > 0) {
      description = descParts.join(' ').trim();
    } else {
      // Fallback: use the raw text but clean it up
      description = rawText
        .replace(/\s+/g, ' ')
        .replace(/[^a-zA-Z0-9\s\-.,!?]/g, '')
        .trim();
    }
  }
  
  // Try to extract event name by looking for patterns in the text
  // Look for text that appears to be an event title
  const eventNamePatterns = [
    // Look for text before "Check ticket"
    /([^]+?)Check ticket/,
    // Look for text before "Save this event"
    /([^]+?)Save this event/,
    // Look for text before "Share this event"
    /([^]+?)Share this event/,
    // Look for text that ends with common venue patterns
    /([^]+?)(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s*•/,
    // Look for text before time patterns
    /([^•]+)•/,
    // Look for text before location patterns (for scraped content)
    /([^]+?)(?:at\s+[A-Za-z\s]+(?:Park|Museum|Library|Square|Bridge|Avenue|Street|Boulevard|Road|Drive|Place|Court|Lane|Parkway))/,
    // Look for text before time patterns like "9:00 a.m."
    /([^]+?)(?:\d{1,2}:\d{2}\s*(?:a\.m\.|p\.m\.|AM|PM))/,
    // Look for text before "Free!" or price indicators
    /([^]+?)(?:Free!|Must See|Event)/,
    // Look for text before "at" or "in" location indicators
    /([^]+?)(?:at\s+[A-Za-z\s]+(?:Park|Museum|Library|Square|Bridge|Avenue|Street|Boulevard|Road|Drive|Place|Court|Lane|Parkway))/,
    // Look for text before time indicators
    /([^]+?)(?:\d{1,2}:\d{2}\s*(?:a\.m\.|p\.m\.|AM|PM))/,
    // Look for text before "Category:" or similar indicators
    /([^]+?)(?:Category:|Free!|Must See|Event)/
  ];
  
  for (const pattern of eventNamePatterns) {
    const match = rawText.match(pattern);
    if (match && match[1]) {
      const candidate = match[1].trim();
      
      // Clean up the candidate name
      let cleanCandidate = candidate
        .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
        .replace(/^[^a-zA-Z]*/, '')  // Remove leading non-alphabetic characters
        .replace(/[^a-zA-Z0-9\s\-&]+$/, '')  // Remove trailing non-alphanumeric characters
        .replace(/\s*-\s*$/, '')  // Remove trailing dashes and spaces
        .replace(/\s*–\s*$/, '')  // Remove trailing en-dashes and spaces
        .trim();
      
      // Remove date prefixes like "Sep28", "Oct15", etc.
      cleanCandidate = cleanCandidate.replace(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\d{1,2}/, '');
      
      // Remove common prefixes and clean up
      cleanCandidate = cleanCandidate
        .replace(/^(NYRR|NYC|NY)\s*/i, '')  // Remove NYRR, NYC, NY prefixes
        .replace(/^(Open Run|Run|Running)\s*/i, '')  // Remove common running prefixes
        .replace(/:\s*$/, '')  // Remove trailing colons
        .trim();
      
      if (cleanCandidate.length > 5 && cleanCandidate.length < 200 && 
          !cleanCandidate.includes('Check ticket') &&
          !cleanCandidate.includes('Save this event') &&
          !cleanCandidate.includes('Share this event') &&
          !cleanCandidate.includes('Almost full') &&
          !cleanCandidate.includes('Going fast') &&
          !cleanCandidate.includes('PM') &&
          !cleanCandidate.includes('AM') &&
          !cleanCandidate.includes('Category:') &&
          !cleanCandidate.includes('Free!') &&
          !cleanCandidate.includes('Must See') &&
          !cleanCandidate.includes('Event')) {
        eventName = cleanCandidate;
        break;
      }
    }
  }
  
  // If still unknown, try to extract from the first line that looks like a title
  if (eventName === 'Unknown Event') {
    // Look for patterns like "Almost fullEvent Name" or "Going fastEvent Name"
    const statusPatterns = [
      /(?:Almost full|Going fast)([A-Za-z\s|&]+?)(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/i,
      /(?:Almost full|Going fast)([A-Za-z\s|&]+?)(?:PM|AM)/i,
      /(?:Almost full|Going fast)([A-Za-z\s|&]+?)(?:Check|Save)/i
    ];
    
    for (const pattern of statusPatterns) {
      const match = rawText.match(pattern);
      if (match && match[1]) {
        const candidate = match[1].trim();
        if (candidate.length > 5 && candidate.length < 200) {
          eventName = candidate;
          break;
        }
      }
    }
  }
  
  // If still unknown, try to extract from the first substantial line
  if (eventName === 'Unknown Event') {
    for (const line of lines) {
      if (line.length > 10 && line.length < 200 && 
          !line.includes('Check ticket') &&
          !line.includes('Save this event') &&
          !line.includes('Share this event') &&
          !line.includes('Almost full') &&
          !line.includes('Going fast')) {
        eventName = line.substring(0, 100); // Limit length
        break;
      }
    }
  }
  
  // Special handling for scraped content that has date embedded in name
  if (eventName === 'Unknown Event' && rawText.length > 0) {
    // Look for patterns like "Sep28Event Name" or "Sep 28 Event Name"
    const dateNamePattern = /^([A-Za-z]{3}\d{1,2})([A-Za-z\s]+?)(?:\s+at\s+|\s+in\s+|\s+–\s+|\s+\d{1,2}:\d{2})/;
    const match = rawText.match(dateNamePattern);
    if (match && match[2]) {
      eventName = match[2].trim();
      // Extract the date part
      const datePart = match[1];
      // Convert abbreviated month to full month
      const monthMap = {
        'Jan': 'January', 'Feb': 'February', 'Mar': 'March', 'Apr': 'April',
        'May': 'May', 'Jun': 'June', 'Jul': 'July', 'Aug': 'August',
        'Sep': 'September', 'Oct': 'October', 'Nov': 'November', 'Dec': 'December'
      };
      const month = monthMap[datePart.substring(0, 3)];
      const day = datePart.substring(3);
      if (month && day) {
        const currentYear = new Date().getFullYear();
        const dateString = `${month} ${day}, ${currentYear}`;
        const parsedDate = new Date(dateString);
        
        // If the date is in the past, assume it's next year
        if (!isNaN(parsedDate.getTime()) && parsedDate < new Date()) {
          const nextYear = currentYear + 1;
          const nextYearDateString = `${month} ${day}, ${nextYear}`;
          const nextYearDate = new Date(nextYearDateString);
          if (!isNaN(nextYearDate.getTime())) {
            date = nextYearDate.toISOString().split('T')[0];
          }
        } else if (!isNaN(parsedDate.getTime())) {
          date = parsedDate.toISOString().split('T')[0];
        }
      }
    }
  }
  
  // Try to extract address (look for patterns with street numbers and NYC)
  const addressPattern = /\d+\s+[A-Za-z\s]+(?:St|Ave|Blvd|Rd|Dr|Way|Pl|Ct|Ln|Pkwy|Sq|Park|Square|Street|Avenue|Boulevard|Road|Drive|Place|Court|Lane|Parkway)(?:\s*,\s*New York,?\s*NY\s*\d{5})?/i;
  const addressMatch = rawText.match(addressPattern);
  if (addressMatch) {
    address = addressMatch[0];
  } else {
    // Look for specific NYC locations and venues
    const locationPatterns = [
      // Central Park
      /Central Park,?\s*New York,?\s*NY\s*\d{5}/i,
      // Brooklyn locations
      /Brooklyn,?\s*NY\s*\d{5}/i,
      // Manhattan locations
      /\d+\s+[A-Za-z\s]+(?:St|Ave|Blvd|Rd|Dr|Way|Pl|Ct|Ln|Pkwy|Sq|Park|Square|Street|Avenue|Boulevard|Road|Drive|Place|Court|Lane|Parkway),?\s*New York,?\s*NY\s*\d{5}/i,
      // Specific venues
      /(?:Brooklyn Museum|Metropolitan Museum|NYC Public Library|Prospect Park|Flushing Meadows Park|Washington Square Park|Bryant Park|Union Square)/i
    ];
    
    for (const pattern of locationPatterns) {
      const match = rawText.match(pattern);
      if (match) {
        address = match[0].trim();
        break;
      }
    }
    
    // If still no address found, try to extract from the text more broadly
    if (!address) {
      // Look for any text that contains NYC location indicators
      const broadLocationPattern = /([A-Za-z\s]+(?:Park|Museum|Library|Square|Bridge|Avenue|Street|Boulevard|Road|Drive|Place|Court|Lane|Parkway)),?\s*(?:New York|NYC|Brooklyn|Manhattan|Queens|Bronx)/i;
      const broadMatch = rawText.match(broadLocationPattern);
      if (broadMatch) {
        address = broadMatch[0].trim();
      } else {
        // Last resort: use default NYC location
        address = 'New York, NY';
      }
    }
  }
  
  // Try to extract time (look for various time patterns)
  const timePatterns = [
    // Standard 12-hour format
    /\d{1,2}:\d{2}\s*(?:AM|PM)/i,
    // With periods
    /\d{1,2}:\d{2}\s*(?:a\.m\.|p\.m\.)/i,
    // Time ranges
    /\d{1,2}:\d{2}\s*(?:a\.m\.|p\.m\.)–\d{1,2}:\d{2}\s*(?:a\.m\.|p\.m\.)/i,
    // 24-hour format
    /\d{1,2}:\d{2}\s*(?:\d{1,2}:\d{2})?/
  ];
  
  for (const pattern of timePatterns) {
    const timeMatch = rawText.match(pattern);
    if (timeMatch) {
      startTime = timeMatch[0];
      break;
    }
  }
  
  // Try to extract price
  if (rawText.toLowerCase().includes('free')) {
    price = 'Free';
  } else {
    const pricePattern = /\$\d+/;
    const priceMatch = rawText.match(pricePattern);
    if (priceMatch) {
      price = priceMatch[0];
    }
  }
  
  
  // Categorize based on keywords (using existing lowerText variable)
  if (lowerText.includes('free') && (lowerText.includes('food') || lowerText.includes('meal') || lowerText.includes('kitchen') || lowerText.includes('distribution'))) {
    category = 'Free Food';
  } else if (lowerText.includes('influencer') || lowerText.includes('content creator') || lowerText.includes('social media') || lowerText.includes('instagram') || lowerText.includes('tiktok') || lowerText.includes('youtube')) {
    category = 'Influencers';
  } else if (lowerText.includes('heritage') || lowerText.includes('cultural') || lowerText.includes('tradition') || lowerText.includes('history') || lowerText.includes('museum') || lowerText.includes('tour')) {
    category = 'Heritage';
  } else if (lowerText.includes('sports') || lowerText.includes('basketball') || lowerText.includes('football') || lowerText.includes('soccer') || lowerText.includes('tennis') || lowerText.includes('baseball') || lowerText.includes('running') || lowerText.includes('marathon') || lowerText.includes('fitness')) {
    category = 'Sports';
  } else if (lowerText.includes('education') || lowerText.includes('class') || lowerText.includes('course') || lowerText.includes('learning') || lowerText.includes('workshop') || lowerText.includes('seminar') || lowerText.includes('lecture')) {
    category = 'Education';
  } else if (lowerText.includes('health') || lowerText.includes('wellness') || lowerText.includes('yoga') || lowerText.includes('meditation') || lowerText.includes('fitness') || lowerText.includes('gym') || lowerText.includes('therapy')) {
    category = 'Health & Wellness';
  } else if (lowerText.includes('technology') || lowerText.includes('tech') || lowerText.includes('coding') || lowerText.includes('programming') || lowerText.includes('startup') || lowerText.includes('ai') || lowerText.includes('blockchain')) {
    category = 'Technology';
  } else if (lowerText.includes('business') || lowerText.includes('networking') || lowerText.includes('entrepreneur') || lowerText.includes('startup') || lowerText.includes('conference') || lowerText.includes('meeting')) {
    category = 'Business';
  } else if (lowerText.includes('theater') || lowerText.includes('theatre') || lowerText.includes('play') || lowerText.includes('drama') || lowerText.includes('broadway') || lowerText.includes('musical')) {
    category = 'Theater';
  } else if (lowerText.includes('entertainment') || lowerText.includes('show') || lowerText.includes('performance') || lowerText.includes('circus') || lowerText.includes('magic')) {
    category = 'Entertainment';
  } else if (lowerText.includes('community') || lowerText.includes('volunteer') || lowerText.includes('charity') || lowerText.includes('fundraiser') || lowerText.includes('social')) {
    category = 'Community';
  } else if (lowerText.includes('workshop') || lowerText.includes('class') || lowerText.includes('training') || lowerText.includes('skill') || lowerText.includes('craft')) {
    category = 'Workshop';
  } else if (lowerText.includes('tour') || lowerText.includes('walking') || lowerText.includes('guided') || lowerText.includes('explore') || lowerText.includes('sightseeing')) {
    category = 'Tour';
  } else if (lowerText.includes('outdoor') || lowerText.includes('park') || lowerText.includes('hiking') || lowerText.includes('camping') || lowerText.includes('nature')) {
    category = 'Outdoor';
  } else if (lowerText.includes('family') || lowerText.includes('kids') || lowerText.includes('children') || lowerText.includes('parent') || lowerText.includes('child-friendly')) {
    category = 'Family';
  } else if (lowerText.includes('nightlife') || lowerText.includes('club') || lowerText.includes('bar') || lowerText.includes('party') || lowerText.includes('dance') || lowerText.includes('night')) {
    category = 'Nightlife';
  } else if (lowerText.includes('shopping') || lowerText.includes('market') || lowerText.includes('store') || lowerText.includes('retail') || lowerText.includes('sale')) {
    category = 'Shopping';
  } else if (lowerText.includes('fashion') || lowerText.includes('style') || lowerText.includes('clothing') || lowerText.includes('design') || lowerText.includes('runway')) {
    category = 'Fashion';
  } else if (lowerText.includes('photography') || lowerText.includes('photo') || lowerText.includes('camera') || lowerText.includes('picture') || lowerText.includes('shoot')) {
    category = 'Photography';
  } else if (lowerText.includes('gaming') || lowerText.includes('game') || lowerText.includes('esports') || lowerText.includes('video game') || lowerText.includes('arcade')) {
    category = 'Gaming';
  } else if (lowerText.includes('jazz') || lowerText.includes('music') || lowerText.includes('concert') || lowerText.includes('band') || lowerText.includes('song') || lowerText.includes('album')) {
    category = 'Music';
  } else if (lowerText.includes('art') || lowerText.includes('gallery') || lowerText.includes('exhibition') || lowerText.includes('painting') || lowerText.includes('sculpture')) {
    category = 'Art';
  } else if (lowerText.includes('food') || lowerText.includes('restaurant') || lowerText.includes('drink') || lowerText.includes('bar') || lowerText.includes('cuisine') || lowerText.includes('dining')) {
    category = 'Food & Drink';
  } else if (lowerText.includes('comedy') || lowerText.includes('stand-up') || lowerText.includes('joke') || lowerText.includes('laugh') || lowerText.includes('humor')) {
    category = 'Comedy';
  } else if (lowerText.includes('free')) {
    category = 'Free';
  }
  
  // Clean up the event name to remove the full text
  if (eventName.includes(' - ')) {
    eventName = eventName.split(' - ')[0];
  }
  
  // Ensure we have a proper address
  if (!address || address === 'New York, NY') {
    // Try to extract address from the raw text more aggressively
    const addressExtractionPatterns = [
      // Look for specific addresses with zip codes
      /\d+\s+[A-Za-z\s]+(?:St|Ave|Blvd|Rd|Dr|Way|Pl|Ct|Ln|Pkwy|Sq|Park|Square|Street|Avenue|Boulevard|Road|Drive|Place|Court|Lane|Parkway),?\s*New York,?\s*NY\s*\d{5}/i,
      // Look for park names
      /(?:Central Park|Prospect Park|Brooklyn Bridge Park|Washington Square Park|Bryant Park|Union Square)/i,
      // Look for museum names
      /(?:Brooklyn Museum|Metropolitan Museum|NYC Public Library)/i,
      // Look for any address pattern
      /\d+\s+[A-Za-z\s]+(?:St|Ave|Blvd|Rd|Dr|Way|Pl|Ct|Ln|Pkwy|Sq|Park|Square|Street|Avenue|Boulevard|Road|Drive|Place|Court|Lane|Parkway)/i
    ];
    
    for (const pattern of addressExtractionPatterns) {
      const match = rawText.match(pattern);
      if (match) {
        address = match[0].trim();
        break;
      }
    }
  }
  
  // Try to extract date from the text
  let date = null;
  const datePatterns = [
    // YYYY-MM-DD format
    /\d{4}-\d{2}-\d{2}/,
    // MM/DD/YYYY format
    /\d{1,2}\/\d{1,2}\/\d{4}/,
    // Month DD, YYYY format
    /(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}/i,
    // DD Month YYYY format
    /\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}/i,
    // Month DD format (current year)
    /(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}/i,
    // DD Month format (current year)
    /\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)/i,
    // Abbreviated month formats
    /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}/i,
    // Day of week patterns
    /(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/i
  ];
  
  for (const pattern of datePatterns) {
    const match = rawText.match(pattern);
    if (match) {
      const parsedDate = new Date(match[0]);
      if (!isNaN(parsedDate.getTime())) {
        date = parsedDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        break;
      }
    }
  }
  
  // If no date found, use a future date (tomorrow)
  if (!date) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    date = tomorrow.toISOString().split('T')[0];
  }

  return {
    eventName,
    address,
    startTime,
    date,
    price,
    category,
    description: rawText.length > 500 ? rawText.substring(0, 500) + '...' : rawText
  };
}

module.exports = { extractEventData };
