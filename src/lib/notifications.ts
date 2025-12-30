// Notifications management system

export interface Notification {
  id: string;
  type: 'event_reminder' | 'booking_confirmed' | 'event_updated' | 'general';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

const NOTIFICATIONS_STORAGE_KEY = 'notifications';

class NotificationManager {
  private listeners: Set<() => void> = new Set();

  // Get all notifications
  getNotifications(): Notification[] {
    const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!stored) return [];
    try {
      const notifications = JSON.parse(stored);
      return notifications.map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp),
      }));
    } catch {
      return [];
    }
  }

  // Save notifications
  private saveNotifications(notifications: Notification[]) {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
    this.notifyListeners();
  }

  // Add a notification
  addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
    const notifications = this.getNotifications();
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    };
    notifications.unshift(newNotification);
    // Keep only last 50 notifications
    if (notifications.length > 50) {
      notifications.splice(50);
    }
    this.saveNotifications(notifications);
    return newNotification;
  }

  // Mark notification as read
  markAsRead(id: string) {
    const notifications = this.getNotifications();
    const notification = notifications.find((n) => n.id === id);
    if (notification) {
      notification.read = true;
      this.saveNotifications(notifications);
    }
  }

  // Mark all as read
  markAllAsRead() {
    const notifications = this.getNotifications();
    notifications.forEach((n) => (n.read = true));
    this.saveNotifications(notifications);
  }

  // Delete notification
  deleteNotification(id: string) {
    const notifications = this.getNotifications();
    const filtered = notifications.filter((n) => n.id !== id);
    this.saveNotifications(filtered);
  }

  // Get unread count
  getUnreadCount(): number {
    return this.getNotifications().filter((n) => !n.read).length;
  }

  // Subscribe to changes
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener());
  }

  // Create event reminder notification
  createEventReminder(eventTitle: string, eventDate: Date, eventId: string) {
    const hoursUntilEvent = (eventDate.getTime() - Date.now()) / (1000 * 60 * 60);
    let message = '';
    
    if (hoursUntilEvent < 1) {
      message = `Your event "${eventTitle}" is starting soon!`;
    } else if (hoursUntilEvent < 24) {
      message = `Your event "${eventTitle}" is tomorrow!`;
    } else {
      const days = Math.floor(hoursUntilEvent / 24);
      message = `Your event "${eventTitle}" is in ${days} day${days > 1 ? 's' : ''}!`;
    }

    return this.addNotification({
      type: 'event_reminder',
      title: 'Event Reminder',
      message,
      actionUrl: `/events/${eventId}`,
    });
  }

  // Schedule reminders for upcoming events
  scheduleReminders(bookings: Array<{ event: { title: string; date: string; _id: string } }>) {
    bookings.forEach((booking) => {
      const eventDate = new Date(booking.event.date);
      const now = new Date();
      
      // Only schedule reminders for future events
      if (eventDate > now) {
        const hoursUntilEvent = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);
        
        // Schedule reminder 24 hours before
        if (hoursUntilEvent > 24 && hoursUntilEvent < 48) {
          this.createEventReminder(booking.event.title, eventDate, booking.event._id);
        }
        // Schedule reminder 1 hour before
        else if (hoursUntilEvent > 1 && hoursUntilEvent < 2) {
          this.createEventReminder(booking.event.title, eventDate, booking.event._id);
        }
      }
    });
  }
}

export const notificationManager = new NotificationManager();

