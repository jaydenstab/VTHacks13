import React, { useRef, useEffect, useState } from 'react';
import { Event } from '../types/Event';

interface GoogleEventMapProps {
  events: Event[];
  selectedEvent: Event | null;
  onEventSelect: (event: Event | null) => void;
  apiKey: string;
}

// Declare Google Maps types
declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

const GoogleEventMap: React.FC<GoogleEventMapProps> = ({ 
  events, 
  selectedEvent, 
  onEventSelect, 
  apiKey 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const infoWindowRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

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

  const createCustomMarker = (event: Event) => {
    const color = getCategoryColor(event.category);
    const emoji = getCategoryEmoji(event.category);
    
    return {
      path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
      fillColor: color,
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 3,
      scale: 1.5,
      anchor: new window.google.maps.Point(12, 24),
      label: {
        text: emoji,
        color: '#ffffff',
        fontSize: '16px',
        fontWeight: 'bold'
      }
    };
  };

  const createInfoWindowContent = (event: Event): string => {
    const color = getCategoryColor(event.category);
    const emoji = getCategoryEmoji(event.category);
    
    return `
      <div style="
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Helvetica, Arial, sans-serif;
        color: #1d1d1f;
        min-width: 280px;
        max-width: 320px;
      ">
        <div style="
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        ">
          <div style="
            width: 40px;
            height: 40px;
            background: ${color};
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            color: white;
          ">
            ${emoji}
          </div>
          <div>
            <h3 style="
              margin: 0 0 4px 0;
              font-size: 18px;
              font-weight: 600;
              color: #1d1d1f;
              letter-spacing: -0.3px;
            ">
              ${event.name}
            </h3>
            <div style="
              display: flex;
              gap: 8px;
              flex-wrap: wrap;
            ">
              <span style="
                background: ${color};
                color: white;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 600;
              ">
                ${event.category}
              </span>
              <span style="
                background: ${event.price === 'Free' ? '#34C759' : '#FF3B30'};
                color: white;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 600;
              ">
                ${event.price}
              </span>
            </div>
          </div>
        </div>
        
        ${event.startTime ? `
          <div style="
            margin: 0 0 8px 0;
            font-size: 14px;
            color: #86868b;
            display: flex;
            align-items: center;
            gap: 8px;
          ">
            <span>🕐</span>
            <span>${event.startTime}</span>
          </div>
        ` : ''}
        
        ${event.address ? `
          <div style="
            margin: 0 0 12px 0;
            font-size: 14px;
            color: #86868b;
            display: flex;
            align-items: flex-start;
            gap: 8px;
          ">
            <span>📍</span>
            <span style="line-height: 1.4;">${event.address}</span>
          </div>
        ` : ''}
        
        <p style="
          margin: 0 0 16px 0;
          font-size: 14px;
          color: #1d1d1f;
          line-height: 1.5;
        ">
          ${event.description}
        </p>
        
        <div style="
          display: flex;
          gap: 8px;
        ">
          <button onclick="window.open('https://maps.google.com/?q=${encodeURIComponent(event.address || '')}', '_blank')" style="
            background: #007AFF;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
          ">
            Directions
          </button>
          <button onclick="window.open('https://www.google.com/search?q=${encodeURIComponent(event.name)}', '_blank')" style="
            background: rgba(0, 0, 0, 0.05);
            color: #1d1d1f;
            border: none;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
          ">
            Learn More
          </button>
        </div>
      </div>
    `;
  };

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    const mapOptions = {
      center: { lat: 40.7282, lng: -73.9857 }, // East Village, NYC
      zoom: 13,
      styles: [
        {
          featureType: 'all',
          elementType: 'geometry.fill',
          stylers: [{ color: '#f5f5f5' }]
        },
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{ color: '#c9c9c9' }]
        },
        {
          featureType: 'poi',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#757575' }]
        },
        {
          featureType: 'poi.park',
          elementType: 'geometry',
          stylers: [{ color: '#c5e1a5' }]
        },
        {
          featureType: 'road',
          elementType: 'geometry',
          stylers: [{ color: '#ffffff' }]
        },
        {
          featureType: 'road.arterial',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#757575' }]
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry',
          stylers: [{ color: '#dadada' }]
        },
        {
          featureType: 'road.highway',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#616161' }]
        },
        {
          featureType: 'road.local',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#9e9e9e' }]
        },
        {
          featureType: 'transit.line',
          elementType: 'geometry',
          stylers: [{ color: '#e5e5e5' }]
        },
        {
          featureType: 'transit.station',
          elementType: 'geometry',
          stylers: [{ color: '#eeeeee' }]
        },
        {
          featureType: 'landscape',
          elementType: 'geometry',
          stylers: [{ color: '#f5f5f5' }]
        }
      ],
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
      zoomControl: true,
      mapTypeControlOptions: {
        style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: window.google.maps.ControlPosition.TOP_CENTER
      }
    };

    mapInstance.current = new window.google.maps.Map(mapRef.current, mapOptions);
    infoWindowRef.current = new window.google.maps.InfoWindow();
    
    setMapLoaded(true);
  };

  const addEventMarkers = () => {
    if (!mapInstance.current || !window.google) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    events.forEach(event => {
      const marker = new window.google.maps.Marker({
        position: { lat: event.latitude, lng: event.longitude },
        map: mapInstance.current,
        icon: createCustomMarker(event),
        title: event.name,
        animation: window.google.maps.Animation.DROP
      });

      marker.addListener('click', () => {
        onEventSelect(event);
        
        // Close any existing info window
        infoWindowRef.current.close();
        
        // Open new info window
        infoWindowRef.current.setContent(createInfoWindowContent(event));
        infoWindowRef.current.open(mapInstance.current, marker);
      });

      marker.addListener('mouseover', () => {
        marker.setAnimation(window.google.maps.Animation.BOUNCE);
        setTimeout(() => {
          marker.setAnimation(null);
        }, 750);
      });

      markersRef.current.push(marker);
    });
  };

  const loadGoogleMapsScript = () => {
    if (window.google) {
      initializeMap();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`;
    script.async = true;
    script.defer = true;
    
    window.initMap = initializeMap;
    document.head.appendChild(script);
  };

  useEffect(() => {
    loadGoogleMapsScript();
  }, [apiKey]);

  useEffect(() => {
    if (mapLoaded) {
      addEventMarkers();
    }
  }, [mapLoaded, events]);

  useEffect(() => {
    if (selectedEvent && mapInstance.current) {
      const eventPosition = { 
        lat: selectedEvent.latitude, 
        lng: selectedEvent.longitude 
      };
      
      mapInstance.current.setCenter(eventPosition);
      mapInstance.current.setZoom(16);
      
      // Find and highlight the selected event marker
      const selectedMarker = markersRef.current.find(marker => 
        marker.getPosition().lat() === selectedEvent.latitude &&
        marker.getPosition().lng() === selectedEvent.longitude
      );
      
      if (selectedMarker) {
        infoWindowRef.current.setContent(createInfoWindowContent(selectedEvent));
        infoWindowRef.current.open(mapInstance.current, selectedMarker);
      }
    }
  }, [selectedEvent]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div 
        ref={mapRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          borderRadius: '12px',
          overflow: 'hidden'
        }} 
      />
      
      {!mapLoaded && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: '#86868b',
          zIndex: 1000
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #e5e5e7',
            borderTop: '3px solid #007AFF',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px auto'
          }} />
          <p style={{ margin: '0', fontSize: '16px' }}>Loading Google Maps...</p>
        </div>
      )}
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default GoogleEventMap;
