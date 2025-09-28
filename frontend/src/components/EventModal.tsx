import React from 'react';

interface Event {
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
  website?: string | null;
}

interface EventModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
}

const EventModal: React.FC<EventModalProps> = ({ event, isOpen, onClose }) => {
  if (!isOpen || !event) return null;

  const getCategoryColor = (category: string): string => {
    const colors: { [key: string]: string } = {
      'music': '#FF6B6B',
      'art': '#4ECDC4',
      'food': '#45B7D1',
      'comedy': '#96CEB4',
      'free': '#FFEAA7',
      'other': '#DDA0DD'
    };
    return colors[category.toLowerCase()] || '#DDA0DD';
  };

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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl flex-shrink-0"
              style={{ backgroundColor: getCategoryColor(event.category) }}
            >
              {getCategoryEmoji(event.category)}
            </div>
            
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                {event.name}
              </h2>
              <div className="flex items-center gap-2">
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: getCategoryColor(event.category) }}
                >
                  {event.category}
                </span>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
            >
              ✕
            </button>
          </div>
          
          {/* Event Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gray-600">
              <span className="text-lg">📅</span>
              <span className="font-medium">
                {event.date ? new Date(event.date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                }) : 'Date TBD'}
              </span>
            </div>
            
            <div className="flex items-center gap-3 text-gray-600">
              <span className="text-lg">🕐</span>
              <span className="font-medium">{event.time}</span>
            </div>
            
            <div className="flex items-center gap-3 text-gray-600">
              <span className="text-lg">💰</span>
              <span className="font-medium">{event.price}</span>
            </div>
            
            <div className="flex items-start gap-3 text-gray-600">
              <span className="text-lg mt-0.5">📍</span>
              <span className="font-medium">{event.address}</span>
            </div>
            
            {event.website && (
              <div className="flex items-center gap-3 text-gray-600">
                <span className="text-lg">🌐</span>
                <a 
                  href={event.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                >
                  Visit Event Website
                </a>
              </div>
            )}
            
            <div className="pt-4 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">About this event</h3>
              <p className="text-gray-600 leading-relaxed">
                {event.description}
              </p>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(event.address)}`;
                window.open(url, '_blank');
              }}
              className="flex-1 px-4 py-3 bg-blue-100 text-blue-700 rounded-xl font-medium hover:bg-blue-200 transition-colors"
            >
              Get Directions
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
