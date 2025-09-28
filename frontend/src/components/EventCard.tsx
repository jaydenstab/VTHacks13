import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Event {
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

interface EventCardProps {
  event: Event;
  onDirectionsClick?: (event: Event) => void;
  onLearnMoreClick?: (event: Event) => void;
}

const EventCard: React.FC<EventCardProps> = ({ 
  event, 
  onDirectionsClick, 
  onLearnMoreClick 
}) => {
  const [eventImage, setEventImage] = useState<string>('');
  const [mapImage, setMapImage] = useState<string>('');

  const getCategoryEmoji = (category: string): string => {
    const emojis: { [key: string]: string } = {
      'music': '🎵',
      'art': '🎨',
      'food': '🍽️',
      'comedy': '😂',
      'free': '🆓',
      'other': '📍'
    };
    return emojis[category.toLowerCase()] || '📍';
  };

  const capitalizeCategory = (category: string): string => {
    return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
  };

  const generateEventImage = (event: Event): string => {
    const categoryImages: { [key: string]: string[] } = {
      'music': [
        '1551632811-561732d1e306?q=80&w=400&auto=format&fit=crop',
        '1493225457124-3fdc8c7c4e8c?q=80&w=400&auto=format&fit=crop',
        '1511671782779-c97d3d27a5d4?q=80&w=400&auto=format&fit=crop',
        '1571019613454-1cb2f99b2d8b?q=80&w=400&auto=format&fit=crop',
        '1558618048-0e4c82c9d7f1?q=80&w=400&auto=format&fit=crop'
      ],
      'art': [
        '1541961014-2dca997ad595?q=80&w=400&auto=format&fit=crop',
        '1578662996442-48f60103fc96?q=80&w=400&auto=format&fit=crop',
        '1571019613454-1cb2f99b2d8b?q=80&w=400&auto=format&fit=crop',
        '1558618048-0e4c82c9d7f1?q=80&w=400&auto=format&fit=crop',
        '1506905925346-21bda4d32df4?q=80&w=400&auto=format&fit=crop'
      ],
      'food': [
        '1555939594-58d7cb561ad1?q=80&w=400&auto=format&fit=crop',
        '1556909112-2a2b4b4b4b4b?q=80&w=400&auto=format&fit=crop',
        '1565299624946-b28f40a0ca4b?q=80&w=400&auto=format&fit=crop',
        '1571019613454-1cb2f99b2d8b?q=80&w=400&auto=format&fit=crop',
        '1558618048-0e4c82c9d7f1?q=80&w=400&auto=format&fit=crop'
      ],
      'comedy': [
        '1515187029135-18ee286d815b?q=80&w=400&auto=format&fit=crop',
        '1571019613454-1cb2f99b2d8b?q=80&w=400&auto=format&fit=crop',
        '1558618048-0e4c82c9d7f1?q=80&w=400&auto=format&fit=crop',
        '1506905925346-21bda4d32df4?q=80&w=400&auto=format&fit=crop',
        '1441974231531-c6227db76b6e?q=80&w=400&auto=format&fit=crop'
      ],
      'free': [
        '1441974231531-c6227db76b6e?q=80&w=400&auto=format&fit=crop',
        '1506905925346-21bda4d32df4?q=80&w=400&auto=format&fit=crop',
        '1571019613454-1cb2f99b2d8b?q=80&w=400&auto=format&fit=crop',
        '1558618048-0e4c82c9d7f1?q=80&w=400&auto=format&fit=crop',
        '1551632811-561732d1e306?q=80&w=400&auto=format&fit=crop'
      ],
      'other': [
        '1506905925346-21bda4d32df4?q=80&w=400&auto=format&fit=crop',
        '1551632811-561732d1e306?q=80&w=400&auto=format&fit=crop',
        '1441974231531-c6227db76b6e?q=80&w=400&auto=format&fit=crop',
        '1571019613454-1cb2f99b2d8b?q=80&w=400&auto=format&fit=crop',
        '1558618048-0e4c82c9d7f1?q=80&w=400&auto=format&fit=crop'
      ]
    };

    const images = categoryImages[event.category.toLowerCase()] || categoryImages['other'];
    const eventIndex = parseInt(event.id.replace(/\D/g, '')) || 0;
    const imageIndex = eventIndex % images.length;
    return `https://images.unsplash.com/photo/${images[imageIndex]}`;
  };

  const generateMapImage = (event: Event): string => {
    const mapboxToken = 'pk.eyJ1IjoiZGV2a3VtYXIxMjMiLCJhIjoiY21nMXZpdTE1MHQwejJub2ZudWd3ZGZ0ZSJ9.Ed8Xd2_5aBZzthiEhdXZgA';
    return `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s-marker+ff0000(${event.lng},${event.lat})/${event.lng},${event.lat},14,0/200x100@2x?access_token=${mapboxToken}`;
  };

  useEffect(() => {
    const img = generateEventImage(event);
    const map = generateMapImage(event);
    setEventImage(img);
    setMapImage(map);
  }, [event]);

  const handleImageError = () => {
    setEventImage('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=400&auto=format&fit=crop');
  };

  return (
    <motion.div
      className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-lg border border-gray-100"
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Top section with background image and content */}
      <div className="relative h-60 w-full">
        <img
          src={eventImage}
          alt={event.name}
          className="h-full w-full object-cover"
          onError={handleImageError}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        
        {/* Category badge */}
        <div className="absolute top-4 left-4">
          <div className="px-4 py-2 rounded-full bg-black/80 backdrop-blur-sm text-white text-xs font-bold flex items-center gap-2">
            <span>{getCategoryEmoji(event.category)}</span>
            <span>{capitalizeCategory(event.category)}</span>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 flex w-full items-end justify-between p-4">
          <div className="text-white">
            <h3 className="text-xl font-bold mb-1">{event.name}</h3>
            <p className="text-sm text-white/90 flex items-center gap-1">
              📍 {event.address}
            </p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileHover={{ opacity: 1, x: 0 }}
            animate={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <button
              onClick={() => onDirectionsClick?.(event)}
              className="px-3 py-2 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-lg hover:bg-white/30 transition-colors"
            >
              📍 Directions
            </button>
          </motion.div>
        </div>
      </div>

      {/* Bottom section with event details */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-bold text-gray-900">{event.time}</p>
            <p className="text-xs text-gray-500">{event.price}</p>
          </div>
          {/* Map preview */}
          <img
            src={mapImage}
            alt="Event location map"
            className="h-10 w-20 object-cover rounded border"
          />
        </div>
        
        <div className="my-4 h-px w-full bg-gray-200" />
        
        <div className="flex justify-between mb-4">
          <div className="text-center flex-1">
            <div className="text-lg font-bold text-gray-900">{event.price}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Price</div>
          </div>
          <div className="text-center flex-1">
            <div className="text-lg font-bold text-gray-900">{event.time}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Time</div>
          </div>
          <div className="text-center flex-1">
            <div className="text-lg font-bold text-gray-900">{capitalizeCategory(event.category)}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Category</div>
          </div>
        </div>
        
        {/* Description */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        </div>

        {/* Learn More button */}
        <button
          onClick={() => onLearnMoreClick?.(event)}
          className="w-full px-4 py-2 border-2 border-blue-500 text-blue-500 rounded-xl font-semibold hover:bg-blue-500 hover:text-white transition-all duration-300"
        >
          Learn More →
        </button>
      </div>
    </motion.div>
  );
};

export default EventCard;
