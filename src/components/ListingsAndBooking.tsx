"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "@/lib/auth-client";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  Filter, 
  Star, 
  Heart, 
  MapPin, 
  Calendar as CalendarIcon, 
  Clock,
  ChevronDown,
  ChevronUp,
  Grid3X3,
  Map,
  SlidersHorizontal,
  User,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

interface Service {
  id: string;
  title: string;
  description: string;
  images: string[];
  price: number;
  priceUnit: "hour" | "day" | "session";
  category: string;
  location: string;
  distance?: number;
  rating: number;
  reviewCount: number;
  host: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
  };
  isAvailable: boolean;
  isFavorite: boolean;
  availableDates: Date[];
}

interface Booking {
  id: string;
  serviceId: string;
  serviceName: string;
  serviceImage: string;
  hostName: string;
  date: Date;
  duration: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "rejected";
  createdAt: Date;
}

interface Filters {
  location: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  minRating: number;
  availability: string;
  sortBy: "price" | "rating" | "distance" | "newest";
}

const CATEGORIES = [
  "All Categories",
  "Life Coaching",
  "Professional Skills",
  "Creative Arts",
  "Fitness & Wellness",
  "Cooking & Culinary",
  "Language Learning",
  "Music & Performance",
  "Technology",
  "Business Mentoring"
];

export const ListingsAndBooking = () => {
  const { data: session, isPending } = useSession();
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookingDate, setBookingDate] = useState<Date | undefined>(undefined);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [activeTab, setActiveTab] = useState("listings");
  
  const [filters, setFilters] = useState<Filters>({
    location: "",
    category: "All Categories",
    minPrice: 0,
    maxPrice: 1000,
    minRating: 0,
    availability: "all",
    sortBy: "rating"
  });

  // Create Service form state
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    priceUnit: "hour" as "hour" | "day" | "session",
    location: "",
    images: ""
  });

  const authHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('bearer_token') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Load from API
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // Services (public)
        const svcRes = await fetch(`/api/services`);
        const svcJson = await svcRes.json();
        const normalizedServices: Service[] = (Array.isArray(svcJson) ? svcJson : []).map((s: any) => {
          const images = typeof s.images === 'string' ? JSON.parse(s.images || '[]') : (s.images || []);
          const availableDatesRaw = typeof s.availableDates === 'string' ? JSON.parse(s.availableDates || '[]') : (s.availableDates || []);
          const availableDates: Date[] = (availableDatesRaw || []).map((d: string) => new Date(d));
          return {
            id: String(s.id),
            title: s.title,
            description: s.description,
            images,
            price: s.price,
            priceUnit: s.priceUnit || 'hour',
            category: s.category || 'General',
            location: s.location || '—',
            distance: undefined,
            rating: s.owner?.rating ?? 0,
            reviewCount: 0,
            host: { id: s.owner?.id || '', name: s.owner?.name || 'Host', avatar: images?.[0] || '/placeholder.svg', rating: s.owner?.rating ?? 0 },
            isAvailable: Boolean(s.isAvailable),
            isFavorite: false,
            availableDates,
          } as Service;
        });
        setServices(normalizedServices);

        // Bookings (auth)
        if (session?.user) {
          const bRes = await fetch(`/api/bookings`, { headers: { 'Content-Type': 'application/json', ...authHeaders() } });
          if (bRes.ok) {
            const bJson = await bRes.json();
            const normalizedBookings: Booking[] = (Array.isArray(bJson) ? bJson : []).map((b: any) => ({
              id: String(b.id),
              serviceId: String(b.serviceId),
              serviceName: b.service?.title || 'Service',
              serviceImage: (typeof b.service?.images === 'string' ? (JSON.parse(b.service.images)[0] || '/placeholder.svg') : '/placeholder.svg'),
              hostName: b.service?.owner?.name || 'Host',
              date: new Date(b.date),
              duration: b.durationHours,
              totalPrice: b.totalPrice,
              status: b.status,
              createdAt: new Date(b.createdAt)
            }));
            setBookings(normalizedBookings);
          }
        } else {
          setBookings([]);
        }
      } catch (e) {
        console.error(e);
        toast.error('Failed to load listings.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [session]);

  // Filter and sort services
  const filteredServices = useCallback(() => {
    let filtered = services.filter(service => {
      const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           service.host.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLocation = !filters.location || service.location.toLowerCase().includes(filters.location.toLowerCase());
      const matchesCategory = filters.category === "All Categories" || service.category === filters.category;
      const matchesPrice = service.price >= filters.minPrice && service.price <= filters.maxPrice;
      const matchesRating = service.rating >= filters.minRating;
      const matchesAvailability = filters.availability === "all" || 
                                 (filters.availability === "available" && service.isAvailable) ||
                                 (filters.availability === "unavailable" && !service.isAvailable);
      return matchesSearch && matchesLocation && matchesCategory && matchesPrice && matchesRating && matchesAvailability;
    });
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "price":
          return a.price - b.price;
        case "rating":
          return b.rating - a.rating;
        case "distance":
          return (a.distance || 0) - (b.distance || 0);
        case "newest":
          return 0;
        default:
          return 0;
      }
    });
    return filtered;
  }, [services, searchQuery, filters]);

  const toggleFavorite = useCallback(async (serviceId: string) => {
    if (!session?.user) {
      toast.error("Please sign in to save favorites");
      return;
    }
    try {
      const res = await fetch(`/api/services/${serviceId}/favorite`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() } });
      if (!res.ok) throw new Error('Favorite toggle failed');
      setServices(prev => prev.map(s => s.id === serviceId ? { ...s, isFavorite: !s.isFavorite } : s));
    } catch {
      toast.error('Could not update favorite');
    }
  }, [session]);

  const handleBooking = useCallback(async (service: Service, date: Date) => {
    if (!session?.user) {
      toast.error("Please sign in to make a booking");
      return;
    }
    if (!date) {
      toast.error("Please select a date");
      return;
    }
    try {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      const payload = { serviceId: Number(service.id), date: `${yyyy}-${mm}-${dd}`, durationHours: 1 };
      const res = await fetch(`/api/bookings`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(payload) });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Booking failed');
      }
      toast.success('Booking request sent!');
      setSelectedService(null);
      setBookingDate(undefined);
      // refresh bookings
      const bRes = await fetch(`/api/bookings`, { headers: { 'Content-Type': 'application/json', ...authHeaders() } });
      if (bRes.ok) {
        const bJson = await bRes.json();
        const normalizedBookings: Booking[] = (Array.isArray(bJson) ? bJson : []).map((b: any) => ({
          id: String(b.id),
          serviceId: String(b.serviceId),
          serviceName: b.service?.title || 'Service',
          serviceImage: '/placeholder.svg',
          hostName: b.service?.owner?.name || 'Host',
          date: new Date(b.date),
          duration: b.durationHours,
          totalPrice: b.totalPrice,
          status: b.status,
          createdAt: new Date(b.createdAt)
        }));
        setBookings(normalizedBookings);
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to create booking');
    }
  }, [session]);

  const submitService = async () => {
    if (!session?.user) { toast.error("Please sign in to post a service"); return; }
    if (!form.title.trim() || !form.description.trim() || !form.price) {
      toast.error("Title, description, and price are required");
      return;
    }
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category.trim() || null,
        price: Number(form.price),
        priceUnit: form.priceUnit,
        location: form.location.trim() || null,
        images: form.images
          ? form.images.split(',').map(s => s.trim()).filter(Boolean)
          : [],
        availableDates: []
      };
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to create service');
      toast.success('Service posted');
      setCreateOpen(false);
      setForm({ title: "", description: "", category: "", price: "", priceUnit: "hour", location: "", images: "" });
      // refresh services
      const svcRes = await fetch(`/api/services`);
      const svcJson = await svcRes.json();
      const normalizedServices: Service[] = (Array.isArray(svcJson) ? svcJson : []).map((s: any) => {
        const images = typeof s.images === 'string' ? JSON.parse(s.images || '[]') : (s.images || []);
        const availableDatesRaw = typeof s.availableDates === 'string' ? JSON.parse(s.availableDates || '[]') : (s.availableDates || []);
        const availableDates: Date[] = (availableDatesRaw || []).map((d: string) => new Date(d));
        return {
          id: String(s.id),
          title: s.title,
          description: s.description,
          images,
          price: s.price,
          priceUnit: s.priceUnit || 'hour',
          category: s.category || 'General',
          location: s.location || '—',
          distance: undefined,
          rating: s.owner?.rating ?? 0,
          reviewCount: 0,
          host: { id: s.owner?.id || '', name: s.owner?.name || 'Host', avatar: images?.[0] || '/placeholder.svg', rating: s.owner?.rating ?? 0 },
          isAvailable: Boolean(s.isAvailable),
          isFavorite: false,
          availableDates,
        } as Service;
      });
      setServices(normalizedServices);
    } catch (e: any) {
      toast.error(e.message || 'Failed to post service');
    }
  };

  const getBookingStatusIcon = (status: Booking["status"]) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "cancelled":
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getBookingStatusColor = (status: Booking["status"]) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "cancelled":
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  if (isPending || loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardHeader className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Discover Experiences</h1>
          <p className="text-muted-foreground">Find and book unique life experiences from talented hosts</p>
        </div>
        
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 lg:flex-none">
            <TabsList>
              <TabsTrigger value="listings">Browse Services</TabsTrigger>
              <TabsTrigger value="bookings">My Bookings</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Post Service */}
          {session?.user && (
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button className="whitespace-nowrap">Post a Service</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create Service</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Title*</label>
                    <Input value={form.title} onChange={(e) => setForm(f => ({...f, title: e.target.value}))} placeholder="e.g. Wedding Photography" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description*</label>
                    <Input value={form.description} onChange={(e) => setForm(f => ({...f, description: e.target.value}))} placeholder="Describe your service" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium">Category</label>
                      <Input value={form.category} onChange={(e) => setForm(f => ({...f, category: e.target.value}))} placeholder="e.g. Photography" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Location</label>
                      <Input value={form.location} onChange={(e) => setForm(f => ({...f, location: e.target.value}))} placeholder="City, State" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium">Price*</label>
                      <Input type="number" value={form.price} onChange={(e) => setForm(f => ({...f, price: e.target.value}))} placeholder="e.g. 150" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Price Unit</label>
                      <Select value={form.priceUnit} onValueChange={(v: any) => setForm(f => ({...f, priceUnit: v}))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hour">Hour</SelectItem>
                          <SelectItem value="day">Day</SelectItem>
                          <SelectItem value="session">Session</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Images (comma separated URLs)</label>
                    <Input value={form.images} onChange={(e) => setForm(f => ({...f, images: e.target.value}))} placeholder="https://... , https://..." />
                  </div>
                  <Button className="w-full" onClick={submitService}>Create</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <TabsContent value="listings" className="space-y-6">
        {/* Search and Filter Bar */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search experiences, hosts, or locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {showAdvancedFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            
            <div className="flex rounded-md border">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "map" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("map")}
                className="rounded-l-none"
              >
                <Map className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        <Collapsible open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
          <CollapsibleContent className="space-y-4">
            <Card className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <Input
                    placeholder="Enter location"
                    value={filters.location}
                    onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price Range</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice || ""}
                      onChange={(e) => setFilters(prev => ({ ...prev, minPrice: Number(e.target.value) || 0 }))}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice || ""}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) || 1000 }))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sort By</label>
                  <Select value={filters.sortBy} onValueChange={(value: any) => setFilters(prev => ({ ...prev, sortBy: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="price">Lowest Price</SelectItem>
                      <SelectItem value="distance">Nearest</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        {/* Results Count */}
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">
            {filteredServices().length} experience{filteredServices().length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Services Grid */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices().length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="text-muted-foreground">
                  <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No experiences found</h3>
                  <p>Try adjusting your search criteria or filters</p>
                </div>
              </div>
            ) : (
              filteredServices().map((service) => (
                <Card key={service.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
                  <div className="relative">
                    <img
                      src={service.images[0]}
                      alt={service.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                      onClick={() => toggleFavorite(service.id)}
                    >
                      <Heart className={`h-4 w-4 ${service.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                    </Button>
                    {!service.isAvailable && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Badge variant="secondary">Unavailable</Badge>
                      </div>
                    )}
                  </div>
                  
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold line-clamp-2 flex-1">{service.title}</h3>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{service.rating}</span>
                        <span className="text-muted-foreground">({service.reviewCount})</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={service.host.avatar} alt={service.host.name} />
                        <AvatarFallback>{service.host.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">{service.host.name}</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{service.category}</Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{service.distance?.toFixed(1)} mi</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold">
                        ${service.price}
                        <span className="text-sm font-normal text-muted-foreground">/{service.priceUnit}</span>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          className="w-full" 
                          disabled={!service.isAvailable}
                          onClick={() => setSelectedService(service)}
                        >
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          Book Experience
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Book "{selectedService?.title}"</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">Select Date</label>
                            <Calendar
                              mode="single"
                              selected={bookingDate}
                              onSelect={setBookingDate}
                              disabled={(date) => {
                                if (!selectedService?.availableDates?.length) return date < new Date();
                                const svcDates = selectedService.availableDates.map(d => new Date(d.getFullYear(), d.getMonth(), d.getDate()).toDateString());
                                const day = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toDateString();
                                return date < new Date() || !svcDates.includes(day);
                              }}
                              className="w-full"
                            />
                          </div>
                          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <span>Total Price:</span>
                            <span className="font-bold">${selectedService?.price}</span>
                          </div>
                          <Button 
                            className="w-full" 
                            onClick={() => selectedService && bookingDate && handleBooking(selectedService, bookingDate)}
                            disabled={!bookingDate}
                          >
                            Confirm Booking
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Map View Placeholder */}
        {viewMode === "map" && (
          <Card className="h-96">
            <CardContent className="h-full flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Map className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Map View</h3>
                <p>Interactive map would be integrated here</p>
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="bookings" className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">My Bookings</h2>
          <Select defaultValue="all">
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Bookings</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          {bookings.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No bookings yet</h3>
                <p className="text-muted-foreground mb-4">Start exploring experiences to make your first booking</p>
                <Button onClick={() => setActiveTab("listings")}>Browse Experiences</Button>
              </CardContent>
            </Card>
          ) : (
            bookings.map((booking) => (
              <Card key={booking.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <img
                      src={booking.serviceImage}
                      alt={booking.serviceName}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{booking.serviceName}</h3>
                          <p className="text-sm text-muted-foreground">with {booking.hostName}</p>
                        </div>
                        <Badge className={getBookingStatusColor(booking.status)}>
                          <div className="flex items-center gap-1">
                            {getBookingStatusIcon(booking.status)}
                            <span className="capitalize">{booking.status}</span>
                          </div>
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4" />
                          <span>{booking.date.toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{booking.duration} hour{booking.duration > 1 ? 's' : ''}</span>
                        </div>
                        <div className="font-medium text-foreground">
                          ${booking.totalPrice}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </TabsContent>
    </div>
  );
};