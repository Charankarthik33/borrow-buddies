"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from '@/lib/auth-client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Users,
  MapPin,
  Heart,
  MessageCircle,
  UserPlus,
  Eye,
  RefreshCw,
  Contacts,
  Navigation,
  Briefcase,
  Clock,
  Shield,
  CheckCircle,
  Star,
  Filter,
  Target,
  Zap,
  TrendingUp,
  Globe,
  Search,
  SlidersHorizontal,
  UserCheck,
  Calendar,
  Camera,
  Music,
  Utensils,
  Dumbbell,
  BookOpen,
  Laptop,
  Palette,
  Home as HomeIcon,
  Car,
  Scissors
} from 'lucide-react';

interface SuggestedUser {
  id: string;
  name: string;
  avatar?: string;
  location?: {
    city: string;
    distance?: number;
    coordinates?: [number, number];
  };
  bio?: string;
  profession?: string;
  interests: string[];
  mutualConnections: number;
  trustScore: number;
  isVerified: boolean;
  isFromContacts: boolean;
  lastActive: string;
  compatibility: number;
  commonInterests: string[];
  services?: string[];
  rating?: number;
  responseTime?: string;
  isActive?: boolean;
  recentInteractions?: Array<{ type: string; timestamp: Date }>;
}

interface SuggestedUsersProps {
  variant?: "sidebar" | "page" | "modal" | "compact";
  limit?: number;
  showFilters?: boolean;
  onUserAction?: (action: string, userId: string) => void;
  algorithms?: string[];
  context?: "social" | "booking" | "general";
}

type SuggestionAlgorithm = {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  category: "discovery" | "social" | "business";
};

const suggestionAlgorithms: SuggestionAlgorithm[] = [
  {
    id: "smart",
    label: "Smart Mix",
    icon: <Zap className="w-4 h-4" />,
    description: "AI-powered personalized suggestions",
    category: "discovery"
  },
  {
    id: "contacts",
    label: "From Contacts",
    icon: <Contacts className="w-4 h-4" />,
    description: "From your imported contacts",
    category: "social"
  },
  {
    id: "nearby",
    label: "Nearby",
    icon: <Navigation className="w-4 h-4" />,
    description: "Users in your area",
    category: "discovery"
  },
  {
    id: "interests",
    label: "Similar Interests",
    icon: <Heart className="w-4 h-4" />,
    description: "Based on your interests",
    category: "social"
  },
  {
    id: "services",
    label: "Service Providers",
    icon: <Briefcase className="w-4 h-4" />,
    description: "Users offering services you might need",
    category: "business"
  },
  {
    id: "trending",
    label: "Trending",
    icon: <TrendingUp className="w-4 h-4" />,
    description: "Popular and active users",
    category: "discovery"
  },
  {
    id: "mutual",
    label: "Mutual Friends",
    icon: <Users className="w-4 h-4" />,
    description: "Connected through mutual friends",
    category: "social"
  },
  {
    id: "recent",
    label: "Recently Active",
    icon: <Clock className="w-4 h-4" />,
    description: "Recently active users",
    category: "discovery"
  }
];

const enhancedMockUsers: SuggestedUser[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    location: { city: "San Francisco, CA", distance: 2.1, coordinates: [37.7749, -122.4194] },
    bio: "UX Designer passionate about sustainable design and user research",
    profession: "UX Designer",
    interests: ["Design", "Sustainability", "Hiking", "Photography", "Tech"],
    services: ["UI/UX Design", "User Research", "Design Consulting"],
    mutualConnections: 5,
    trustScore: 92,
    isVerified: true,
    isFromContacts: true,
    lastActive: "2 hours ago",
    compatibility: 89,
    commonInterests: ["Design", "Hiking", "Photography"],
    rating: 4.8,
    responseTime: "within 1 hour",
    isActive: true,
    recentInteractions: [
      { type: "viewed_profile", timestamp: new Date(Date.now() - 3600000) },
      { type: "liked_post", timestamp: new Date(Date.now() - 7200000) }
    ]
  },
  {
    id: "2", 
    name: "Michael Chen",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    location: { city: "Mountain View, CA", distance: 8.4, coordinates: [37.3861, -122.0839] },
    bio: "Full-stack developer and rock climbing instructor on weekends",
    profession: "Software Engineer",
    interests: ["Climbing", "Technology", "Photography", "Travel", "Music"],
    services: ["Web Development", "Mobile Apps", "Climbing Lessons"],
    mutualConnections: 3,
    trustScore: 88,
    isVerified: false,
    isFromContacts: false,
    lastActive: "30 minutes ago",
    compatibility: 76,
    commonInterests: ["Technology", "Photography"],
    rating: 4.6,
    responseTime: "within 2 hours",
    isActive: true
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    location: { city: "Palo Alto, CA", distance: 12.3, coordinates: [37.4419, -122.1430] },
    bio: "Marketing strategist helping startups grow. Love exploring new cafes!",
    profession: "Marketing Manager",
    interests: ["Marketing", "Travel", "Coffee", "Books", "Startups"],
    services: ["Marketing Strategy", "Social Media", "Content Creation"],
    mutualConnections: 8,
    trustScore: 95,
    isVerified: true,
    isFromContacts: false,
    lastActive: "15 minutes ago",
    compatibility: 82,
    commonInterests: ["Travel", "Books"],
    rating: 4.9,
    responseTime: "within 30 minutes",
    isActive: true
  },
  {
    id: "4",
    name: "David Park",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    location: { city: "San Jose, CA", distance: 18.7, coordinates: [37.3382, -121.8863] },
    bio: "Serial entrepreneur building AI solutions for everyday problems",
    profession: "Entrepreneur",
    interests: ["AI", "Startups", "Innovation", "Fitness", "Networking"],
    services: ["Business Consulting", "AI Solutions", "Mentoring"],
    mutualConnections: 12,
    trustScore: 87,
    isVerified: true,
    isFromContacts: true,
    lastActive: "1 hour ago",
    compatibility: 71,
    commonInterests: ["Innovation", "AI"],
    rating: 4.7,
    responseTime: "within 3 hours"
  },
  {
    id: "5",
    name: "Lisa Thompson",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    location: { city: "Berkeley, CA", distance: 24.1, coordinates: [37.8715, -122.2730] },
    bio: "Certified yoga instructor and holistic wellness coach. Helping people find balance.",
    profession: "Yoga Instructor", 
    interests: ["Yoga", "Wellness", "Meditation", "Nature", "Mindfulness"],
    services: ["Yoga Classes", "Wellness Coaching", "Meditation Guidance"],
    mutualConnections: 2,
    trustScore: 91,
    isVerified: false,
    isFromContacts: false,
    lastActive: "45 minutes ago",
    compatibility: 85,
    commonInterests: ["Wellness", "Nature"],
    rating: 4.8,
    responseTime: "within 1 hour",
    isActive: true
  },
  {
    id: "6",
    name: "James Wilson",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    location: { city: "Oakland, CA", distance: 15.2, coordinates: [37.8044, -122.2712] },
    bio: "Executive chef specializing in farm-to-table cuisine. Available for private events.",
    profession: "Chef",
    interests: ["Cooking", "Sustainability", "Food", "Farming", "Wine"],
    services: ["Private Chef", "Catering", "Cooking Classes"],
    mutualConnections: 6,
    trustScore: 89,
    isVerified: true,
    isFromContacts: false,
    lastActive: "2 hours ago",
    compatibility: 78,
    commonInterests: ["Sustainability", "Food"],
    rating: 4.9,
    responseTime: "within 4 hours"
  },
  {
    id: "7",
    name: "Amanda Torres",
    avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop&crop=face",
    location: { city: "Fremont, CA", distance: 21.5, coordinates: [37.5485, -121.9886] },
    bio: "Professional photographer capturing life's beautiful moments. Available for events and portraits.",
    profession: "Photographer",
    interests: ["Photography", "Art", "Travel", "Nature", "Design"],
    services: ["Event Photography", "Portraits", "Photo Editing"],
    mutualConnections: 4,
    trustScore: 93,
    isVerified: true,
    isFromContacts: true,
    lastActive: "3 hours ago",
    compatibility: 84,
    commonInterests: ["Photography", "Art", "Travel"],
    rating: 4.7,
    responseTime: "within 2 hours"
  },
  {
    id: "8",
    name: "Carlos Martinez",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    location: { city: "San Francisco, CA", distance: 1.8, coordinates: [37.7849, -122.4094] },
    bio: "Fitness trainer and nutrition consultant. Helping people achieve their health goals.",
    profession: "Fitness Trainer",
    interests: ["Fitness", "Nutrition", "Health", "Sports", "Motivation"],
    services: ["Personal Training", "Nutrition Coaching", "Group Fitness"],
    mutualConnections: 7,
    trustScore: 86,
    isVerified: false,
    isFromContacts: false,
    lastActive: "20 minutes ago",
    compatibility: 72,
    commonInterests: ["Fitness", "Health"],
    rating: 4.5,
    responseTime: "within 1 hour",
    isActive: true
  }
];

export const SuggestedUsers: React.FC<SuggestedUsersProps> = ({
  variant = "page",
  limit = 6,
  showFilters = true,
  onUserAction,
  algorithms = ["smart", "contacts", "nearby", "interests"],
  context = "general"
}) => {
  const { data: session } = useSession();
  const [users, setUsers] = useState<SuggestedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>("smart");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "discovery" | "social" | "business">("all");
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [contactsImported, setContactsImported] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"relevance" | "distance" | "compatibility" | "trust">("relevance");
  const [locationPermissionAsked, setLocationPermissionAsked] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);

  // Smart suggestion algorithm - combines multiple factors
  const getSmartSuggestions = useCallback((users: SuggestedUser[]) => {
    const currentTime = new Date();
    
    return users
      .map(user => {
        let score = 0;
        
        // Contact bonus (highest weight)
        if (user.isFromContacts) score += 40;
        
        // Distance bonus (closer = better)
        if (user.location?.distance) {
          if (user.location.distance <= 5) score += 30;
          else if (user.location.distance <= 15) score += 20;
          else if (user.location.distance <= 30) score += 10;
        }
        
        // Common interests bonus
        score += user.commonInterests.length * 8;
        
        // Trust score bonus
        score += user.trustScore * 0.15;
        
        // Mutual connections bonus
        score += user.mutualConnections * 3;
        
        // Compatibility bonus
        score += user.compatibility * 0.1;
        
        // Recent activity bonus
        if (user.lastActive.includes("minute")) score += 15;
        else if (user.lastActive.includes("hour")) score += 8;
        
        // Verification bonus
        if (user.isVerified) score += 10;
        
        // Service provider bonus (context-based)
        if (context === "booking" && user.services?.length) score += 20;
        
        // Active user bonus
        if (user.isActive) score += 5;
        
        return { ...user, smartScore: score };
      })
      .sort((a, b) => b.smartScore - a.smartScore);
  }, [context]);

  // Enhanced fetch with better algorithms and real API integration
  const fetchSuggestions = useCallback(async (algorithm: string) => {
    setLoading(true);
    try {
      // Try to fetch from API first
      const token = localStorage.getItem('bearer_token');
      if (token && session?.user) {
        try {
          const response = await fetch(`/api/users/suggested?algorithm=${algorithm}&limit=${limit}&context=${context}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.ok) {
            const apiUsers = await response.json();
            setUsers(apiUsers);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.log('API not available, using enhanced mock data');
        }
      }
      
      // Enhanced fallback with better filtering
      await new Promise(resolve => setTimeout(resolve, 600));
      
      let filteredUsers = [...enhancedMockUsers];
      
      // Apply search filter
      if (searchQuery.trim()) {
        filteredUsers = filteredUsers.filter(user =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.profession?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.interests.some(interest => interest.toLowerCase().includes(searchQuery.toLowerCase())) ||
          user.location?.city.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      switch (algorithm) {
        case "smart":
          filteredUsers = getSmartSuggestions(filteredUsers);
          break;
        case "contacts":
          filteredUsers = filteredUsers.filter(user => user.isFromContacts);
          break;
        case "nearby":
          if (locationEnabled || currentLocation) {
            filteredUsers = filteredUsers.sort((a, b) => 
              (a.location?.distance || 999) - (b.location?.distance || 999)
            );
          } else {
            // If location not enabled, show users with location data
            filteredUsers = filteredUsers.filter(user => user.location?.distance);
          }
          break;
        case "interests":
          filteredUsers = filteredUsers.sort((a, b) => b.compatibility - a.compatibility);
          break;
        case "services":
          filteredUsers = filteredUsers.filter(user => user.services?.length).sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case "trending":
          filteredUsers = filteredUsers.filter(user => user.isActive).sort((a, b) => b.trustScore - a.trustScore);
          break;
        case "mutual":
          filteredUsers = filteredUsers.sort((a, b) => b.mutualConnections - a.mutualConnections);
          break;
        case "recent":
          filteredUsers = filteredUsers.sort((a, b) => {
            const timeA = a.lastActive.includes("minute") ? 1 : 
                         a.lastActive.includes("hour") ? 2 : 3;
            const timeB = b.lastActive.includes("minute") ? 1 : 
                         b.lastActive.includes("hour") ? 2 : 3;
            return timeA - timeB;
          });
          break;
      }
      
      // Apply sorting
      switch (sortBy) {
        case "distance":
          filteredUsers = filteredUsers.sort((a, b) => (a.location?.distance || 999) - (b.location?.distance || 999));
          break;
        case "compatibility":
          filteredUsers = filteredUsers.sort((a, b) => b.compatibility - a.compatibility);
          break;
        case "trust":
          filteredUsers = filteredUsers.sort((a, b) => b.trustScore - a.trustScore);
          break;
      }
      
      setUsers(filteredUsers.slice(0, limit));
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      toast.error("Failed to load suggestions");
    } finally {
      setLoading(false);
    }
  }, [limit, session, context, searchQuery, sortBy, getSmartSuggestions, locationEnabled, currentLocation]);

  // Request location permission
  const requestLocationPermission = useCallback(async () => {
    if (!navigator.geolocation) {
      toast.error("Location not supported by this browser");
      return;
    }

    setLocationPermissionAsked(true);
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });
      
      setCurrentLocation([position.coords.latitude, position.coords.longitude]);
      setLocationEnabled(true);
      toast.success("Location enabled! Finding users nearby...");
      
      // Refresh suggestions if currently viewing location-based
      if (selectedAlgorithm === "nearby") {
        fetchSuggestions("nearby");
      }
    } catch (error) {
      toast.error("Location permission denied or unavailable");
      console.error("Location error:", error);
    }
  }, [selectedAlgorithm, fetchSuggestions]);

  useEffect(() => {
    fetchSuggestions(selectedAlgorithm);
  }, [fetchSuggestions, selectedAlgorithm]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchSuggestions(selectedAlgorithm);
    setRefreshing(false);
    toast.success("Suggestions refreshed with latest data!");
  }, [fetchSuggestions, selectedAlgorithm]);

  const handleImportContacts = useCallback(async () => {
    try {
      setContactsImported(true);
      toast.success("Contacts imported! Found 127 friends already on the platform.");
      
      // Simulate finding more contact-based suggestions
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (selectedAlgorithm === "contacts") {
        fetchSuggestions("contacts");
      }
    } catch (error) {
      toast.error("Failed to import contacts");
    }
  }, [selectedAlgorithm, fetchSuggestions]);

  const handleUserAction = useCallback(async (action: string, userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    switch (action) {
      case "follow":
        toast.success(`Now following ${user.name}! 🎉`);
        // Update user state to show followed
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, isFollowing: true } : u));
        break;
      case "message":
        toast.success(`Opening conversation with ${user.name}...`);
        break;
      case "view":
        toast.success(`Viewing ${user.name}'s profile...`);
        break;
      case "connect":
        if (user.isFromContacts) {
          toast.success(`Sent connection request to ${user.name}`);
        } else {
          toast.success(`Connected with ${user.name} via shared interests!`);
        }
        break;
    }

    onUserAction?.(action, userId);
  }, [users, onUserAction]);

  const getInterestIcon = (interest: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      "Photography": <Camera className="w-3 h-3" />,
      "Design": <Palette className="w-3 h-3" />,
      "Music": <Music className="w-3 h-3" />,
      "Cooking": <Utensils className="w-3 h-3" />,
      "Food": <Utensils className="w-3 h-3" />,
      "Fitness": <Dumbbell className="w-3 h-3" />,
      "Tech": <Laptop className="w-3 h-3" />,
      "Technology": <Laptop className="w-3 h-3" />,
      "Books": <BookOpen className="w-3 h-3" />,
      "Travel": <Globe className="w-3 h-3" />,
      "Yoga": <Dumbbell className="w-3 h-3" />,
      "Cars": <Car className="w-3 h-3" />,
      "Hair": <Scissors className="w-3 h-3" />
    };
    return iconMap[interest] || <Heart className="w-3 h-3" />;
  };

  const renderUserCard = useCallback((user: SuggestedUser) => {
    const isCompact = variant === "compact" || variant === "sidebar";
    
    return (
      <Card 
        key={user.id} 
        className="group hover:shadow-lg transition-all duration-300 hover:shadow-brand/10 border-border/50 hover:border-brand/20 relative overflow-hidden"
      >
        {/* Smart suggestion indicator */}
        {selectedAlgorithm === "smart" && (user as any).smartScore > 80 && (
          <div className="absolute top-2 right-2 z-10">
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
              <Zap className="w-2 h-2 mr-1" />
              High Match
            </Badge>
          </div>
        )}
        
        <CardContent className={`p-4 ${isCompact ? 'space-y-3' : 'space-y-4'}`}>
          <div className="flex items-start gap-3">
            <div className="relative">
              <Avatar className={isCompact ? "w-10 h-10" : "w-12 h-12"}>
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              {user.isVerified && (
                <CheckCircle className="absolute -top-1 -right-1 w-4 h-4 text-blue-500 bg-white rounded-full" />
              )}
              {user.isActive && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className={`font-semibold text-foreground group-hover:text-brand transition-colors ${isCompact ? 'text-sm' : 'text-base'}`}>
                    {user.name}
                  </h4>
                  {user.profession && (
                    <p className={`text-muted-foreground ${isCompact ? 'text-xs' : 'text-sm'}`}>
                      {user.profession}
                    </p>
                  )}
                  {user.rating && (
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-xs font-medium">{user.rating}</span>
                      <span className="text-xs text-muted-foreground">
                        • {user.responseTime}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col items-end gap-1">
                  {user.trustScore >= 90 && (
                    <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-success-soft text-success">
                      <Shield className="w-3 h-3 mr-1" />
                      {user.trustScore}%
                    </Badge>
                  )}
                  {user.isFromContacts && (
                    <Badge variant="default" className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700">
                      <Contacts className="w-3 h-3 mr-1" />
                      Contact
                    </Badge>
                  )}
                </div>
              </div>
              
              {user.location && (
                <div className={`flex items-center gap-1 text-muted-foreground ${isCompact ? 'text-xs mt-1' : 'text-sm mt-2'}`}>
                  <MapPin className="w-3 h-3 text-green-600" />
                  <span>{user.location.city}</span>
                  {user.location.distance && (
                    <span className="text-green-600 font-medium">
                      • {user.location.distance}km away
                    </span>
                  )}
                </div>
              )}
              
              {user.mutualConnections > 0 && (
                <div className={`flex items-center gap-1 text-muted-foreground ${isCompact ? 'text-xs' : 'text-sm'}`}>
                  <Users className="w-3 h-3 text-purple-600" />
                  <span className="text-purple-600 font-medium">{user.mutualConnections} mutual connections</span>
                </div>
              )}
              
              {user.commonInterests.length > 0 && !isCompact && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {user.commonInterests.slice(0, 3).map(interest => (
                    <Badge key={interest} variant="outline" className="text-xs flex items-center gap-1">
                      {getInterestIcon(interest)}
                      {interest}
                    </Badge>
                  ))}
                  {user.commonInterests.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{user.commonInterests.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
              
              {user.services && user.services.length > 0 && context === "booking" && (
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground mb-1">Services:</p>
                  <div className="flex flex-wrap gap-1">
                    {user.services.slice(0, 2).map(service => (
                      <Badge key={service} variant="secondary" className="text-xs">
                        {service}
                      </Badge>
                    ))}
                    {user.services.length > 2 && (
                      <Badge variant="outline" className="text-xs">+{user.services.length - 2}</Badge>
                    )}
                  </div>
                </div>
              )}
              
              {user.compatibility > 75 && (
                <div className={`flex items-center gap-1 mt-1 ${isCompact ? 'text-xs' : 'text-sm'}`}>
                  <Target className="w-3 h-3 text-orange-500" />
                  <span className="text-orange-600 font-medium">
                    {user.compatibility}% compatibility
                  </span>
                </div>
              )}
              
              <div className={`flex items-center gap-2 ${isCompact ? 'text-xs' : 'text-sm'} text-muted-foreground mt-1`}>
                <Clock className="w-3 h-3" />
                <span>Active {user.lastActive}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 pt-2 border-t">
            {user.isFromContacts ? (
              <Button
                size="sm"
                variant="default"
                className="flex-1 h-8 text-xs bg-blue-600 hover:bg-blue-700"
                onClick={() => handleUserAction("connect", user.id)}
              >
                <UserCheck className="w-3 h-3 mr-1" />
                Connect
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-8 text-xs hover:bg-brand hover:text-white transition-colors"
                onClick={() => handleUserAction("follow", user.id)}
              >
                <UserPlus className="w-3 h-3 mr-1" />
                Follow
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-8 text-xs hover:bg-brand hover:text-white transition-colors"
              onClick={() => handleUserAction("message", user.id)}
            >
              <MessageCircle className="w-3 h-3 mr-1" />
              Message
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-2 text-xs hover:bg-muted"
              onClick={() => handleUserAction("view", user.id)}
            >
              <Eye className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }, [variant, handleUserAction, selectedAlgorithm, context]);

  const renderFilters = useCallback(() => {
    if (!showFilters) return null;
    
    const availableAlgorithms = suggestionAlgorithms.filter(alg => algorithms.includes(alg.id));
    
    return (
      <div className="space-y-4">
        {/* Algorithm Selection */}
        <Tabs value={selectedAlgorithm} onValueChange={setSelectedAlgorithm} className="w-full">
          <TabsList className="grid grid-cols-4 w-full">
            {availableAlgorithms.slice(0, 4).map(algorithm => (
              <TabsTrigger key={algorithm.id} value={algorithm.id} className="text-xs">
                {algorithm.icon}
                <span className="ml-1 hidden sm:inline">{algorithm.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        
        {/* Enhanced Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex-1 min-w-48">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, profession, interests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
          </div>
          
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="distance">Distance</SelectItem>
              <SelectItem value="compatibility">Compatibility</SelectItem>
              <SelectItem value="trust">Trust Score</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-8 px-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
    );
  }, [showFilters, algorithms, selectedAlgorithm, searchQuery, sortBy, handleRefresh, refreshing]);

  const renderActionButtons = useCallback(() => {
    return (
      <div className="space-y-3">
        {/* Permission Requests */}
        {selectedAlgorithm === "contacts" && !contactsImported && (
          <Card className="border-dashed border-2 border-blue-200 bg-blue-50/50">
            <CardContent className="p-4 text-center">
              <Contacts className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold text-sm mb-2">Find Friends from Contacts</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Import your contacts to find friends who are already on the platform
              </p>
              <Button
                size="sm"
                onClick={handleImportContacts}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Contacts className="w-4 h-4 mr-2" />
                Import Contacts (127 found)
              </Button>
            </CardContent>
          </Card>
        )}
        
        {selectedAlgorithm === "nearby" && !locationEnabled && !locationPermissionAsked && (
          <Card className="border-dashed border-2 border-green-200 bg-green-50/50">
            <CardContent className="p-4 text-center">
              <Navigation className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-semibold text-sm mb-2">Find People Nearby</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Enable location to discover users in your area for easier meetups
              </p>
              <Button
                size="sm"
                onClick={requestLocationPermission}
                className="bg-green-600 hover:bg-green-700"
              >
                <Navigation className="w-4 h-4 mr-2" />
                Enable Location Access
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Algorithm Description */}
        {(() => {
          const algorithm = suggestionAlgorithms.find(a => a.id === selectedAlgorithm);
          return algorithm && (
            <Card className="bg-muted/30">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  {algorithm.icon}
                  <span className="font-medium text-sm">{algorithm.label} Suggestions</span>
                </div>
                <p className="text-xs text-muted-foreground">{algorithm.description}</p>
              </CardContent>
            </Card>
          );
        })()}
      </div>
    );
  }, [selectedAlgorithm, contactsImported, locationEnabled, locationPermissionAsked, handleImportContacts, requestLocationPermission]);

  const renderEmptyState = useCallback(() => {
    const algorithm = suggestionAlgorithms.find(a => a.id === selectedAlgorithm);
    
    return (
      <Card className="border-dashed border-2 border-border/60">
        <CardContent className="p-8 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            {algorithm?.icon || <Filter className="w-6 h-6 text-muted-foreground" />}
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {searchQuery ? "No matching users found" : "No suggestions available"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery 
              ? `No users match "${searchQuery}". Try a different search term.`
              : algorithm?.description && `No users found using ${algorithm.description.toLowerCase()}.`
            }
          </p>
          {searchQuery && (
            <Button variant="outline" onClick={() => setSearchQuery("")} className="mt-2">
              Clear Search
            </Button>
          )}
          {selectedAlgorithm === "contacts" && !contactsImported && (
            <Button onClick={handleImportContacts} className="mt-2">
              <Contacts className="w-4 h-4 mr-2" />
              Import Contacts to Find Friends
            </Button>
          )}
          {selectedAlgorithm === "nearby" && !locationEnabled && (
            <Button onClick={requestLocationPermission} className="mt-2">
              <Navigation className="w-4 h-4 mr-2" />
              Enable Location to Find Nearby Users
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }, [selectedAlgorithm, searchQuery, contactsImported, locationEnabled, handleImportContacts, requestLocationPermission]);

  const renderLoadingState = useCallback(() => {
    const skeletonCount = variant === "sidebar" ? 3 : limit;
    
    return (
      <div className={`grid gap-4 ${
        variant === "sidebar" || variant === "compact" 
          ? "grid-cols-1" 
          : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      }`}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-40" />
                  <div className="flex gap-1">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-4 mt-4 border-t">
                <Skeleton className="h-8 flex-1" />
                <Skeleton className="h-8 flex-1" />
                <Skeleton className="h-8 w-10" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }, [variant, limit]);

  // Sidebar variant
  if (variant === "sidebar") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold">People You May Know</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        {/* Quick Algorithm Switcher for Sidebar */}
        <div className="flex gap-1">
          <Button
            variant={selectedAlgorithm === "smart" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedAlgorithm("smart")}
            className="text-xs h-6 px-2"
          >
            <Zap className="w-2 h-2 mr-1" />
            Smart
          </Button>
          <Button
            variant={selectedAlgorithm === "contacts" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedAlgorithm("contacts")}
            className="text-xs h-6 px-2"
          >
            <Contacts className="w-2 h-2 mr-1" />
            Contacts
          </Button>
          <Button
            variant={selectedAlgorithm === "nearby" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedAlgorithm("nearby")}
            className="text-xs h-6 px-2"
          >
            <Navigation className="w-2 h-2 mr-1" />
            Near
          </Button>
        </div>
        
        {loading ? (
          renderLoadingState()
        ) : users.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">
            {searchQuery ? "No matching users" : "No suggestions available"}
            {selectedAlgorithm === "contacts" && !contactsImported && (
              <div className="mt-2">
                <Button size="sm" onClick={handleImportContacts} className="text-xs">
                  Import Contacts
                </Button>
              </div>
            )}
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-3 pr-2">
              {users.slice(0, 8).map(renderUserCard)}
            </div>
          </ScrollArea>
        )}
      </div>
    );
  }

  // Full page variant
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold mb-2">Discover People</h2>
          <p className="text-muted-foreground">
            Find people to connect with based on your contacts, location, and interests
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {users.length} suggestions
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSearchQuery("")}
            disabled={!searchQuery}
          >
            Clear Search
          </Button>
        </div>
      </div>
      
      {renderFilters()}
      {renderActionButtons()}
      
      {loading ? (
        renderLoadingState()
      ) : users.length === 0 ? (
        renderEmptyState()
      ) : (
        <div className={`grid gap-4 ${
          variant === "compact" 
            ? "grid-cols-1 md:grid-cols-2" 
            : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        }`}>
          {users.map(renderUserCard)}
        </div>
      )}
      
      {/* Results Summary */}
      <div className="text-center text-sm text-muted-foreground">
        Showing {users.length} of {limit} suggested users
        {selectedAlgorithm === "smart" && (
          <span className="ml-2">• Personalized recommendations</span>
        )}
        {selectedAlgorithm === "contacts" && contactsImported && (
          <span className="ml-2">• From your contacts</span>
        )}
        {selectedAlgorithm === "nearby" && locationEnabled && (
          <span className="ml-2">• Within 30km of your location</span>
        )}
      </div>
    </div>
  );
};

export default SuggestedUsers;