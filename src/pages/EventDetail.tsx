import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, Clock, MapPin, Users, Share2, Heart, 
  Minus, Plus, ChevronRight, Check, Star, Wifi,
  ArrowLeft
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { events, categories } from '@/lib/data';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const event = events.find((e) => e.id === id);
  const [selectedTier, setSelectedTier] = useState(event?.ticketTiers[0]?.id || '');
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    event ? new Date(event.date) : undefined
  );

  if (!event) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Event not found</h1>
          <Link to="/events">
            <Button>Browse Events</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const category = categories.find((c) => c.id === event.category);
  const selectedTicketTier = event.ticketTiers.find((t) => t.id === selectedTier);
  const totalPrice = selectedTicketTier ? selectedTicketTier.price * quantity : 0;

  const handleBookNow = () => {
    if (!selectedTicketTier) {
      toast({
        title: "Please select a ticket tier",
        variant: "destructive",
      });
      return;
    }
    navigate(`/checkout?eventId=${event.id}&tier=${selectedTier}&quantity=${quantity}`);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied to clipboard!",
      description: "Share this event with your friends",
    });
  };

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="bg-muted/50 border-b border-border">
        <div className="container py-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/events" className="hover:text-foreground">Events</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground truncate">{event.title}</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent z-10" />
        <img
          src={event.image}
          alt={event.title}
          className="h-full w-full object-cover"
        />

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 z-20 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        {/* Action Buttons */}
        <div className="absolute top-6 right-6 z-20 flex gap-2">
          <button
            onClick={() => setIsLiked(!isLiked)}
            className={cn(
              "p-2 rounded-full backdrop-blur-sm transition-colors",
              isLiked ? "bg-primary text-primary-foreground" : "bg-background/80 hover:bg-background"
            )}
          >
            <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
          </button>
          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
          >
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Content */}
      <section className="py-8">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <Badge className={cn("bg-gradient-to-r text-primary-foreground border-0", category?.color)}>
                    {category?.name}
                  </Badge>
                  {event.isOnline && (
                    <Badge variant="secondary">
                      <Wifi className="h-3 w-3 mr-1" />
                      Online Event
                    </Badge>
                  )}
                  {event.isFeatured && (
                    <Badge variant="outline" className="border-primary text-primary">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      Featured
                    </Badge>
                  )}
                </div>

                <h1 className="text-3xl md:text-4xl font-bold mb-4">{event.title}</h1>

                <div className="flex flex-wrap gap-6 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span>{new Date(event.date).toLocaleDateString('en-US', { 
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <span>{event.time} - {event.endTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span>{event.location}</span>
                  </div>
                </div>
              </motion.div>

              {/* Tabs */}
              <Tabs defaultValue="about" className="space-y-6">
                <TabsList className="w-full justify-start bg-muted p-1">
                  <TabsTrigger value="about">About</TabsTrigger>
                  <TabsTrigger value="schedule">Schedule</TabsTrigger>
                  <TabsTrigger value="venue">Venue</TabsTrigger>
                </TabsList>

                <TabsContent value="about" className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">About This Event</h3>
                    <p className="text-muted-foreground leading-relaxed">{event.description}</p>
                  </div>

                  {/* Organizer */}
                  <div className="p-6 rounded-2xl bg-muted/50 border border-border">
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Organized by</h4>
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                        {event.organizer.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold">{event.organizer}</div>
                        <div className="text-sm text-muted-foreground">Event Organizer</div>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="capitalize">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="schedule">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold mb-4">Event Schedule</h3>
                    <div className="space-y-4">
                      <div className="flex gap-4 p-4 rounded-xl bg-muted/50 border border-border">
                        <div className="text-sm font-medium text-primary">{event.time}</div>
                        <div>
                          <div className="font-medium">Doors Open</div>
                          <div className="text-sm text-muted-foreground">Entry and registration</div>
                        </div>
                      </div>
                      <div className="flex gap-4 p-4 rounded-xl bg-muted/50 border border-border">
                        <div className="text-sm font-medium text-primary">{event.time}</div>
                        <div>
                          <div className="font-medium">Main Event Starts</div>
                          <div className="text-sm text-muted-foreground">{event.title}</div>
                        </div>
                      </div>
                      <div className="flex gap-4 p-4 rounded-xl bg-muted/50 border border-border">
                        <div className="text-sm font-medium text-primary">{event.endTime}</div>
                        <div>
                          <div className="font-medium">Event Ends</div>
                          <div className="text-sm text-muted-foreground">Thank you for attending!</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="venue">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold mb-4">Venue Information</h3>
                    <div className="p-6 rounded-2xl bg-muted/50 border border-border">
                      <h4 className="font-semibold text-lg mb-2">{event.venue}</h4>
                      <p className="text-muted-foreground mb-4">{event.location}</p>
                      <div className="aspect-video rounded-xl bg-muted flex items-center justify-center">
                        <MapPin className="h-12 w-12 text-muted-foreground/50" />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar - Booking */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="sticky top-24 space-y-6"
              >
                {/* Calendar */}
                <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
                  <h3 className="font-semibold mb-4">Select Date</h3>
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const eventDate = new Date(event.date);
                      eventDate.setHours(0, 0, 0, 0);
                      const checkDate = new Date(date);
                      checkDate.setHours(0, 0, 0, 0);
                      return checkDate < today || checkDate.toDateString() !== eventDate.toDateString();
                    }}
                  />
                </div>

                {/* Ticket Selection */}
                <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
                  <h3 className="font-semibold mb-4">Select Tickets</h3>
                  
                  <div className="space-y-3 mb-6">
                    {event.ticketTiers.map((tier) => (
                      <button
                        key={tier.id}
                        onClick={() => setSelectedTier(tier.id)}
                        disabled={tier.available === 0}
                        className={cn(
                          "w-full p-4 rounded-xl border text-left transition-all",
                          selectedTier === tier.id
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "border-border hover:border-primary/50",
                          tier.available === 0 && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-medium">{tier.name}</div>
                            <div className="text-sm text-muted-foreground">{tier.description}</div>
                          </div>
                          <div className="text-lg font-bold">${tier.price}</div>
                        </div>
                        <ul className="space-y-1">
                          {tier.perks.map((perk, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Check className="h-3 w-3 text-primary" />
                              {perk}
                            </li>
                          ))}
                        </ul>
                        {tier.available < 20 && tier.available > 0 && (
                          <div className="mt-2 text-xs text-destructive">
                            Only {tier.available} left!
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Quantity */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-medium">Quantity</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center font-semibold">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(10, quantity + 1))}
                        className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Price Summary */}
                  <div className="py-4 border-t border-border space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Service Fee</span>
                      <span>${(totalPrice * 0.05).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg pt-2 border-t border-border">
                      <span>Total</span>
                      <span>${(totalPrice * 1.05).toFixed(2)}</span>
                    </div>
                  </div>

                  <Button 
                    onClick={handleBookNow}
                    className="w-full h-12 bg-gradient-primary hover:opacity-90 shadow-glow"
                  >
                    Book Now
                  </Button>

                  <p className="text-xs text-center text-muted-foreground mt-3">
                    <Users className="h-3 w-3 inline mr-1" />
                    {event.availableTickets.toLocaleString()} tickets remaining
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}