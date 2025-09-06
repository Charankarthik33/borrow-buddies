"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Loader2
} from "lucide-react";
import { toast } from "sonner";

// Types
interface User {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  isVerified?: boolean;
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
  type: 'micro' | 'media' | 'service' | 'listing';
  hashtags: string[];
  mentions: string[];
  location?: string;
  price?: number;
  availability?: string;
  duration?: string;
  serviceCategory?: string;
  tags?: string[];
  isListing?: boolean;
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
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerContent, setComposerContent] = useState("");
  const [composerMedia, setComposerMedia] = useState<File[]>([]);
  const [composerPrivacy, setComposerPrivacy] = useState("public");
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
  const [newTag, setNewTag] = useState("");
  const [currentUser] = useState({
    id: "1",
    username: "your_username",
    displayName: "Your Name",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face"
  });

  // Fetch posts from API
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/posts?limit=20&sort=createdAt&order=desc');
      if (!response.ok) throw new Error('Failed to fetch posts');
      
      const postsData = await response.json();
      
      // Transform API data to component format
      const transformedPosts = await Promise.all(postsData.map(async (post: any): Promise<Post> => {
        // Fetch user data for each post
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
            isVerified: userData?.isVerified || false
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
          type: post.postType as 'micro' | 'media' | 'service' | 'listing',
          hashtags: post.hashtags ? JSON.parse(post.hashtags) : [],
          mentions: post.mentions ? JSON.parse(post.mentions) : [],
          location: post.location,
          price: post.price,
          availability: post.availability,
          duration: post.duration,
          serviceCategory: post.serviceCategory,
          tags: post.tags ? JSON.parse(post.tags) : [],
          isListing: post.isListing || false
        };
      }));
      
      setPosts(transformedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

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

  // Create new post
  const handleCreatePost = useCallback(async () => {
    if (!composerContent.trim()) return;

    try {
      const postData: any = {
        userId: parseInt(currentUser.id),
        content: composerContent,
        postType: isServicePost ? 'service' : (composerMedia.length > 0 ? 'media' : 'micro'),
        hashtags: JSON.stringify([]),
        mentions: JSON.stringify([])
      };

      if (isServicePost && serviceDetails.category) {
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

      const newPostData = await response.json();
      
      // Add new post to the beginning of the list
      const newPost: Post = {
        id: newPostData.id.toString(),
        userId: newPostData.userId,
        author: {
          id: currentUser.id,
          username: currentUser.username,
          displayName: currentUser.displayName,
          avatar: currentUser.avatar,
          isVerified: false
        },
        content: composerContent,
        media: composerMedia.length > 0 ? composerMedia.map(file => ({
          type: file.type.startsWith('video/') ? 'video' as const : 'image' as const,
          url: URL.createObjectURL(file),
          alt: `Uploaded ${file.type.startsWith('video/') ? 'video' : 'image'}`
        })) : undefined,
        timestamp: new Date(),
        likes: 0,
        shares: 0,
        comments: 0,
        bookmarked: false,
        liked: false,
        following: false,
        type: isServicePost ? 'service' : (composerMedia.length > 0 ? 'media' : 'micro'),
        hashtags: [],
        mentions: [],
        location: serviceDetails.location || undefined,
        price: serviceDetails.price ? parseInt(serviceDetails.price) : undefined,
        availability: serviceDetails.availability || undefined,
        duration: serviceDetails.duration || undefined,
        serviceCategory: serviceDetails.category || undefined,
        tags: serviceDetails.tags || [],
        isListing: serviceDetails.category === 'equipment'
      };

      setPosts(prev => [newPost, ...prev]);
      setComposerContent('');
      setComposerMedia([]);
      setComposerOpen(false);
      setIsServicePost(false);
      setServiceDetails({
        category: "",
        location: "",
        price: "",
        priceType: "hourly",
        availability: "",
        duration: "",
        tags: []
      });
      toast.success("Post created successfully!");
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    }
  }, [composerContent, composerMedia, isServicePost, serviceDetails, currentUser]);

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

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading posts...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      {/* Post Composer */}
      <Card>
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
              <span className="text-muted-foreground">What's on your mind?</span>
            </button>
          </div>

          {composerOpen && (
            <div className="space-y-4">
              {/* Post Type Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={!isServicePost ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsServicePost(false)}
                >
                  Regular Post
                </Button>
                <Button
                  variant={isServicePost ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsServicePost(true)}
                >
                  Service Listing
                </Button>
              </div>

              {/* Service Details Form */}
              {isServicePost && (
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

              {/* Content Input */}
              <Textarea
                placeholder={isServicePost ? "Describe your service..." : "What's happening?"}
                value={composerContent}
                onChange={(e) => setComposerContent(e.target.value)}
                className="min-h-[100px] resize-none"
              />

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
                    {isServicePost ? "Post Service" : "Post"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id} className="overflow-hidden">
            <CardContent className="p-0">
              {/* Post Header */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={post.author.avatar} alt={post.author.displayName} />
                    <AvatarFallback>{post.author.displayName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{post.author.displayName}</span>
                      {post.author.isVerified && (
                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>@{post.author.username}</span>
                      <span>·</span>
                      <span>{formatTimeAgo(post.timestamp)}</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>

              {/* Service/Listing Badge */}
              {(post.type === 'service' || post.isListing) && (
                <div className="px-4 pb-2">
                  <Badge variant={post.isListing ? "secondary" : "default"} className="text-xs">
                    {post.isListing ? "Equipment Rental" : "Service Available"}
                  </Badge>
                </div>
              )}

              {/* Post Content */}
              <div className="px-4 pb-4">
                <p className="text-foreground whitespace-pre-wrap">{post.content}</p>
                
                {/* Service Details */}
                {post.type === 'service' && (
                  <div className="mt-3 p-3 bg-accent/50 rounded-lg space-y-2">
                    <div className="flex flex-wrap gap-4 text-sm">
                      {post.location && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{post.location}</span>
                        </div>
                      )}
                      {post.price && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <DollarSign className="h-4 w-4" />
                          <span>{formatPrice(post.price, post.isListing)}</span>
                        </div>
                      )}
                      {post.availability && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{post.availability}</span>
                        </div>
                      )}
                      {post.duration && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{post.duration}</span>
                        </div>
                      )}
                    </div>
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {post.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Hashtags */}
                {post.hashtags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {post.hashtags.map((tag) => (
                      <span key={tag} className="text-blue-600 hover:underline cursor-pointer">
                        #{tag}
                      </span>
                    ))}
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
                          className="w-full h-64 object-cover"
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

              {/* Post Actions */}
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

                <button className="text-muted-foreground hover:text-blue-500 transition-colors">
                  <Bookmark className={`h-5 w-5 ${post.bookmarked ? 'fill-current text-blue-500' : ''}`} />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {posts.length === 0 && !loading && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No posts yet. Be the first to share something!</p>
        </div>
      )}
    </div>
  );
}