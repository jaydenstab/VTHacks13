import React, { useState, useEffect } from 'react';
import NYC3DMap from './components/NYC3DMap';
import EventsPanel from './components/EventsPanel';
import EventModal from './components/EventModal';
import { fetchEvents, Event } from './services/api';

const App: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [modalEvent, setModalEvent] = useState<Event | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event);
  };

  const handleDirectionsClick = (event: Event) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(event.address)}`;
    window.open(url, '_blank');
  };

  const handleLearnMoreClick = (event: Event) => {
    setModalEvent(event);
  };

  const handleCloseModal = () => {
    setModalEvent(null);
  };

  // Load events on component mount
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        console.log('Loading events from API...');
        const eventsData = await fetchEvents();
        console.log(`Loaded ${eventsData.length} events:`, eventsData.map(e => e.name));
        setEvents(eventsData);
      } catch (error) {
        console.error('Error loading events:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  if (loading) {
    return (
      <div className="relative w-full h-screen overflow-hidden flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-700">Loading NYC Events...</h3>
          <p className="text-sm text-gray-500 mt-2">Fetching 10 events from API</p>
        </div>
      </div>
    );
  }

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
      
      {/* Event Modal */}
      <EventModal
        event={modalEvent}
        isOpen={modalEvent !== null}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default App;