export interface Event {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  address: string;
  time: string;
  price: string;
  description: string;
}

export const events: Event[] = [
  {
    id: 'event-1',
    name: 'Jazz Night at Blue Note',
    category: 'music',
    lat: 40.7306,
    lng: -74.0023,
    address: '131 W 3rd St, New York, NY 10012',
    time: '8:00 PM',
    price: '$25',
    description: 'An evening of smooth jazz featuring local artists in the heart of Greenwich Village. Enjoy a night of soulful melodies and vibrant performances.'
  },
  {
    id: 'event-2',
    name: 'Modern Art Exhibition',
    category: 'art',
    lat: 40.7614,
    lng: -73.9776,
    address: '11 W 53rd St, New York, NY 10019',
    time: '10:00 AM',
    price: '$18',
    description: 'Contemporary art showcase featuring emerging artists and established masters. Explore innovative works across various mediums and styles.'
  },
  {
    id: 'event-3',
    name: 'Food Truck Festival',
    category: 'food',
    lat: 40.7589,
    lng: -73.9851,
    address: 'Central Park, New York, NY 10019',
    time: '12:00 PM',
    price: 'Free',
    description: 'A culinary adventure featuring the best food trucks from across the city. Sample diverse cuisines and discover new flavors.'
  },
  {
    id: 'event-4',
    name: 'Comedy Show at The Comedy Cellar',
    category: 'comedy',
    lat: 40.7306,
    lng: -74.0023,
    address: '117 MacDougal St, New York, NY 10012',
    time: '9:30 PM',
    price: '$15',
    description: 'Laugh the night away with top comedians in an intimate setting. A perfect evening for comedy lovers and first-time visitors.'
  },
  {
    id: 'event-5',
    name: 'Free Yoga in the Park',
    category: 'free',
    lat: 40.7829,
    lng: -73.9654,
    address: 'Central Park, New York, NY 10024',
    time: '7:00 AM',
    price: 'Free',
    description: 'Start your day with peaceful yoga practice in the beautiful surroundings of Central Park. All levels welcome, mats provided.'
  },
  {
    id: 'event-6',
    name: 'Brooklyn Bridge Walking Tour',
    category: 'other',
    lat: 40.7061,
    lng: -73.9969,
    address: 'Brooklyn Bridge, New York, NY 10038',
    time: '2:00 PM',
    price: '$20',
    description: 'Discover the history and architecture of this iconic landmark. Learn fascinating stories and enjoy stunning city views.'
  },
  {
    id: 'event-7',
    name: 'Live Music at Bowery Ballroom',
    category: 'music',
    lat: 40.7209,
    lng: -73.9934,
    address: '6 Delancey St, New York, NY 10002',
    time: '8:30 PM',
    price: '$35',
    description: 'Experience the energy of live music in one of NYC\'s most iconic venues. Featuring indie and alternative artists.'
  },
  {
    id: 'event-8',
    name: 'Art Gallery Opening',
    category: 'art',
    lat: 40.7505,
    lng: -73.9934,
    address: '525 W 22nd St, New York, NY 10011',
    time: '6:00 PM',
    price: 'Free',
    description: 'Join us for the opening of a new contemporary art exhibition. Meet the artists and enjoy wine and light refreshments.'
  },
  {
    id: 'event-9',
    name: 'Food & Wine Tasting',
    category: 'food',
    lat: 40.7505,
    lng: -73.9934,
    address: '123 9th Ave, New York, NY 10011',
    time: '7:00 PM',
    price: '$45',
    description: 'Indulge in a curated selection of wines paired with artisanal cheeses and charcuterie. Perfect for food enthusiasts.'
  },
  {
    id: 'event-10',
    name: 'Stand-up Comedy Night',
    category: 'comedy',
    lat: 40.7614,
    lng: -73.9776,
    address: '208 W 23rd St, New York, NY 10011',
    time: '8:00 PM',
    price: '$12',
    description: 'An evening of hilarious stand-up comedy featuring both established and up-and-coming comedians. Guaranteed laughs!'
  },
  {
    id: 'event-11',
    name: 'Free Outdoor Movie',
    category: 'free',
    lat: 40.7589,
    lng: -73.9851,
    address: 'Bryant Park, New York, NY 10018',
    time: '8:00 PM',
    price: 'Free',
    description: 'Enjoy a classic film under the stars in the heart of Manhattan. Bring a blanket and some snacks for the perfect evening.'
  },
  {
    id: 'event-12',
    name: 'Photography Workshop',
    category: 'other',
    lat: 40.7505,
    lng: -73.9934,
    address: '456 W 18th St, New York, NY 10011',
    time: '10:00 AM',
    price: '$75',
    description: 'Learn professional photography techniques while exploring the vibrant streets of NYC. All skill levels welcome.'
  }
];
