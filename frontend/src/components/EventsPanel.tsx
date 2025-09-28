import React from 'react';
import EventCard from './EventCard';

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
  const handleDirectionsClick = (event: Event) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(event.address)}`;
    window.open(url, '_blank');
    onDirectionsClick?.(event);
  };

  const handleLearnMoreClick = (event: Event) => {
    // You can implement a modal or detailed view here
    console.log('Learn more about:', event.name);
    onLearnMoreClick?.(event);
  };

  return (
    <div className="fixed top-0 right-0 w-96 h-screen bg-white/95 backdrop-blur-lg shadow-2xl border-l border-gray-200 overflow-y-auto z-20">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          🎯 NYC Events
        </h2>
        
        <div className="space-y-6">
          {events.map((event) => (
            <div
              key={event.id}
              onClick={() => onEventSelect?.(event)}
              className="cursor-pointer"
            >
              <EventCard
                event={event}
                onDirectionsClick={handleDirectionsClick}
                onLearnMoreClick={handleLearnMoreClick}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventsPanel;
