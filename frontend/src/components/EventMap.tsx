import React, { useRef, useEffect, useState } from 'react';
import Map, { Marker, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Event } from '../types/Event';

interface EventMapProps {
  events: Event[];
  selectedEvent: Event | null;
  onEventSelect: (event: Event | null) => void;
}

const EventMap: React.FC<EventMapProps> = ({ events, selectedEvent, onEventSelect }) => {
  const mapRef = useRef<any>(null);
  const [viewState, setViewState] = useState({
    longitude: -73.9857, // East Village, NYC
    latitude: 40.7282,
    zoom: 13
  });

  const getCategoryColor = (category: string): string => {
    const colors: { [key: string]: string } = {
      'Music': '#FF3B30',
      'Art': '#007AFF',
      'Food & Drink': '#34C759',
      'Comedy': '#FF9500',
      'Free': '#FFCC00',
      'Other': '#AF52DE'
    };
    return colors[category] || '#AF52DE';
  };

  const getCategoryEmoji = (category: string): string => {
    const emojis: { [key: string]: string } = {
      'Music': '🎵',
      'Art': '🎨',
      'Food & Drink': '🍽️',
      'Comedy': '😂',
      'Free': '🆓',
      'Other': '📍'
    };
    return emojis[category] || '📍';
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapboxAccessToken={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        attributionControl={false}
      >
        {events.map((event) => (
          <Marker
            key={event.id}
            longitude={event.longitude}
            latitude={event.latitude}
            onClick={() => onEventSelect(event)}
            style={{ cursor: 'pointer' }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '18px',
                backgroundColor: getCategoryColor(event.category),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                border: '3px solid #ffffff',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.15)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.2)';
              }}
            >
              {getCategoryEmoji(event.category)}
            </div>
          </Marker>
        ))}

        {selectedEvent && (
          <Popup
            longitude={selectedEvent.longitude}
            latitude={selectedEvent.latitude}
            onClose={() => onEventSelect(null)}
            closeButton={true}
            closeOnClick={false}
            offset={[0, -10]}
          >
            <div style={{ 
              color: '#1d1d1f', 
              minWidth: '280px',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif'
            }}>
              <h3 style={{ 
                margin: '0 0 12px 0', 
                fontSize: '18px', 
                fontWeight: '600',
                color: '#1d1d1f',
                letterSpacing: '-0.3px'
              }}>
                {selectedEvent.name}
              </h3>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '12px',
                gap: '8px',
                flexWrap: 'wrap'
              }}>
                <span style={{ 
                  backgroundColor: getCategoryColor(selectedEvent.category),
                  color: '#ffffff',
                  padding: '6px 12px',
                  borderRadius: '16px',
                  fontSize: '13px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {getCategoryEmoji(selectedEvent.category)} {selectedEvent.category}
                </span>
                <span style={{ 
                  backgroundColor: selectedEvent.price === 'Free' ? '#34C759' : '#FF3B30',
                  color: '#ffffff',
                  padding: '6px 12px',
                  borderRadius: '16px',
                  fontSize: '13px',
                  fontWeight: '600'
                }}>
                  {selectedEvent.price}
                </span>
              </div>

              {selectedEvent.startTime && (
                <div style={{ 
                  margin: '0 0 8px 0', 
                  fontSize: '15px', 
                  color: '#86868b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '16px' }}>🕐</span>
                  <span>{selectedEvent.startTime}</span>
                </div>
              )}

              {selectedEvent.address && (
                <div style={{ 
                  margin: '0 0 12px 0', 
                  fontSize: '15px', 
                  color: '#86868b',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '16px', marginTop: '1px' }}>📍</span>
                  <span style={{ lineHeight: '1.4' }}>{selectedEvent.address}</span>
                </div>
              )}

              <p style={{ 
                margin: '0', 
                fontSize: '15px', 
                color: '#1d1d1f',
                lineHeight: '1.5',
                fontWeight: '400'
              }}>
                {selectedEvent.description}
              </p>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
};

export default EventMap;
