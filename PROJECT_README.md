# 🗽 NYC 3D Event Map - PulseNYC

A modern, interactive 3D map application showcasing events across New York City and Long Island with a 40-mile radius coverage.

## ✨ Features

### 🗺️ **3D Interactive Map**
- **Mapbox GL JS** with 3D perspective
- **NYC & Long Island** coverage (40-mile radius)
- **Interactive markers** with category colors
- **Light presets**: Dawn, Day, Dusk, Night
- **Label controls**: Places, POI, Roads, Transit

### 🎯 **Event Management**
- **Trail-style cards** with modern design
- **AI-generated images** for each event
- **Category filtering** (Music, Art, Food, Comedy, Free, Other)
- **Real-time data** from The Skint
- **Google Maps integration** for directions

### 🎨 **Modern UI/UX**
- **Apple-inspired design** with glassmorphism
- **Smooth animations** with Framer Motion
- **Responsive layout** for all devices
- **Minimalistic interface** with clean typography
- **Hover effects** and micro-interactions

## 🚀 Quick Start

### **Option 1: Standalone HTML (No Installation)**
```bash
# Open in browser
start 3d-nyc-mapbox-trail-cards.html
```

### **Option 2: React Application**
```bash
cd frontend
npm install
npm run dev
```

### **Option 3: Full Stack**
```bash
# Backend
cd backend
npm install
npm start

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

## 📁 Project Structure

```
VT HACKS/
├── 📱 Frontend (React + TypeScript)
│   ├── src/components/
│   │   ├── NYC3DMap.tsx      # 3D Mapbox component
│   │   ├── EventCard.tsx     # Trail-style event cards
│   │   └── EventsPanel.tsx   # Events sidebar
│   ├── src/data/
│   │   └── events.ts         # Event data
│   └── App.tsx               # Main app component
│
├── 🔧 Backend (Node.js + Express)
│   ├── server.js             # Express server
│   ├── scraper.js            # Web scraping
│   ├── aiProcessor.js        # AI data processing
│   └── geocoder.js           # Address geocoding
│
├── 🌐 Standalone Demos
│   ├── 3d-nyc-mapbox-trail-cards.html  # Main demo
│   ├── react-nyc-3d-map.html          # React version
│   └── trail-cards-demo.html          # Cards demo
│
└── 📚 Documentation
    ├── README.md
    ├── GITHUB_PUSH_GUIDE.md
    └── PROJECT_README.md
```

## 🛠️ Technologies

### **Frontend**
- **React 18** with TypeScript
- **Mapbox GL JS** for 3D mapping
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Google Maps API** for directions

### **Backend**
- **Node.js** with Express
- **Google Gemini AI** for data processing
- **Web scraping** with Cheerio
- **Geocoding** with OpenStreetMap

### **Design**
- **Apple UI** aesthetic
- **Glassmorphism** effects
- **Modern typography** (SF Pro Display)
- **Responsive design**
- **Smooth animations**

## 🎯 Key Components

### **NYC3DMap.tsx**
- 3D Mapbox GL integration
- Interactive markers with popups
- Map controls and settings
- Event selection handling

### **EventCard.tsx**
- Trail-style card design
- AI-generated images
- Hover animations
- Category badges

### **EventsPanel.tsx**
- Scrollable events list
- Search and filtering
- Directions integration
- Learn more functionality

## 🔧 Configuration

### **Environment Variables**
```env
# Frontend (.env.local)
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key

# Backend (.env)
GEMINI_API_KEY=your_gemini_api_key
MAPBOX_ACCESS_TOKEN=your_mapbox_token
```

### **Mapbox Token**
Current token: `pk.eyJ1IjoiZGV2a3VtYXIxMjMiLCJhIjoiY21nMXZpdTE1MHQwejJub2ZudWd3ZGZ0ZSJ9.Ed8Xd2_5aBZzthiEhdXZgA`

## 🎨 Design Features

### **Typography**
- **SF Pro Display** font family
- **Proper capitalization** (Music, Art, etc.)
- **Modern letter spacing** (-0.2px to -0.4px)
- **Text shadows** for depth

### **Animations**
- **Hover effects** with scale and lift
- **Smooth transitions** (0.3s cubic-bezier)
- **Glow effects** on interactive elements
- **Micro-interactions** throughout

### **Color Scheme**
- **Primary**: Apple Blue (#007AFF)
- **Categories**: Vibrant colors per type
- **Background**: Gradient with glassmorphism
- **Text**: High contrast for readability

## 📱 Responsive Design

- **Desktop**: Full 3D map with sidebar
- **Tablet**: Optimized layout
- **Mobile**: Stacked view with touch controls

## 🚀 Deployment

### **GitHub Pages**
1. Push to GitHub
2. Enable Pages in repository settings
3. Select main branch
4. Access via GitHub Pages URL

### **Vercel/Netlify**
1. Connect GitHub repository
2. Deploy automatically
3. Configure environment variables

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Submit pull request

## 📄 License

MIT License - feel free to use for your projects!

---

**Built with ❤️ for VT Hacks 13**
