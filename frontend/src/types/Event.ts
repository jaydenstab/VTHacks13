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
}

export type EventCategory = 'All' | 'Music' | 'Art' | 'Food & Drink' | 'Comedy' | 'Free' | 'Other';
