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

    const prompt = `You are an expert event data extractor for NYC. From the following text, extract the Event Name, Address, Start Time, and Price. Also, assign a single category from this list: ['Music', 'Art', 'Food & Drink', 'Comedy', 'Free', 'Other']. 

Return the output as a clean JSON object with keys: eventName, address, startTime, price, category, and description. If the price is free, the value for 'price' should be 'Free'. If any information is missing, use null.

Text to analyze:
${rawText}

Please respond with only the JSON object, no additional text.`;

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
  
  // Try to extract event name (usually the first substantial line)
  for (const line of lines) {
    if (line.length > 10 && line.length < 100 && !line.includes('$') && !line.includes('PM') && !line.includes('AM')) {
      eventName = line;
      break;
    }
  }
  
  // Try to extract address (look for patterns with street numbers and NYC)
  const addressPattern = /\d+\s+[A-Za-z\s]+(?:St|Ave|Blvd|Rd|Dr|Way|Pl|Ct|Ln|Pkwy|Sq|Park|Square|Street|Avenue|Boulevard|Road|Drive|Place|Court|Lane|Parkway)(?:\s*,\s*New York,?\s*NY\s*\d{5})?/i;
  const addressMatch = rawText.match(addressPattern);
  if (addressMatch) {
    address = addressMatch[0];
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
