export interface Event {
  id: string;
  name: string;
  description: string;
  address: string | null;
  startTime: string | null;
  price: string;
  category: string;
  latitude: number;
  longitude: number;
  website: string | null;
}

export type EventCategory = 'All' | 'Music' | 'Art' | 'Food & Drink' | 'Comedy' | 'Free' | 'Free Food' | 'Influencers' | 'Heritage' | 'Sports' | 'Education' | 'Health & Wellness' | 'Technology' | 'Business' | 'Theater' | 'Broadway' | 'Entertainment' | 'Performance' | 'Community' | 'Cultural' | 'Networking' | 'Workshop' | 'Tour' | 'Outdoor' | 'Family' | 'Nightlife' | 'Shopping' | 'Fashion' | 'Photography' | 'Gaming' | 'Other';
