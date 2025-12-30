import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { authApi, setAuthToken } from '@/lib/api';
import { auth } from '@/lib/auth';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center">
            <Link to="/" className="inline-flex items-center gap-2 mb-8">
              <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                <Ticket className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold">Eventix</span>
            </Link>
            <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
            <p className="text-muted-foreground">Sign in to continue to your account</p>
          </div>

          <form 
            className="space-y-5"
            onSubmit={async (e) => {
              e.preventDefault();
              setIsLoading(true);

              try {
                const response = await authApi.login(email, password);
                
                if (response.success) {
                  // Store token and user
                  setAuthToken(response.data.token);
                  auth.setUser(response.data.user);
                  
                  toast({
                    title: "Login successful!",
                    description: `Welcome back, ${response.data.user.name}!`,
                  });
                  
                  // Redirect to dashboard or home
                  navigate('/dashboard');
                }
              } catch (error: any) {
                toast({
                  title: "Login failed",
                  description: error.message || "Invalid email or password",
                  variant: "destructive",
                });
              } finally {
                setIsLoading(false);
              }
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="you@example.com" 
                  className="pl-10 h-12"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox disabled={isLoading} />
                <span className="text-sm">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-primary hover:opacity-90 shadow-glow"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary font-medium hover:underline">Sign up</Link>
          </p>
        </motion.div>
      </div>

      <div className="hidden lg:block flex-1 bg-gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center text-primary-foreground">
            <h2 className="text-4xl font-bold mb-4">Discover Amazing Events</h2>
            <p className="text-lg opacity-90">Join millions finding unforgettable experiences</p>
          </div>
        </div>
      </div>
    </div>
  );
}