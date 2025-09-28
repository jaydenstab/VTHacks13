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
    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not found, using fallback extraction');
      return extractEventDataFallback(rawText);
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `You are an expert event data extractor for NYC events. From the following text, extract structured event information.

REQUIREMENTS:
1. Extract Event Name, Address, Start Time, Date, Price, and Description
2. Assign ONE category from: ['Music', 'Art', 'Food & Drink', 'Comedy', 'Free', 'Other']
3. For addresses, ensure they include "New York, NY" or "NYC" if missing
4. For prices, use "Free" if the event is free, otherwise use the exact price format (e.g., "$25", "$15-20")
5. For times, use 12-hour format (e.g., "8:00 PM", "2:00 PM")
6. For dates, use YYYY-MM-DD format. If no date is specified, use a future date within the next 30 days
7. Create a brief description (1-2 sentences) if none provided

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
    
    // Fallback to rule-based extraction
    return extractEventDataFallback(rawText);
  }
}

/**
 * Fallback extraction method using simple text parsing
 * @param {string} rawText - Raw text containing event information
 * @returns {Object} Structured event data object
 */
function extractEventDataFallback(rawText) {
  const lines = rawText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  let eventName = 'Unknown Event';
  let address = null;
  let startTime = null;
  let price = 'Unknown';
  let category = 'Other';
  let description = rawText;
  
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
  ];
  
  for (const pattern of eventNamePatterns) {
    const match = rawText.match(pattern);
    if (match && match[1]) {
      const candidate = match[1].trim();
      if (candidate.length > 5 && candidate.length < 200 && 
          !candidate.includes('Check ticket') &&
          !candidate.includes('Save this event') &&
          !candidate.includes('Share this event') &&
          !candidate.includes('Almost full') &&
          !candidate.includes('Going fast') &&
          !candidate.includes('PM') &&
          !candidate.includes('AM')) {
        eventName = candidate;
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
  
  // Try to extract address (look for patterns with street numbers and NYC)
  const addressPattern = /\d+\s+[A-Za-z\s]+(?:St|Ave|Blvd|Rd|Dr|Way|Pl|Ct|Ln|Pkwy|Sq|Park|Square|Street|Avenue|Boulevard|Road|Drive|Place|Court|Lane|Parkway)(?:\s*,\s*New York,?\s*NY\s*\d{5})?/i;
  const addressMatch = rawText.match(addressPattern);
  if (addressMatch) {
    address = addressMatch[0];
  } else {
    // Look for venue names that appear before time patterns
    const venuePatterns = [
      // Look for venue names before "Check ticket" (no spaces)
      /([A-Za-z]+(?:Steakhouse|Restaurant|Bar|Club|Theater|Theatre|Hall|Center|Centre|Park|Square|Refuge|DROM|Marriott))Check/i,
      // Look for venue names before "Save this event" (no spaces)
      /([A-Za-z]+(?:Steakhouse|Restaurant|Bar|Club|Theater|Theatre|Hall|Center|Centre|Park|Square|Refuge|DROM|Marriott))Save/i,
      // Look for venue names before time patterns (no spaces)
      /([A-Za-z]+(?:Steakhouse|Restaurant|Bar|Club|Theater|Theatre|Hall|Center|Centre|Park|Square|Refuge|DROM|Marriott))(?:PM|AM)/i,
      // Look for venue names in general
      /([A-Za-z]+(?:Steakhouse|Restaurant|Bar|Club|Theater|Theatre|Hall|Center|Centre|Park|Square|Refuge|DROM|Marriott))/i
    ];
    
    for (const pattern of venuePatterns) {
      const match = rawText.match(pattern);
      if (match && match[1]) {
        const venue = match[1].trim();
        if (venue.length > 2 && venue.length < 50 && !venue.includes('PM') && !venue.includes('AM')) {
          address = venue + ', New York, NY';
          break;
        }
      }
    }
    
    // If still no address found, use default NYC location
    if (!address) {
      address = 'New York, NY';
    }
  }
  
  // Try to extract time (look for PM/AM patterns)
  const timePattern = /\d{1,2}:\d{2}\s*(?:AM|PM)/i;
  const timeMatch = rawText.match(timePattern);
  if (timeMatch) {
    startTime = timeMatch[0];
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
  
  // Categorize based on keywords
  const lowerText = rawText.toLowerCase();
  if (lowerText.includes('jazz') || lowerText.includes('music') || lowerText.includes('concert') || lowerText.includes('band')) {
    category = 'Music';
  } else if (lowerText.includes('art') || lowerText.includes('gallery') || lowerText.includes('exhibition')) {
    category = 'Art';
  } else if (lowerText.includes('food') || lowerText.includes('restaurant') || lowerText.includes('drink') || lowerText.includes('bar')) {
    category = 'Food & Drink';
  } else if (lowerText.includes('comedy') || lowerText.includes('stand-up') || lowerText.includes('joke')) {
    category = 'Comedy';
  } else if (lowerText.includes('free') && !lowerText.includes('free')) {
    category = 'Free';
  }
  
  return {
    eventName,
    address,
    startTime,
    price,
    category,
    description: rawText.substring(0, 200) + (rawText.length > 200 ? '...' : '')
  };
}

module.exports = { extractEventData };
