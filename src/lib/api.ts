// API configuration and utility functions

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token from localStorage
export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Helper function to set auth token
export const setAuthToken = (token: string): void => {
  localStorage.setItem('authToken', token);
};

// Helper function to remove auth token
export const removeAuthToken = (): void => {
  localStorage.removeItem('authToken');
};

// Helper function to get auth headers
export const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Generic API request function
export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const contentType = response.headers.get("content-type") || "";
    let data: any;

    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      // Fallback for text responses (e.g. rate limit message)
      const text = await response.text();
      data = { message: text };
    }

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Authentication API functions
export const authApi = {
  signup: async (name: string, email: string, password: string) => {
    const response = await apiRequest<{
      success: boolean;
      message: string;
      data: {
        user: {
          id: string;
          name: string;
          email: string;
          role: string;
        };
        token: string;
      };
    }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    return response;
  },

  login: async (email: string, password: string) => {
    const response = await apiRequest<{
      success: boolean;
      message: string;
      data: {
        user: {
          id: string;
          name: string;
          email: string;
          role: string;
        };
        token: string;
      };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return response;
  },

  getMe: async () => {
    const response = await apiRequest<{
      success: boolean;
      data: {
        user: {
          id: string;
          name: string;
          email: string;
          role: string;
          avatar?: string;
        };
      };
    }>('/auth/me');
    return response;
  },

  updateProfile: async (updates: { name?: string; phone?: string; avatar?: string }) => {
    const response = await apiRequest<{
      success: boolean;
      message: string;
      data: {
        user: {
          id: string;
          name: string;
          email: string;
          role: string;
        };
      };
    }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return response;
  },
};

// Events API functions
export const eventsApi = {
  getAll: async (params?: {
    category?: string;
    city?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    isOnline?: boolean;
    isFeatured?: boolean;
    page?: number;
    limit?: number;
    sort?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const queryString = queryParams.toString();
    const endpoint = `/events${queryString ? `?${queryString}` : ''}`;
    return apiRequest(endpoint);
  },

  getById: async (id: string) => {
    return apiRequest(`/events/${id}`);
  },
};

// Bookings API functions
export const bookingsApi = {
  create: async (eventId: string, ticketTierId: string, quantity: number) => {
    return apiRequest('/bookings', {
      method: 'POST',
      body: JSON.stringify({ eventId, ticketTierId, quantity }),
    });
  },

  getAll: async (status?: string) => {
    const endpoint = status ? `/bookings?status=${status}` : '/bookings';
    return apiRequest(endpoint);
  },

  getById: async (id: string) => {
    return apiRequest(`/bookings/${id}`);
  },

  cancel: async (id: string, reason?: string) => {
    return apiRequest(`/bookings/${id}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  },

  getHistory: async () => {
    return apiRequest('/bookings/history');
  },
};

// Payments API functions
export const paymentsApi = {
  createIntent: async (bookingId: string) => {
    return apiRequest('/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify({ bookingId }),
    });
  },

  getAll: async () => {
    return apiRequest('/payments');
  },

  getById: async (id: string) => {
    return apiRequest(`/payments/${id}`);
  },
};

// Admin API functions
export const adminApi = {
  // Get all events (admin view)
  getAllEvents: async () => {
    return apiRequest<{
      success: boolean;
      count: number;
      data: any[];
    }>('/events/admin/all');
  },

  // Create event
  createEvent: async (eventData: {
    title: string;
    description: string;
    shortDescription?: string;
    category: string;
    date: string;
    time: string;
    endTime: string;
    location: string;
    venue: string;
    city: string;
    image?: string;
    organizer: string;
    price: number;
    currency?: string;
    isFeatured?: boolean;
    isOnline?: boolean;
    tags?: string[];
    ticketTiers: Array<{
      name: string;
      price: number;
      description: string;
      available: number;
      total?: number;
      perks?: string[];
    }>;
  }) => {
    return apiRequest<{
      success: boolean;
      message: string;
      data: any;
    }>('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  },

  // Update event
  updateEvent: async (id: string, eventData: Partial<{
    title: string;
    description: string;
    shortDescription?: string;
    category: string;
    date: string;
    time: string;
    endTime: string;
    location: string;
    venue: string;
    city: string;
    image?: string;
    organizer: string;
    price: number;
    currency?: string;
    isFeatured?: boolean;
    isOnline?: boolean;
    tags?: string[];
    ticketTiers: Array<{
      name: string;
      price: number;
      description: string;
      available: number;
      total?: number;
      perks?: string[];
    }>;
  }>) => {
    return apiRequest<{
      success: boolean;
      message: string;
      data: any;
    }>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
  },

  // Delete event
  deleteEvent: async (id: string) => {
    return apiRequest<{
      success: boolean;
      message: string;
    }>(`/events/${id}`, {
      method: 'DELETE',
    });
  },
};

