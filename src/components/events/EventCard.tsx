import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Users, Wifi } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Event, categories } from '@/lib/data';
import { cn } from '@/lib/utils';

interface EventCardProps {
  event: Event;
  featured?: boolean;
}

export function EventCard({ event, featured = false }: EventCardProps) {
  const category = categories.find((c) => c.id === event.category);
  const availabilityPercent = (event.availableTickets / event.totalTickets) * 100;
  // Normalize ID: use _id from database or id from static data
  const eventId = (event as any)._id || event.id;

  return (
    <Link to={`/events/${eventId}`} className="h-full flex">
      <motion.article
        whileHover={{ y: -4 }}
        className={cn(
          "group relative overflow-hidden rounded-2xl bg-card border border-border shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full w-full"
        )}
      >
        {/* Image */}
        <div className={cn(
          "relative overflow-hidden",
          "aspect-[16/10]"
        )}>
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/20 to-transparent z-10" />
          <img
            src={event.image}
            alt={event.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Category Badge */}
          <Badge 
            className={cn(
              "absolute top-4 left-4 z-20 bg-gradient-to-r text-primary-foreground border-0",
              category?.color
            )}
          >
            {category?.name}
          </Badge>

          {/* Online Badge */}
          {event.isOnline && (
            <Badge 
              variant="secondary"
              className="absolute top-4 right-4 z-20 bg-background/90 backdrop-blur-sm"
            >
              <Wifi className="h-3 w-3 mr-1" />
              Online
            </Badge>
          )}

          {/* Price Tag */}
          <div className="absolute bottom-4 left-4 z-20">
            <div className="flex items-baseline gap-1 text-primary-foreground">
              <span className="text-sm font-medium">From</span>
              <span className="text-2xl font-bold">${event.price}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 flex-1 flex flex-col">
          <div className="space-y-2 flex-1">
            <h3 className={cn(
              "font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors",
              "text-lg"
            )}>
              {event.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {event.shortDescription || event.description?.substring(0, 100) || ''}
            </p>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4 text-primary" />
              <span>{new Date(event.date).toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })}</span>
              <Clock className="h-4 w-4 ml-2 text-primary" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="truncate">{event.venue}, {event.city}</span>
            </div>
          </div>

          {/* Availability */}
          <div className="pt-3 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{event.availableTickets.toLocaleString()} tickets left</span>
              </div>
              <span className={cn(
                "text-xs font-medium px-2 py-1 rounded-full",
                availabilityPercent > 50 
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : availabilityPercent > 20
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              )}>
                {availabilityPercent > 50 ? 'Available' : availabilityPercent > 20 ? 'Selling Fast' : 'Almost Gone'}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${100 - availabilityPercent}%` }}
                transition={{ duration: 1, delay: 0.2 }}
                className={cn(
                  "h-full rounded-full",
                  availabilityPercent > 50 
                    ? "bg-emerald-500"
                    : availabilityPercent > 20
                      ? "bg-amber-500"
                      : "bg-red-500"
                )}
              />
            </div>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}