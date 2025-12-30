import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, X, Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { adminApi, eventsApi } from '@/lib/api';
import { auth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { categories } from '@/lib/data';

interface TicketTier {
  name: string;
  price: number;
  description: string;
  available: number;
  total?: number;
  perks: string[];
}

export default function AdminEventForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditMode = !!id;
  const user = auth.getUser();

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEvent, setIsLoadingEvent] = useState(isEditMode);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    category: '',
    date: '',
    time: '',
    endTime: '',
    location: '',
    venue: '',
    city: '',
    image: '',
    organizer: '',
    price: 0,
    currency: 'USD',
    isFeatured: false,
    isOnline: false,
    tags: [] as string[],
    ticketTiers: [] as TicketTier[],
  });

  const [tagInput, setTagInput] = useState('');
  const hasFetched = useRef<string | null>(null);

  useEffect(() => {
    // Check if user is admin
    const currentUser = auth.getUser();
    const isAdmin = auth.isAuthenticated() && currentUser && currentUser.role === 'admin';

    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "You must be an admin to access this page",
        variant: "destructive",
      });
      navigate('/dashboard');
      return;
    }

    // Only fetch once per event ID when in edit mode
    if (isEditMode && id && hasFetched.current !== id) {
      hasFetched.current = id;
      fetchEvent();
    }
  }, [id, navigate, toast, isEditMode]);

  const fetchEvent = async () => {
    try {
      setIsLoadingEvent(true);
      const response = await eventsApi.getById(id!) as { success: boolean; data: any };
      if (response.success && response.data) {
        const event = response.data;
        setFormData({
          title: event.title || '',
          description: event.description || '',
          shortDescription: event.shortDescription || '',
          category: event.category || '',
          date: event.date ? event.date.split('T')[0] : '',
          time: event.time || '',
          endTime: event.endTime || '',
          location: event.location || '',
          venue: event.venue || '',
          city: event.city || '',
          image: event.image || '',
          organizer: event.organizer || '',
          price: event.price || 0,
          currency: event.currency || 'USD',
          isFeatured: event.isFeatured || false,
          isOnline: event.isOnline || false,
          tags: event.tags || [],
          ticketTiers: event.ticketTiers || [],
        });
      }
    } catch (error: any) {
      toast({
        title: "Error loading event",
        description: error.message || "Failed to fetch event",
        variant: "destructive",
      });
    } finally {
      setIsLoadingEvent(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isEditMode) {
        await adminApi.updateEvent(id!, formData);
        toast({
          title: "Event updated",
          description: "The event has been updated successfully",
        });
      } else {
        await adminApi.createEvent(formData);
        toast({
          title: "Event created",
          description: "The event has been created successfully",
        });
      }
      navigate('/admin');
    } catch (error: any) {
      toast({
        title: isEditMode ? "Update failed" : "Creation failed",
        description: error.message || `Failed to ${isEditMode ? 'update' : 'create'} event`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addTicketTier = () => {
    setFormData({
      ...formData,
      ticketTiers: [
        ...formData.ticketTiers,
        {
          name: '',
          price: 0,
          description: '',
          available: 0,
          total: 0,
          perks: [],
        },
      ],
    });
  };

  const removeTicketTier = (index: number) => {
    setFormData({
      ...formData,
      ticketTiers: formData.ticketTiers.filter((_, i) => i !== index),
    });
  };

  const updateTicketTier = (index: number, field: keyof TicketTier, value: any) => {
    const updated = [...formData.ticketTiers];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, ticketTiers: updated });
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag),
    });
  };

  if (isLoadingEvent) {
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
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Admin Dashboard
        </Link>

        <h1 className="text-3xl font-bold mb-8">
          {isEditMode ? 'Edit Event' : 'Create New Event'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="rounded-2xl bg-card border border-border p-6 space-y-6">
            <h2 className="text-xl font-semibold">Basic Information</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortDescription">Short Description</Label>
              <Input
                id="shortDescription"
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                placeholder="Brief one-line description"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Full Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={5}
                required
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="rounded-2xl bg-card border border-border p-6 space-y-6">
            <h2 className="text-xl font-semibold">Date & Time</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="date">Event Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Start Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">End Time *</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="rounded-2xl bg-card border border-border p-6 space-y-6">
            <h2 className="text-xl font-semibold">Location</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="venue">Venue *</Label>
                <Input
                  id="venue"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Full Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Central Park Arena, New York, NY"
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isOnline"
                checked={formData.isOnline}
                onCheckedChange={(checked) => setFormData({ ...formData, isOnline: !!checked })}
              />
              <Label htmlFor="isOnline" className="cursor-pointer">Online Event</Label>
            </div>
          </div>

          {/* Pricing & Tickets */}
          <div className="rounded-2xl bg-card border border-border p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Ticket Tiers *</h2>
              <Button type="button" variant="outline" size="sm" onClick={addTicketTier}>
                <Plus className="h-4 w-4 mr-2" />
                Add Tier
              </Button>
            </div>

            {formData.ticketTiers.length === 0 && (
              <p className="text-sm text-muted-foreground">Add at least one ticket tier</p>
            )}

            <div className="space-y-4">
              {formData.ticketTiers.map((tier, index) => (
                <div key={index} className="p-4 border border-border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Tier {index + 1}</h3>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTicketTier(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Name *</Label>
                      <Input
                        value={tier.name}
                        onChange={(e) => updateTicketTier(index, 'name', e.target.value)}
                        placeholder="e.g., General Admission"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Price ($) *</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={tier.price}
                        onChange={(e) => updateTicketTier(index, 'price', parseFloat(e.target.value) || 0)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description *</Label>
                    <Input
                      value={tier.description}
                      onChange={(e) => updateTicketTier(index, 'description', e.target.value)}
                      placeholder="e.g., Standard festival access"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Available Tickets *</Label>
                      <Input
                        type="number"
                        min="0"
                        value={tier.available}
                        onChange={(e) => updateTicketTier(index, 'available', parseInt(e.target.value) || 0)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Total Tickets</Label>
                      <Input
                        type="number"
                        min="0"
                        value={tier.total || tier.available}
                        onChange={(e) => updateTicketTier(index, 'total', parseInt(e.target.value) || tier.available)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Base Price ($) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                required
              />
              <p className="text-xs text-muted-foreground">Lowest ticket tier price</p>
            </div>
          </div>

          {/* Additional Settings */}
          <div className="rounded-2xl bg-card border border-border p-6 space-y-6">
            <h2 className="text-xl font-semibold">Additional Settings</h2>
            
            <div className="space-y-2">
              <Label htmlFor="organizer">Organizer *</Label>
              <Input
                id="organizer"
                value={formData.organizer}
                onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add a tag and press Enter"
                />
                <Button type="button" onClick={addTag}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded-md text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: !!checked })}
                />
                <Label htmlFor="isFeatured" className="cursor-pointer">Feature this event</Label>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-primary hover:opacity-90 shadow-glow"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isEditMode ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEditMode ? 'Update Event' : 'Create Event'
              )}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

