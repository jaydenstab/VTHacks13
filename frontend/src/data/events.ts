export interface Event {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  address: string;
  time: string;
  date: string | null;
  price: string;
  description: string;
  website?: string | null;
}

export const events: Event[] = [
  {
    id: 'event-1',
    name: 'Free Food Truck Festival',
    category: 'free food',
    lat: 40.7589,
    lng: -73.9851,
    address: 'Central Park, New York, NY 10019',
    time: '12:00 PM',
    date: '2025-10-05',
    price: 'Free',
    description: 'A culinary adventure featuring the best food trucks from across the city. Sample diverse cuisines and discover new flavors - all completely free!',
    website: null
  },
  {
    id: 'event-2',
    name: 'Influencer Meet & Greet at Soho House',
    category: 'influencers',
    lat: 40.7231,
    lng: -74.0026,
    address: '29-35 9th Ave, New York, NY 10014',
    time: '7:00 PM',
    date: '2025-10-06',
    price: 'Free',
    description: 'Network with top NYC influencers, content creators, and digital entrepreneurs. Perfect for building connections in the social media world.',
    website: null
  },
  {
    id: 'event-3',
    name: 'Little Italy Heritage Festival',
    category: 'heritage',
    lat: 40.7191,
    lng: -73.9972,
    address: 'Mulberry St, New York, NY 10013',
    time: '10:00 AM',
    date: '2025-10-07',
    price: 'Free',
    description: 'Celebrate Italian-American heritage with traditional food, music, and cultural performances. Experience the rich history of Little Italy.',
    website: null
  },
  {
    id: 'event-4',
    name: 'Free Community Kitchen',
    category: 'free food',
    lat: 40.7505,
    lng: -73.9934,
    address: '123 9th Ave, New York, NY 10011',
    time: '6:00 PM',
    date: '2025-10-08',
    price: 'Free',
    description: 'Join us for a free community meal featuring locally sourced ingredients. All are welcome to share in this nourishing experience.',
    website: null
  },
  {
    id: 'event-5',
    name: 'Chinatown Heritage Walking Tour',
    category: 'heritage',
    lat: 40.7158,
    lng: -73.9973,
    address: 'Chinatown, New York, NY 10013',
    time: '2:00 PM',
    date: '2025-10-09',
    price: 'Free',
    description: 'Explore the rich cultural heritage of NYC\'s Chinatown. Learn about immigration history, traditional architecture, and cultural traditions.',
    website: null
  },
  {
    id: 'event-6',
    name: 'Influencer Photography Workshop',
    category: 'influencers',
    lat: 40.7505,
    lng: -73.9934,
    address: '456 W 18th St, New York, NY 10011',
    time: '10:00 AM',
    date: '2025-10-10',
    price: 'Free',
    description: 'Learn Instagram-worthy photography techniques from top NYC influencers. Perfect for content creators looking to up their social media game.',
    website: null
  },
  {
    id: 'event-7',
    name: 'Free Food Distribution',
    category: 'free food',
    lat: 40.7589,
    lng: -73.9851,
    address: 'Union Square, New York, NY 10003',
    time: '11:00 AM',
    date: '2025-10-11',
    price: 'Free',
    description: 'Community food distribution event providing fresh produce and meals to all. No questions asked, everyone is welcome.',
    website: null
  },
  {
    id: 'event-8',
    name: 'African American Heritage Museum Tour',
    category: 'heritage',
    lat: 40.7614,
    lng: -73.9776,
    address: '144 W 125th St, New York, NY 10027',
    time: '1:00 PM',
    date: '2025-10-12',
    price: 'Free',
    description: 'Explore the rich history and contributions of African Americans in NYC. Guided tour through Harlem\'s cultural landmarks and history.',
    website: null
  },
  {
    id: 'event-9',
    name: 'Influencer Brand Collaboration Event',
    category: 'influencers',
    lat: 40.7505,
    lng: -73.9934,
    address: '525 W 22nd St, New York, NY 10011',
    time: '6:00 PM',
    date: '2025-10-13',
    price: 'Free',
    description: 'Connect with brands and fellow influencers for potential collaborations. Network with marketing professionals and content creators.',
    website: null
  },
  {
    id: 'event-10',
    name: 'Free Community Garden Harvest',
    category: 'free food',
    lat: 40.7829,
    lng: -73.9654,
    address: 'Central Park, New York, NY 10024',
    time: '9:00 AM',
    date: '2025-10-14',
    price: 'Free',
    description: 'Join the community garden harvest and take home fresh vegetables and herbs. Learn about urban gardening and sustainable living.',
    website: null
  },
  {
    id: 'event-11',
    name: 'Puerto Rican Heritage Celebration',
    category: 'heritage',
    lat: 40.7589,
    lng: -73.9851,
    address: 'East Harlem, New York, NY 10029',
    time: '3:00 PM',
    date: '2025-10-15',
    price: 'Free',
    description: 'Celebrate Puerto Rican culture with traditional music, dance, and food. Experience the vibrant heritage of NYC\'s Puerto Rican community.',
    website: null
  },
  {
    id: 'event-12',
    name: 'Influencer Content Creation Meetup',
    category: 'influencers',
    lat: 40.7209,
    lng: -73.9934,
    address: '6 Delancey St, New York, NY 10002',
    time: '7:30 PM',
    date: '2025-10-16',
    price: 'Free',
    description: 'Collaborate with other content creators on projects, share tips, and build your influencer network. Perfect for growing your social media presence.',
    website: null
  },
  {
    id: 'event-13',
    name: 'Central Park Basketball Tournament',
    category: 'sports',
    lat: 40.7829,
    lng: -73.9654,
    address: 'Central Park, New York, NY 10024',
    time: '10:00 AM',
    date: '2025-10-17',
    price: 'Free',
    description: 'Join NYC\'s premier basketball tournament in the heart of Central Park. All skill levels welcome for this community sports event.',
    website: null
  },
  {
    id: 'event-14',
    name: 'Tech Startup Networking Mixer',
    category: 'technology',
    lat: 40.7505,
    lng: -73.9934,
    address: '123 9th Ave, New York, NY 10011',
    time: '6:00 PM',
    date: '2025-10-18',
    price: '$25',
    description: 'Connect with NYC\'s top tech entrepreneurs, investors, and innovators. Perfect for networking in the startup ecosystem.',
    website: null
  },
  {
    id: 'event-15',
    name: 'Broadway Show Workshop',
    category: 'theater',
    lat: 40.7614,
    lng: -73.9776,
    address: '208 W 23rd St, New York, NY 10011',
    time: '2:00 PM',
    date: '2025-10-19',
    price: '$45',
    description: 'Learn from Broadway professionals in this intensive theater workshop. Perfect for aspiring actors and theater enthusiasts.',
    website: null
  },
  {
    id: 'event-16',
    name: 'Yoga in the Park',
    category: 'health & wellness',
    lat: 40.7589,
    lng: -73.9851,
    address: 'Bryant Park, New York, NY 10018',
    time: '8:00 AM',
    date: '2025-10-20',
    price: 'Free',
    description: 'Start your day with peaceful yoga practice in Bryant Park. All levels welcome, mats provided for this wellness event.',
    website: null
  },
  {
    id: 'event-17',
    name: 'NYC Photography Walk',
    category: 'photography',
    lat: 40.7061,
    lng: -73.9969,
    address: 'Brooklyn Bridge, New York, NY 10038',
    time: '9:00 AM',
    date: '2025-10-21',
    price: '$30',
    description: 'Capture stunning NYC views with professional photography guidance. Perfect for improving your photography skills.',
    website: null
  },
  {
    id: 'event-18',
    name: 'Family Fun Day at Prospect Park',
    category: 'family',
    lat: 40.6602,
    lng: -73.9690,
    address: 'Prospect Park, Brooklyn, NY 11215',
    time: '11:00 AM',
    date: '2025-10-22',
    price: 'Free',
    description: 'Family-friendly activities including games, crafts, and entertainment. Perfect for parents and children of all ages.',
    website: null
  },
  {
    id: 'event-19',
    name: 'Fashion Week Pop-up Show',
    category: 'fashion',
    lat: 40.7505,
    lng: -73.9934,
    address: '525 W 22nd St, New York, NY 10011',
    time: '7:00 PM',
    date: '2025-10-23',
    price: '$60',
    description: 'Experience the latest fashion trends at this exclusive pop-up show. Network with designers and fashion professionals.',
    website: null
  },
  {
    id: 'event-20',
    name: 'Gaming Tournament at Barcade',
    category: 'gaming',
    lat: 40.7209,
    lng: -73.9934,
    address: '6 Delancey St, New York, NY 10002',
    time: '8:00 PM',
    date: '2025-10-24',
    price: '$15',
    description: 'Compete in classic arcade games and modern esports. Prizes for winners in this competitive gaming event.',
    website: null
  },
  {
    id: 'event-21',
    name: 'Night Market Food Tour',
    category: 'nightlife',
    lat: 40.7589,
    lng: -73.9851,
    address: 'Union Square, New York, NY 10003',
    time: '8:00 PM',
    date: '2025-10-25',
    price: '$40',
    description: 'Explore NYC\'s vibrant night market scene with guided food tastings and local vendor visits.',
    website: null
  },
  {
    id: 'event-22',
    name: 'Outdoor Hiking Adventure',
    category: 'outdoor',
    lat: 40.7829,
    lng: -73.9654,
    address: 'Central Park, New York, NY 10024',
    time: '7:00 AM',
    date: '2025-10-26',
    price: 'Free',
    description: 'Discover hidden trails and scenic spots in Central Park. Perfect for nature lovers and outdoor enthusiasts.',
    website: null
  },
  {
    id: 'event-23',
    name: 'Business Networking Breakfast',
    category: 'business',
    lat: 40.7505,
    lng: -73.9934,
    address: '123 9th Ave, New York, NY 10011',
    time: '8:00 AM',
    date: '2025-10-27',
    price: '$35',
    description: 'Start your day with professional networking over breakfast. Connect with NYC business leaders and entrepreneurs.',
    website: null
  },
  {
    id: 'event-24',
    name: 'Community Volunteer Day',
    category: 'community',
    lat: 40.7589,
    lng: -73.9851,
    address: 'Union Square, New York, NY 10003',
    time: '10:00 AM',
    date: '2025-10-28',
    price: 'Free',
    description: 'Give back to the community through various volunteer activities. Make a positive impact in NYC neighborhoods.',
    website: null
  }
];
