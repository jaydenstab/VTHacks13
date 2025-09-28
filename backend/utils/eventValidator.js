/**
 * Event validation utilities
 * Filters out incomplete or bad event data to ensure quality
 */

/**
 * Validates if an event object has the required fields and quality
 * @param {Object} event - Event object to validate
 * @returns {boolean} - True if event is valid, false otherwise
 */
function isValidEvent(event) {
  if (!event) return false;
  
  // Check required fields
  const requiredFields = ['name', 'address', 'date', 'startTime'];
  for (const field of requiredFields) {
    if (!event[field] || event[field].trim() === '') {
      console.log(`❌ Event rejected: Missing ${field}`);
      return false;
    }
  }
  
  // Validate website link if provided
  if (event.website && event.website.trim() !== '') {
    const websitePattern = /^https?:\/\/.+/;
    if (!websitePattern.test(event.website)) {
      console.log(`❌ Event rejected: Invalid website URL format`);
      return false;
    }
  }
  
  // Check event name quality
  if (event.name.length < 5 || event.name.length > 200) {
    console.log(`❌ Event rejected: Invalid event name length (${event.name.length})`);
    return false;
  }
  
  // Check for generic or placeholder names
  const genericNames = [
    'Unknown Event',
    'Event',
    'TBD',
    'To Be Announced',
    'Coming Soon',
    'Event Name',
    'Title'
  ];
  
  if (genericNames.some(generic => event.name.toLowerCase().includes(generic.toLowerCase()))) {
    console.log(`❌ Event rejected: Generic event name`);
    return false;
  }
  
  // Check for generic "things to do" lists and attraction guides
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
    'new york attractions',
    'heritage',
    'outdoor',
    'cultural',
    'entertainment',
    'dining',
    'shopping',
    'nightlife',
    'family',
    'romantic',
    'budget',
    'luxury',
    'hidden gems'
  ];
  
  const hasGenericContent = genericContentPatterns.some(pattern => 
    event.name.toLowerCase().includes(pattern.toLowerCase())
  );
  
  if (hasGenericContent) {
    console.log(`❌ Event rejected: Generic content pattern detected in event name`);
    return false;
  }
  
  // Check address quality - very lenient
  if (event.address.length < 1 || event.address.length > 2000) {
    console.log(`❌ Event rejected: Invalid address length (${event.address.length})`);
    return false;
  }
  
  // Check if address contains NYC location indicators
  const nycIndicators = [
    'New York',
    'NYC',
    'Manhattan',
    'Brooklyn',
    'Queens',
    'Bronx',
    'Staten Island',
    'NY',
    'Richard Rodgers Theatre',
    'Gershwin Theatre',
    'Minskoff Theatre',
    'New Amsterdam Theatre',
    'St. James Theatre',
    'Eugene O\'Neill Theatre',
    'Radio City Music Hall',
    'Carnegie Hall',
    'Lincoln Center',
    'Madison Square Garden'
  ];
  
  const hasNYCLocation = nycIndicators.some(indicator => 
    event.address.toLowerCase().includes(indicator.toLowerCase())
  );
  
  // Make NYC location check more lenient - only warn, don't reject
  if (!hasNYCLocation) {
    console.log(`⚠️ Warning: No NYC location indicators in address, but allowing event`);
    // Don't return false - just warn
  }
  
  // Check date validity - more lenient
  const eventDate = new Date(event.date);
  if (isNaN(eventDate.getTime())) {
    console.log(`⚠️ Warning: Invalid date format, but allowing event`);
    // Don't return false - just warn
  } else {
    // Check if event is in the future (within reasonable timeframe)
    const now = new Date();
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(now.getFullYear() + 1);
    
    // Allow events for today and future dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDateOnly = new Date(eventDate);
    eventDateOnly.setHours(0, 0, 0, 0);
    
    if (eventDateOnly < today) {
      console.log(`⚠️ Warning: Event is in the past, but allowing event`);
      // Don't return false - just warn
    }
    
    if (eventDate > oneYearFromNow) {
      console.log(`⚠️ Warning: Event is too far in the future, but allowing event`);
      // Don't return false - just warn
    }
  }
  
  // Check time format - more lenient
  if (!event.startTime || event.startTime === 'TBD' || event.startTime === 'Unknown') {
    console.log(`⚠️ Warning: Invalid start time, but allowing event`);
    // Don't return false - just warn
  }
  
  // Check category validity
  const validCategories = [
    'Music', 'Art', 'Food & Drink', 'Comedy', 'Free', 'Free Food', 'Influencers', 'Heritage',
    'Sports', 'Education', 'Health & Wellness', 'Health', 'Technology', 'Business', 
    'Theater', 'Broadway', 'Entertainment', 'Performance', 'Community', 'Cultural',
    'Networking', 'Workshop', 'Tour', 'Outdoor', 'Family', 'Nightlife', 'Shopping',
    'Fashion', 'Photography', 'Gaming', 'Other'
  ];
  
  if (!validCategories.includes(event.category)) {
    console.log(`❌ Event rejected: Invalid category (${event.category})`);
    return false;
  }
  
  // Check description quality
  if (event.description && event.description.length > 10) {
    // Check for generic descriptions
    const genericDescriptions = [
      'No description available',
      'Description',
      'TBD',
      'To be announced',
      'Coming soon'
    ];
    
    if (genericDescriptions.some(generic => 
      event.description.toLowerCase().includes(generic.toLowerCase())
    )) {
      console.log(`❌ Event rejected: Generic description`);
      return false;
    }
  }
  
  console.log(`✅ Event validated: ${event.eventName}`);
  return true;
}

/**
 * Validates and filters an array of events
 * @param {Array} events - Array of event objects to validate
 * @returns {Array} - Array of valid events
 */
function validateEvents(events) {
  if (!Array.isArray(events)) {
    console.log('❌ Invalid input: events must be an array');
    return [];
  }
  
  console.log(`🔍 Validating ${events.length} events...`);
  
  const validEvents = events.filter(event => isValidEvent(event));
  
  console.log(`📊 Validation complete: ${validEvents.length}/${events.length} events passed validation`);
  
  return validEvents;
}

/**
 * Checks if an event is a duplicate based on name, date, and website
 * @param {Object} event - Event to check
 * @param {Array} existingEvents - Array of existing events
 * @returns {boolean} - True if event is a duplicate
 */
function isDuplicateEvent(event, existingEvents) {
  return existingEvents.some(existing => {
    // Check name and date match
    const nameDateMatch = existing.name.toLowerCase() === event.name.toLowerCase() &&
                         existing.date === event.date;
    
    // Check website match if both have websites
    const websiteMatch = event.website && existing.website && 
                        event.website.toLowerCase() === existing.website.toLowerCase();
    
    // Check if it's the same event based on name similarity and same date
    const nameSimilarity = existing.name.toLowerCase().includes(event.name.toLowerCase()) ||
                          event.name.toLowerCase().includes(existing.name.toLowerCase());
    const dateMatch = existing.date === event.date;
    
    return nameDateMatch || websiteMatch || (nameSimilarity && dateMatch);
  });
}

/**
 * Removes duplicate events from an array
 * @param {Array} events - Array of events
 * @returns {Array} - Array of unique events
 */
function removeDuplicates(events) {
  const uniqueEvents = [];
  
  for (const event of events) {
    if (!isDuplicateEvent(event, uniqueEvents)) {
      uniqueEvents.push(event);
    } else {
      console.log(`🔄 Duplicate event removed: ${event.name || 'Unknown'}`);
    }
  }
  
  console.log(`📊 Duplicate removal: ${uniqueEvents.length}/${events.length} unique events`);
  return uniqueEvents;
}

module.exports = {
  isValidEvent,
  validateEvents,
  isDuplicateEvent,
  removeDuplicates
};
