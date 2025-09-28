import { TrailCard, EventCard } from "@/components/ui/trail-card";
import { Event } from "@/types/Event";

export function TrailCardDemo() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <TrailCard
        title="Embercrest Ridge"
        location="Silverpine Mountains"
        difficulty="Hard"
        creators="1886 by Helen Rowe & Elias Mendez"
        distance="12.4km"
        elevation="870m"
        duration="4h 45m"
        imageUrl="https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=2070&auto=format&fit=crop"
        mapImageUrl="https://www.thiings.co/_next/image?url=https%3A%2F%2Flftz25oez4aqbxpq.public.blob.vercel-storage.com%2Fimage-3JYNLpogg5zknunPABpdOpEjJmZN5R.png&w=320&q=75"
        onDirectionsClick={() => alert("Directions clicked!")}
      />
    </div>
  );
}

export function EventCardDemo() {
  const sampleEvent: Event = {
    id: 'demo',
    name: 'Jazz Night at Blue Note',
    description: 'An evening of smooth jazz featuring local artists',
    address: '131 W 3rd St, New York, NY 10012',
    startTime: '8:00 PM',
    price: '$25',
    category: 'Music',
    latitude: 40.7306,
    longitude: -74.0023
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <EventCard
        event={sampleEvent}
        onDirectionsClick={() => alert("Directions clicked!")}
        onLearnMoreClick={() => alert("Learn more clicked!")}
      />
    </div>
  );
}
