import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, ArrowRight, Star, Shield, Zap, Clock, 
  ChevronLeft, ChevronRight, Play, Check 
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EventCard } from '@/components/events/EventCard';
import { CategoryCard } from '@/components/events/CategoryCard';
import { events, categories } from '@/lib/data';
import { eventsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { notificationManager } from '@/lib/notifications';
import { auth } from '@/lib/auth';
import { Textarea } from '@/components/ui/textarea';
import heroConcert from '@/assets/hero-concert.jpg';
import heroConference from '@/assets/hero-conference.jpg';
import heroBusiness from '@/assets/hero-business.jpg';
import heroSports from '@/assets/hero-sports.jpg';

const heroImages = [heroConcert, heroConference, heroBusiness, heroSports];
const heroTexts = [
  { title: 'Live Music', subtitle: 'Festivals & Concerts' },
  { title: 'Tech Events', subtitle: 'Conferences & Summits' },
  { title: 'Business', subtitle: 'Networking & Workshops' },
  { title: 'Sports', subtitle: 'Games & Championships' },
];

const features = [
  { icon: Zap, title: 'Instant Booking', description: 'Book tickets in seconds with our streamlined checkout' },
  { icon: Shield, title: 'Secure Payments', description: 'Your transactions are protected with bank-level security' },
  { icon: Clock, title: 'Smart Reminders', description: 'Never miss an event with personalized notifications' },
];

interface Testimonial {
  id: string;
  name: string;
  role: string;
  rating: number;
  content: string;
}

export default function Index() {
  const [currentHero, setCurrentHero] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [testimonialsList, setTestimonialsList] = useState<Testimonial[]>([]);
  const [testimonialForm, setTestimonialForm] = useState({
    name: '',
    role: '',
    rating: 5,
    content: '',
  });
  const [liveEvents, setLiveEvents] = useState<any[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const { toast } = useToast();
  const featuredEvents = events.filter((e) => e.isFeatured);
  const categoryEventCounts = categories.map((cat) => ({
    ...cat,
    count: events.filter((e) => e.category === cat.id).length,
  }));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHero((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Load featured events from API so admin-created events appear on the homepage
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setIsLoadingEvents(true);
        const response = await eventsApi.getAll({ isFeatured: true, limit: 6 }) as any;
        if (response.success) {
          // Only show published events from API
          setLiveEvents((response.data || []).filter((e: any) => e.status === 'published'));
        }
      } catch (error) {
        console.error('Failed to load featured events', error);
        setLiveEvents([]);
      } finally {
        setIsLoadingEvents(false);
      }
    };

    fetchFeatured();
  }, []);

  // Prefer live (API) events; fall back to hardcoded ones if none
  const combinedFeaturedEvents =
    liveEvents.length > 0 ? liveEvents : featuredEvents;

  // Load testimonials from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('testimonials');
      if (stored) {
        const parsed = JSON.parse(stored);
        setTestimonialsList(Array.isArray(parsed) ? parsed : []);
      }
    } catch (err) {
      console.error('Failed to load testimonials', err);
    }
  }, []);

  const saveTestimonials = (items: Testimonial[]) => {
    setTestimonialsList(items);
    localStorage.setItem('testimonials', JSON.stringify(items));
  };

  const handleTestimonialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testimonialForm.name.trim() || !testimonialForm.content.trim()) {
      toast({
        title: 'Missing fields',
        description: 'Please provide your name and a comment.',
        variant: 'destructive',
      });
      return;
    }
    const rating = Number(testimonialForm.rating);
    if (rating < 1 || rating > 5) {
      toast({
        title: 'Invalid rating',
        description: 'Rating must be between 1 and 5.',
        variant: 'destructive',
      });
      return;
    }

    const newItem: Testimonial = {
      id: `t-${Date.now()}`,
      name: testimonialForm.name.trim(),
      role: testimonialForm.role.trim() || 'Community Member',
      rating,
      content: testimonialForm.content.trim(),
    };

    const updated = [newItem, ...testimonialsList];
    saveTestimonials(updated);
    setTestimonialForm({ name: '', role: '', rating: 5, content: '' });
    toast({
      title: 'Thanks for sharing!',
      description: 'Your testimonial has been added.',
    });
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative h-[85vh] min-h-[600px] overflow-hidden">
        {/* Background Images */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentHero}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-foreground/70 via-foreground/50 to-foreground z-10" />
            <img
              src={heroImages[currentHero]}
              alt={heroTexts[currentHero].title}
              className="h-full w-full object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {/* Hero Content */}
        <div className="relative z-20 container h-full flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-2 mb-6">
              {heroImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentHero(idx)}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    idx === currentHero ? 'w-8 bg-primary' : 'w-4 bg-primary-foreground/30'
                  }`}
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentHero}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
              >
                <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-primary-foreground text-sm font-medium mb-4">
                  {heroTexts[currentHero].subtitle}
                </span>
              </motion.div>
            </AnimatePresence>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground leading-tight mb-6">
              Discover Your Next
              <br />
              <span className="text-gradient">Unforgettable</span> Experience
            </h1>

            <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-xl">
              From electrifying concerts to inspiring conferences, find and book the events that 
              matter to you. Your next adventure is just a click away.
            </p>

            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search events, artists, venues..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 bg-background/95 backdrop-blur-sm border-0 text-base"
                />
              </div>
              <Link to="/events">
                <Button size="lg" className="h-14 px-8 bg-gradient-primary hover:opacity-90 shadow-glow">
                  Find Events
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Hero Navigation Arrows */}
        <button
          onClick={() => setCurrentHero((prev) => (prev - 1 + heroImages.length) % heroImages.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-background/20 backdrop-blur-sm text-primary-foreground hover:bg-background/30 transition-colors hidden md:flex"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={() => setCurrentHero((prev) => (prev + 1) % heroImages.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-background/20 backdrop-blur-sm text-primary-foreground hover:bg-background/30 transition-colors hidden md:flex"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </section>

      {/* Categories Section */}
      <section className="py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Browse by Category
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore events across various categories and find exactly what you're looking for
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categoryEventCounts.map((category, idx) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                viewport={{ once: true }}
              >
                <CategoryCard category={category} eventCount={category.count} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-20 bg-muted/50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-12"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Featured Events
              </h2>
              <p className="text-muted-foreground max-w-xl">
                Don't miss out on these handpicked experiences, curated just for you
              </p>
            </div>
            <Link to="/events">
              <Button variant="outline" className="group">
                View All Events
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>

          {isLoadingEvents ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading featured events...</p>
            </div>
          ) : combinedFeaturedEvents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No featured events available</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {combinedFeaturedEvents.slice(0, 4).map((event: any, idx: number) => (
                <motion.div
                  key={event._id || event.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="h-full"
                >
                  <EventCard event={event} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose Eventix?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We've built the best event booking experience with you in mind
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="relative p-8 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 group"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-primary mb-6">
                  <feature.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground mb-4">{feature.description}</p>
                {feature.title === 'Smart Reminders' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const user = auth.getUser();
                      if (user) {
                        notificationManager.addNotification({
                          type: 'general',
                          title: 'Smart Reminders Enabled',
                          message: 'You will receive notifications for your upcoming events 24 hours and 1 hour before they start.',
                        });
                        toast({
                          title: "Smart Reminders Enabled",
                          description: "You'll receive notifications for your upcoming events!",
                        });
                      } else {
                        toast({
                          title: "Sign in required",
                          description: "Please sign in to enable Smart Reminders",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    Enable Reminders
                  </Button>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-muted/50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Loved by Event Enthusiasts
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              See what our community has to say about their Eventix experience. Share your own!
            </p>
          </motion.div>

          {/* Testimonial Form + Info */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-6 rounded-2xl bg-card border border-border"
            >
              <h3 className="text-xl font-semibold mb-4">Share your experience</h3>
              <form className="space-y-4" onSubmit={handleTestimonialSubmit}>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name *</label>
                  <Input
                    value={testimonialForm.name}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, name: e.target.value })}
                    placeholder="Your name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role / Title</label>
                  <Input
                    value={testimonialForm.role}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, role: e.target.value })}
                    placeholder="e.g., Event Enthusiast"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rating (1-5)</label>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={testimonialForm.rating}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, rating: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Comment *</label>
                  <Textarea
                    value={testimonialForm.content}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, content: e.target.value })}
                    rows={4}
                    placeholder="Tell others about your Eventix experience"
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-primary hover:opacity-90 shadow-glow">
                  Submit
                </Button>
              </form>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-6 rounded-2xl bg-card border border-border h-full flex flex-col justify-center space-y-3"
            >
              <h3 className="text-xl font-semibold">Why share?</h3>
              <p className="text-muted-foreground">
                Your feedback helps others discover great events and keeps our community thriving.
                Add your rating and comment to appear alongside other Eventix users.
              </p>
              <p className="text-sm text-muted-foreground">
                We display the most recent submissions first. Ratings are shown with stars.
              </p>
            </motion.div>
          </div>

          {/* Testimonials List */}
          <div className="grid md:grid-cols-3 gap-8">
            {testimonialsList.length === 0 ? (
              <div className="md:col-span-3 text-center py-10 text-muted-foreground">
                No testimonials yet. Be the first to share your experience!
              </div>
            ) : (
              testimonialsList.map((testimonial, idx) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  viewport={{ once: true }}
                  className="relative p-8 rounded-2xl bg-card border border-border"
                >
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-foreground mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role || 'Community Member'}</div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-primary p-12 md:p-16 text-center"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-6">
                Ready to Experience Something Amazing?
              </h2>
              <p className="text-lg text-primary-foreground/90 mb-8">
                Join millions of event lovers who discover and book unforgettable experiences every day.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/events">
                  <Button size="lg" variant="secondary" className="h-14 px-8">
                    <Play className="mr-2 h-5 w-5" />
                    Explore Events
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="lg" variant="outline" className="h-14 px-8 bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                    Create Free Account
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}