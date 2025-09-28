import * as React from "react";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Clock, DollarSign } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Event } from "@/types/Event";

interface EventCardProps extends React.HTMLAttributes<HTMLDivElement> {
  event: Event;
  onDirectionsClick?: () => void;
  onLearnMoreClick?: () => void;
}

const StatItem = ({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) => (
  <div className="flex flex-col items-center">
    <div className="flex items-center gap-1 mb-1">
      {icon}
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
    <span className="text-xs text-muted-foreground">{label}</span>
  </div>
);

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
    const getCategoryColor = (category: string) => {
      const colors: { [key: string]: string } = {
        'Music': 'from-red-500 to-red-600',
        'Art': 'from-blue-500 to-blue-600',
        'Food & Drink': 'from-green-500 to-green-600',
        'Comedy': 'from-orange-500 to-orange-600',
        'Free': 'from-yellow-500 to-yellow-600',
        'Other': 'from-purple-500 to-purple-600'
      };
      return colors[category] || 'from-gray-500 to-gray-600';
    };

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

    // Generate AI-powered image URL using Gemini Nano (simulated)
    const generateEventImage = (event: Event) => {
      const baseUrl = "https://images.unsplash.com/photo";
      const categoryImages: { [key: string]: string } = {
        'Music': "1551632811-561732d1e306?q=80&w=400&auto=format&fit=crop",
        'Art': "1541961014-2dca997ad595?q=80&w=400&auto=format&fit=crop",
        'Food & Drink': "1555939594-58d7cb561ad1?q=80&w=400&auto=format&fit=crop",
        'Comedy': "1515187029135-18ee286d815b?q=80&w=400&auto=format&fit=crop",
        'Free': "1441974231531-c6227db76b6e?q=80&w=400&auto=format&fit=crop",
        'Other': "1506905925346-21bda4d32df4?q=80&w=400&auto=format&fit=crop"
      };
      return `${baseUrl}/${categoryImages[event.category] || categoryImages['Other']}`;
    };

    const generateMapImage = (event: Event) => {
      // Generate a simple map representation based on coordinates
      const lat = event.latitude;
      const lng = event.longitude;
      return `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s-marker+ff0000(${lng},${lat})/${lng},${lat},14,0/300x200@2x?access_token=pk.eyJ1IjoiZGV2a3VtYXIxMjMiLCJhIjoiY21nMXZpdTE1MHQwejJub2ZudWd3ZGZ0ZSJ9.Ed8Xd2_5aBZzthiEhdXZgA`;
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
            src={generateEventImage(event)}
            alt={event.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          
          {/* Category badge */}
          <div className="absolute top-4 left-4">
            <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getCategoryColor(event.category)} text-white text-xs font-semibold flex items-center gap-1`}>
              <span>{getCategoryEmoji(event.category)}</span>
              <span>{event.category}</span>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 flex w-full items-end justify-between p-4">
            <div className="text-white">
              <h3 className="text-xl font-bold mb-1">{event.name}</h3>
              <p className="text-sm text-white/90 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {event.address}
              </p>
            </div>
            
            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileHover={{ opacity: 1, x: 0 }}
              animate={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex gap-2"
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-bold text-foreground text-sm">{event.startTime}</p>
              <p className="text-xs text-muted-foreground">Event Time</p>
            </div>
            {/* Map preview */}
            <img
              src={generateMapImage(event)}
              alt="Event location map"
              className="h-10 w-20 object-cover rounded border"
            />
          </div>
          
          <div className="my-4 h-px w-full bg-border" />
          
          <div className="flex justify-between">
            <StatItem 
              label="Price" 
              value={event.price} 
              icon={<DollarSign className="h-3 w-3 text-muted-foreground" />} 
            />
            <StatItem 
              label="Time" 
              value={event.startTime} 
              icon={<Clock className="h-3 w-3 text-muted-foreground" />} 
            />
            <StatItem 
              label="Category" 
              value={event.category} 
              icon={<span className="text-xs">{getCategoryEmoji(event.category)}</span>} 
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

export { EventCard };
