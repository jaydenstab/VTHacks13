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
  const [isEventsPanelOpen, setIsEventsPanelOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
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
            style: 'mapbox://styles/mapbox/light-v11',
            center: [-73.935242, 40.730610],
            zoom: 10,
            pitch: 45,
            bearing: -17.6
          });

          map.current.on('load', () => {
            console.log('Map loaded successfully');
            addMarkersToMap();
            // Apply initial light preset
            applyLightPreset();
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

  // Apply light preset when it changes
  useEffect(() => {
    if (map.current) {
      applyLightPreset();
    }
  }, [lightPreset]);

  // Apply label settings when they change
  useEffect(() => {
    if (map.current) {
      applyLabelSettings();
    }
  }, [showPlaceLabels, showPOILabels, showRoadLabels, showTransitLabels]);

  // Function to apply label settings
  const applyLabelSettings = () => {
    if (!map.current) return;
    
    try {
      map.current.setConfigProperty('basemap', 'showPlaceLabels', showPlaceLabels);
      map.current.setConfigProperty('basemap', 'showPointOfInterestLabels', showPOILabels);
      map.current.setConfigProperty('basemap', 'showRoadLabels', showRoadLabels);
      map.current.setConfigProperty('basemap', 'showTransitLabels', showTransitLabels);
      console.log('Applied label settings');
    } catch (error) {
      console.error('Error applying label settings:', error);
    }
  };

  // Function to apply light preset
  const applyLightPreset = () => {
    if (!map.current) return;
    
    try {
      // Apply light preset using Mapbox's setConfigProperty
      map.current.setConfigProperty('basemap', 'lightPreset', lightPreset);
      console.log(`Applied light preset: ${lightPreset}`);
    } catch (error) {
      console.error('Error applying light preset:', error);
      // Fallback: try to set the style based on light preset
      const styleMap = {
        'dawn': 'mapbox://styles/mapbox/light-v11',
        'day': 'mapbox://styles/mapbox/light-v11',
        'dusk': 'mapbox://styles/mapbox/dark-v11',
        'night': 'mapbox://styles/mapbox/dark-v11'
      };
      
      const newStyle = styleMap[lightPreset as keyof typeof styleMap] || 'mapbox://styles/mapbox/light-v11';
      if (map.current.getStyle().name !== newStyle) {
        map.current.setStyle(newStyle);
        console.log(`Applied fallback style: ${newStyle}`);
      }
    }
  };

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

  // Create popup content - circular and smooth
  const createPopupContent = (event: Event): string => {
    const config = categoryConfig[event.category as keyof typeof categoryConfig] || categoryConfig.other;
    const capitalizedCategory = event.category.charAt(0).toUpperCase() + event.category.slice(1);
    
    return `
      <div style="
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif; 
        color: #1d1d1f; 
        min-width: 280px; 
        max-width: 320px;
        background: linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.95));
        backdrop-filter: blur(20px);
        border-radius: 24px;
        padding: 20px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.2);
        border: 1px solid rgba(255,255,255,0.3);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      ">
        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
          <div style="
            width: 50px; 
            height: 50px; 
            background: linear-gradient(135deg, ${config.color}, ${config.color}dd); 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-size: 22px; 
            color: white;
            box-shadow: 0 8px 20px ${config.color}40;
            border: 3px solid rgba(255,255,255,0.8);
          ">
            ${config.emoji}
          </div>
          <div style="flex: 1;">
            <h3 style="margin: 0 0 6px 0; font-size: 18px; font-weight: 700; color: #1d1d1f; line-height: 1.2;">
              ${event.name}
            </h3>
            <div style="
              background: linear-gradient(135deg, ${config.color}, ${config.color}dd); 
              color: white; 
              padding: 6px 12px; 
              border-radius: 20px; 
              font-size: 11px; 
              font-weight: 600; 
              display: inline-block;
              box-shadow: 0 4px 12px ${config.color}40;
            ">
              ${capitalizedCategory}
            </div>
          </div>
        </div>
        <div style="
          margin: 0 0 12px 0; 
          font-size: 14px; 
          color: #6b7280;
          display: flex;
          align-items: center;
          gap: 8px;
        ">
          <span style="font-size: 16px;">🕐</span>
          <span style="font-weight: 500;">${event.time}</span>
          <span style="color: #d1d5db;">•</span>
          <span style="font-size: 16px;">💰</span>
          <span style="font-weight: 500;">${event.price}</span>
        </div>
        <div style="
          margin: 0 0 12px 0; 
          font-size: 14px; 
          color: #6b7280;
          display: flex;
          align-items: flex-start;
          gap: 8px;
        ">
          <span style="font-size: 16px; margin-top: 2px;">📍</span>
          <span style="font-weight: 500; line-height: 1.4;">${event.address}</span>
        </div>
        <p style="
          margin: 0; 
          font-size: 14px; 
          color: #374151; 
          line-height: 1.5;
          background: rgba(255,255,255,0.6);
          padding: 12px;
          border-radius: 12px;
          border: 1px solid rgba(0,0,0,0.05);
        ">
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
      
      {/* Events Panel - Left Side with Toggle */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        width: isEventsPanelOpen ? '350px' : '60px',
        height: isEventsPanelOpen ? 'calc(100vh - 40px)' : '60px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        overflow: 'hidden',
        zIndex: 1000,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Events Panel Header */}
        <div style={{ 
          padding: '20px', 
          borderBottom: isEventsPanelOpen ? '1px solid rgba(0,0,0,0.1)' : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: '60px'
        }}>
          {isEventsPanelOpen && (
            <>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1d1d1f', marginBottom: '5px' }}>NYC Events</h2>
                <p style={{ fontSize: '14px', color: '#666' }}>{events.length} events found</p>
              </div>
              <button
                onClick={() => setIsEventsPanelOpen(false)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '16px',
                  background: 'rgba(0,0,0,0.1)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  color: '#666',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0,0,0,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(0,0,0,0.1)';
                }}
              >
                ←
              </button>
            </>
          )}
          {!isEventsPanelOpen && (
            <button
              onClick={() => setIsEventsPanelOpen(true)}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                color: 'white',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
              }}
            >
              📅
            </button>
          )}
        </div>
        
        {/* Events List */}
        {isEventsPanelOpen && (
          <div style={{ 
            flex: 1,
            overflowY: 'auto',
            padding: '0 20px 20px 20px'
          }}>
            {events.map((event, index) => {
              const config = categoryConfig[event.category as keyof typeof categoryConfig] || categoryConfig.other;
              return (
                <div
                  key={event.id || index}
                  style={{
                    padding: '16px',
                    marginBottom: '12px',
                    background: 'rgba(255,255,255,0.7)',
                    borderRadius: '16px',
                    border: '1px solid rgba(0,0,0,0.05)',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.9)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.7)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                  }}
                  onClick={() => focusOnEvent(event.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      background: `linear-gradient(135deg, ${config.color}, ${config.color}dd)`,
                      borderRadius: '22px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      color: 'white',
                      flexShrink: 0,
                      boxShadow: `0 4px 12px ${config.color}40`
                    }}>
                      {config.emoji}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1d1d1f', marginBottom: '6px', lineHeight: '1.3' }}>
                        {event.name}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ 
                          background: `linear-gradient(135deg, ${config.color}, ${config.color}dd)`, 
                          color: 'white', 
                          padding: '4px 8px', 
                          borderRadius: '12px', 
                          fontSize: '11px', 
                          fontWeight: '600',
                          boxShadow: `0 2px 6px ${config.color}40`
                        }}>
                          {event.category}
                        </span>
                        <span style={{ fontSize: '12px', color: '#666' }}>{event.time}</span>
                      </div>
                      <p style={{ fontSize: '13px', color: '#666', marginBottom: '10px', lineHeight: '1.3' }}>
                        📍 {event.address}
                      </p>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            getDirections(event.address);
                          }}
                          style={{
                            padding: '6px 12px',
                            background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
                            color: '#1976d2',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 2px 4px rgba(25, 118, 210, 0.2)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(25, 118, 210, 0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(25, 118, 210, 0.2)';
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
                            padding: '6px 12px',
                            background: `linear-gradient(135deg, ${config.color}, ${config.color}dd)`,
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: `0 2px 6px ${config.color}40`
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = `0 4px 12px ${config.color}60`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = `0 2px 6px ${config.color}40`;
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
        )}
      </div>
      
      {/* Settings Icon - Right Side */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 1000
      }}>
        {/* Settings Button */}
        <button
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '30px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            color: 'white',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1) rotate(90deg)';
            e.currentTarget.style.boxShadow = '0 12px 35px rgba(102, 126, 234, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
          }}
        >
          ⚙️
        </button>

        {/* Settings Dropdown */}
        {isSettingsOpen && (
          <div style={{
            position: 'absolute',
            top: '80px',
            right: '0',
            width: '300px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            animation: 'slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 1001
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              marginBottom: '20px', 
              color: '#1d1d1f',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              ⚙️ Map Settings
            </h3>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '600', 
                marginBottom: '8px', 
                color: '#1d1d1f' 
              }}>
                Light Preset
              </label>
              <select
                value={lightPreset}
                onChange={(e) => setLightPreset(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '12px 16px', 
                  border: '2px solid #e5e7eb', 
                  borderRadius: '12px', 
                  fontSize: '14px',
                  background: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="dawn">🌅 Dawn</option>
                <option value="day">☀️ Day</option>
                <option value="dusk">🌆 Dusk</option>
                <option value="night">🌙 Night</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                fontSize: '14px', 
                color: '#1d1d1f',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(102, 126, 234, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              >
                <input
                  type="checkbox"
                  checked={showPlaceLabels}
                  onChange={(e) => setShowPlaceLabels(e.target.checked)}
                  style={{ 
                    width: '18px', 
                    height: '18px',
                    accentColor: '#667eea',
                    cursor: 'pointer'
                  }}
                />
                <span style={{ fontWeight: '500' }}>Show place labels</span>
              </label>
              
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                fontSize: '14px', 
                color: '#1d1d1f',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(102, 126, 234, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              >
                <input
                  type="checkbox"
                  checked={showPOILabels}
                  onChange={(e) => setShowPOILabels(e.target.checked)}
                  style={{ 
                    width: '18px', 
                    height: '18px',
                    accentColor: '#667eea',
                    cursor: 'pointer'
                  }}
                />
                <span style={{ fontWeight: '500' }}>Show POI labels</span>
              </label>
              
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                fontSize: '14px', 
                color: '#1d1d1f',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(102, 126, 234, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              >
                <input
                  type="checkbox"
                  checked={showRoadLabels}
                  onChange={(e) => setShowRoadLabels(e.target.checked)}
                  style={{ 
                    width: '18px', 
                    height: '18px',
                    accentColor: '#667eea',
                    cursor: 'pointer'
                  }}
                />
                <span style={{ fontWeight: '500' }}>Show road labels</span>
              </label>
              
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                fontSize: '14px', 
                color: '#1d1d1f',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(102, 126, 234, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              >
                <input
                  type="checkbox"
                  checked={showTransitLabels}
                  onChange={(e) => setShowTransitLabels(e.target.checked)}
                  style={{ 
                    width: '18px', 
                    height: '18px',
                    accentColor: '#667eea',
                    cursor: 'pointer'
                  }}
                />
                <span style={{ fontWeight: '500' }}>Show transit labels</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Event Modal - Circular and Smooth */}
      {selectedEvent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '20px',
          animation: 'fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.95))',
            backdropFilter: 'blur(20px)',
            borderRadius: '32px',
            padding: '40px',
            maxWidth: '520px',
            width: '100%',
            maxHeight: '85vh',
            overflow: 'auto',
            color: '#1d1d1f',
            position: 'relative',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            animation: 'slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            <button
              onClick={() => setSelectedEvent(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                color: '#6b7280',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1) rotate(90deg)';
                e.currentTarget.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                e.currentTarget.style.background = 'linear-gradient(135deg, #f3f4f6, #e5e7eb)';
                e.currentTarget.style.color = '#6b7280';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
              }}
            >
              ✕
            </button>

            <div style={{ display: 'flex', alignItems: 'start', gap: '20px', marginBottom: '24px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: `linear-gradient(135deg, ${categoryConfig[selectedEvent.category as keyof typeof categoryConfig]?.color || categoryConfig.other.color}, ${categoryConfig[selectedEvent.category as keyof typeof categoryConfig]?.color || categoryConfig.other.color}dd)`,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '36px',
                color: 'white',
                boxShadow: `0 12px 30px ${categoryConfig[selectedEvent.category as keyof typeof categoryConfig]?.color || categoryConfig.other.color}40`,
                border: '4px solid rgba(255, 255, 255, 0.8)'
              }}>
                {categoryConfig[selectedEvent.category as keyof typeof categoryConfig]?.emoji || categoryConfig.other.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', lineHeight: '1.2' }}>
                  {selectedEvent.name}
                </h2>
                <div style={{
                  background: `linear-gradient(135deg, ${categoryConfig[selectedEvent.category as keyof typeof categoryConfig]?.color || categoryConfig.other.color}, ${categoryConfig[selectedEvent.category as keyof typeof categoryConfig]?.color || categoryConfig.other.color}dd)`,
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: '600',
                  display: 'inline-block',
                  boxShadow: `0 4px 12px ${categoryConfig[selectedEvent.category as keyof typeof categoryConfig]?.color || categoryConfig.other.color}40`
                }}>
                  {selectedEvent.category.toUpperCase()}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '24px', background: 'rgba(255, 255, 255, 0.6)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(0, 0, 0, 0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ marginRight: '12px', fontSize: '20px' }}>🕐</span>
                <span style={{ fontWeight: '600', fontSize: '16px' }}>{selectedEvent.time}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ marginRight: '12px', fontSize: '20px' }}>💰</span>
                <span style={{ fontWeight: '600', fontSize: '16px' }}>{selectedEvent.price}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                <span style={{ marginRight: '12px', fontSize: '20px', marginTop: '2px' }}>📍</span>
                <span style={{ fontWeight: '600', fontSize: '16px', lineHeight: '1.4' }}>{selectedEvent.address}</span>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#1d1d1f' }}>About this event</h3>
              <p style={{ 
                color: '#4b5563', 
                lineHeight: '1.6', 
                fontSize: '15px',
                background: 'rgba(255, 255, 255, 0.6)',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid rgba(0, 0, 0, 0.05)'
              }}>
                {selectedEvent.description}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => getDirections(selectedEvent.address)}
                style={{
                  flex: 1,
                  padding: '16px 24px',
                  background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
                  color: '#1976d2',
                  border: 'none',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '600',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(25, 118, 210, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(25, 118, 210, 0.2)';
                }}
              >
                Get Directions
              </button>
              <button
                onClick={() => setSelectedEvent(null)}
                style={{
                  flex: 1,
                  padding: '16px 24px',
                  background: `linear-gradient(135deg, ${categoryConfig[selectedEvent.category as keyof typeof categoryConfig]?.color || categoryConfig.other.color}, ${categoryConfig[selectedEvent.category as keyof typeof categoryConfig]?.color || categoryConfig.other.color}dd)`,
                  color: 'white',
                  border: 'none',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '600',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: `0 4px 12px ${categoryConfig[selectedEvent.category as keyof typeof categoryConfig]?.color || categoryConfig.other.color}40`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 8px 25px ${categoryConfig[selectedEvent.category as keyof typeof categoryConfig]?.color || categoryConfig.other.color}60`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 4px 12px ${categoryConfig[selectedEvent.category as keyof typeof categoryConfig]?.color || categoryConfig.other.color}40`;
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes slideDown {
          from { 
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default App;