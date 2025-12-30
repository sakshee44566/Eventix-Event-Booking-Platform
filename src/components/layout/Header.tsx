import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, X, User, Bell, Ticket, LogOut, Settings, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { auth } from '@/lib/auth';
import { removeAuthToken } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { notificationManager, Notification } from '@/lib/notifications';

const navLinks = [
  { label: 'Browse Events', href: '/events' },
  { label: 'Categories', href: '/events?view=categories' },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(auth.getUser());
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = auth.isAuthenticated();
      setIsAuthenticated(authenticated);
      if (authenticated) {
        setUser(auth.getUser());
      } else {
        setUser(null);
      }
    };

    checkAuth();
    // Check auth state periodically
    const interval = setInterval(checkAuth, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadNotifications = () => {
      const notifs = notificationManager.getNotifications();
      setNotifications(notifs);
      setUnreadCount(notificationManager.getUnreadCount());
    };

    loadNotifications();
    const unsubscribe = notificationManager.subscribe(loadNotifications);
    return unsubscribe;
  }, []);

  const handleLogout = () => {
    auth.logout();
    removeAuthToken();
    setIsAuthenticated(false);
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full glass">
      <div className="container flex h-16 items-center justify-between gap-4 md:h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
            <Ticket className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">Eventix</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "relative text-sm font-medium transition-colors hover:text-primary",
                location.pathname === link.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              {link.label}
              {location.pathname === link.href && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                />
              )}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <AnimatePresence>
            {isSearchOpen ? (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 280, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <Input
                  placeholder="Search events..."
                  className="h-9"
                  autoFocus
                  onBlur={() => setIsSearchOpen(false)}
                />
              </motion.div>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="h-4 w-4" />
              </Button>
            )}
          </AnimatePresence>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 relative">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-[10px] text-primary-foreground font-bold">{unreadCount > 9 ? '9+' : unreadCount}</span>
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      notificationManager.markAllAsRead();
                    }}
                  >
                    Mark all read
                  </Button>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <ScrollArea className="h-[400px]">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No notifications
                  </div>
                ) : (
                  <div className="space-y-1">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          "p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer",
                          !notification.read && "bg-primary/5"
                        )}
                        onClick={() => {
                          if (notification.actionUrl) {
                            navigate(notification.actionUrl);
                          }
                          if (!notification.read) {
                            notificationManager.markAsRead(notification.id);
                          }
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "text-sm font-medium",
                              !notification.read && "font-semibold"
                            )}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(notification.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  notificationManager.markAsRead(notification.id);
                                }}
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                notificationManager.deleteNotification(notification.id);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>

          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline">{user.name.split(' ')[0]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                {user?.role === 'admin' && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button variant="ghost" size="sm" className="gap-2">
                <User className="h-4 w-4" />
                Sign In
              </Button>
            </Link>
          )}

          <Link to="/events">
            <Button size="sm" className="bg-gradient-primary hover:opacity-90 shadow-glow">
              Find Events
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-background"
          >
            <div className="container py-4 space-y-4">
              <Input placeholder="Search events..." className="w-full" />
              
              <nav className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={cn(
                      "py-2 px-3 rounded-lg text-sm font-medium transition-colors",
                      location.pathname === link.href
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted"
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="flex gap-2 pt-2">
                {isAuthenticated && user ? (
                  <>
                    <Link to="/dashboard" className="flex-1">
                      <Button variant="outline" className="w-full">Dashboard</Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={handleLogout}
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="flex-1">
                      <Button variant="outline" className="w-full">Sign In</Button>
                    </Link>
                    <Link to="/events" className="flex-1">
                      <Button className="w-full bg-gradient-primary">Find Events</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}