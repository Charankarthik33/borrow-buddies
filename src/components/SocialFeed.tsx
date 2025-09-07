"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Heart, 
  MessageCircle, 
  Share, 
  Bookmark, 
  MoreHorizontal, 
  Image as ImageIcon, 
  MapPin, 
  Calendar, 
  Star,
  Clock,
  Users,
  DollarSign,
  Send
} from "lucide-react";

interface Post {
  id: string;
  user: {
    name: string;
    avatar: string;
    username: string;
    verified?: boolean;
  };
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isBookmarked: boolean;
  type: 'regular' | 'service' | 'experience' | 'review';
  serviceDetails?: {
    title: string;
    price: string;
    location: string;
    rating?: number;
    availability: string;
  };
}

interface Story {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  hasNew: boolean;
}

const mockStories: Story[] = [
  { id: '1', user: { name: 'Your Story', avatar: '/api/placeholder/40/40' }, hasNew: false },
  { id: '2', user: { name: 'Sarah', avatar: '/api/placeholder/40/40' }, hasNew: true },
  { id: '3', user: { name: 'Mike', avatar: '/api/placeholder/40/40' }, hasNew: true },
  { id: '4', user: { name: 'Emma', avatar: '/api/placeholder/40/40' }, hasNew: false },
  { id: '5', user: { name: 'James', avatar: '/api/placeholder/40/40' }, hasNew: true },
  { id: '6', user: { name: 'Lisa', avatar: '/api/placeholder/40/40' }, hasNew: false },
];

const mockPosts: Post[] = [
  {
    id: '1',
    user: { name: 'Sarah Johnson', avatar: '/api/placeholder/40/40', username: '@sarahj_photo', verified: true },
    content: "Just finished an amazing photography session with @mikephoto! His lighting techniques are incredible. If you're looking for professional headshots in NYC, he's your guy! 📸✨",
    image: '/api/placeholder/500/300',
    timestamp: '2 hours ago',
    likes: 42,
    comments: 8,
    shares: 3,
    isLiked: false,
    isBookmarked: true,
    type: 'review',
    serviceDetails: {
      title: 'Professional Photography Session',
      price: '$150/hour',
      location: 'New York, NY',
      rating: 4.9,
      availability: 'Available weekends'
    }
  },
  {
    id: '2',
    user: { name: 'Mike Chen', avatar: '/api/placeholder/40/40', username: '@mikecooks' },
    content: "Offering cooking classes this weekend! Learn to make authentic Chinese dumplings from scratch. Perfect for date nights or family activities 🥟👨‍🍳",
    timestamp: '4 hours ago',
    likes: 67,
    comments: 15,
    shares: 12,
    isLiked: true,
    isBookmarked: false,
    type: 'service',
    serviceDetails: {
      title: 'Chinese Dumpling Making Class',
      price: '$45/person',
      location: 'Brooklyn, NY',
      availability: 'This weekend'
    }
  },
  {
    id: '3',
    user: { name: 'Emma Davis', avatar: '/api/placeholder/40/40', username: '@emmayoga' },
    content: "Morning meditation in Central Park was absolutely magical today 🧘‍♀️ The sunrise, the peaceful energy... this is why I love sharing these moments with others. Join me next week!",
    image: '/api/placeholder/500/300',
    timestamp: '6 hours ago',
    likes: 89,
    comments: 12,
    shares: 5,
    isLiked: true,
    isBookmarked: true,
    type: 'experience'
  },
  {
    id: '4',
    user: { name: 'James Wilson', avatar: '/api/placeholder/40/40', username: '@jamesguitars' },
    content: "Had the most incredible guitar lesson with @alexmusic today! Finally nailed that solo I've been struggling with for months. His teaching style is perfect for intermediate players 🎸🔥",
    timestamp: '8 hours ago',
    likes: 34,
    comments: 6,
    shares: 2,
    isLiked: false,
    isBookmarked: false,
    type: 'review',
    serviceDetails: {
      title: 'Guitar Lessons',
      price: '$60/hour',
      location: 'Manhattan, NY',
      rating: 4.8,
      availability: 'Weekday evenings'
    }
  },
  {
    id: '5',
    user: { name: 'Lisa Park', avatar: '/api/placeholder/40/40', username: '@lisadesigns' },
    content: "Just launched my new interior design consultation service! Transform your space with personalized design solutions. First consultation is 50% off for new clients ✨🏠",
    image: '/api/placeholder/500/300',
    timestamp: '12 hours ago',
    likes: 156,
    comments: 23,
    shares: 18,
    isLiked: false,
    isBookmarked: true,
    type: 'service',
    serviceDetails: {
      title: 'Interior Design Consultation',
      price: '$100/session',
      location: 'Queens, NY',
      availability: 'Flexible scheduling'
    }
  }
];

export const SocialFeed = () => {
  const { data: session, isPending } = useSession();
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [newPost, setNewPost] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [postType, setPostType] = useState<'regular' | 'service'>('regular');

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked, 
            likes: post.isLiked ? post.likes - 1 : post.likes + 1 
          }
        : post
    ));
  };

  const handleBookmark = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, isBookmarked: !post.isBookmarked }
        : post
    ));
  };

  const handleCreatePost = async () => {
    if (!newPost.trim() || !session?.user) return;
    
    setIsPosting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const post: Post = {
      id: Date.now().toString(),
      user: {
        name: session.user.name || 'You',
        avatar: session.user.image || '/api/placeholder/40/40',
        username: `@${session.user.name?.toLowerCase().replace(' ', '')}` || '@user'
      },
      content: newPost,
      image: selectedImage ? URL.createObjectURL(selectedImage) : undefined,
      timestamp: 'Just now',
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false,
      isBookmarked: false,
      type: postType
    };
    
    setPosts(prev => [post, ...prev]);
    setNewPost('');
    setSelectedImage(null);
    setIsPosting(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  if (isPending) {
    return (
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="animate-pulse">
          <div className="flex space-x-4 mb-6">
            <div className="h-16 w-16 bg-muted rounded-full"></div>
            <div className="h-16 w-16 bg-muted rounded-full"></div>
            <div className="h-16 w-16 bg-muted rounded-full"></div>
          </div>
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="h-24 bg-muted rounded-lg mb-4"></div>
              <div className="h-10 bg-muted rounded-lg"></div>
            </CardContent>
          </Card>
          {[1, 2, 3].map((i) => (
            <Card key={i} className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="h-10 w-10 bg-muted rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-muted rounded"></div>
                    <div className="h-3 w-20 bg-muted rounded"></div>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="h-4 w-full bg-muted rounded"></div>
                  <div className="h-4 w-3/4 bg-muted rounded"></div>
                </div>
                <div className="h-48 bg-muted rounded-lg"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Stories Section */}
      <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
        {mockStories.map((story) => (
          <div key={story.id} className="flex-shrink-0 text-center cursor-pointer group">
            <div className={`relative p-1 rounded-full ${story.hasNew ? 'bg-gradient-to-tr from-pink-500 to-orange-400' : 'bg-muted'}`}>
              <Avatar className="h-16 w-16 border-2 border-background">
                <AvatarImage src={story.user.avatar} />
                <AvatarFallback>{story.user.name[0]}</AvatarFallback>
              </Avatar>
              {story.hasNew && (
                <div className="absolute -top-1 -right-1 h-4 w-4 bg-blue-500 rounded-full border-2 border-background"></div>
              )}
            </div>
            <p className="text-xs mt-2 text-muted-foreground group-hover:text-foreground transition-colors">
              {story.user.name}
            </p>
          </div>
        ))}
      </div>

      {/* Post Creation */}
      {session?.user && (
        <Card>
          <CardContent className="p-6">
            <div className="flex space-x-4">
              <Avatar>
                <AvatarImage src={session.user.image || '/api/placeholder/40/40'} />
                <AvatarFallback>{session.user.name?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-4">
                <Textarea
                  placeholder="What's happening in your world?"
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="min-h-[100px] resize-none border-none p-0 text-lg placeholder:text-muted-foreground focus-visible:ring-0"
                />
                
                {selectedImage && (
                  <div className="relative">
                    <img 
                      src={URL.createObjectURL(selectedImage)} 
                      alt="Upload preview" 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2"
                      onClick={() => setSelectedImage(null)}
                    >
                      Remove
                    </Button>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload">
                      <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-600" asChild>
                        <div className="cursor-pointer">
                          <ImageIcon className="h-5 w-5 mr-2" />
                          Photo
                        </div>
                      </Button>
                    </label>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant={postType === 'regular' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setPostType('regular')}
                      >
                        Post
                      </Button>
                      <Button
                        variant={postType === 'service' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setPostType('service')}
                      >
                        Service
                      </Button>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleCreatePost}
                    disabled={!newPost.trim() || isPosting}
                    className="px-6"
                  >
                    {isPosting ? (
                      <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    {isPosting ? 'Posting...' : 'Post'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.map((post) => (
          <Card key={post.id} className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={post.user.avatar} />
                    <AvatarFallback>{post.user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{post.user.name}</h3>
                      {post.user.verified && (
                        <div className="h-4 w-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <div className="h-2 w-2 bg-white rounded-full"></div>
                        </div>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        {post.type === 'service' ? 'Service' : 
                         post.type === 'experience' ? 'Experience' : 
                         post.type === 'review' ? 'Review' : 'Post'}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span>{post.user.username}</span>
                      <span>•</span>
                      <span>{post.timestamp}</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <p className="mb-4 leading-relaxed">{post.content}</p>
              
              {post.image && (
                <div className="mb-4">
                  <img 
                    src={post.image} 
                    alt="Post content" 
                    className="w-full rounded-lg object-cover max-h-96"
                  />
                </div>
              )}

              {post.serviceDetails && (
                <Card className="mb-4 bg-muted/30">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">{post.serviceDetails.title}</h4>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4" />
                            <span>{post.serviceDetails.price}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{post.serviceDetails.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{post.serviceDetails.availability}</span>
                          </div>
                        </div>
                      </div>
                      {post.serviceDetails.rating && (
                        <div className="flex items-center space-x-1 bg-background px-2 py-1 rounded-full">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{post.serviceDetails.rating}</span>
                        </div>
                      )}
                    </div>
                    <Button size="sm" className="w-full">
                      Book Now
                    </Button>
                  </CardContent>
                </Card>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-6">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleLike(post.id)}
                    className={`space-x-2 ${post.isLiked ? 'text-red-500 hover:text-red-600' : 'hover:text-red-500'}`}
                  >
                    <Heart className={`h-5 w-5 ${post.isLiked ? 'fill-current' : ''}`} />
                    <span>{post.likes}</span>
                  </Button>
                  
                  <Button variant="ghost" size="sm" className="space-x-2 hover:text-blue-500">
                    <MessageCircle className="h-5 w-5" />
                    <span>{post.comments}</span>
                  </Button>
                  
                  <Button variant="ghost" size="sm" className="space-x-2 hover:text-green-500">
                    <Share className="h-5 w-5" />
                    <span>{post.shares}</span>
                  </Button>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleBookmark(post.id)}
                  className={post.isBookmarked ? 'text-blue-500' : ''}
                >
                  <Bookmark className={`h-5 w-5 ${post.isBookmarked ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!session?.user && (
        <Card className="text-center">
          <CardContent className="p-8">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Join the Community</h3>
            <p className="text-muted-foreground mb-4">
              Sign up to share your experiences, offer services, and connect with amazing people.
            </p>
            <div className="flex justify-center space-x-4">
              <Button>Sign Up</Button>
              <Button variant="outline">Log In</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};