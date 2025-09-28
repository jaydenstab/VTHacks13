export interface Event {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  address: string;
  time: string;
  date: string;
  price: string;
  description: string;
}

const API_BASE_URL = 'http://localhost:8000';

export const fetchEvents = async (): Promise<Event[]> => {
  try {
    console.log('Loading real NYC events from API...');
    return await fetchRealEvents();
  } catch (error) {
    console.error('Error fetching events:', error);
    
    // Return empty array if API fails - no fallback dummy data
    return [];
  }
};

export const fetchRealEvents = async (): Promise<Event[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/events`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform the API response to match our Event interface
    return data.map((event: any, index: number) => ({
      id: event.id || `event-${index + 1}`,
      name: event.name || 'Unknown Event',
      category: event.category?.toLowerCase() || 'other',
      lat: event.latitude || 40.7128,
      lng: event.longitude || -74.0060,
      address: event.address || 'New York, NY',
      time: event.startTime || 'TBD',
      date: event.date || new Date().toISOString().split('T')[0],
      price: event.price || 'Unknown',
      description: event.description || 'No description available'
    }));
  } catch (error) {
    console.error('Error fetching real events:', error);
    return [];
  }
};
