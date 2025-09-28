#!/usr/bin/env node

/**
 * Setup script for Gemini API integration
 * This script helps configure the Gemini API key for the PulseNYC application
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🗽 PulseNYC - Gemini API Setup');
console.log('================================\n');

console.log('To use real AI-powered event scraping, you need a Gemini API key.');
console.log('Get your free API key at: https://makersuite.google.com/app/apikey\n');

rl.question('Enter your Gemini API key (or press Enter to skip): ', (apiKey) => {
  if (apiKey.trim()) {
    const envPath = path.join(__dirname, 'backend', '.env');
    const envContent = `PORT=8000
GEMINI_API_KEY=${apiKey.trim()}
MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoiZGV2a3VtYXIxMjMiLCJhIjoiY21nMXZpdTE1MHQwejJub2ZudWd3ZGZ0ZSJ9.Ed8Xd2_5aBZzthiEhdXZgA
`;

    try {
      fs.writeFileSync(envPath, envContent);
      console.log('\n✅ Gemini API key configured successfully!');
      console.log('🚀 You can now run the backend with AI-powered event scraping.');
      console.log('\nTo start the backend:');
      console.log('  cd backend && npm start');
      console.log('\nTo start the frontend:');
      console.log('  cd frontend && npm run dev');
    } catch (error) {
      console.error('❌ Error writing .env file:', error.message);
    }
  } else {
    console.log('\n⚠️  Skipping Gemini API setup.');
    console.log('The app will use fallback data without AI processing.');
    console.log('\nTo set up later, edit backend/.env and add:');
    console.log('  GEMINI_API_KEY=your_api_key_here');
  }
  
  rl.close();
});

rl.on('close', () => {
  console.log('\n🎯 Next steps:');
  console.log('1. Start the backend: cd backend && npm start');
  console.log('2. Start the frontend: cd frontend && npm run dev');
  console.log('3. Open http://localhost:5173 to see the app');
  console.log('\n📚 The app will:');
  console.log('- Scrape events from multiple NYC sources');
  console.log('- Use Gemini AI to process and categorize events');
  console.log('- Display events on an interactive 3D map');
  console.log('- Provide real-time event discovery');
});
