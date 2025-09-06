"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
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
  Filter
} from 'lucide-react';

interface SuggestedUser {
  id: string;
  name: string;
  avatar?: string;
  location?: {
    city: string;
    distance?: number;
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
}

interface SuggestedUsersProps {
  variant?: "sidebar" | "page" | "modal" | "compact";
  limit?: number;
  showFilters?: boolean;
  onUserAction?: (action: string, userId: string) => void;
  algorithms?: string[];
}

type SuggestionAlgorithm = {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
};

const suggestionAlgorithms: SuggestionAlgorithm[] = [
  {
    id: "contacts",
    label: "Contacts",
    icon: <Contacts className="w-4 h-4" />,
    description: "From your imported contacts"
  },
  {
    id: "location",
    label: "Nearby",
    icon: <MapPin className="w-4 h-4" />,
    description: "Users near your location"
  },
  {
    id: "interests",
    label: "Interests",
    icon: <Heart className="w-4 h-4" />,
    description: "Similar interests and hobbies"
  },
  {
    id: "mutual",
    label: "Mutual",
    icon: <Users className="w-4 h-4" />,
    description: "Mutual connections"
  },
  {
    id: "professional",
    label: "Professional",
    icon: <Briefcase className="w-4 h-4" />,
    description: "Similar work or services"
  },
  {
    id: "recent",
    label: "Recent",
    icon: <Clock className="w-4 h-4" />,
    description: "Recently active users"
  }
];

const mockUsers: SuggestedUser[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    location: { city: "San Francisco, CA", distance: 2.1 },
    bio: "UX Designer passionate about sustainable design",
    profession: "UX Designer",
    interests: ["Design", "Sustainability", "Hiking"],
    mutualConnections: 5,
    trustScore: 92,
    isVerified: true,
    isFromContacts: true,
    lastActive: "2 hours ago",
    compatibility: 89,
    commonInterests: ["Design", "Hiking"]
  },
  {
    id: "2", 
    name: "Michael Chen",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    location: { city: "Mountain View, CA", distance: 8.4 },
    bio: "Software engineer and rock climbing enthusiast",
    profession: "Software Engineer",
    interests: ["Climbing", "Technology", "Photography"],
    mutualConnections: 3,
    trustScore: 88,
    isVerified: false,
    isFromContacts: false,
    lastActive: "1 day ago",
    compatibility: 76,
    commonInterests: ["Technology"]
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    location: { city: "Palo Alto, CA", distance: 12.3 },
    bio: "Marketing manager who loves travel and coffee",
    profession: "Marketing Manager",
    interests: ["Travel", "Coffee", "Marketing", "Books"],
    mutualConnections: 8,
    trustScore: 95,
    isVerified: true,
    isFromContacts: false,
    lastActive: "30 minutes ago",
    compatibility: 82,
    commonInterests: ["Travel", "Books"]
  },
  {
    id: "4",
    name: "David Park",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    location: { city: "San Jose, CA", distance: 18.7 },
    bio: "Entrepreneur building the next big thing",
    profession: "Entrepreneur",
    interests: ["Startups", "Innovation", "Fitness"],
    mutualConnections: 12,
    trustScore: 87,
    isVerified: true,
    isFromContacts: true,
    lastActive: "5 hours ago",
    compatibility: 71,
    commonInterests: ["Innovation"]
  },
  {
    id: "5",
    name: "Lisa Thompson",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    location: { city: "Berkeley, CA", distance: 24.1 },
    bio: "Yoga instructor and wellness coach",
    profession: "Yoga Instructor", 
    interests: ["Yoga", "Wellness", "Meditation", "Nature"],
    mutualConnections: 2,
    trustScore: 91,
    isVerified: false,
    isFromContacts: false,
    lastActive: "3 hours ago",
    compatibility: 85,
    commonInterests: ["Wellness", "Nature"]
  },
  {
    id: "6",
    name: "James Wilson",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    location: { city: "Oakland, CA", distance: 15.2 },
    bio: "Chef specializing in farm-to-table cuisine",
    profession: "Chef",
    interests: ["Cooking", "Sustainability", "Food"],
    mutualConnections: 6,
    trustScore: 89,
    isVerified: true,
    isFromContacts: false,
    lastActive: "1 hour ago",
    compatibility: 78,
    commonInterests: ["Sustainability"]
  }
];

export const SuggestedUsers: React.FC<SuggestedUsersProps> = ({
  variant = "page",
  limit = 6,
  showFilters = true,
  onUserAction,
  algorithms = ["contacts", "location", "interests", "mutual"]
}) => {
  const [users, setUsers] = useState<SuggestedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>(algorithms[0] || "contacts");
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [contactsImported, setContactsImported] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSuggestions = useCallback(async (algorithm: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Filter mock users based on algorithm
      let filteredUsers = [...mockUsers];
      
      switch (algorithm) {
        case "contacts":
          filteredUsers = filteredUsers.filter(user => user.isFromContacts);
          break;
        case "location":
          filteredUsers = filteredUsers.sort((a, b) => 
            (a.location?.distance || 999) - (b.location?.distance || 999)
          );
          break;
        case "interests":
          filteredUsers = filteredUsers.sort((a, b) => b.compatibility - a.compatibility);
          break;
        case "mutual":
          filteredUsers = filteredUsers.sort((a, b) => b.mutualConnections - a.mutualConnections);
          break;
        case "professional":
          filteredUsers = filteredUsers.filter(user => 
            ["UX Designer", "Software Engineer", "Marketing Manager", "Entrepreneur"].includes(user.profession || "")
          );
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
      
      setUsers(filteredUsers.slice(0, limit));
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      toast.error("Failed to load suggestions");
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchSuggestions(selectedAlgorithm);
  }, [fetchSuggestions, selectedAlgorithm]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchSuggestions(selectedAlgorithm);
    setRefreshing(false);
    toast.success("Suggestions refreshed");
  }, [fetchSuggestions, selectedAlgorithm]);

  const handleImportContacts = useCallback(() => {
    setContactsImported(true);
    toast.success("Contacts imported successfully! 127 new suggestions found.");
    if (selectedAlgorithm === "contacts") {
      fetchSuggestions("contacts");
    }
  }, [selectedAlgorithm, fetchSuggestions]);

  const handleEnableLocation = useCallback(() => {
    setLocationEnabled(true);
    toast.success("Location enabled! Finding users nearby.");
    if (selectedAlgorithm === "location") {
      fetchSuggestions("location");
    }
  }, [selectedAlgorithm, fetchSuggestions]);

  const handleUserAction = useCallback((action: string, userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    switch (action) {
      case "follow":
        toast.success(`Following ${user.name}`);
        break;
      case "message":
        toast.success(`Message sent to ${user.name}`);
        break;
      case "view":
        toast.success(`Viewing ${user.name}'s profile`);
        break;
    }

    onUserAction?.(action, userId);
  }, [users, onUserAction]);

  const renderUserCard = useCallback((user: SuggestedUser) => {
    const isCompact = variant === "compact" || variant === "sidebar";
    
    return (
      <Card 
        key={user.id} 
        className="group hover:shadow-lg transition-all duration-300 hover:shadow-brand/10 border-border/50 hover:border-brand/20"
      >
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
                </div>
                
                <div className="flex items-center gap-1">
                  {user.trustScore >= 90 && (
                    <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-success-soft text-success">
                      <Shield className="w-3 h-3 mr-1" />
                      {user.trustScore}%
                    </Badge>
                  )}
                  {user.isFromContacts && (
                    <Badge variant="outline" className="text-xs px-2 py-0.5">
                      <Contacts className="w-3 h-3 mr-1" />
                      Contact
                    </Badge>
                  )}
                </div>
              </div>
              
              {user.location && (
                <div className={`flex items-center gap-1 text-muted-foreground ${isCompact ? 'text-xs mt-1' : 'text-sm mt-2'}`}>
                  <MapPin className="w-3 h-3" />
                  <span>{user.location.city}</span>
                  {user.location.distance && (
                    <span className="text-brand font-medium">
                      • {user.location.distance}km away
                    </span>
                  )}
                </div>
              )}
              
              {user.mutualConnections > 0 && (
                <div className={`flex items-center gap-1 text-muted-foreground ${isCompact ? 'text-xs' : 'text-sm'}`}>
                  <Users className="w-3 h-3" />
                  <span>{user.mutualConnections} mutual connections</span>
                </div>
              )}
              
              {user.commonInterests.length > 0 && !isCompact && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {user.commonInterests.slice(0, 2).map(interest => (
                    <Badge key={interest} variant="secondary" className="text-xs">
                      {interest}
                    </Badge>
                  ))}
                  {user.commonInterests.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{user.commonInterests.length - 2}
                    </Badge>
                  )}
                </div>
              )}
              
              {user.compatibility > 80 && (
                <div className={`flex items-center gap-1 ${isCompact ? 'text-xs' : 'text-sm'}`}>
                  <Star className="w-3 h-3 text-yellow-500" />
                  <span className="text-yellow-600 font-medium">
                    {user.compatibility}% compatibility
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-2 pt-2 border-t">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-8 text-xs hover:bg-brand hover:text-white transition-colors"
              onClick={() => handleUserAction("follow", user.id)}
            >
              <UserPlus className="w-3 h-3 mr-1" />
              Follow
            </Button>
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
  }, [variant, handleUserAction]);

  const renderFilters = useCallback(() => {
    if (!showFilters) return null;
    
    return (
      <div className="flex flex-wrap gap-2 mb-6">
        {algorithms.map(algorithmId => {
          const algorithm = suggestionAlgorithms.find(a => a.id === algorithmId);
          if (!algorithm) return null;
          
          const isActive = selectedAlgorithm === algorithmId;
          const needsPermission = (algorithmId === "location" && !locationEnabled) || 
                                 (algorithmId === "contacts" && !contactsImported);
          
          return (
            <Button
              key={algorithmId}
              variant={isActive ? "default" : "outline"}
              size="sm"
              className={`transition-all duration-200 ${
                isActive 
                  ? "bg-brand text-white shadow-sm" 
                  : "hover:bg-muted hover:border-brand/40"
              } ${needsPermission ? "opacity-60" : ""}`}
              onClick={() => setSelectedAlgorithm(algorithmId)}
            >
              {algorithm.icon}
              <span className="ml-1">{algorithm.label}</span>
              {needsPermission && <span className="ml-1 text-xs">•</span>}
            </Button>
          );
        })}
      </div>
    );
  }, [showFilters, algorithms, selectedAlgorithm, locationEnabled, contactsImported]);

  const renderActionButtons = useCallback(() => {
    return (
      <div className="flex flex-wrap gap-2 mb-6">
        {selectedAlgorithm === "contacts" && !contactsImported && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleImportContacts}
            className="hover:bg-brand hover:text-white transition-colors"
          >
            <Contacts className="w-4 h-4 mr-2" />
            Import Contacts
          </Button>
        )}
        
        {selectedAlgorithm === "location" && !locationEnabled && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleEnableLocation}
            className="hover:bg-brand hover:text-white transition-colors"
          >
            <Navigation className="w-4 h-4 mr-2" />
            Enable Location
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="hover:bg-muted"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
    );
  }, [selectedAlgorithm, contactsImported, locationEnabled, handleImportContacts, handleEnableLocation, handleRefresh, refreshing]);

  const renderEmptyState = useCallback(() => {
    const algorithm = suggestionAlgorithms.find(a => a.id === selectedAlgorithm);
    
    return (
      <Card className="border-dashed border-2 border-border/60">
        <CardContent className="p-8 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Filter className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No suggestions found</h3>
          <p className="text-muted-foreground mb-4">
            {algorithm?.description && `No users found using ${algorithm.description.toLowerCase()}.`}
          </p>
          {selectedAlgorithm === "contacts" && !contactsImported && (
            <Button onClick={handleImportContacts} className="mt-2">
              <Contacts className="w-4 h-4 mr-2" />
              Import Contacts to Find Friends
            </Button>
          )}
          {selectedAlgorithm === "location" && !locationEnabled && (
            <Button onClick={handleEnableLocation} className="mt-2">
              <Navigation className="w-4 h-4 mr-2" />
              Enable Location to Find Nearby Users
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }, [selectedAlgorithm, contactsImported, locationEnabled, handleImportContacts, handleEnableLocation]);

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

  if (variant === "sidebar") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold">Suggested</h3>
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
        
        {loading ? (
          renderLoadingState()
        ) : users.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">
            No suggestions available
          </div>
        ) : (
          <div className="space-y-3">
            {users.slice(0, 4).map(renderUserCard)}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold mb-2">Suggested Users</h2>
        <p className="text-muted-foreground">
          Discover people you might know or want to connect with
        </p>
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
            ? "grid-cols-1" 
            : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        }`}>
          {users.map(renderUserCard)}
        </div>
      )}
    </div>
  );
};