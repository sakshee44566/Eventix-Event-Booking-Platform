import { useState } from 'react';
import { Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export function Footer() {
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }
    
    // TODO: Implement newsletter subscription API call
    toast({
      title: "Subscribed!",
      description: "Thank you for subscribing to our newsletter",
    });
    setEmail('');
  };

  return (
    <footer className="bg-foreground text-background">
      <div className="container py-16">
        {/* Newsletter Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-md">
            <h3 className="text-xl font-semibold mb-2">Stay in the loop</h3>
            <p className="text-background/70 text-sm">
              Subscribe to our newsletter for exclusive events, early access, and special offers.
            </p>
          </div>
          <form onSubmit={handleSubscribe} className="flex gap-2 w-full md:w-auto">
            <Input
              placeholder="Enter your email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background/10 border-background/20 text-background placeholder:text-background/50 w-full md:w-72"
            />
            <Button type="submit" className="bg-gradient-primary shrink-0">
              <Mail className="h-4 w-4 mr-2" />
              Subscribe
            </Button>
          </form>
        </div>
      </div>
    </footer>
  );
}