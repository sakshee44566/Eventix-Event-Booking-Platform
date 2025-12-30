// Authentication state management

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

const USER_STORAGE_KEY = 'user';

export const auth = {
  // Get current user from localStorage
  getUser: (): User | null => {
    const userStr = localStorage.getItem(USER_STORAGE_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  // Set user in localStorage
  setUser: (user: User): void => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  },

  // Remove user from localStorage
  removeUser: (): void => {
    localStorage.removeItem(USER_STORAGE_KEY);
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('authToken');
  },

  // Check if user is admin
  isAdmin: (): boolean => {
    const user = auth.getUser();
    return user?.role === 'admin';
  },

  // Logout - clear all auth data
  logout: (): void => {
    localStorage.removeItem('authToken');
    localStorage.removeItem(USER_STORAGE_KEY);
  },
};

