// Debug script to test the API connection
const API_BASE_URL = 'http://localhost:8000';

async function testAPI() {
    console.log('Testing API connection...');
    
    try {
        // Test health endpoint
        const healthResponse = await fetch(`${API_BASE_URL}/api/health`);
        const healthData = await healthResponse.json();
        console.log('✅ Health check:', healthData);
        
        // Test events endpoint
        const eventsResponse = await fetch(`${API_BASE_URL}/api/events/dummy`);
        const eventsData = await eventsResponse.json();
        console.log(`✅ Events API: Found ${eventsData.length} events`);
        
        // Show first few events
        eventsData.slice(0, 3).forEach((event, index) => {
            console.log(`Event ${index + 1}:`, {
                name: event.name,
                address: event.address,
                coordinates: `${event.latitude}, ${event.longitude}`,
                price: event.price,
                category: event.category
            });
        });
        
        return eventsData;
    } catch (error) {
        console.error('❌ API Error:', error);
        return null;
    }
}

// Run the test
testAPI().then(events => {
    if (events) {
        console.log('🎯 API Test Complete - All systems working!');
        console.log(`📊 Total events: ${events.length}`);
    } else {
        console.log('💥 API Test Failed');
    }
});
