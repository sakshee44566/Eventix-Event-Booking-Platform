import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin, Download, X, Clock, Loader2 } from 'lucide-react';
import { bookingsApi } from '@/lib/api';
import { auth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { notificationManager } from '@/lib/notifications';

interface Booking {
  _id: string;
  bookingId: string;
  event: {
    _id: string;
    title: string;
    date: string;
    time: string;
    endTime?: string;
    venue: string;
    location: string;
    image?: string;
  };
  ticketTierName: string;
  quantity: number;
  totalPrice: number;
  status: string;
  bookingDate: string;
  ticketCodes: string[];
  paymentStatus: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = auth.getUser();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!auth.isAuthenticated() || !user) {
      navigate('/login');
      return;
    }

    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const response = await bookingsApi.getAll() as { success: boolean; data: Booking[] };
      if (response.success) {
        const bookingsData = response.data || [];
        setBookings(bookingsData);
        // Schedule reminders for upcoming events
        notificationManager.scheduleReminders(bookingsData);
      }
    } catch (error: any) {
      toast({
        title: "Error loading bookings",
        description: error.message || "Failed to fetch your bookings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await bookingsApi.cancel(bookingId);
      toast({
        title: "Booking cancelled",
        description: "Your booking has been cancelled successfully",
      });
      fetchBookings();
    } catch (error: any) {
      toast({
        title: "Cancellation failed",
        description: error.message || "Failed to cancel booking",
        variant: "destructive",
      });
    }
  };

  const handleDownload = (booking: Booking) => {
    // Create a simple ticket text
    const ticketText = `
EVENTIX - TICKET
================
Event: ${booking.event.title}
Date: ${new Date(booking.event.date).toLocaleDateString()}
Time: ${booking.event.time}
Venue: ${booking.event.venue}
Ticket Type: ${booking.ticketTierName}
Quantity: ${booking.quantity}
Booking ID: ${booking.bookingId}
Ticket Codes: ${booking.ticketCodes.join(', ')}

Thank you for your booking!
    `;

    const blob = new Blob([ticketText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ticket-${booking.bookingId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Ticket downloaded",
      description: "Your ticket has been downloaded",
    });
  };

  // Determine if booking is upcoming or past based on event date
  const isUpcoming = (booking: Booking) => {
    const eventDate = new Date(booking.event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate >= today && booking.status === 'confirmed';
  };

  const upcomingBookings = bookings.filter(isUpcoming);
  const pastBookings = bookings.filter((b) => !isUpcoming(b) || b.status === 'cancelled');

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name.split(' ')[0] || 'User'}!</h1>
          <p className="text-muted-foreground">Manage your bookings and discover new events</p>
        </motion.div>

        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList>
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingBookings.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past ({pastBookings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingBookings.length > 0 ? (
              upcomingBookings.map((booking, idx) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex flex-col md:flex-row gap-4 p-6 rounded-2xl bg-card border border-border"
                >
                  <div className="w-full md:w-48 h-32 bg-muted rounded-xl flex items-center justify-center">
                    {booking.event.image ? (
                      <img
                        src={booking.event.image}
                        alt={booking.event.title}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <Calendar className="h-12 w-12 text-muted-foreground/50" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <Badge variant="secondary" className="mb-2">{booking.ticketTierName}</Badge>
                        <h3 className="font-semibold text-lg">{booking.event.title}</h3>
                      </div>
                      <Badge className={
                        booking.status === 'confirmed' 
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : booking.status === 'cancelled'
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      }>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(booking.event.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {booking.event.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {booking.event.venue}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Booking ID: </span>
                        <span className="font-mono font-medium">{booking.bookingId}</span>
                        {booking.ticketCodes.length > 0 && (
                          <div className="mt-1">
                            <span className="text-muted-foreground">Tickets: </span>
                            <span className="font-mono font-medium">{booking.ticketCodes.join(', ')}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDownload(booking)}
                        >
                          <Download className="h-4 w-4 mr-1" /> Download
                        </Button>
                        {booking.status === 'confirmed' && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleCancel(booking._id)}
                          >
                            <X className="h-4 w-4 mr-1" /> Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium mb-2">No upcoming bookings</h3>
                <p className="text-muted-foreground mb-4">Discover events and book your next experience</p>
                <Link to="/events"><Button>Browse Events</Button></Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastBookings.length > 0 ? (
              pastBookings.map((booking, idx) => (
                <motion.div
                  key={booking._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex flex-col md:flex-row gap-4 p-6 rounded-2xl bg-card border border-border opacity-75"
                >
                  <div className="w-full md:w-48 h-32 bg-muted rounded-xl flex items-center justify-center grayscale">
                    {booking.event.image ? (
                      <img
                        src={booking.event.image}
                        alt={booking.event.title}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <Calendar className="h-12 w-12 text-muted-foreground/50" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Badge variant="secondary" className="mb-2">{booking.ticketTierName}</Badge>
                    <h3 className="font-semibold text-lg mb-2">{booking.event.title}</h3>
                    <div className="text-sm text-muted-foreground">
                      {new Date(booking.event.date).toLocaleDateString()} • {booking.event.venue}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      Booking ID: {booking.bookingId}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium mb-2">No past bookings</h3>
                <p className="text-muted-foreground mb-4">Your past event bookings will appear here</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}