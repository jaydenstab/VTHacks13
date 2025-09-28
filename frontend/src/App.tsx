import React, { useState, useEffect, useRef } from 'react';

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

const App: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [lightPreset, setLightPreset] = useState('day');
  const [showPlaceLabels, setShowPlaceLabels] = useState(true);
  const [showPOILabels, setShowPOILabels] = useState(true);
  const [showRoadLabels, setShowRoadLabels] = useState(true);
  const [showTransitLabels, setShowTransitLabels] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const markers = useRef<any[]>([]);

  // Category configuration
  const categoryConfig = {
    'music': { color: '#FF6B6B', emoji: '🎵' },
    'art': { color: '#4ECDC4', emoji: '🎨' },
    'food': { color: '#45B7D1', emoji: '🍽️' },
    'comedy': { color: '#96CEB4', emoji: '😂' },
    'free': { color: '#FFEAA7', emoji: '🆓' },
    'other': { color: '#DDA0DD', emoji: '📍' }
  };

  // Load Mapbox library
  useEffect(() => {
    const loadMapbox = async () => {
      try {
        // Load Mapbox GL JS script
        const script = document.createElement('script');
        script.src = 'https://api.mapbox.com/mapbox-gl-js/v3.15.0/mapbox-gl.js';
        script.onload = () => {
          console.log('Mapbox GL JS loaded successfully');
          setMapLoaded(true);
        };
        script.onerror = () => {
          console.error('Failed to load Mapbox GL JS');
        };
        document.head.appendChild(script);
      } catch (error) {
        console.error('Error loading Mapbox:', error);
      }
    };

    loadMapbox();
  }, []);

  // Load events from API
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        console.log('Loading events from API...');
        
        const response = await fetch('http://localhost:8000/api/events');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Data received:', data);
        
        // Transform the API response
        const transformedEvents = data.map((event: any, index: number) => ({
          id: event.id || `event-${index + 1}`,
          name: event.name || 'Unknown Event',
          category: (event.category || 'other').toLowerCase(),
          lat: event.latitude || 40.7128,
          lng: event.longitude || -74.0060,
          address: event.address || 'New York, NY',
          time: event.startTime || 'TBD',
          price: event.price || 'Unknown',
          description: event.description || 'No description available'
        }));
        
        setEvents(transformedEvents);
        setError(null);
        console.log(`Loaded ${transformedEvents.length} events:`, transformedEvents.map(e => e.name));
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

  // Initialize map when both events and mapbox are loaded
  useEffect(() => {
    if (events.length === 0 || !mapLoaded) return;

    const initMap = () => {
      try {
        // Check if mapboxgl is available
        if (typeof (window as any).mapboxgl === 'undefined') {
          console.error('Mapbox GL JS not loaded');
          return;
        }

        const mapboxgl = (window as any).mapboxgl;
        
        // Set the Mapbox access token
        mapboxgl.accessToken = 'pk.eyJ1IjoiZGV2a3VtYXIxMjMiLCJhIjoiY21nMXZpdTE1MHQwejJub2ZudWd3ZGZ0ZSJ9.Ed8Xd2_5aBZzthiEhdXZgA';
        
        if (mapContainer.current && !map.current) {
          console.log('Initializing map...');
          map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/standard',
            center: [-73.935242, 40.730610],
            zoom: 10,
            pitch: 45,
            bearing: -17.6
          });

          map.current.on('load', () => {
            console.log('Map loaded successfully');
            addMarkersToMap();
          });

          map.current.on('error', (e) => {
            console.error('Mapbox error:', e);
          });
        }
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    initMap();
  }, [events, mapLoaded]);

  // Add markers to map
  const addMarkersToMap = () => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    events.forEach(event => {
      const config = categoryConfig[event.category as keyof typeof categoryConfig] || categoryConfig.other;
      
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.cssText = `
        background-color: ${config.color};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        transition: all 0.3s ease;
      `;
      el.textContent = config.emoji;
      
      const marker = new (window as any).mapboxgl.Marker(el)
        .setLngLat([event.lng, event.lat])
        .setPopup(new (window as any).mapboxgl.Popup({ offset: 25 }).setHTML(createPopupContent(event)))
        .addTo(map.current);
      
      el.addEventListener('click', () => {
        map.current!.flyTo({
          center: [event.lng, event.lat],
          zoom: 15,
          duration: 1000
        });
      });
      
      markers.current.push(marker);
    });
  };

  // Create popup content
  const createPopupContent = (event: Event): string => {
    const config = categoryConfig[event.category as keyof typeof categoryConfig] || categoryConfig.other;
    const capitalizedCategory = event.category.charAt(0).toUpperCase() + event.category.slice(1);
    
    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif; color: #1d1d1f; min-width: 250px; max-width: 300px;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
          <div style="width: 40px; height: 40px; background: ${config.color}; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 20px; color: white;">
            ${config.emoji}
          </div>
          <div>
            <h3 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 700; color: #1d1d1f;">
              ${event.name}
            </h3>
            <div style="background: ${config.color}; color: white; padding: 4px 8px; border-radius: 12px; font-size: 10px; font-weight: 600; display: inline-block;">
              ${capitalizedCategory}
            </div>
          </div>
        </div>
        <div style="margin: 0 0 8px 0; font-size: 13px; color: #86868b;">
          🕐 ${event.time} • 💰 ${event.price}
        </div>
        <div style="margin: 0 0 8px 0; font-size: 13px; color: #86868b;">
          📍 ${event.address}
        </div>
        <p style="margin: 0; font-size: 13px; color: #1d1d1f; line-height: 1.4;">
          ${event.description}
        </p>
      </div>
    `;
  };

  // Helper functions
  const focusOnEvent = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (event && map.current) {
      map.current.flyTo({
        center: [event.lng, event.lat],
        zoom: 15,
        duration: 1000
      });
    }
  };

  const getDirections = (address: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
  };

  const showEventDetails = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      setSelectedEvent(event);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        backgroundColor: '#1a1a1a',
        color: 'white',
        flexDirection: 'column'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '5px solid rgba(255, 255, 255, 0.3)',
          borderTop: '5px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }}></div>
        <h2>Loading NYC Events...</h2>
        <p>Fetching events from API</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        backgroundColor: '#1a1a1a',
        color: 'white',
        flexDirection: 'column'
      }}>
        <h2>Error Loading Events</h2>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      width: '100vw',
      height: '100vh',
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: '#1a1a1a'
    }}>
      {/* Map */}
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      
      {/* Events Panel */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        width: '320px',
        maxHeight: 'calc(100vh - 40px)',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        overflow: 'hidden',
        zIndex: 1000
      }}>
        <div style={{ padding: '20px', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1d1d1f', marginBottom: '5px' }}>NYC Events</h2>
          <p style={{ fontSize: '14px', color: '#666' }}>{events.length} events found</p>
        </div>
        <div style={{ maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
          {events.map((event, index) => {
            const config = categoryConfig[event.category as keyof typeof categoryConfig] || categoryConfig.other;
            return (
              <div
                key={event.id || index}
                style={{
                  padding: '15px',
                  borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                onClick={() => focusOnEvent(event.id)}
              >
                <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: config.color,
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    color: 'white',
                    flexShrink: 0
                  }}>
                    {config.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1d1d1f', marginBottom: '4px', lineHeight: '1.3' }}>
                      {event.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ background: config.color, color: 'white', padding: '2px 6px', borderRadius: '8px', fontSize: '10px', fontWeight: '600' }}>
                        {event.category}
                      </span>
                      <span style={{ fontSize: '11px', color: '#666' }}>{event.time}</span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px', lineHeight: '1.3' }}>
                      📍 {event.address}
                    </p>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          getDirections(event.address);
                        }}
                        style={{
                          padding: '4px 8px',
                          background: '#e3f2fd',
                          color: '#1976d2',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '11px',
                          cursor: 'pointer'
                        }}
                      >
                        Directions
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          showEventDetails(event.id);
                        }}
                        style={{
                          padding: '4px 8px',
                          background: config.color,
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '11px',
                          cursor: 'pointer'
                        }}
                      >
                        Learn More
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Map Controls */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '20px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        zIndex: 1000
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '15px', color: '#1d1d1f' }}>Map Controls</h3>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px', color: '#1d1d1f' }}>Light Preset</label>
          <select
            value={lightPreset}
            onChange={(e) => setLightPreset(e.target.value)}
            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }}
          >
            <option value="dawn">Dawn</option>
            <option value="day">Day</option>
            <option value="dusk">Dusk</option>
            <option value="night">Night</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#1d1d1f', marginBottom: '8px' }}>
            <input
              type="checkbox"
              checked={showPlaceLabels}
              onChange={(e) => setShowPlaceLabels(e.target.checked)}
              style={{ width: '16px', height: '16px' }}
            />
            <span>Show place labels</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#1d1d1f', marginBottom: '8px' }}>
            <input
              type="checkbox"
              checked={showPOILabels}
              onChange={(e) => setShowPOILabels(e.target.checked)}
              style={{ width: '16px', height: '16px' }}
            />
            <span>Show POI labels</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#1d1d1f', marginBottom: '8px' }}>
            <input
              type="checkbox"
              checked={showRoadLabels}
              onChange={(e) => setShowRoadLabels(e.target.checked)}
              style={{ width: '16px', height: '16px' }}
            />
            <span>Show road labels</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#1d1d1f' }}>
            <input
              type="checkbox"
              checked={showTransitLabels}
              onChange={(e) => setShowTransitLabels(e.target.checked)}
              style={{ width: '16px', height: '16px' }}
            />
            <span>Show transit labels</span>
          </label>
        </div>
      </div>

      {/* Event Modal */}
      {selectedEvent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto',
            color: '#1d1d1f',
            position: 'relative'
          }}>
            <button
              onClick={() => setSelectedEvent(null)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                width: '30px',
                height: '30px',
                borderRadius: '15px',
                backgroundColor: '#f0f0f0',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px'
              }}
            >
              ✕
            </button>

            <div style={{ display: 'flex', alignItems: 'start', gap: '15px', marginBottom: '20px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: categoryConfig[selectedEvent.category as keyof typeof categoryConfig]?.color || categoryConfig.other.color,
                borderRadius: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                color: 'white'
              }}>
                {categoryConfig[selectedEvent.category as keyof typeof categoryConfig]?.emoji || categoryConfig.other.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '5px' }}>
                  {selectedEvent.name}
                </h2>
                <div style={{
                  backgroundColor: categoryConfig[selectedEvent.category as keyof typeof categoryConfig]?.color || categoryConfig.other.color,
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '15px',
                  fontSize: '12px',
                  fontWeight: '600',
                  display: 'inline-block'
                }}>
                  {selectedEvent.category.toUpperCase()}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ marginRight: '10px', fontSize: '16px' }}>🕐</span>
                <span style={{ fontWeight: '500' }}>{selectedEvent.time}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ marginRight: '10px', fontSize: '16px' }}>💰</span>
                <span style={{ fontWeight: '500' }}>{selectedEvent.price}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '10px', fontSize: '16px' }}>📍</span>
                <span style={{ fontWeight: '500' }}>{selectedEvent.address}</span>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>About this event</h3>
              <p style={{ color: '#666', lineHeight: '1.5' }}>
                {selectedEvent.description}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => getDirections(selectedEvent.address)}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  backgroundColor: '#e3f2fd',
                  color: '#1976d2',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Get Directions
              </button>
              <button
                onClick={() => setSelectedEvent(null)}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  background: `linear-gradient(135deg, ${categoryConfig[selectedEvent.category as keyof typeof categoryConfig]?.color || categoryConfig.other.color}, ${categoryConfig[selectedEvent.category as keyof typeof categoryConfig]?.color || categoryConfig.other.color}dd)`,
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;