// Google Places API integration for event images
export class GooglePlacesService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Get Street View image for a location
  getStreetViewImage(lat: number, lng: number, size: string = "400x300"): string {
    return `https://maps.googleapis.com/maps/api/streetview?size=${size}&location=${lat},${lng}&fov=90&heading=0&pitch=0&key=${this.apiKey}`;
  }

  // Get Place Photo (requires Place ID)
  getPlacePhoto(photoReference: string, maxWidth: number = 400): string {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${this.apiKey}`;
  }

  // Search for places near coordinates
  async searchNearbyPlaces(lat: number, lng: number, radius: number = 1000, type?: string): Promise<any> {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type || 'establishment'}&key=${this.apiKey}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching nearby places:', error);
      return null;
    }
  }

  // Get place details
  async getPlaceDetails(placeId: string): Promise<any> {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,photos,rating,formatted_address,geometry&key=${this.apiKey}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching place details:', error);
      return null;
    }
  }
}

// Fallback image service using Unsplash
export class FallbackImageService {
  private categoryImages: { [key: string]: string } = {
    'Music': "1551632811-561732d1e306?q=80&w=400&auto=format&fit=crop",
    'Art': "1541961014-2dca997ad595?q=80&w=400&auto=format&fit=crop",
    'Food & Drink': "1555939594-58d7cb561ad1?q=80&w=400&auto=format&fit=crop",
    'Comedy': "1515187029135-18ee286d815b?q=80&w=400&auto=format&fit=crop",
    'Free': "1441974231531-c6227db76b6e?q=80&w=400&auto=format&fit=crop",
    'Other': "1506905925346-21bda4d32df4?q=80&w=400&auto=format&fit=crop"
  };

  getEventImage(category: string): string {
    return `https://images.unsplash.com/photo/${this.categoryImages[category] || this.categoryImages['Other']}`;
  }

  getLocationImage(lat: number, lng: number): string {
    // Use a location-based image service
    return `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`;
  }
}

// Main image service that tries Google first, then falls back
export class EventImageService {
  private googlePlaces: GooglePlacesService | null;
  private fallback: FallbackImageService;

  constructor(googleApiKey?: string) {
    this.googlePlaces = googleApiKey ? new GooglePlacesService(googleApiKey) : null;
    this.fallback = new FallbackImageService();
  }

  async getEventImage(category: string, lat?: number, lng?: number): Promise<string> {
    // If we have Google API key and coordinates, try Google first
    if (this.googlePlaces && lat && lng) {
      try {
        return this.googlePlaces.getStreetViewImage(lat, lng);
      } catch (error) {
        console.warn('Google Places API failed, using fallback:', error);
      }
    }

    // Fallback to Unsplash
    return this.fallback.getEventImage(category);
  }

  getMapImage(lat: number, lng: number): string {
    return `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s-marker+ff0000(${lng},${lat})/${lng},${lat},14,0/200x100@2x?access_token=pk.eyJ1IjoiZGV2a3VtYXIxMjMiLCJhIjoiY21nMXZpdTE1MHQwejJub2ZudWd3ZGZ0ZSJ9.Ed8Xd2_5aBZzthiEhdXZgA`;
  }
}
