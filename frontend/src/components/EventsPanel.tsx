import React from 'react';

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

interface EventsPanelProps {
  events: Event[];
  onEventSelect?: (event: Event) => void;
  onDirectionsClick?: (event: Event) => void;
  onLearnMoreClick?: (event: Event) => void;
}

const EventsPanel: React.FC<EventsPanelProps> = ({ 
  events, 
  onEventSelect, 
  onDirectionsClick, 
  onLearnMoreClick 
}) => {
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
    <div className="absolute top-4 right-4 w-80 max-h-[calc(100vh-2rem)] overflow-y-auto z-20">
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-black/10">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">NYC Events</h2>
          <p className="text-sm text-gray-600">{events.length} events found</p>
        </div>
        
        <div className="p-4 space-y-3">
          {events.map((event, index) => (
            <div
              key={event.id || index}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer"
              onClick={() => onEventSelect?.(event)}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg flex-shrink-0"
                  style={{ backgroundColor: getCategoryColor(event.category) }}
                >
                  {getCategoryEmoji(event.category)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1 line-clamp-2">
                    {event.name}
                  </h3>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="px-2 py-1 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: getCategoryColor(event.category) }}
                    >
                      {event.category}
                    </span>
                    <span className="text-xs text-gray-500">{event.time}</span>
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-2 line-clamp-1">
                    📍 {event.address}
                  </p>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDirectionsClick?.(event);
                      }}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-200 transition-colors"
                    >
                      Directions
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onLearnMoreClick?.(event);
                      }}
                      className="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-xs font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm"
                    >
                      Learn More
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventsPanel;
