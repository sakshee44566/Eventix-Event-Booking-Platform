import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Grid3X3, List, SlidersHorizontal, X, MapPin, 
  Calendar, DollarSign, ChevronDown 
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { EventCard } from '@/components/events/EventCard';
import { CategoryCard } from '@/components/events/CategoryCard';
import { events, categories } from '@/lib/data';

type ViewMode = 'grid' | 'list';

const cities = ['New York', 'San Francisco', 'Los Angeles', 'Austin', 'Online'];

export default function Events() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortBy, setSortBy] = useState('date');
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  const filteredEvents = useMemo(() => {
    let result = events;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(query) ||
          e.description.toLowerCase().includes(query) ||
          e.venue.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      result = result.filter((e) => selectedCategories.includes(e.category));
    }

    // City filter
    if (selectedCity) {
      if (selectedCity === 'Online') {
        result = result.filter((e) => e.isOnline);
      } else {
        result = result.filter((e) => e.city === selectedCity);
      }
    }

    // Price filter
    result = result.filter((e) => e.price >= priceRange[0] && e.price <= priceRange[1]);

    // Online only filter
    if (showOnlineOnly) {
      result = result.filter((e) => e.isOnline);
    }

    // Sort
    switch (sortBy) {
      case 'date':
        result = [...result].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'price-low':
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case 'popularity':
        result = [...result].sort((a, b) => (b.totalTickets - b.availableTickets) - (a.totalTickets - a.availableTickets));
        break;
    }

    return result;
  }, [searchQuery, selectedCategories, selectedCity, priceRange, sortBy, showOnlineOnly]);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((c) => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedCity('');
    setPriceRange([0, 1000]);
    setShowOnlineOnly(false);
  };

  const activeFiltersCount = [
    selectedCategories.length > 0,
    selectedCity !== '',
    priceRange[0] > 0 || priceRange[1] < 1000,
    showOnlineOnly,
  ].filter(Boolean).length;

  const categoryEventCounts = categories.map((cat) => ({
    ...cat,
    count: events.filter((e) => e.category === cat.id).length,
  }));

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-hero py-16">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center mb-10"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Explore Events</h1>
            <p className="text-muted-foreground text-lg">
              Discover amazing experiences happening near you and around the world
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-3xl mx-auto"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search events, artists, venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-base bg-background border-border shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Quick Filter */}
      <section className="py-8 border-b border-border">
        <div className="container">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categoryEventCounts.map((category) => (
              <button
                key={category.id}
                onClick={() => toggleCategory(category.id)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategories.includes(category.id)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {category.name}
                <span className="ml-1.5 text-xs opacity-70">({category.count})</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Desktop Filters Sidebar */}
            <aside className="hidden lg:block w-72 shrink-0">
              <div className="sticky top-24 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Filters</h3>
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-primary hover:underline"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Location Filter */}
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Location
                  </label>
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger>
                      <SelectValue placeholder="All locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All locations</SelectItem>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Filter */}
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    Price Range
                  </label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    min={0}
                    max={1000}
                    step={10}
                    className="my-4"
                  />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}+</span>
                  </div>
                </div>

                {/* Category Filter */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Categories</label>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <label
                        key={category.id}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <Checkbox
                          checked={selectedCategories.includes(category.id)}
                          onCheckedChange={() => toggleCategory(category.id)}
                        />
                        <span className="text-sm">{category.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Online Only Filter */}
                <div className="pt-4 border-t border-border">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <Checkbox
                      checked={showOnlineOnly}
                      onCheckedChange={(checked) => setShowOnlineOnly(checked as boolean)}
                    />
                    <span className="text-sm font-medium">Online events only</span>
                  </label>
                </div>
              </div>
            </aside>

            {/* Events Grid */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <p className="text-sm text-muted-foreground">
                    Showing <span className="font-medium text-foreground">{filteredEvents.length}</span> events
                  </p>
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary">
                      {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* Mobile Filters */}
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="lg:hidden">
                        <SlidersHorizontal className="h-4 w-4 mr-2" />
                        Filters
                        {activeFiltersCount > 0 && (
                          <Badge variant="default" className="ml-2">
                            {activeFiltersCount}
                          </Badge>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80">
                      <SheetHeader>
                        <SheetTitle>Filters</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6 space-y-6">
                        {/* Same filters as sidebar */}
                        <div className="space-y-3">
                          <label className="text-sm font-medium">Location</label>
                          <Select value={selectedCity} onValueChange={setSelectedCity}>
                            <SelectTrigger>
                              <SelectValue placeholder="All locations" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All locations</SelectItem>
                              {cities.map((city) => (
                                <SelectItem key={city} value={city}>{city}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-3">
                          <label className="text-sm font-medium">Price Range</label>
                          <Slider
                            value={priceRange}
                            onValueChange={setPriceRange}
                            min={0}
                            max={1000}
                            step={10}
                          />
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>${priceRange[0]}</span>
                            <span>${priceRange[1]}+</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="text-sm font-medium">Categories</label>
                          <div className="space-y-2">
                            {categories.map((category) => (
                              <label key={category.id} className="flex items-center gap-3 cursor-pointer">
                                <Checkbox
                                  checked={selectedCategories.includes(category.id)}
                                  onCheckedChange={() => toggleCategory(category.id)}
                                />
                                <span className="text-sm">{category.name}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <Button onClick={clearFilters} variant="outline" className="w-full">
                          Clear all filters
                        </Button>
                      </div>
                    </SheetContent>
                  </Sheet>

                  {/* Sort */}
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="popularity">Popularity</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* View Toggle */}
                  <div className="flex border border-border rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Events */}
              {filteredEvents.length > 0 ? (
                <div className={`grid gap-6 ${viewMode === 'grid' ? 'md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                  {filteredEvents.map((event, idx) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <EventCard event={event} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No events found</h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your filters or search query
                  </p>
                  <Button onClick={clearFilters} variant="outline">
                    Clear all filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}