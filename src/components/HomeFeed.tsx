"use client";

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  BookmarkCheck,
  Plus,
  Calendar,
  Mail,
  TrendingUp,
  Users,
  Clock,
  Sparkles,
  ArrowRight,
  Image as ImageIcon,
  Send,
  MoreHorizontal,
  Star
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  followers?: number;
  following?: number;
}

interface Post {
  id: string;
  content: string;
  author: User;
  createdAt: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isBookmarked: boolean;
  images?: string[];
}

interface QuickStats {
  newMessages: number;
  bookingRequests: number;
  newFollowers: number;
  notifications: number;
}

export const HomeFeed = () => {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickPostContent, setQuickPostContent] = useState('');
  const [activeTab, setActiveTab] = useState('for-you');
  const [quickStats, setQuickStats] = useState<QuickStats>({
    newMessages: 0,
    bookingRequests: 0,
    newFollowers: 0,
    notifications: 0
  });

  useEffect(() => {
    if (session?.user) {
      fetchPersonalizedFeed();
      fetchBookmarkedPosts();
      fetchQuickStats();
    }
  }, [session, activeTab]);

  const fetchPersonalizedFeed = async () => {
    try {
      const token = localStorage.getItem('bearer_token');
      const endpoint = activeTab === 'following' 
        ? '/api/posts?filter=following' 
        : '/api/posts?filter=personalized';
        
      const response = await fetch(endpoint, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Error fetching feed:', error);
      toast.error('Failed to load your personalized feed');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarkedPosts = async () => {
    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch('/api/posts?filter=bookmarked', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      if (response.ok) {
        const data = await response.json();
        setBookmarkedPosts(data.posts?.slice(0, 3) || []);
      }
    } catch (error) {
      console.error('Error fetching bookmarked posts:', error);
    }
  };

  const fetchQuickStats = async () => {
    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch('/api/user/stats', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      if (response.ok) {
        const data = await response.json();
        setQuickStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const createQuickPost = async () => {
    if (!quickPostContent.trim()) return;

    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({ content: quickPostContent })
      });

      if (response.ok) {
        const newPost = await response.json();
        setPosts([newPost, ...posts]);
        setQuickPostContent('');
        toast.success('Post shared successfully!');
      } else {
        toast.error('Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    }
  };

  const toggleLike = async (postId: string) => {
    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (response.ok) {
        setPosts(posts.map(post => 
          post.id === postId 
            ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
            : post
        ));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const toggleBookmark = async (postId: string) => {
    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch(`/api/posts/${postId}/bookmark`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (response.ok) {
        setPosts(posts.map(post => 
          post.id === postId 
            ? { ...post, isBookmarked: !post.isBookmarked }
            : post
        ));
        if (!posts.find(p => p.id === postId)?.isBookmarked) {
          fetchBookmarkedPosts();
        }
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-display font-bold mb-4">Welcome to Your Personal Feed</h2>
          <p className="text-muted-foreground mb-6">Sign in to see personalized content and connect with your network</p>
          <Button>Sign In</Button>
        </Card>
      </div>
    );
  }

  const WelcomeSection = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {session.user.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-muted-foreground">Here's what's happening in your network</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Messages
            {quickStats.newMessages > 0 && (
              <Badge variant="secondary" className="bg-red-500 text-white text-xs px-1.5 py-0.5">
                {quickStats.newMessages}
              </Badge>
            )}
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Bookings
            {quickStats.bookingRequests > 0 && (
              <Badge variant="secondary" className="bg-blue-500 text-white text-xs px-1.5 py-0.5">
                {quickStats.bookingRequests}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Mail className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">New Messages</p>
              <p className="text-xl font-semibold">{quickStats.newMessages}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Booking Requests</p>
              <p className="text-xl font-semibold">{quickStats.bookingRequests}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">New Followers</p>
              <p className="text-xl font-semibold">{quickStats.newFollowers}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Engagement</p>
              <p className="text-xl font-semibold">
                {posts.reduce((sum, post) => sum + post.likes + post.comments, 0)}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const QuickPostComposer = () => (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={session.user.image} />
            <AvatarFallback>{session.user.name?.[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3">
            <Textarea
              placeholder="What's on your mind?"
              value={quickPostContent}
              onChange={(e) => setQuickPostContent(e.target.value)}
              className="min-h-[80px] resize-none border-0 shadow-none focus-visible:ring-0 text-base"
            />
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Photo
                </Button>
              </div>
              <Button 
                onClick={createQuickPost}
                disabled={!quickPostContent.trim()}
                size="sm"
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const PostCard = ({ post, compact = false }: { post: Post; compact?: boolean }) => (
    <Card className={compact ? "mb-3" : "mb-6"}>
      <CardContent className={compact ? "p-4" : "p-6"}>
        <div className="flex gap-3">
          <Avatar className={compact ? "h-8 w-8" : "h-12 w-12"}>
            <AvatarImage src={post.author.avatar} />
            <AvatarFallback>{post.author.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className={`font-semibold ${compact ? 'text-sm' : 'text-base'}`}>
                  {post.author.name}
                </h4>
                <p className={`text-muted-foreground ${compact ? 'text-xs' : 'text-sm'}`}>
                  {new Date(post.createdAt).toRelativeTimeString()}
                </p>
              </div>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
            
            <p className={`mb-4 ${compact ? 'text-sm line-clamp-2' : ''}`}>
              {post.content}
            </p>

            {post.images && post.images.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mb-4 rounded-lg overflow-hidden">
                {post.images.slice(0, 4).map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt=""
                    className="w-full h-32 object-cover"
                  />
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex gap-6">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => toggleLike(post.id)}
                  className={`flex items-center gap-2 ${post.isLiked ? 'text-red-500' : ''}`}
                >
                  <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                  <span className="text-sm">{post.likes}</span>
                </Button>

                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-sm">{post.comments}</span>
                </Button>

                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  <span className="text-sm">{post.shares}</span>
                </Button>
              </div>

              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => toggleBookmark(post.id)}
                className={post.isBookmarked ? 'text-blue-500' : ''}
              >
                {post.isBookmarked ? (
                  <BookmarkCheck className="h-4 w-4 fill-current" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const BookmarkedSection = () => (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Bookmark className="h-4 w-4" />
            Recently Bookmarked
          </h3>
          <Button variant="ghost" size="sm" className="text-blue-600">
            View all <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {bookmarkedPosts.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">
            No bookmarked posts yet
          </p>
        ) : (
          <div className="space-y-3">
            {bookmarkedPosts.map(post => (
              <PostCard key={post.id} post={post} compact />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const LoadingSkeleton = () => (
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-3">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-16 w-full" />
                <div className="flex gap-6">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <WelcomeSection />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <QuickPostComposer />
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="for-you" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                For You
              </TabsTrigger>
              <TabsTrigger value="following" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Following
              </TabsTrigger>
            </TabsList>

            <TabsContent value="for-you" className="mt-6">
              {loading ? (
                <LoadingSkeleton />
              ) : posts.length === 0 ? (
                <Card className="p-8 text-center">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Your feed is waiting!</h3>
                  <p className="text-muted-foreground mb-4">
                    Follow more people or create your first post to see personalized content here.
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Post
                  </Button>
                </Card>
              ) : (
                <div className="space-y-6">
                  {posts.map(post => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="following" className="mt-6">
              {loading ? (
                <LoadingSkeleton />
              ) : posts.length === 0 ? (
                <Card className="p-8 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No posts from people you follow</h3>
                  <p className="text-muted-foreground mb-4">
                    Follow more people to see their posts here, or check out the "For You" tab for recommendations.
                  </p>
                  <Button variant="outline">Find People to Follow</Button>
                </Card>
              ) : (
                <div className="space-y-6">
                  {posts.map(post => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <BookmarkedSection />
          
          <Card>
            <CardHeader className="pb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Star className="h-4 w-4" />
                Suggested for You
              </h3>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>U{i}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-sm">User {i}</p>
                      <p className="text-xs text-muted-foreground">Suggested for you</p>
                    </div>
                    <Button size="sm" variant="outline">Follow</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Trending in Your Network
              </h3>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {['Product Design', 'Remote Work', 'AI Technology'].map((topic, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">#{topic}</p>
                      <p className="text-xs text-muted-foreground">{Math.floor(Math.random() * 100) + 50} posts</p>
                    </div>
                    <Button size="sm" variant="ghost">
                      <TrendingUp className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};