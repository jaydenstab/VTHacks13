import React, { useState, useEffect } from 'react';

const App: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        console.log('Loading events from API...');
        setLoading(true);
        
        const response = await fetch('http://localhost:8000/api/events');
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Data received:', data);
        
        setEvents(data);
        setError(null);
      } catch (err) {
        console.error('Error loading events:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Loading NYC Events...</h2>
        <p>Fetching events from API...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h2>Error Loading Events</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>NYC Events Debug</h1>
      <p>Loaded {events.length} events</p>
      
      <div style={{ display: 'grid', gap: '10px', marginTop: '20px' }}>
        {events.slice(0, 5).map((event, index) => (
          <div key={index} style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
            <h3>{event.name}</h3>
            <p><strong>Category:</strong> {event.category}</p>
            <p><strong>Address:</strong> {event.address}</p>
            <p><strong>Coordinates:</strong> {event.latitude}, {event.longitude}</p>
            <p><strong>Time:</strong> {event.startTime || 'TBD'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
