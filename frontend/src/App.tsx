import React, { useState } from 'react';
import NYC3DMap from './components/NYC3DMap';
import EventsPanel from './components/EventsPanel';
import { events, Event } from './data/events';

const App: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event);
  };

  const handleDirectionsClick = (event: Event) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(event.address)}`;
    window.open(url, '_blank');
  };

  const handleLearnMoreClick = (event: Event) => {
    console.log('Learn more about:', event.name);
    // You can implement a modal or detailed view here
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* 3D Map */}
      <NYC3DMap 
        events={events} 
        onEventSelect={handleEventSelect}
      />
      
      {/* Events Panel */}
      <EventsPanel
        events={events}
        onEventSelect={handleEventSelect}
        onDirectionsClick={handleDirectionsClick}
        onLearnMoreClick={handleLearnMoreClick}
      />
    </div>
  );
};

export default App;