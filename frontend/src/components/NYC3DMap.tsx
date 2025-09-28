import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

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

interface NYC3DMapProps {
  events: Event[];
  onEventSelect?: (event: Event) => void;
}

const NYC3DMap: React.FC<NYC3DMapProps> = ({ events, onEventSelect }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [lightPreset, setLightPreset] = useState('day');
  const [showPlaceLabels, setShowPlaceLabels] = useState(true);
  const [showPOILabels, setShowPOILabels] = useState(true);
  const [showRoadLabels, setShowRoadLabels] = useState(true);
  const [showTransitLabels, setShowTransitLabels] = useState(true);

  // Use the same Mapbox token from the original HTML file
  const mapboxToken = 'pk.eyJ1IjoiZGV2a3VtYXIxMjMiLCJhIjoiY21nMXZpdTE1MHQwejJub2ZudWd3ZGZ0ZSJ9.Ed8Xd2_5aBZzthiEhdXZgA';

  const getCategoryColor = (category: string): string => {
    const colors: { [key: string]: string } = {
      'music': '#FF6B6B',
      'art': '#4ECDC4',
      'food': '#45B7D1',
      'food & drink': '#45B7D1',
      'comedy': '#96CEB4',
      'free': '#FFEAA7',
      'free food': '#FFA500',
      'influencers': '#E91E63',
      'heritage': '#8B4513',
      'sports': '#FF5722',
      'education': '#2196F3',
      'health & wellness': '#4CAF50',
      'health': '#4CAF50',
      'technology': '#9C27B0',
      'business': '#607D8B',
      'theater': '#FF9800',
      'broadway': '#FF9800',
      'entertainment': '#E91E63',
      'performance': '#FF9800',
      'community': '#4CAF50',
      'cultural': '#8B4513',
      'networking': '#607D8B',
      'workshop': '#2196F3',
      'tour': '#795548',
      'outdoor': '#4CAF50',
      'family': '#FFC107',
      'nightlife': '#673AB7',
      'shopping': '#FF5722',
      'fashion': '#E91E63',
      'photography': '#607D8B',
      'gaming': '#9C27B0',
      'other': '#DDA0DD'
    };
    return colors[category.toLowerCase()] || '#DDA0DD';
  };

  const getCategoryEmoji = (category: string): string => {
    const emojis: { [key: string]: string } = {
      'music': '🎵',
      'art': '🎨',
      'food': '🍽️',
      'food & drink': '🍽️',
      'comedy': '😂',
      'free': '🆓',
      'free food': '🍎',
      'influencers': '📱',
      'heritage': '🏛️',
      'sports': '⚽',
      'education': '📚',
      'health & wellness': '🧘',
      'health': '🧘',
      'technology': '💻',
      'business': '💼',
      'theater': '🎭',
      'broadway': '🎭',
      'entertainment': '🎪',
      'performance': '🎭',
      'community': '🤝',
      'cultural': '🏛️',
      'networking': '🤝',
      'workshop': '🔧',
      'tour': '🚶',
      'outdoor': '🌳',
      'family': '👨‍👩‍👧‍👦',
      'nightlife': '🌃',
      'shopping': '🛍️',
      'fashion': '👗',
      'photography': '📸',
      'gaming': '🎮',
      'other': '📍'
    };
    return emojis[category.toLowerCase()] || '📍';
  };

  const createMarker = (event: Event): mapboxgl.Marker => {
    const color = getCategoryColor(event.category);
    const emoji = getCategoryEmoji(event.category);
    
    const el = document.createElement('div');
    el.className = 'marker';
    el.style.cssText = `
      background-color: ${color};
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
    el.textContent = emoji;
    
    const marker = new mapboxgl.Marker(el)
      .setLngLat([event.lng, event.lat])
      .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(createPopupContent(event)));
    
    el.addEventListener('click', () => {
      if (onEventSelect) {
        onEventSelect(event);
      }
    });
    
    return marker;
  };

  const createPopupContent = (event: Event): string => {
    const color = getCategoryColor(event.category);
    const emoji = getCategoryEmoji(event.category);
    const capitalizedCategory = event.category.charAt(0).toUpperCase() + event.category.slice(1).toLowerCase();
    
    return `
      <div style="
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
        color: #1d1d1f;
        min-width: 250px;
        max-width: 300px;
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
              font-size: 16px;
              font-weight: 700;
              color: #1d1d1f;
            ">
              ${event.name}
            </h3>
            <div style="
              background: ${color};
              color: white;
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 10px;
              font-weight: 600;
              display: inline-block;
            ">
              ${capitalizedCategory}
            </div>
          </div>
        </div>
        
        <div style="
          margin: 0 0 8px 0;
          font-size: 13px;
          color: #86868b;
        ">
          🕐 ${event.time} • 💰 ${event.price}
        </div>
        
        <div style="
          margin: 0 0 8px 0;
          font-size: 13px;
          color: #86868b;
        ">
          📍 ${event.address}
        </div>
        
        <p style="
          margin: 0;
          font-size: 13px;
          color: #1d1d1f;
          line-height: 1.4;
        ">
          ${event.description}
        </p>
      </div>
    `;
  };

  useEffect(() => {
    if (map.current) return;

    try {
      console.log('Initializing Mapbox map...');
      
      // Set the Mapbox access token
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/standard',
        center: [-73.935242, 40.730610],
        zoom: 10,
        pitch: 45,
        bearing: -17.6
      });

      map.current.on('load', () => {
        console.log('Map loaded successfully');
        // Add markers for events
        events.forEach(event => {
          const marker = createMarker(event);
          marker.addTo(map.current!);
          markers.current.push(marker);
        });
      });

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
      });

    } catch (error) {
      console.error('Error initializing map:', error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (map.current) {
      map.current.setConfigProperty('basemap', 'lightPreset', lightPreset);
    }
  }, [lightPreset]);

  useEffect(() => {
    if (map.current) {
      map.current.setConfigProperty('basemap', 'showPlaceLabels', showPlaceLabels);
    }
  }, [showPlaceLabels]);

  useEffect(() => {
    if (map.current) {
      map.current.setConfigProperty('basemap', 'showPointOfInterestLabels', showPOILabels);
    }
  }, [showPOILabels]);

  useEffect(() => {
    if (map.current) {
      map.current.setConfigProperty('basemap', 'showRoadLabels', showRoadLabels);
    }
  }, [showRoadLabels]);

  useEffect(() => {
    if (map.current) {
      map.current.setConfigProperty('basemap', 'showTransitLabels', showTransitLabels);
    }
  }, [showTransitLabels]);

  return (
    <div className="relative w-full h-screen">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Map Controls Overlay */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-4 shadow-lg border border-black/10">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Light Preset
              </label>
              <select
                value={lightPreset}
                onChange={(e) => setLightPreset(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="dawn">Dawn</option>
                <option value="day">Day</option>
                <option value="dusk">Dusk</option>
                <option value="night">Night</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-bold text-gray-900">
                <input
                  type="checkbox"
                  checked={showPlaceLabels}
                  onChange={(e) => setShowPlaceLabels(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span>Show place labels</span>
              </label>
              
              <label className="flex items-center space-x-2 text-sm font-bold text-gray-900">
                <input
                  type="checkbox"
                  checked={showPOILabels}
                  onChange={(e) => setShowPOILabels(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span>Show POI labels</span>
              </label>
              
              <label className="flex items-center space-x-2 text-sm font-bold text-gray-900">
                <input
                  type="checkbox"
                  checked={showRoadLabels}
                  onChange={(e) => setShowRoadLabels(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span>Show road labels</span>
              </label>
              
              <label className="flex items-center space-x-2 text-sm font-bold text-gray-900">
                <input
                  type="checkbox"
                  checked={showTransitLabels}
                  onChange={(e) => setShowTransitLabels(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span>Show transit labels</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NYC3DMap;
