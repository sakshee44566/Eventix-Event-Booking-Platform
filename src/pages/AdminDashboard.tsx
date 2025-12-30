import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, Edit, Trash2, Calendar, Users, DollarSign, 
  TrendingUp, Loader2, Eye, Settings
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/lib/api';
import { auth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { categories } from '@/lib/data';

interface Event {
  _id: string;
  title: string;
  category: string;
  date: string;
  price: number;
  availableTickets: number;
  totalTickets: number;
  status: string;
  isFeatured: boolean;
  isOnline: boolean;
  createdAt: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = auth.getUser();
  const isAdmin = auth.isAuthenticated() && user && user.role === 'admin';

  useEffect(() => {
    // If not admin, redirect once
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "You must be an admin to access this page",
        variant: "destructive",
      });
      navigate('/dashboard');
      return;
    }

    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const response = await adminApi.getAllEvents();
      if (response.success) {
        setEvents(response.data || []);
      }
    } catch (error: any) {
      toast({
        title: "Error loading events",
        description: error.message || "Failed to fetch events",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      await adminApi.deleteEvent(id);
      toast({
        title: "Event deleted",
        description: "The event has been deleted successfully",
      });
      fetchEvents();
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete event",
        variant: "destructive",
      });
    }
  };

  const stats = {
    total: events.length,
    published: events.filter(e => e.status === 'published').length,
    featured: events.filter(e => e.isFeatured).length,
    totalRevenue: events.reduce((sum, e) => sum + (e.price * (e.totalTickets - e.availableTickets)), 0),
  };

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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage events, availability, and pricing</p>
          </div>
          <Link to="/admin/events/new">
            <Button className="bg-gradient-primary hover:opacity-90 shadow-glow">
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-card border border-border"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Events</span>
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <p className="text-2xl font-bold">{stats.total}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl bg-card border border-border"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Published</span>
              <Eye className="h-5 w-5 text-primary" />
            </div>
            <p className="text-2xl font-bold">{stats.published}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl bg-card border border-border"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Featured</span>
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <p className="text-2xl font-bold">{stats.featured}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl bg-card border border-border"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Revenue</span>
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <p className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
          </motion.div>
        </div>

        {/* Events Table */}
        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold">All Events</h2>
          </div>
          
          {events.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No events yet</h3>
              <p className="text-muted-foreground mb-4">Create your first event to get started</p>
              <Link to="/admin/events/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Event</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Availability</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {events.map((event, idx) => {
                    const category = categories.find(c => c.id === event.category);
                    const availabilityPercent = (event.availableTickets / event.totalTickets) * 100;
                    
                    return (
                      <motion.tr
                        key={event._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="hover:bg-muted/50"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium">{event.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {event.isOnline && <Badge variant="secondary" className="mr-1">Online</Badge>}
                              {event.isFeatured && <Badge variant="outline" className="border-primary text-primary">Featured</Badge>}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={category?.color}>{category?.name}</Badge>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {new Date(event.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 font-medium">${event.price}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-muted rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  availabilityPercent > 50
                                    ? 'bg-emerald-500'
                                    : availabilityPercent > 20
                                    ? 'bg-amber-500'
                                    : 'bg-red-500'
                                }`}
                                style={{ width: `${availabilityPercent}%` }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground w-16">
                              {event.availableTickets}/{event.totalTickets}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            className={
                              event.status === 'published'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                : event.status === 'draft'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }
                          >
                            {event.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Link to={`/events/${event._id}`}>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link to={`/admin/events/${event._id}/edit`}>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(event._id, event.title)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

