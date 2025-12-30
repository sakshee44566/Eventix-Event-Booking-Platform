import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, Clock, MapPin, CreditCard, Lock, ArrowLeft,
  Check, User, Mail, Phone, Building
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { events } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const eventId = searchParams.get('eventId');
  const tierId = searchParams.get('tier');
  const quantity = parseInt(searchParams.get('quantity') || '1', 10);

  const event = events.find((e) => e.id === eventId);
  const selectedTier = event?.ticketTiers.find((t) => t.id === tierId);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    billingAddress: '',
    city: '',
    zipCode: '',
  });

  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!event || !selectedTier) {
      toast({
        title: "Invalid booking",
        description: "Please select an event and ticket tier first",
        variant: "destructive",
      });
      navigate('/events');
    }
  }, [event, selectedTier, navigate, toast]);

  if (!event || !selectedTier) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid booking</h1>
          <Link to="/events">
            <Button>Browse Events</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const subtotal = selectedTier.price * quantity;
  const serviceFee = subtotal * 0.05;
  const total = subtotal + serviceFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: "Booking successful!",
        description: "Your tickets have been confirmed. Check your email for details.",
      });
      navigate(`/dashboard`);
    }, 2000);
  };

  return (
    <Layout>
      <div className="bg-muted/50 border-b border-border">
        <div className="container py-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <Link to="/events" className="hover:text-foreground">Events</Link>
            <span>/</span>
            <Link to={`/events/${event.id}`} className="hover:text-foreground">{event.title}</Link>
            <span>/</span>
            <span className="text-foreground">Checkout</span>
          </nav>
        </div>
      </div>

      <section className="py-8">
        <div className="container">
          <div className="mb-6">
            <Link 
              to={`/events/${event.id}`}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to event
            </Link>
            <h1 className="text-3xl font-bold">Complete Your Booking</h1>
            <p className="text-muted-foreground mt-2">Review your order and enter payment details</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Event Summary Card */}
                <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
                  <h2 className="text-xl font-semibold mb-4">Event Details</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-4">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-24 h-24 rounded-xl object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{event.title}</h3>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(event.date).toLocaleDateString('en-US', { 
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            })}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{event.time} - {event.endTime}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{event.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
                  <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="name"
                          className="pl-10"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          className="pl-10"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          className="pl-10"
                          placeholder="+1 (555) 000-0000"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <h2 className="text-xl font-semibold">Payment Information</h2>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          value={formData.cardNumber}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
                            setFormData({ ...formData, cardNumber: value });
                          }}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiryDate">Expiry Date</Label>
                          <Input
                            id="expiryDate"
                            placeholder="MM/YY"
                            maxLength={5}
                            value={formData.expiryDate}
                            onChange={(e) => {
                              let value = e.target.value.replace(/\D/g, '');
                              if (value.length >= 2) {
                                value = value.slice(0, 2) + '/' + value.slice(2, 4);
                              }
                              setFormData({ ...formData, expiryDate: value });
                            }}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            maxLength={4}
                            value={formData.cvv}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              setFormData({ ...formData, cvv: value });
                            }}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="billingAddress">Billing Address</Label>
                        <div className="relative">
                          <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            id="billingAddress"
                            className="pl-10"
                            placeholder="123 Main Street"
                            value={formData.billingAddress}
                            onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            placeholder="New York"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="zipCode">ZIP Code</Label>
                          <Input
                            id="zipCode"
                            placeholder="10001"
                            value={formData.zipCode}
                            onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-primary hover:opacity-90 shadow-glow"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      'Processing...'
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Complete Booking
                      </>
                    )}
                  </Button>
                </form>
              </motion.div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="sticky top-24"
              >
                <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-6">
                  <h2 className="text-xl font-semibold">Order Summary</h2>
                  
                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-muted/50 border border-border">
                      <div className="font-medium mb-1">{selectedTier.name}</div>
                      <div className="text-sm text-muted-foreground mb-2">{selectedTier.description}</div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Quantity: {quantity}</span>
                        <span className="font-semibold">${selectedTier.price.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-border">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Service Fee</span>
                      <span>${serviceFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg pt-2 border-t border-border">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Lock className="h-4 w-4 mt-0.5 text-primary" />
                      <span>Your payment information is secure and encrypted</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      <span>Instant confirmation</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      <span>Mobile tickets</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      <span>Free cancellation</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

