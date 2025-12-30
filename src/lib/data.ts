// Mock data for the event booking system

export interface Event {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  category: 'music' | 'tech' | 'business' | 'education' | 'sports' | 'arts';
  date: string;
  time: string;
  endTime: string;
  location: string;
  venue: string;
  city: string;
  image: string;
  organizer: string;
  organizerLogo: string;
  price: number;
  currency: string;
  availableTickets: number;
  totalTickets: number;
  isFeatured: boolean;
  isOnline: boolean;
  tags: string[];
  ticketTiers: TicketTier[];
}

export interface TicketTier {
  id: string;
  name: string;
  price: number;
  description: string;
  available: number;
  perks: string[];
}

export interface Booking {
  id: string;
  eventId: string;
  event: Event;
  ticketTier: string;
  quantity: number;
  totalPrice: number;
  status: 'upcoming' | 'past' | 'cancelled';
  bookingDate: string;
  ticketCode: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'user' | 'admin';
}

export const categories = [
  { id: 'music', name: 'Music', icon: 'Music', color: 'from-pink-500 to-rose-500' },
  { id: 'tech', name: 'Technology', icon: 'Cpu', color: 'from-blue-500 to-cyan-500' },
  { id: 'business', name: 'Business', icon: 'Briefcase', color: 'from-emerald-500 to-teal-500' },
  { id: 'education', name: 'Education', icon: 'GraduationCap', color: 'from-violet-500 to-purple-500' },
  { id: 'sports', name: 'Sports', icon: 'Trophy', color: 'from-orange-500 to-amber-500' },
  { id: 'arts', name: 'Arts & Culture', icon: 'Palette', color: 'from-fuchsia-500 to-pink-500' },
];

export const events: Event[] = [
  {
    id: '1',
    title: 'Neon Nights Music Festival 2025',
    description: 'Experience the ultimate electronic music festival featuring world-renowned DJs, immersive light shows, and three stages of non-stop entertainment. Join thousands of music lovers for an unforgettable night under the stars.',
    shortDescription: 'The ultimate electronic music festival with world-class DJs',
    category: 'music',
    date: '2025-02-15',
    time: '18:00',
    endTime: '02:00',
    location: 'Central Park Arena, New York, NY',
    venue: 'Central Park Arena',
    city: 'New York',
    image: '/placeholder.svg',
    organizer: 'Neon Productions',
    organizerLogo: '/placeholder.svg',
    price: 89,
    currency: 'USD',
    availableTickets: 1247,
    totalTickets: 5000,
    isFeatured: true,
    isOnline: false,
    tags: ['electronic', 'festival', 'outdoor'],
    ticketTiers: [
      { id: 't1', name: 'General Admission', price: 89, description: 'Standard festival access', available: 800, perks: ['Festival access', 'Food vendors access'] },
      { id: 't2', name: 'VIP', price: 199, description: 'Premium experience with perks', available: 300, perks: ['Priority entry', 'VIP lounge access', 'Complimentary drinks', 'Exclusive merch'] },
      { id: 't3', name: 'Backstage Pass', price: 499, description: 'Ultimate experience', available: 50, perks: ['All VIP perks', 'Backstage access', 'Meet & greet opportunity', 'Premium viewing area'] },
    ],
  },
  {
    id: '2',
    title: 'TechVision AI Summit 2025',
    description: 'Join industry leaders and innovators at the premier AI and technology conference. Explore cutting-edge developments, network with experts, and gain insights into the future of artificial intelligence.',
    shortDescription: 'Premier AI conference with industry leaders',
    category: 'tech',
    date: '2025-03-20',
    time: '09:00',
    endTime: '18:00',
    location: 'Moscone Center, San Francisco, CA',
    venue: 'Moscone Center',
    city: 'San Francisco',
    image: '/placeholder.svg',
    organizer: 'TechVision Inc.',
    organizerLogo: '/placeholder.svg',
    price: 349,
    currency: 'USD',
    availableTickets: 523,
    totalTickets: 2000,
    isFeatured: true,
    isOnline: false,
    tags: ['AI', 'technology', 'conference', 'networking'],
    ticketTiers: [
      { id: 't1', name: 'Conference Pass', price: 349, description: 'Full conference access', available: 400, perks: ['All sessions access', 'Lunch included', 'Digital materials'] },
      { id: 't2', name: 'Premium Pass', price: 599, description: 'Enhanced conference experience', available: 100, perks: ['All sessions', 'Workshop access', 'Networking dinner', 'Priority seating'] },
    ],
  },
  {
    id: '3',
    title: 'Startup Founders Masterclass',
    description: 'An intensive workshop series designed for aspiring entrepreneurs. Learn from successful founders, develop your business strategy, and connect with potential investors and mentors.',
    shortDescription: 'Intensive workshop for aspiring entrepreneurs',
    category: 'business',
    date: '2025-02-28',
    time: '10:00',
    endTime: '17:00',
    location: 'Online Event',
    venue: 'Virtual',
    city: 'Online',
    image: '/placeholder.svg',
    organizer: 'Founder Academy',
    organizerLogo: '/placeholder.svg',
    price: 149,
    currency: 'USD',
    availableTickets: 180,
    totalTickets: 200,
    isFeatured: true,
    isOnline: true,
    tags: ['startup', 'entrepreneurship', 'workshop', 'online'],
    ticketTiers: [
      { id: 't1', name: 'Standard', price: 149, description: 'Full workshop access', available: 150, perks: ['Live sessions', 'Q&A participation', 'Recording access'] },
      { id: 't2', name: 'Premium', price: 299, description: 'Enhanced learning experience', available: 30, perks: ['All standard perks', '1-on-1 mentorship session', 'Private community access'] },
    ],
  },
  {
    id: '4',
    title: 'Jazz Under the Stars',
    description: 'An enchanting evening of live jazz performances in an intimate outdoor setting. Featuring acclaimed jazz artists and a curated selection of fine wines and gourmet appetizers.',
    shortDescription: 'Enchanting evening of live jazz performances',
    category: 'music',
    date: '2025-03-05',
    time: '19:00',
    endTime: '23:00',
    location: 'Botanical Gardens, Los Angeles, CA',
    venue: 'Botanical Gardens',
    city: 'Los Angeles',
    image: '/placeholder.svg',
    organizer: 'LA Jazz Society',
    organizerLogo: '/placeholder.svg',
    price: 75,
    currency: 'USD',
    availableTickets: 89,
    totalTickets: 300,
    isFeatured: false,
    isOnline: false,
    tags: ['jazz', 'outdoor', 'intimate'],
    ticketTiers: [
      { id: 't1', name: 'Garden Seating', price: 75, description: 'Open garden seating', available: 60, perks: ['Event access', 'Welcome drink'] },
      { id: 't2', name: 'Premium Table', price: 150, description: 'Reserved table seating', available: 29, perks: ['Reserved table for 2', 'Wine pairing', 'Gourmet appetizers'] },
    ],
  },
  {
    id: '5',
    title: 'Data Science Bootcamp',
    description: 'A comprehensive 3-day bootcamp covering essential data science skills. From Python programming to machine learning, gain hands-on experience with real-world projects.',
    shortDescription: 'Comprehensive 3-day data science bootcamp',
    category: 'education',
    date: '2025-04-10',
    time: '09:00',
    endTime: '17:00',
    location: 'Tech Hub, Austin, TX',
    venue: 'Tech Hub',
    city: 'Austin',
    image: '/placeholder.svg',
    organizer: 'DataLearn Academy',
    organizerLogo: '/placeholder.svg',
    price: 599,
    currency: 'USD',
    availableTickets: 35,
    totalTickets: 50,
    isFeatured: false,
    isOnline: false,
    tags: ['data science', 'python', 'bootcamp', 'education'],
    ticketTiers: [
      { id: 't1', name: 'Full Bootcamp', price: 599, description: 'All 3 days access', available: 35, perks: ['All sessions', 'Course materials', 'Certificate', 'Lunch included'] },
    ],
  },
  {
    id: '6',
    title: 'Championship Basketball Finals',
    description: 'Witness the ultimate showdown as the top teams compete for the championship title. Experience the thrill of live basketball action with passionate fans.',
    shortDescription: 'Ultimate championship basketball showdown',
    category: 'sports',
    date: '2025-03-22',
    time: '19:30',
    endTime: '22:00',
    location: 'Madison Square Garden, New York, NY',
    venue: 'Madison Square Garden',
    city: 'New York',
    image: '/placeholder.svg',
    organizer: 'National Basketball League',
    organizerLogo: '/placeholder.svg',
    price: 125,
    currency: 'USD',
    availableTickets: 2340,
    totalTickets: 8000,
    isFeatured: true,
    isOnline: false,
    tags: ['basketball', 'championship', 'live sports'],
    ticketTiers: [
      { id: 't1', name: 'Upper Bowl', price: 125, description: 'Upper level seating', available: 1500, perks: ['Event access', 'Standard seating'] },
      { id: 't2', name: 'Lower Bowl', price: 275, description: 'Lower level seating', available: 600, perks: ['Premium seating', 'Better views'] },
      { id: 't3', name: 'Courtside', price: 750, description: 'Courtside experience', available: 40, perks: ['Courtside seats', 'VIP lounge', 'Player tunnel access'] },
    ],
  },
  {
    id: '7',
    title: 'Modern Art Exhibition Opening',
    description: 'Be among the first to experience our groundbreaking exhibition featuring contemporary artists from around the world. Includes guided tours and champagne reception.',
    shortDescription: 'Groundbreaking contemporary art exhibition',
    category: 'arts',
    date: '2025-02-20',
    time: '18:00',
    endTime: '22:00',
    location: 'Metropolitan Museum of Art, New York, NY',
    venue: 'Metropolitan Museum of Art',
    city: 'New York',
    image: '/placeholder.svg',
    organizer: 'Met Art Foundation',
    organizerLogo: '/placeholder.svg',
    price: 45,
    currency: 'USD',
    availableTickets: 156,
    totalTickets: 400,
    isFeatured: false,
    isOnline: false,
    tags: ['art', 'exhibition', 'contemporary', 'culture'],
    ticketTiers: [
      { id: 't1', name: 'General Admission', price: 45, description: 'Exhibition access', available: 120, perks: ['Exhibition access', 'Welcome drink'] },
      { id: 't2', name: 'Curator Tour', price: 95, description: 'Guided experience', available: 36, perks: ['Private guided tour', 'Champagne reception', 'Exhibition catalog'] },
    ],
  },
  {
    id: '8',
    title: 'Product Management Workshop',
    description: 'Master the art of product management in this hands-on workshop. Learn frameworks, tools, and strategies used by top product managers at leading tech companies.',
    shortDescription: 'Hands-on product management workshop',
    category: 'education',
    date: '2025-03-15',
    time: '09:00',
    endTime: '16:00',
    location: 'Online Event',
    venue: 'Virtual',
    city: 'Online',
    image: '/placeholder.svg',
    organizer: 'Product School',
    organizerLogo: '/placeholder.svg',
    price: 199,
    currency: 'USD',
    availableTickets: 75,
    totalTickets: 100,
    isFeatured: false,
    isOnline: true,
    tags: ['product management', 'workshop', 'online', 'career'],
    ticketTiers: [
      { id: 't1', name: 'Workshop Access', price: 199, description: 'Full workshop participation', available: 75, perks: ['Live workshop', 'Templates & resources', 'Certificate'] },
    ],
  },
];

export const bookings: Booking[] = [
  {
    id: 'b1',
    eventId: '1',
    event: events[0],
    ticketTier: 'VIP',
    quantity: 2,
    totalPrice: 398,
    status: 'upcoming',
    bookingDate: '2025-01-15',
    ticketCode: 'NNF-2025-VIP-A7X9',
  },
  {
    id: 'b2',
    eventId: '2',
    event: events[1],
    ticketTier: 'Conference Pass',
    quantity: 1,
    totalPrice: 349,
    status: 'upcoming',
    bookingDate: '2025-01-10',
    ticketCode: 'TVS-2025-CNF-B3K2',
  },
  {
    id: 'b3',
    eventId: '4',
    event: events[3],
    ticketTier: 'Premium Table',
    quantity: 1,
    totalPrice: 150,
    status: 'past',
    bookingDate: '2024-12-20',
    ticketCode: 'JZS-2024-PRM-C5M8',
  },
];

export const currentUser: User = {
  id: 'u1',
  name: 'Alex Johnson',
  email: 'alex.johnson@email.com',
  avatar: '/placeholder.svg',
  role: 'user',
};

export const adminUser: User = {
  id: 'a1',
  name: 'Sarah Admin',
  email: 'sarah.admin@eventix.com',
  avatar: '/placeholder.svg',
  role: 'admin',
};

export const testimonials = [
  {
    id: 1,
    name: 'Emily Chen',
    role: 'Event Enthusiast',
    content: 'Eventix made finding and booking events so seamless. The UI is beautiful and the checkout process is incredibly smooth!',
    avatar: '/placeholder.svg',
    rating: 5,
  },
  {
    id: 2,
    name: 'Marcus Williams',
    role: 'Music Lover',
    content: 'I\'ve attended 12 concerts this year, all booked through Eventix. The reminders and digital tickets are game-changers.',
    avatar: '/placeholder.svg',
    rating: 5,
  },
  {
    id: 3,
    name: 'Priya Sharma',
    role: 'Tech Professional',
    content: 'The best event platform I\'ve used. From tech conferences to art exhibitions, everything is curated perfectly.',
    avatar: '/placeholder.svg',
    rating: 5,
  },
];
