"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import {
  Calendar as CalendarIcon,
  CalendarRange,
  CalendarSearch,
  CalendarCheck2,
  CalendarX,
  Wallet,
  CreditCard,
  Component,
  Search,
  Filter,
  UserCheck,
  UserX,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from "lucide-react";

interface Listing {
  id: string;
  title: string;
  type: "companion" | "item";
  price: number;
  description: string;
  shortDescription: string;
  rating: number;
  reviewCount: number;
  location: string;
  category: string;
  availability: "available" | "busy" | "unavailable";
  images: string[];
  host: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    responseTime: string;
  };
  amenities: string[];
  rules: string[];
  minimumDuration: number;
  maximumDuration: number;
}

interface Booking {
  id: string;
  listingId: string;
  listingTitle: string;
  guestName: string;
  hostName: string;
  dates: string;
  status: "pending" | "confirmed" | "rejected" | "completed" | "cancelled";
  amount: number;
  message: string;
  createdAt: string;
  isHost: boolean; // true if current user is the host, false if guest
}

interface Review {
  id: string;
  bookingId: string;
  rating: number;
  comment: string;
  tags: string[];
  author: string;
  date: string;
}

const mockListings: Listing[] = [
  {
    id: "1",
    title: "Professional Photography Companion",
    type: "companion",
    price: 85,
    description: "Experienced photographer available for events, portraits, and special occasions. Professional equipment included.",
    shortDescription: "Professional photographer for hire",
    rating: 4.9,
    reviewCount: 127,
    location: "San Francisco, CA",
    category: "Photography",
    availability: "available",
    images: [
      "https://images.unsplash.com/photo-1554048612-b6a482b224ec?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop"
    ],
    host: {
      id: "host1",
      name: "Alex Chen",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
      rating: 4.8,
      responseTime: "within 1 hour"
    },
    amenities: ["Professional Camera", "Lighting Equipment", "Editing Included"],
    rules: ["48-hour notice required", "Travel fees may apply", "Weather dependent"],
    minimumDuration: 2,
    maximumDuration: 8
  },
  {
    id: "2",
    title: "Vintage Film Camera Collection",
    type: "item",
    price: 45,
    description: "Rare vintage Leica M6 film camera in excellent condition. Perfect for film photography enthusiasts.",
    shortDescription: "Vintage Leica M6 film camera",
    rating: 4.7,
    reviewCount: 43,
    location: "Brooklyn, NY",
    category: "Photography Equipment",
    availability: "available",
    images: [
      "https://images.unsplash.com/photo-1606983340077-94ee6b40d854?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop"
    ],
    host: {
      id: "host2",
      name: "Sarah Kim",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop",
      rating: 4.9,
      responseTime: "within 2 hours"
    },
    amenities: ["Original Case", "Lens Included", "Film Roll Included"],
    rules: ["Security deposit required", "No smoking", "Handle with care"],
    minimumDuration: 1,
    maximumDuration: 7
  }
];

const mockBookings: Booking[] = [
  {
    id: "b1",
    listingId: "1",
    listingTitle: "Professional Photography Companion",
    guestName: "Emma Wilson",
    hostName: "Alex Chen",
    dates: "Dec 15-16, 2024",
    status: "pending",
    amount: 170,
    message: "Need photographer for wedding rehearsal dinner",
    createdAt: "2024-12-12",
    isHost: false
  },
  {
    id: "b2", 
    listingId: "2",
    listingTitle: "Vintage Film Camera Collection",
    guestName: "Mike Johnson",
    hostName: "Sarah Kim",
    dates: "Dec 20-22, 2024",
    status: "confirmed",
    amount: 135,
    message: "Weekend photography project",
    createdAt: "2024-12-10",
    isHost: false
  },
  {
    id: "b3",
    listingId: "1", 
    listingTitle: "Professional Photography Companion",
    guestName: "John Smith",
    hostName: "Alex Chen",
    dates: "Dec 8-9, 2024",
    status: "rejected",
    amount: 170,
    message: "Corporate headshots needed",
    createdAt: "2024-12-05",
    isHost: false
  },
  {
    id: "b4",
    listingId: "2",
    listingTitle: "Vintage Film Camera Collection", 
    guestName: "Lisa Brown",
    hostName: "Current User",
    dates: "Dec 25-27, 2024",
    status: "confirmed",
    amount: 135,
    message: "Holiday family photos",
    createdAt: "2024-12-11",
    isHost: true
  }
];

const mockReviews: Review[] = [
  {
    id: "r1",
    bookingId: "completed1",
    rating: 5,
    comment: "Amazing photographer! Captured our event perfectly.",
    tags: ["Professional", "Punctual", "Creative"],
    author: "Jennifer L.",
    date: "2024-12-01"
  }
];

export default function ListingsAndBooking() {
  const { data: session } = useSession();
  const [activeView, setActiveView] = useState<"listings" | "bookings" | "host">("listings");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showBookingFlow, setShowBookingFlow] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [showWallet, setShowWallet] = useState(false);
  const [showCreateListing, setShowCreateListing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  
  // Enhanced filter states
  const [filters, setFilters] = useState({
    type: "all",
    category: "all", 
    priceRange: [0, 200],
    location: "",
    availability: "all"
  });

  // Booking filters state
  const [bookingFilters, setBookingFilters] = useState({
    status: "all", // all, pending, confirmed, rejected, completed, cancelled
    bookingType: "all", // all, sent (bookings I made), received (bookings I received)
    dateRange: "all", // all, upcoming, past, this_month
    hostName: "",
    searchQuery: ""
  });

  // Data states
  const [listings, setListings] = useState<Listing[]>(mockListings);
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [walletBalance] = useState(1247.50);

  // Fetch data from APIs
  useEffect(() => {
    if (activeView === "listings") {
      fetchListings();
    } else if (activeView === "bookings") {
      fetchBookings();
    }
  }, [activeView]);

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('bearer_token');
      const response = await fetch('/api/posts?postType=service&postType=listing', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      if (response.ok) {
        const data = await response.json();
        // Transform API data to listings format
        const transformedListings = data.map((post: any) => ({
          id: post.id.toString(),
          title: post.content.split('\n')[0] || 'Untitled',
          type: post.isListing ? "item" : "companion",
          price: post.price || 0,
          description: post.content,
          shortDescription: post.content.substring(0, 100) + '...',
          rating: 4.5, // Default rating
          reviewCount: 0,
          location: post.location || 'Location not specified',
          category: post.serviceCategory || 'Other',
          availability: "available",
          images: post.media ? JSON.parse(post.media).map((m: any) => m.url) : [],
          host: {
            id: post.userId.toString(),
            name: 'Host Name', // TODO: Get from user data
            avatar: '',
            rating: 4.5,
            responseTime: 'within 2 hours'
          },
          amenities: post.tags ? JSON.parse(post.tags) : [],
          rules: [],
          minimumDuration: 1,
          maximumDuration: 7
        }));
        setListings([...transformedListings, ...mockListings]);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('bearer_token');
      const response = await fetch('/api/bookings', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      if (response.ok) {
        const data = await response.json();
        // Transform API data to bookings format
        const transformedBookings = data.map((booking: any) => ({
          id: booking.id.toString(),
          listingId: booking.listingId?.toString() || '',
          listingTitle: booking.listingTitle || 'Unknown Listing',
          guestName: booking.guestName || 'Unknown Guest', 
          hostName: booking.hostName || 'Unknown Host',
          dates: booking.checkIn && booking.checkOut ? 
            `${new Date(booking.checkIn).toLocaleDateString()} - ${new Date(booking.checkOut).toLocaleDateString()}` : 
            'Dates not specified',
          status: booking.status,
          amount: booking.totalAmount || 0,
          message: booking.specialRequests || '',
          createdAt: booking.createdAt,
          isHost: booking.isHost || false
        }));
        setBookings([...transformedBookings, ...mockBookings]);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      if (activeView === "listings") {
        // Search listings
        const filteredListings = mockListings.filter(listing =>
          listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          listing.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          listing.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          listing.category.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setListings(filteredListings);
      } else if (activeView === "bookings") {
        // Update booking search filter
        setBookingFilters(prev => ({...prev, searchQuery}));
      }
      toast.success(`Search completed for "${searchQuery}"`);
    } catch (error) {
      toast.error("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, activeView]);

  const handleBookingRequest = useCallback(() => {
    toast.success("Booking request sent successfully!");
    setShowBookingFlow(false);
    setBookingStep(1);
  }, []);

  const handleBookingAction = useCallback((bookingId: string, action: "accept" | "reject") => {
    toast.success(`Booking ${action}ed successfully`);
  }, []);

  // Enhanced booking filtering
  const filteredBookings = bookings.filter(booking => {
    if (bookingFilters.status !== "all" && booking.status !== bookingFilters.status) return false;
    if (bookingFilters.bookingType === "sent" && booking.isHost) return false;
    if (bookingFilters.bookingType === "received" && !booking.isHost) return false;
    if (bookingFilters.hostName && !booking.hostName.toLowerCase().includes(bookingFilters.hostName.toLowerCase())) return false;
    if (bookingFilters.searchQuery && !(
      booking.listingTitle.toLowerCase().includes(bookingFilters.searchQuery.toLowerCase()) ||
      booking.guestName.toLowerCase().includes(bookingFilters.searchQuery.toLowerCase()) ||
      booking.hostName.toLowerCase().includes(bookingFilters.searchQuery.toLowerCase())
    )) return false;
    return true;
  });

  const filteredListings = listings.filter(listing => {
    if (filters.type !== "all" && listing.type !== filters.type) return false;
    if (filters.category !== "all" && listing.category !== filters.category) return false;
    if (listing.price < filters.priceRange[0] || listing.price > filters.priceRange[1]) return false;
    if (filters.location && !listing.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
    if (filters.availability !== "all" && listing.availability !== filters.availability) return false;
    return true;
  });

  const getBookingStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending": return <Clock className="h-4 w-4 text-yellow-600" />;
      case "rejected": return <XCircle className="h-4 w-4 text-red-600" />;
      case "completed": return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case "cancelled": return <AlertCircle className="h-4 w-4 text-gray-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getBookingStatusStats = () => {
    const stats = {
      total: bookings.length,
      pending: bookings.filter(b => b.status === "pending").length,
      confirmed: bookings.filter(b => b.status === "confirmed").length, 
      rejected: bookings.filter(b => b.status === "rejected").length,
      completed: bookings.filter(b => b.status === "completed").length,
      sent: bookings.filter(b => !b.isHost).length,
      received: bookings.filter(b => b.isHost).length
    };
    return stats;
  };

  const ListingCard = ({ listing }: { listing: Listing }) => (
    <Card className="group cursor-pointer transition-all hover:shadow-lg" onClick={() => setSelectedListing(listing)}>
      <div className="aspect-video overflow-hidden rounded-t-lg">
        <img
          src={listing.images[0] || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop"}
          alt={listing.title}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-sm leading-tight">{listing.title}</h3>
          <Badge variant={listing.type === "companion" ? "default" : "secondary"}>
            {listing.type}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-3">{listing.shortDescription}</p>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <span className="text-sm">★</span>
            <span className="text-sm font-medium">{listing.rating}</span>
            <span className="text-xs text-muted-foreground">({listing.reviewCount})</span>
          </div>
          <span className="font-semibold">${listing.price}/day</span>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{listing.location}</span>
          <Badge variant="outline" className={`text-xs ${
            listing.availability === "available" ? "border-green-200 text-green-700" :
            listing.availability === "busy" ? "border-yellow-200 text-yellow-700" :
            "border-red-200 text-red-700"
          }`}>
            {listing.availability}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );

  const ListingDetail = () => (
    <Dialog open={!!selectedListing} onOpenChange={() => setSelectedListing(null)}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {selectedListing && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="aspect-video overflow-hidden rounded-lg">
                  <img
                    src={selectedListing.images[0]}
                    alt={selectedListing.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {selectedListing.images.slice(1).map((image, index) => (
                    <div key={index} className="aspect-video overflow-hidden rounded-lg">
                      <img src={image} alt="" className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-2xl font-bold">{selectedListing.title}</h2>
                    <Badge variant={selectedListing.type === "companion" ? "default" : "secondary"}>
                      {selectedListing.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      <span>★</span>
                      <span className="font-medium">{selectedListing.rating}</span>
                      <span className="text-muted-foreground">({selectedListing.reviewCount} reviews)</span>
                    </div>
                    <span className="text-muted-foreground">{selectedListing.location}</span>
                  </div>
                  <div className="text-3xl font-bold mb-4">${selectedListing.price}<span className="text-base text-muted-foreground">/day</span></div>
                </div>

                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <Avatar>
                    <AvatarImage src={selectedListing.host.avatar} />
                    <AvatarFallback>{selectedListing.host.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{selectedListing.host.name}</div>
                    <div className="text-sm text-muted-foreground">
                      ★ {selectedListing.host.rating} • Responds {selectedListing.host.responseTime}
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => setShowBookingFlow(true)}
                >
                  Book Now
                </Button>
              </div>
            </div>

            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="amenities">Amenities</TabsTrigger>
                <TabsTrigger value="availability">Availability</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="space-y-4">
                <p>{selectedListing.description}</p>
                <div>
                  <h4 className="font-semibold mb-2">Rules</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {selectedListing.rules.map((rule, index) => (
                      <li key={index}>• {rule}</li>
                    ))}
                  </ul>
                </div>
              </TabsContent>
              
              <TabsContent value="amenities">
                <div className="grid grid-cols-2 gap-2">
                  {selectedListing.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Component className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{amenity}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="availability">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Minimum duration: {selectedListing.minimumDuration} day(s)</span>
                    <span className="text-sm font-medium">Maximum duration: {selectedListing.maximumDuration} day(s)</span>
                  </div>
                  <Calendar mode="multiple" className="rounded-md border" />
                </div>
              </TabsContent>
              
              <TabsContent value="reviews">
                <div className="space-y-4">
                  {mockReviews.map((review) => (
                    <div key={review.id} className="space-y-2 p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{review.author}</span>
                          <span className="text-sm text-muted-foreground">{review.date}</span>
                        </div>
                        <div className="flex">
                          {Array.from({ length: 5 }, (_, i) => (
                            <span key={i} className={i < review.rating ? "text-yellow-400" : "text-gray-300"}>★</span>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm">{review.comment}</p>
                      <div className="flex gap-2">
                        {review.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  const BookingFlow = () => (
    <Dialog open={showBookingFlow} onOpenChange={setShowBookingFlow}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Book {selectedListing?.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= bookingStep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    {step}
                  </div>
                  {step < 4 && <div className={`w-8 h-0.5 ${step < bookingStep ? "bg-primary" : "bg-muted"}`} />}
                </div>
              ))}
            </div>
          </div>

          {bookingStep === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Request Details</h3>
              <div className="space-y-4">
                <div>
                  <Label>Select Dates</Label>
                  <Calendar mode="range" className="rounded-md border mt-2" />
                </div>
                <div>
                  <Label htmlFor="message">Message to Host</Label>
                  <Textarea 
                    id="message"
                    placeholder="Tell the host about your needs..."
                    value={bookingData.message}
                    onChange={(e) => setBookingData({...bookingData, message: e.target.value})}
                  />
                </div>
                <Button onClick={() => setBookingStep(2)} className="w-full">
                  Continue to Review
                </Button>
              </div>
            </div>
          )}

          {bookingStep === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Host Decision</h3>
              <div className="p-4 border rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-4">
                  Your request has been sent to the host. They typically respond within {selectedListing?.host.responseTime}.
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      toast.success("Booking accepted!");
                      setBookingStep(3);
                    }}
                  >
                    Simulate Accept
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      toast.error("Booking rejected");
                      setShowBookingFlow(false);
                      setBookingStep(1);
                    }}
                  >
                    Simulate Reject
                  </Button>
                </div>
              </div>
            </div>
          )}

          {bookingStep === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Payment</h3>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span>Subtotal (2 days)</span>
                    <span>${selectedListing?.price ? selectedListing.price * 2 : 0}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span>Service fee</span>
                    <span>$15</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span>Taxes</span>
                    <span>$12</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between items-center font-semibold">
                    <span>Total</span>
                    <span>${selectedListing?.price ? selectedListing.price * 2 + 27 : 27}</span>
                  </div>
                </div>

                <div>
                  <Label>Payment Method</Label>
                  <Select value={bookingData.paymentMethod} onValueChange={(value) => setBookingData({...bookingData, paymentMethod: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="card">Credit Card</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="wallet">Wallet Balance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {bookingData.paymentMethod === "card" && (
                  <div className="space-y-3">
                    <Input placeholder="Card Number" />
                    <div className="grid grid-cols-2 gap-3">
                      <Input placeholder="MM/YY" />
                      <Input placeholder="CVC" />
                    </div>
                    <Input placeholder="Cardholder Name" />
                  </div>
                )}

                <Button onClick={() => setBookingStep(4)} className="w-full">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay Now
                </Button>
              </div>
            </div>
          )}

          {bookingStep === 4 && (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CalendarCheck2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-xl">Booking Confirmed!</h3>
              <p className="text-muted-foreground">
                Your booking request has been confirmed. You'll receive a confirmation email shortly.
              </p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" size="sm">Add to Google Calendar</Button>
                <Button variant="outline" size="sm">Add to Apple Calendar</Button>
              </div>
              <Button onClick={handleBookingRequest} className="w-full">
                Done
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );

  const WalletPanel = () => (
    <Dialog open={showWallet} onOpenChange={setShowWallet}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Wallet & Payouts</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Available Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${walletBalance.toFixed(2)}</div>
              <div className="flex gap-2 mt-4">
                <Button size="sm">Withdraw</Button>
                <Button size="sm" variant="outline">Add Funds</Button>
              </div>
            </CardContent>
          </Card>

          <div>
            <h3 className="font-semibold mb-3">Recent Transactions</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <div className="font-medium">Booking Payment</div>
                  <div className="text-sm text-muted-foreground">Dec 10, 2024</div>
                </div>
                <div className="text-green-600 font-medium">+$157.50</div>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <div className="font-medium">Platform Fee</div>
                  <div className="text-sm text-muted-foreground">Dec 10, 2024</div>
                </div>
                <div className="text-red-600 font-medium">-$12.50</div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  const BookingFilters = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Booking Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Status</Label>
          <Select value={bookingFilters.status} onValueChange={(value) => setBookingFilters({...bookingFilters, status: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Booking Type</Label>
          <Select value={bookingFilters.bookingType} onValueChange={(value) => setBookingFilters({...bookingFilters, bookingType: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Bookings</SelectItem>
              <SelectItem value="sent">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  Who You Booked
                </div>
              </SelectItem>
              <SelectItem value="received">
                <div className="flex items-center gap-2">
                  <UserX className="h-4 w-4" />
                  Who Booked You
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Host/Guest Name</Label>
          <Input
            placeholder="Search by name..."
            value={bookingFilters.hostName}
            onChange={(e) => setBookingFilters({...bookingFilters, hostName: e.target.value})}
          />
        </div>

        <div>
          <Label>Date Range</Label>
          <Select value={bookingFilters.dateRange} onValueChange={(value) => setBookingFilters({...bookingFilters, dateRange: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="past">Past</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => setBookingFilters({
            status: "all",
            bookingType: "all", 
            dateRange: "all",
            hostName: "",
            searchQuery: ""
          })}
        >
          Clear Filters
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header with Primary Search */}
        <div className="space-y-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold">Listings & Bookings</h1>
              <Tabs value={activeView} onValueChange={(value) => setActiveView(value as "listings" | "bookings" | "host")}>
                <TabsList>
                  <TabsTrigger value="listings">Browse Listings</TabsTrigger>
                  <TabsTrigger value="bookings">My Bookings</TabsTrigger>
                  <TabsTrigger value="host">Host Tools</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setShowWallet(true)}>
                <Wallet className="w-4 h-4 mr-2" />
                Wallet
              </Button>
              {activeView === "host" && (
                <Button onClick={() => setShowCreateListing(true)}>
                  Create Listing
                </Button>
              )}
            </div>
          </div>

          {/* Primary Search Bar */}
          <Card className="p-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder={
                    activeView === "listings" 
                      ? "Search listings, locations, categories..." 
                      : activeView === "bookings"
                      ? "Search bookings, hosts, guests..."
                      : "Search your listings..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="text-base"
                />
              </div>
              <Button 
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="px-8"
              >
                {isSearching ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                Search
              </Button>
            </div>
          </Card>
        </div>

        {activeView === "listings" && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarSearch className="w-5 h-5" />
                    Filters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Type</Label>
                    <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="companion">Companions</SelectItem>
                        <SelectItem value="item">Items</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Category</Label>
                    <Select value={filters.category} onValueChange={(value) => setFilters({...filters, category: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="Photography">Photography</SelectItem>
                        <SelectItem value="Photography Equipment">Equipment</SelectItem>
                        <SelectItem value="Events">Events</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Price Range</Label>
                    <div className="mt-2">
                      <Slider
                        value={filters.priceRange}
                        onValueChange={(value) => setFilters({...filters, priceRange: value})}
                        max={200}
                        step={10}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground mt-1">
                        <span>${filters.priceRange[0]}</span>
                        <span>${filters.priceRange[1]}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Location</Label>
                    <Input
                      placeholder="Enter city or area"
                      value={filters.location}
                      onChange={(e) => setFilters({...filters, location: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label>Availability</Label>
                    <Select value={filters.availability} onValueChange={(value) => setFilters({...filters, availability: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="busy">Busy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Listings Grid */}
            <div className="lg:col-span-3">
              <div className="flex justify-between items-center mb-4">
                <span className="text-muted-foreground">
                  {filteredListings.length} listings found
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    Grid
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    List
                  </Button>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading listings...</span>
                </div>
              ) : (
                <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" : "space-y-4"}>
                  {filteredListings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeView === "bookings" && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Booking Filters Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              <BookingFilters />
              
              {/* Booking Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Booking Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(() => {
                    const stats = getBookingStatusStats();
                    return (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm">Total Bookings</span>
                          <span className="font-medium">{stats.total}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Pending</span>
                          <span className="font-medium text-yellow-600">{stats.pending}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Confirmed</span>
                          <span className="font-medium text-green-600">{stats.confirmed}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Rejected</span>
                          <span className="font-medium text-red-600">{stats.rejected}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                          <span className="text-sm">You Booked</span>
                          <span className="font-medium">{stats.sent}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Booked You</span>
                          <span className="font-medium">{stats.received}</span>
                        </div>
                      </>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>

            {/* Bookings List */}
            <div className="lg:col-span-3">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    {filteredBookings.length} bookings found
                  </span>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Loading bookings...</span>
                  </div>
                ) : filteredBookings.length === 0 ? (
                  <Card className="p-8 text-center">
                    <CalendarX className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
                    <p className="text-muted-foreground">
                      {bookingFilters.status === "all" && bookingFilters.bookingType === "all"
                        ? "You don't have any bookings yet. Start by browsing listings!"
                        : "No bookings match your current filters. Try adjusting your search criteria."
                      }
                    </p>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {filteredBookings.map((booking) => (
                      <Card key={booking.id}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              {getBookingStatusIcon(booking.status)}
                              <div>
                                <h3 className="font-semibold">{booking.listingTitle}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {booking.isHost ? `Guest: ${booking.guestName}` : `Host: ${booking.hostName}`}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant={
                                booking.status === "confirmed" ? "default" :
                                booking.status === "pending" ? "secondary" :
                                booking.status === "completed" ? "outline" : "destructive"
                              }>
                                {booking.status}
                              </Badge>
                              <p className="text-sm text-muted-foreground mt-1">
                                {booking.isHost ? "As Host" : "As Guest"}
                              </p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Dates</p>
                              <p className="font-medium">{booking.dates}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Amount</p>
                              <p className="font-medium">${booking.amount}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Booked</p>
                              <p className="font-medium">{new Date(booking.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Actions</p>
                              <div className="flex gap-1">
                                {booking.status === "pending" && booking.isHost && (
                                  <>
                                    <Button size="sm" onClick={() => handleBookingAction(booking.id, "accept")}>
                                      Accept
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => handleBookingAction(booking.id, "reject")}>
                                      Reject
                                    </Button>
                                  </>
                                )}
                                {booking.status === "confirmed" && (
                                  <Button size="sm" variant="outline">
                                    Contact
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {booking.message && (
                            <div className="mt-4 p-3 bg-muted rounded-lg">
                              <p className="text-sm"><strong>Message:</strong> {booking.message}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeView === "host" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Active Listings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2</div>
                  <p className="text-sm text-muted-foreground">Items available</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Pending Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1</div>
                  <p className="text-sm text-muted-foreground">Awaiting response</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>This Month's Earnings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$1,247</div>
                  <p className="text-sm text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Booking Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Guest</TableHead>
                      <TableHead>Listing</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.filter(b => b.isHost).map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">{booking.guestName}</TableCell>
                        <TableCell>{booking.listingTitle}</TableCell>
                        <TableCell>{booking.dates}</TableCell>
                        <TableCell>${booking.amount}</TableCell>
                        <TableCell>
                          <Badge variant={
                            booking.status === "confirmed" ? "default" :
                            booking.status === "pending" ? "secondary" :
                            booking.status === "completed" ? "outline" : "destructive"
                          }>
                            {booking.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {booking.status === "pending" && (
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                onClick={() => handleBookingAction(booking.id, "accept")}
                              >
                                Accept
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleBookingAction(booking.id, "reject")}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarRange className="w-5 h-5" />
                  Availability Calendar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch id="auto-accept" />
                      <Label htmlFor="auto-accept">Auto-accept bookings</Label>
                    </div>
                    <Button variant="outline" size="sm">
                      Set Bulk Availability
                    </Button>
                  </div>
                  <Calendar mode="multiple" className="rounded-md border" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Create/Edit Listing Modal */}
        <Dialog open={showCreateListing} onOpenChange={setShowCreateListing}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Listing</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="What are you listing?" />
              </div>
              
              <div>
                <Label htmlFor="type">Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="companion">Companion Service</SelectItem>
                    <SelectItem value="item">Item Rental</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Describe your listing..." rows={4} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Daily Price ($)</Label>
                  <Input id="price" type="number" placeholder="0" />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="photography">Photography</SelectItem>
                      <SelectItem value="equipment">Equipment</SelectItem>
                      <SelectItem value="events">Events</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Duration Limits</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <Label htmlFor="min-duration">Minimum (days)</Label>
                    <Input id="min-duration" type="number" placeholder="1" />
                  </div>
                  <div>
                    <Label htmlFor="max-duration">Maximum (days)</Label>
                    <Input id="max-duration" type="number" placeholder="7" />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateListing(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  toast.success("Listing created successfully!");
                  setShowCreateListing(false);
                }}>
                  Create Listing
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modals */}
        <ListingDetail />
        <BookingFlow />
        <WalletPanel />
      </div>
    </div>
  );
}