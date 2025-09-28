// components/ui/trail-card.tsx
import * as React from "react";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Clock, DollarSign, Users } from "lucide-react";

import { cn } from "@/lib/utils"; // Your utility for merging class names
import { Button } from "@/components/ui/button"; // Assuming you have a Button component
import { Event } from "@/types/Event";
import { EventImageService } from "@/services/googlePlaces";

// Define the props interface for type safety and reusability
interface TrailCardProps extends React.HTMLAttributes<HTMLDivElement> {
  imageUrl: string;
  mapImageUrl: string;
  title: string;
  location: string;
  difficulty: string;
  creators: string;
  distance: string;
  elevation: string;
  duration: string;
  onDirectionsClick?: () => void;
}

// Event-specific props for PulseNYC
interface EventCardProps extends React.HTMLAttributes<HTMLDivElement> {
  event: Event;
  onDirectionsClick?: () => void;
  onLearnMoreClick?: () => void;
}

// Define stat item component for DRY principle
const StatItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col">
    <span className="text-sm font-semibold text-foreground">{value}</span>
    <span className="text-xs text-muted-foreground">{label}</span>
  </div>
);

const TrailCard = React.forwardRef<HTMLDivElement, TrailCardProps>(
  (
    {
      className,
      imageUrl,
      mapImageUrl,
      title,
      location,
      difficulty,
      creators,
      distance,
      elevation,
      duration,
      onDirectionsClick,
      ...props
    },
    ref
  ) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "w-full max-w-sm overflow-hidden rounded-2xl bg-card text-card-foreground shadow-lg",
          className
        )}
        whileHover={{ y: -5, scale: 1.02 }} // Subtle lift and scale animation on hover
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        {...props}
      >
        {/* Top section with background image and content */}
        <div className="relative h-60 w-full">
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 flex w-full items-end justify-between p-4">
            <div className="text-white">
              <h3 className="text-xl font-bold">{title}</h3>
              <p className="text-sm text-white/90">{location}</p>
            </div>
            {/* The button will animate in on hover of the parent card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileHover={{ opacity: 1, x: 0 }}
              animate={{ opacity: 0, x: 20 }} // Kept hidden by default
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Button
                variant="secondary"
                onClick={onDirectionsClick}
                aria-label={`Get directions to ${title}`}
              >
                Directions
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Bottom section with trail details */}
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-foreground">{difficulty}</p>
              <p className="text-xs text-muted-foreground">{creators}</p>
            </div>
            {/* Simple SVG or image representation of the trail map */}
            <img
              src={mapImageUrl}
              alt="Trail map"
              className="h-10 w-20 object-contain"
            />
          </div>
          <div className="my-4 h-px w-full bg-border" />
          <div className="flex justify-between">
            <StatItem label="Distance" value={distance} />
            <StatItem label="Elevation" value={elevation} />
            <StatItem label="Duration" value={duration} />
          </div>
        </div>
      </motion.div>
    );
  }
);

TrailCard.displayName = "TrailCard";

// EventCard component for PulseNYC events
const EventCard = React.forwardRef<HTMLDivElement, EventCardProps>(
  (
    {
      className,
      event,
      onDirectionsClick,
      onLearnMoreClick,
      ...props
    },
    ref
  ) => {
    // Initialize image service
    const imageService = new EventImageService(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
    const [eventImage, setEventImage] = React.useState<string>('');
    const [mapImage, setMapImage] = React.useState<string>('');

    // Load images when component mounts
    React.useEffect(() => {
      const loadImages = async () => {
        const img = await imageService.getEventImage(event.category, event.latitude, event.longitude);
        const map = imageService.getMapImage(event.latitude, event.longitude);
        setEventImage(img);
        setMapImage(map);
      };
      loadImages();
    }, [event]);

    const getCategoryEmoji = (category: string) => {
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

    const getDifficultyFromPrice = (price: string) => {
      if (price === 'Free') return 'Easy';
      if (price.includes('$') && parseInt(price.replace('$', '')) > 50) return 'Hard';
      return 'Medium';
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          "w-full max-w-sm overflow-hidden rounded-2xl bg-card text-card-foreground shadow-lg border",
          className
        )}
        whileHover={{ y: -5, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        {...props}
      >
        {/* Top section with background image and content */}
        <div className="relative h-60 w-full">
          <img
            src={eventImage || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=400&auto=format&fit=crop'}
            alt={event.name}
            className="h-full w-full object-cover"
            onError={(e) => {
              // Fallback to a default image if all else fails
              e.currentTarget.src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=400&auto=format&fit=crop';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          
          {/* Category badge */}
          <div className="absolute top-4 left-4">
            <div className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-semibold flex items-center gap-1">
              <span>{getCategoryEmoji(event.category)}</span>
              <span>{event.category}</span>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 flex w-full items-end justify-between p-4">
            <div className="text-white">
              <h3 className="text-xl font-bold">{event.name}</h3>
              <p className="text-sm text-white/90 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {event.address}
              </p>
            </div>
            {/* The button will animate in on hover of the parent card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileHover={{ opacity: 1, x: 0 }}
              animate={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Button
                variant="secondary"
                size="sm"
                onClick={onDirectionsClick}
                aria-label={`Get directions to ${event.name}`}
              >
                <MapPin className="h-3 w-3 mr-1" />
                Directions
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Bottom section with event details */}
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-foreground">{getDifficultyFromPrice(event.price)}</p>
              <p className="text-xs text-muted-foreground">{event.startTime}</p>
            </div>
            {/* Map preview */}
            <img
              src={mapImage || 'https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s-marker+ff0000(-74.0023,40.7306)/-74.0023,40.7306,14,0/200x100@2x?access_token=pk.eyJ1IjoiZGV2a3VtYXIxMjMiLCJhIjoiY21nMXZpdTE1MHQwejJub2ZudWd3ZGZ0ZSJ9.Ed8Xd2_5aBZzthiEhdXZgA'}
              alt="Event location map"
              className="h-10 w-20 object-cover rounded border"
            />
          </div>
          <div className="my-4 h-px w-full bg-border" />
          <div className="flex justify-between">
            <StatItem 
              label="Price" 
              value={event.price} 
            />
            <StatItem 
              label="Time" 
              value={event.startTime} 
            />
            <StatItem 
              label="Category" 
              value={event.category} 
            />
          </div>
          
          {/* Description */}
          <div className="mt-4">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {event.description}
            </p>
          </div>

          {/* Learn More button */}
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={onLearnMoreClick}
            >
              Learn More
              <ArrowRight className="ml-2 h-3 w-3" />
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }
);

EventCard.displayName = "EventCard";

export { TrailCard, EventCard };
