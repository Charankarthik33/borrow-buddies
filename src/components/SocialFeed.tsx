"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MoreHorizontal, 
  Image as ImageIcon, 
  Video, 
  MapPin, 
  Calendar,
  DollarSign,
  Clock,
  Tag,
  Plus,
  X,
  Loader2,
  TrendingUp,
  Users,
  Zap,
  Eye,
  Flame,
  Star,
  Globe,
  UserPlus,
  Search,
  Filter,
  Play,
  Pause,
  Volume2,
  VolumeX
} from "lucide-react";
import { toast } from "sonner";

// Types
interface User {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  isVerified?: boolean;
  isOnline?: boolean;
  location?: string;
}

interface Story {
  id: string;
  user: User;
  media: {
    type: 'image' | 'video';
    url: string;
    duration?: number;
  };
  timestamp: Date;
  viewed: boolean;
}

interface LiveEvent {
  id: string;
  title: string;
  host: User;
  participants: number;
  category: string;
  thumbnail: string;
  isLive: boolean;
}

interface TrendingTopic {
  hashtag: string;
  posts: number;
  growth: number;
}

interface Media {
  type: 'image' | 'video';
  url: string;
  alt?: string;
  caption?: string;
}

interface Post {
  id: string;
  userId: number;
  author: User;
  content: string;
  media?: Media[];
  timestamp: Date;
  likes: number;
  shares: number;
  comments: number;
  bookmarked: boolean;
  liked: boolean;
  following: boolean;
  type: 'micro' | 'media' | 'service' | 'listing' | 'poll' | 'event';
  hashtags: string[];
  mentions: string[];
  location?: string;
  price?: number;
  availability?: string;
  duration?: string;
  serviceCategory?: string;
  tags?: string[];
  isListing?: boolean;
  poll?: {
    question: string;
    options: Array<{ text: string; votes: number }>;
    totalVotes: number;
    hasVoted: boolean;
  };
  event?: {
    title: string;
    date: Date;
    location: string;
    attendees: number;
    isAttending: boolean;
  };
}

interface ServiceDetails {
  category: string;
  location: string;
  price: string;
  priceType: 'hourly' | 'daily' | 'fixed';
  availability: string;
  duration: string;
  tags: string[];
}

export default function SocialFeed() {
  const [activeTab, setActiveTab] = useState("discover");
  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerContent, setComposerContent] = useState("");
  const [composerMedia, setComposerMedia] = useState<File[]>([]);
  const [composerType, setComposerType] = useState<'post' | 'service' | 'poll' | 'event'>('post');
  const [isServicePost, setIsServicePost] = useState(false);
  const [serviceDetails, setServiceDetails] = useState<ServiceDetails>({
    category: "",
    location: "",
    price: "",
    priceType: "hourly",
    availability: "",
    duration: "",
    tags: []
  });
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [newTag, setNewTag] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [currentUser] = useState({
    id: "1",
    username: "your_username",
    displayName: "Your Name",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face"
  });

  // Mock data for enhanced social features
  useEffect(() => {
    const mockStories: Story[] = [
      {
        id: "1",
        user: { id: "2", username: "alex_travel", displayName: "Alex Chen", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop", isOnline: true },
        media: { type: "image", url: "https://images.unsplash.com/photo-1606909114-f6e7ad7d3136?w=400&h=600&fit=crop" },
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        viewed: false
      },
      {
        id: "2", 
        user: { id: "3", username: "maria_photo", displayName: "Maria Rodriguez", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop", isOnline: true },
        media: { type: "image", url: "https://images.unsplash.com/photo-1493770348161-369560ae357d?w=400&h=600&fit=crop" },
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        viewed: false
      },
      {
        id: "3",
        user: { id: "4", username: "david_music", displayName: "David Park", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop", isOnline: false },
        media: { type: "video", url: "https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4", duration: 15 },
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        viewed: true
      }
    ];

    const mockLiveEvents: LiveEvent[] = [
      {
        id: "1",
        title: "Photography Workshop",
        host: { id: "2", username: "alex_travel", displayName: "Alex Chen", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop" },
        participants: 45,
        category: "Education",
        thumbnail: "https://images.unsplash.com/photo-1606909114-f6e7ad7d3136?w=200&h=120&fit=crop",
        isLive: true
      },
      {
        id: "2",
        title: "Community Cooking Class",
        host: { id: "5", username: "chef_sara", displayName: "Sara Wilson", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b388?w=50&h=50&fit=crop" },
        participants: 23,
        category: "Lifestyle",
        thumbnail: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=120&fit=crop",
        isLive: true
      }
    ];

    const mockTrending: TrendingTopic[] = [
      { hashtag: "Photography", posts: 1245, growth: 15 },
      { hashtag: "TravelTips", posts: 892, growth: 8 },
      { hashtag: "LocalEvents", posts: 634, growth: 22 },
      { hashtag: "SkillShare", posts: 478, growth: 12 },
      { hashtag: "CommunityLove", posts: 356, growth: 5 }
    ];

    setStories(mockStories);
    setLiveEvents(mockLiveEvents);
    setTrendingTopics(mockTrending);
  }, []);

  // Fetch posts from API with enhanced filtering
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      let endpoint = '/api/posts?limit=20&sort=createdAt&order=desc';
      
      // Add tab-specific filtering
      if (activeTab === 'trending') {
        endpoint += '&filter=trending';
      } else if (activeTab === 'nearby') {
        endpoint += '&filter=nearby';
      } else if (activeTab === 'events') {
        endpoint += '&postType=event';
      }

      // Add category filter
      if (filterCategory !== 'all') {
        endpoint += `&category=${filterCategory}`;
      }

      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Failed to fetch posts');
      
      const postsData = await response.json();
      
      // Transform API data to component format with enhanced post types
      const transformedPosts = await Promise.all(postsData.map(async (post: any): Promise<Post> => {
        const userResponse = await fetch(`/api/users?id=${post.userId}`);
        const userData = userResponse.ok ? await userResponse.json() : null;
        
        return {
          id: post.id.toString(),
          userId: post.userId,
          author: {
            id: post.userId.toString(),
            username: userData?.username || 'unknown',
            displayName: userData?.displayName || 'Unknown User',
            avatar: userData?.avatar,
            isVerified: userData?.isVerified || false,
            isOnline: Math.random() > 0.5, // Mock online status
            location: userData?.location
          },
          content: post.content || '',
          media: post.media ? JSON.parse(post.media) : undefined,
          timestamp: new Date(post.createdAt),
          likes: post.likesCount || 0,
          shares: post.sharesCount || 0,
          comments: post.commentsCount || 0,
          bookmarked: post.bookmarked || false,
          liked: false, // TODO: Check if current user liked this post
          following: false, // TODO: Check if current user follows the author
          type: post.postType as 'micro' | 'media' | 'service' | 'listing' | 'poll' | 'event',
          hashtags: post.hashtags ? JSON.parse(post.hashtags) : [],
          mentions: post.mentions ? JSON.parse(post.mentions) : [],
          location: post.location,
          price: post.price,
          availability: post.availability,
          duration: post.duration,
          serviceCategory: post.serviceCategory,
          tags: post.tags ? JSON.parse(post.tags) : [],
          isListing: post.isListing || false,
          // Mock enhanced features
          poll: post.postType === 'poll' ? {
            question: post.content,
            options: [
              { text: "Option A", votes: Math.floor(Math.random() * 50) },
              { text: "Option B", votes: Math.floor(Math.random() * 50) }
            ],
            totalVotes: Math.floor(Math.random() * 100),
            hasVoted: Math.random() > 0.5
          } : undefined,
          event: post.postType === 'event' ? {
            title: post.content.split('\n')[0] || post.content,
            date: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000),
            location: post.location || "TBD",
            attendees: Math.floor(Math.random() * 100),
            isAttending: Math.random() > 0.5
          } : undefined
        };
      }));
      
      setPosts(transformedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, [activeTab, filterCategory]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Enhanced post creation with new types
  const handleCreatePost = useCallback(async () => {
    if (!composerContent.trim()) return;

    try {
      const postData: any = {
        userId: parseInt(currentUser.id),
        content: composerContent,
        postType: composerType,
        hashtags: JSON.stringify([]),
        mentions: JSON.stringify([])
      };

      if (composerType === 'service' && serviceDetails.category) {
        postData.location = serviceDetails.location;
        postData.price = parseInt(serviceDetails.price) || null;
        postData.availability = serviceDetails.availability;
        postData.duration = serviceDetails.duration;
        postData.serviceCategory = serviceDetails.category;
        postData.tags = JSON.stringify(serviceDetails.tags);
        postData.isListing = serviceDetails.category === 'equipment';
      }

      if (composerMedia.length > 0) {
        const processedMedia = composerMedia.map(file => ({
          type: file.type.startsWith('video/') ? 'video' as const : 'image' as const,
          url: URL.createObjectURL(file),
          alt: `Uploaded ${file.type.startsWith('video/') ? 'video' : 'image'}`
        }));
        postData.media = JSON.stringify(processedMedia);
      }

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });

      if (!response.ok) throw new Error('Failed to create post');

      // Reset composer
      setComposerContent('');
      setComposerMedia([]);
      setComposerOpen(false);
      setComposerType('post');
      setPollOptions(['', '']);
      toast.success("Post created successfully!");
      
      // Refresh posts
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    }
  }, [composerContent, composerMedia, composerType, serviceDetails, currentUser, fetchPosts]);

  // Like/unlike post
  const handleLikePost = useCallback(async (postId: string) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.liked) {
        // Unlike post
        const response = await fetch(`/api/likes?userId=${currentUser.id}&postId=${postId}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to unlike post');
      } else {
        // Like post
        const response = await fetch('/api/likes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: parseInt(currentUser.id),
            postId: parseInt(postId)
          })
        });
        if (!response.ok) throw new Error('Failed to like post');
      }

      // Update local state
      setPosts(prev => prev.map(p => 
        p.id === postId 
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    }
  }, [posts, currentUser.id]);

  const handleMediaUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length + composerMedia.length > 4) {
      toast.error("Maximum 4 media files allowed");
      return;
    }
    setComposerMedia(prev => [...prev, ...files].slice(0, 4));
  }, [composerMedia.length]);

  const removeMedia = useCallback((index: number) => {
    setComposerMedia(prev => prev.filter((_, i) => i !== index));
  }, []);

  const addTag = useCallback(() => {
    if (newTag.trim() && !serviceDetails.tags.includes(newTag.trim())) {
      setServiceDetails(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  }, [newTag, serviceDetails.tags]);

  const removeTag = useCallback((tagToRemove: string) => {
    setServiceDetails(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  }, []);

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const formatPrice = (price: number, isListing: boolean = false): string => {
    if (isListing) {
      return `$${price}/day`;
    }
    return `$${price}/hr`;
  };

  // Enhanced UI Components
  const StoriesSection = () => (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Stories</h3>
        <Button variant="ghost" size="sm" className="text-blue-600">View all</Button>
      </div>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-3 pb-2">
          {/* Add Story Button */}
          <div className="flex-shrink-0 text-center">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-muted-foreground flex items-center justify-center mb-1 cursor-pointer hover:border-primary">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <span className="text-xs text-muted-foreground">Your story</span>
          </div>
          
          {stories.map((story) => (
            <div key={story.id} className="flex-shrink-0 text-center cursor-pointer">
              <div className={`w-16 h-16 rounded-full p-0.5 ${story.viewed ? 'bg-gray-300' : 'bg-gradient-to-r from-pink-500 to-orange-500'}`}>
                <Avatar className="w-full h-full border-2 border-white">
                  <AvatarImage src={story.user.avatar} />
                  <AvatarFallback>{story.user.displayName[0]}</AvatarFallback>
                </Avatar>
              </div>
              <span className="text-xs text-muted-foreground block mt-1 w-16 truncate">
                {story.user.username}
              </span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  const LiveEventsSection = () => (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Zap className="h-4 w-4 text-red-500" />
            Live Events
          </h3>
          <Button variant="ghost" size="sm" className="text-blue-600">View all</Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {liveEvents.map((event) => (
            <div key={event.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer">
              <div className="relative">
                <img src={event.thumbnail} alt={event.title} className="w-12 h-12 rounded-lg object-cover" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                </div>
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{event.title}</p>
                <p className="text-xs text-muted-foreground">by @{event.host.username}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">{event.category}</Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {event.participants}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const TrendingSection = () => (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <h3 className="font-semibold flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Trending Topics
        </h3>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {trendingTopics.map((topic, index) => (
            <div key={topic.hashtag} className="flex items-center justify-between hover:bg-accent p-2 rounded cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                <div>
                  <p className="font-medium text-sm">#{topic.hashtag}</p>
                  <p className="text-xs text-muted-foreground">{topic.posts.toLocaleString()} posts</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="h-3 w-3" />
                <span className="text-xs">+{topic.growth}%</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  // Enhanced Post Composer
  const EnhancedComposer = () => (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={currentUser.avatar} alt={currentUser.displayName} />
            <AvatarFallback>{currentUser.displayName.charAt(0)}</AvatarFallback>
          </Avatar>
          <button
            onClick={() => setComposerOpen(true)}
            className="flex-1 text-left p-3 border rounded-lg hover:bg-accent transition-colors"
          >
            <span className="text-muted-foreground">Share something with the community...</span>
          </button>
        </div>

        {composerOpen && (
          <div className="space-y-4">
            {/* Post Type Selection */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={composerType === 'post' ? "default" : "outline"}
                size="sm"
                onClick={() => setComposerType('post')}
              >
                📝 Post
              </Button>
              <Button
                variant={composerType === 'service' ? "default" : "outline"}
                size="sm"
                onClick={() => setComposerType('service')}
              >
                💼 Service
              </Button>
              <Button
                variant={composerType === 'poll' ? "default" : "outline"}
                size="sm"
                onClick={() => setComposerType('poll')}
              >
                📊 Poll
              </Button>
              <Button
                variant={composerType === 'event' ? "default" : "outline"}
                size="sm"
                onClick={() => setComposerType('event')}
              >
                🎉 Event
              </Button>
            </div>

            {/* Content Input */}
            <Textarea
              placeholder={
                composerType === 'service' ? "Describe your service..." :
                composerType === 'poll' ? "Ask a question..." :
                composerType === 'event' ? "Tell us about your event..." :
                "What's happening in your community?"
              }
              value={composerContent}
              onChange={(e) => setComposerContent(e.target.value)}
              className="min-h-[100px] resize-none"
            />

            {/* Service Details Form */}
            {composerType === 'service' && (
              <div className="space-y-4 p-4 bg-accent/50 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="service-category">Category</Label>
                    <Select 
                      value={serviceDetails.category} 
                      onValueChange={(value) => setServiceDetails(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="photography">Photography</SelectItem>
                        <SelectItem value="tutoring">Tutoring</SelectItem>
                        <SelectItem value="cleaning">Cleaning</SelectItem>
                        <SelectItem value="petcare">Pet Care</SelectItem>
                        <SelectItem value="handyman">Handyman</SelectItem>
                        <SelectItem value="cooking">Cooking</SelectItem>
                        <SelectItem value="transportation">Transportation</SelectItem>
                        <SelectItem value="eventplanning">Event Planning</SelectItem>
                        <SelectItem value="fitness">Fitness</SelectItem>
                        <SelectItem value="techsupport">Tech Support</SelectItem>
                        <SelectItem value="equipment">Equipment Rental</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="service-location">Location</Label>
                    <Input
                      id="service-location"
                      placeholder="e.g., San Francisco, CA"
                      value={serviceDetails.location}
                      onChange={(e) => setServiceDetails(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="service-price">Price</Label>
                    <Input
                      id="service-price"
                      type="number"
                      placeholder="150"
                      value={serviceDetails.price}
                      onChange={(e) => setServiceDetails(prev => ({ ...prev, price: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="price-type">Price Type</Label>
                    <Select 
                      value={serviceDetails.priceType} 
                      onValueChange={(value: 'hourly' | 'daily' | 'fixed') => 
                        setServiceDetails(prev => ({ ...prev, priceType: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Per Hour</SelectItem>
                        <SelectItem value="daily">Per Day</SelectItem>
                        <SelectItem value="fixed">Fixed Price</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="service-availability">Availability</Label>
                    <Input
                      id="service-availability"
                      placeholder="Weekends"
                      value={serviceDetails.availability}
                      onChange={(e) => setServiceDetails(prev => ({ ...prev, availability: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="service-duration">Duration</Label>
                    <Input
                      id="service-duration"
                      placeholder="2-3 hours"
                      value={serviceDetails.duration}
                      onChange={(e) => setServiceDetails(prev => ({ ...prev, duration: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="service-tags">Tags</Label>
                    <div className="flex gap-2">
                      <Input
                        id="service-tags"
                        placeholder="Add tag"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      />
                      <Button type="button" size="sm" onClick={addTag}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {serviceDetails.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {serviceDetails.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                            <button onClick={() => removeTag(tag)} className="ml-1">
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Poll Options */}
            {composerType === 'poll' && (
              <div className="space-y-3">
                {pollOptions.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...pollOptions];
                        newOptions[index] = e.target.value;
                        setPollOptions(newOptions);
                      }}
                    />
                    {index > 1 && (
                      <Button variant="ghost" size="sm" onClick={() => setPollOptions(prev => prev.filter((_, i) => i !== index))}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {pollOptions.length < 4 && (
                  <Button variant="outline" size="sm" onClick={() => setPollOptions(prev => [...prev, ''])}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Option
                  </Button>
                )}
              </div>
            )}

            {/* Media Preview */}
            {composerMedia.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {composerMedia.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeMedia(index)}
                      className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Composer Actions */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <input
                  type="file"
                  id="media-upload"
                  accept="image/*,video/*"
                  multiple
                  className="hidden"
                  onChange={handleMediaUpload}
                />
                <label htmlFor="media-upload">
                  <Button variant="ghost" size="sm" asChild>
                    <span className="cursor-pointer">
                      <ImageIcon className="h-4 w-4" />
                    </span>
                  </Button>
                </label>
                <Button variant="ghost" size="sm">
                  <MapPin className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setComposerOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleCreatePost}
                  disabled={!composerContent.trim()}
                >
                  Share
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading community...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Community Features */}
        <div className="lg:col-span-1 space-y-6">
          <LiveEventsSection />
          <TrendingSection />
          
          {/* Community Stats */}
          <Card>
            <CardHeader className="pb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Users className="h-4 w-4" />
                Community Stats
              </h3>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active users</span>
                <span className="font-medium">2,347</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Posts today</span>
                <span className="font-medium">189</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Events this week</span>
                <span className="font-medium">12</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <StoriesSection />
          <EnhancedComposer />
          
          {/* Enhanced Tab Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="discover" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Discover
              </TabsTrigger>
              <TabsTrigger value="trending" className="flex items-center gap-2">
                <Fire className="h-4 w-4" />
                Trending
              </TabsTrigger>
              <TabsTrigger value="nearby" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Nearby
              </TabsTrigger>
              <TabsTrigger value="events" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Events
              </TabsTrigger>
            </TabsList>

            {/* Search and Filter */}
            <div className="flex gap-2 mt-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search posts, people, topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-32">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="photography">Photography</SelectItem>
                  <SelectItem value="events">Events</SelectItem>
                  <SelectItem value="services">Services</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tab Content with Enhanced Posts */}
            <div className="mt-6">
              {posts.length === 0 ? (
                <Card className="p-8 text-center">
                  <Globe className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Welcome to the Community!</h3>
                  <p className="text-muted-foreground mb-4">
                    Start exploring, share your thoughts, or create your first post to connect with others.
                  </p>
                  <Button onClick={() => setComposerOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Post
                  </Button>
                </Card>
              ) : (
                <div className="space-y-6">
                  {posts.map(post => (
                    // Enhanced PostCard with new features
                    <Card key={post.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        {/* Post Header */}
                        <div className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={post.author.avatar} alt={post.author.displayName} />
                                <AvatarFallback>{post.author.displayName.charAt(0)}</AvatarFallback>
                              </Avatar>
                              {post.author.isOnline && (
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{post.author.displayName}</span>
                                {post.author.isVerified && (
                                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs">✓</span>
                                  </div>
                                )}
                                {post.type === 'service' && <Badge variant="secondary" className="text-xs">Service</Badge>}
                                {post.type === 'event' && <Badge variant="default" className="text-xs">Event</Badge>}
                                {post.type === 'poll' && <Badge variant="outline" className="text-xs">Poll</Badge>}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>@{post.author.username}</span>
                                <span>·</span>
                                <span>{formatTimeAgo(post.timestamp)}</span>
                                {post.author.location && (
                                  <>
                                    <span>·</span>
                                    <span className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      {post.author.location}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Post Content */}
                        <div className="px-4 pb-4">
                          <p className="text-foreground whitespace-pre-wrap">{post.content}</p>
                          
                          {/* Enhanced Service Details */}
                          {post.type === 'service' && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="flex flex-wrap gap-4 text-sm">
                                {post.location && (
                                  <div className="flex items-center gap-1 text-blue-700">
                                    <MapPin className="h-4 w-4" />
                                    <span>{post.location}</span>
                                  </div>
                                )}
                                {post.price && (
                                  <div className="flex items-center gap-1 text-blue-700">
                                    <DollarSign className="h-4 w-4" />
                                    <span>{formatPrice(post.price, post.isListing)}</span>
                                  </div>
                                )}
                                {post.availability && (
                                  <div className="flex items-center gap-1 text-blue-700">
                                    <Calendar className="h-4 w-4" />
                                    <span>{post.availability}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Poll Component */}
                          {post.poll && (
                            <div className="mt-4 p-4 bg-accent/50 rounded-lg">
                              <h4 className="font-medium mb-3">{post.poll.question}</h4>
                              <div className="space-y-2">
                                {post.poll.options.map((option, index) => (
                                  <div key={index} className="flex items-center justify-between p-2 bg-background rounded border cursor-pointer hover:border-primary">
                                    <span className="text-sm">{option.text}</span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-muted-foreground">{option.votes}</span>
                                      <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                                        <div 
                                          className="h-full bg-primary rounded-full"
                                          style={{ width: `${(option.votes / post.poll!.totalVotes) * 100}%` }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <p className="text-xs text-muted-foreground mt-2">{post.poll.totalVotes} votes</p>
                            </div>
                          )}

                          {/* Event Component */}
                          {post.event && (
                            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium text-green-800">{post.event.title}</h4>
                                  <div className="flex items-center gap-4 mt-2 text-sm text-green-700">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-4 w-4" />
                                      <span>{post.event.date.toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <MapPin className="h-4 w-4" />
                                      <span>{post.event.location}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Users className="h-4 w-4" />
                                      <span>{post.event.attendees} attending</span>
                                    </div>
                                  </div>
                                </div>
                                <Button size="sm" variant={post.event.isAttending ? "default" : "outline"}>
                                  {post.event.isAttending ? "Attending" : "Join Event"}
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Media */}
                        {post.media && post.media.length > 0 && (
                          <div className={`grid gap-1 ${post.media.length === 1 ? 'grid-cols-1' : post.media.length === 2 ? 'grid-cols-2' : post.media.length === 3 ? 'grid-cols-2' : 'grid-cols-2'}`}>
                            {post.media.map((media, index) => (
                              <div 
                                key={index} 
                                className={`relative ${post.media!.length === 3 && index === 0 ? 'row-span-2' : ''}`}
                              >
                                {media.type === 'image' ? (
                                  <img
                                    src={media.url}
                                    alt={media.alt || `Post media ${index + 1}`}
                                    className="w-full h-64 object-cover cursor-pointer hover:opacity-90"
                                  />
                                ) : (
                                  <video
                                    src={media.url}
                                    className="w-full h-64 object-cover"
                                    controls
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Enhanced Post Actions */}
                        <div className="p-4 border-t flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <button
                              onClick={() => handleLikePost(post.id)}
                              className={`flex items-center gap-2 hover:text-red-500 transition-colors ${
                                post.liked ? 'text-red-500' : 'text-muted-foreground'
                              }`}
                            >
                              <Heart className={`h-5 w-5 ${post.liked ? 'fill-current' : ''}`} />
                              <span className="text-sm">{post.likes}</span>
                            </button>
                            
                            <button className="flex items-center gap-2 text-muted-foreground hover:text-blue-500 transition-colors">
                              <MessageCircle className="h-5 w-5" />
                              <span className="text-sm">{post.comments}</span>
                            </button>
                            
                            <button className="flex items-center gap-2 text-muted-foreground hover:text-green-500 transition-colors">
                              <Share2 className="h-5 w-5" />
                              <span className="text-sm">{post.shares}</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <button className="text-muted-foreground hover:text-blue-500 transition-colors">
                              <Bookmark className={`h-5 w-5 ${post.bookmarked ? 'fill-current text-blue-500' : ''}`} />
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </Tabs>
        </div>

        {/* Right Sidebar - Social Features */}
        <div className="lg:col-span-1 space-y-6">
          {/* Suggested People */}
          <Card>
            <CardHeader className="pb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                People to Follow
              </h3>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>U{i}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Creative User {i}</p>
                    <p className="text-xs text-muted-foreground">@user{i} • Photographer</p>
                  </div>
                  <Button size="sm" variant="outline">Follow</Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader className="pb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Upcoming Events
              </h3>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {[
                { title: "Photography Meetup", date: "Tomorrow", attendees: 23 },
                { title: "Community Cleanup", date: "This Weekend", attendees: 45 },
                { title: "Skill Share Evening", date: "Next Week", attendees: 12 }
              ].map((event, i) => (
                <div key={i} className="p-3 bg-accent/50 rounded-lg">
                  <p className="font-medium text-sm">{event.title}</p>
                  <p className="text-xs text-muted-foreground">{event.date} • {event.attendees} attending</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}