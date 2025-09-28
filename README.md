<<<<<<< HEAD
# 🗽 PulseNYC - AI-Powered Event Discovery

A sophisticated hyperlocal event aggregator for New York City that combines web scraping, AI processing, and interactive mapping to help users discover the best events happening around them.

![PulseNYC Demo](https://img.shields.io/badge/Status-Demo%20Ready-brightgreen)
![React](https://img.shields.io/badge/React-18.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-18.0-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Google Maps](https://img.shields.io/badge/Google%20Maps-API-orange)

## ✨ Features

### 🎯 **Core Functionality**
- **Web Scraping**: Automatically scrapes events from The Skint and other NYC sources
- **AI Processing**: Uses Google Gemini API to extract and categorize event data
- **Interactive Mapping**: Multiple map providers (Mapbox, Google Maps, Advanced Google Maps)
- **Real-time Filtering**: Filter events by category, location, and time
- **Smart Search**: AI-powered search and recommendations

### 🗺️ **Mapping Options**
- **Mapbox**: Open-source, customizable mapping
- **Google Maps**: Standard Google Maps integration
- **Advanced Google Maps**: Full-featured with Places API, directions, and Street View

### 🤖 **AI Features**
- **Event Categorization**: Automatic categorization using AI
- **Smart Recommendations**: Personalized event suggestions
- **Trend Analysis**: Identify popular event types and locations
- **Sentiment Analysis**: Analyze event descriptions and reviews

### 📱 **User Experience**
- **Apple-Style UI**: Clean, modern interface inspired by iOS design
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Real-time Updates**: Live event data and notifications
- **Social Integration**: Share events and add to calendar

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Google Gemini API key
- Mapbox access token (optional)
- Google Maps API key (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/pulsenyc.git
   cd pulsenyc
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Set up environment variables**
   
   **Backend** (`backend/.env`):
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
   PORT=8000
   ```

   **Frontend** (`frontend/.env.local`):
   ```env
   VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   ```

4. **Run the application**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm start
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

5. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

## 🏗️ Project Structure

```
pulsenyc/
├── backend/                 # Node.js/Express backend
│   ├── ai/                 # AI processing modules
│   │   ├── advancedProcessor.js
│   │   └── recommendationEngine.js
│   ├── analytics/          # Real-time analytics
│   ├── ml/                 # Machine learning models
│   ├── notifications/      # Notification system
│   ├── scraper.js          # Web scraping logic
│   ├── aiProcessor.js      # AI data processing
│   ├── geocoder.js         # Address geocoding
│   └── server.js           # Express server
├── frontend/               # React/TypeScript frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── EventMap.tsx
│   │   │   ├── GoogleEventMap.tsx
│   │   │   ├── AdvancedGoogleMap.tsx
│   │   │   ├── CategoryFilter.tsx
│   │   │   ├── AIInsights.tsx
│   │   │   └── RealTimeDashboard.tsx
│   │   ├── types/          # TypeScript definitions
│   │   ├── App.tsx         # Main application
│   │   └── main.tsx        # Entry point
│   └── public/             # Static assets
├── demos/                  # Standalone HTML demos
│   ├── simple-google-maps.html
│   ├── leaflet-interactive-map.html
│   ├── advanced-google-maps-demo.html
│   └── interactive-map.html
└── README.md
```

## 🎨 Demo Files

Try out different map implementations:

- **Simple Google Maps**: `simple-google-maps.html`
- **Leaflet Interactive**: `leaflet-interactive-map.html` 
- **Advanced Google Maps**: `advanced-google-maps-demo.html`
- **Interactive Map**: `interactive-map.html`

## 🔧 API Endpoints

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get specific event
- `POST /api/events` - Create new event

### AI Features
- `POST /api/ai/analyze` - Analyze event data
- `GET /api/ai/recommendations` - Get AI recommendations
- `POST /api/ai/categorize` - Categorize events

### Analytics
- `GET /api/analytics/metrics` - Get real-time metrics
- `GET /api/analytics/trends` - Get trend data

## 🗺️ Map Providers

### Mapbox (Free)
- Open source mapping
- Custom styling
- No API key required for basic usage
- Great for development and testing

### Google Maps (Paid)
- Industry standard mapping
- Rich features (Street View, satellite)
- Requires API key
- Usage-based pricing

### Advanced Google Maps (Paid)
- Full Google Maps API features
- Places API integration
- Directions and navigation
- Calendar integration
- Social sharing

## 🤖 AI Integration

### Google Gemini API
- Event data extraction
- Content categorization
- Sentiment analysis
- Smart recommendations

### Machine Learning
- Collaborative filtering
- Content-based filtering
- Hybrid recommendation systems
- User behavior analysis

## 📊 Analytics & Monitoring

- Real-time event metrics
- User engagement tracking
- Performance monitoring
- A/B testing capabilities

## 🔔 Notifications

- Proximity-based alerts
- Price drop notifications
- Weather-based warnings
- Personalized timing

## 🛠️ Development

### Available Scripts

**Backend:**
```bash
npm start          # Start development server
npm run dev        # Start with nodemon
npm test           # Run tests
npm run build      # Build for production
```

**Frontend:**
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

### Tech Stack

**Backend:**
- Node.js & Express
- Google Gemini AI
- Cheerio (web scraping)
- Axios (HTTP client)
- WebSocket (real-time)

**Frontend:**
- React 18 & TypeScript
- Vite (build tool)
- Mapbox GL JS
- Google Maps API
- Leaflet.js

**Styling:**
- CSS Modules
- Apple-inspired design
- Glassmorphism effects
- Responsive design

## 🚀 Deployment

### Backend (Railway/Heroku)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
railway login
railway init
railway up
```

### Frontend (Vercel/Netlify)
```bash
# Build
npm run build

# Deploy to Vercel
npx vercel

# Or deploy to Netlify
npx netlify deploy --prod --dir=dist
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **The Skint** - NYC event source
- **Google Maps** - Mapping services
- **Mapbox** - Open source mapping
- **Google Gemini** - AI processing
- **React** - Frontend framework
- **Node.js** - Backend runtime

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/pulsenyc/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/pulsenyc/discussions)
- **Email**: your.email@example.com

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] More event sources
- [ ] User accounts and preferences
- [ ] Event booking integration
- [ ] Social features
- [ ] Offline support
- [ ] Push notifications
- [ ] Multi-city support

---

**Built with ❤️ for NYC event lovers**

*Discover the pulse of New York City, one event at a time.*
=======
# VTHacks13
>>>>>>> f0e43e71d5d66f78f83fc623085f4b97651caa6e
