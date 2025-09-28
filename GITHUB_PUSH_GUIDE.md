# 🚀 GitHub Push Guide

## After Installing Git, Run These Commands:

### 1. Initialize Git Repository
```bash
git init
```

### 2. Add All Files
```bash
git add .
```

### 3. Create Initial Commit
```bash
git commit -m "Initial commit: NYC 3D Map with React components"
```

### 4. Add Remote Repository
```bash
git remote add origin https://github.com/jaydenstab/VTHacks13.git
```

### 5. Push to GitHub
```bash
git push -u origin main
```

## 📁 Project Structure
```
VT HACKS/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── NYC3DMap.tsx
│   │   │   ├── EventCard.tsx
│   │   │   └── EventsPanel.tsx
│   │   ├── data/
│   │   │   └── events.ts     # Event data
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
├── backend/                  # Node.js backend
│   ├── server.js
│   ├── scraper.js
│   └── package.json
├── 3d-nyc-mapbox-trail-cards.html  # Standalone HTML version
├── react-nyc-3d-map.html    # React standalone version
└── README.md
```

## 🎯 Features Included
- ✅ 3D Mapbox GL map with NYC focus
- ✅ Interactive event markers
- ✅ Trail-style event cards
- ✅ React components with TypeScript
- ✅ Modern UI with animations
- ✅ Responsive design
- ✅ Map controls and filters
- ✅ Google Maps integration
- ✅ AI-generated event images

## 🔧 Technologies Used
- **Frontend**: React, TypeScript, Tailwind CSS, Framer Motion
- **Maps**: Mapbox GL JS, Google Maps API
- **Backend**: Node.js, Express
- **AI**: Google Gemini API
- **Styling**: CSS3, Glassmorphism effects
