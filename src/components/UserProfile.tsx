"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Camera,
  MapPin,
  Calendar,
  Star,
  Heart,
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  Settings,
  Shield,
  Bell,
  Link2,
  Edit,
  MessageCircle,
  UserPlus,
  UserMinus,
  CheckCircle,
  Award,
  Grid3X3,
  Clock,
  Eye,
  MoreHorizontal
} from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  coverPhoto?: string;
  bio?: string;
  location?: string;
  joinedDate: string;
  verified: boolean;
  stats: {
    followers: number;
    following: number;
    posts: number;
    bookings: number;
    rating: number;
    totalEarnings?: number;
  };
  isOwner: boolean;
  isFollowing?: boolean;
}

interface Post {
  id: string;
  title: string;
  image: string;
  price: number;
  rating: number;
  category: string;
  views: number;
  createdAt: string;
}

interface Booking {
  id: string;
  serviceName: string;
  customerName: string;
  date: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  amount: number;
}

interface Review {
  id: string;
  reviewerName: string;
  reviewerAvatar: string;
  rating: number;
  comment: string;
  date: string;
  serviceName: string;
}

const UserProfile = () => {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState("posts");

  // Form state for editing
  const [editForm, setEditForm] = useState({
    name: "",
    bio: "",
    location: ""
  });

  // Settings state
  const [settings, setSettings] = useState({
    publicProfile: true,
    showEmail: false,
    showLocation: true,
    emailNotifications: true,
    bookingNotifications: true,
    marketingEmails: false
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  // Mock data loader
  const loadUserData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock user profile data
      const mockProfile: UserProfile = {
        id: session?.user?.id || "1",
        name: session?.user?.name || "John Doe",
        email: session?.user?.email || "john@example.com",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
        coverPhoto: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop",
        bio: "Passionate about sharing unique experiences and connecting people through memorable adventures. Host of various outdoor activities and cultural experiences.",
        location: "San Francisco, CA",
        joinedDate: "2023-03-15",
        verified: true,
        stats: {
          followers: 1234,
          following: 567,
          posts: 24,
          bookings: 89,
          rating: 4.8,
          totalEarnings: 12450
        },
        isOwner: true,
        isFollowing: false
      };

      // Mock posts data
      const mockPosts: Post[] = [
        {
          id: "1",
          title: "Sunset Photography Tour",
          image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop",
          price: 75,
          rating: 4.9,
          category: "Photography",
          views: 234,
          createdAt: "2024-01-15"
        },
        {
          id: "2",
          title: "Cooking Class: Italian Cuisine",
          image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop",
          price: 120,
          rating: 4.7,
          category: "Culinary",
          views: 189,
          createdAt: "2024-01-10"
        },
        {
          id: "3",
          title: "Urban Sketching Workshop",
          image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=200&fit=crop",
          price: 45,
          rating: 4.8,
          category: "Art",
          views: 156,
          createdAt: "2024-01-08"
        }
      ];

      // Mock bookings data
      const mockBookings: Booking[] = [
        {
          id: "1",
          serviceName: "Sunset Photography Tour",
          customerName: "Alice Johnson",
          date: "2024-01-25",
          status: "confirmed",
          amount: 75
        },
        {
          id: "2",
          serviceName: "Cooking Class: Italian Cuisine",
          customerName: "Bob Smith",
          date: "2024-01-28",
          status: "pending",
          amount: 120
        }
      ];

      // Mock reviews data
      const mockReviews: Review[] = [
        {
          id: "1",
          reviewerName: "Sarah Wilson",
          reviewerAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=40&h=40&fit=crop&crop=face",
          rating: 5,
          comment: "Amazing experience! John was incredibly knowledgeable and made the photography tour both educational and fun.",
          date: "2024-01-20",
          serviceName: "Sunset Photography Tour"
        },
        {
          id: "2",
          reviewerName: "Mike Chen",
          reviewerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
          rating: 4,
          comment: "Great cooking class! Learned so much about authentic Italian techniques.",
          date: "2024-01-18",
          serviceName: "Cooking Class: Italian Cuisine"
        }
      ];

      setProfile(mockProfile);
      setPosts(mockPosts);
      setBookings(mockBookings);
      setReviews(mockReviews);
      
      setEditForm({
        name: mockProfile.name,
        bio: mockProfile.bio || "",
        location: mockProfile.location || ""
      });

    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  }, [session?.user]);

  useEffect(() => {
    if (session?.user) {
      loadUserData();
    }
  }, [session?.user, loadUserData]);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (profile) {
        setProfile({
          ...profile,
          name: editForm.name,
          bio: editForm.bio,
          location: editForm.location
        });
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const calculateProfileCompletion = () => {
    if (!profile) return 0;
    
    let completed = 0;
    const total = 6;
    
    if (profile.avatar) completed++;
    if (profile.bio) completed++;
    if (profile.location) completed++;
    if (profile.coverPhoto) completed++;
    if (profile.verified) completed++;
    completed++; // Basic info always completed
    
    return Math.round((completed / total) * 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Cover Photo Skeleton */}
          <div className="h-64 bg-muted rounded-lg animate-pulse" />
          
          {/* Profile Header Skeleton */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-32 h-32 bg-muted rounded-full animate-pulse" />
            <div className="flex-1 space-y-4">
              <div className="h-8 bg-muted rounded animate-pulse w-48" />
              <div className="h-4 bg-muted rounded animate-pulse w-64" />
              <div className="h-4 bg-muted rounded animate-pulse w-32" />
            </div>
          </div>
          
          {/* Stats Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Profile not found</h2>
          <p className="text-muted-foreground">Unable to load profile data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Cover Photo */}
      <div className="relative h-64 bg-gradient-to-r from-blue-500 to-purple-600 overflow-hidden">
        {profile.coverPhoto && (
          <img
            src={profile.coverPhoto}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        )}
        {profile.isOwner && (
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-4 right-4"
          >
            <Camera className="w-4 h-4 mr-2" />
            Change Cover
          </Button>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-16 relative z-10">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="w-32 h-32 border-4 border-background">
              <AvatarImage src={profile.avatar} alt={profile.name} />
              <AvatarFallback className="text-2xl">
                {profile.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            {profile.isOwner && (
              <Button
                variant="secondary"
                size="sm"
                className="absolute bottom-0 right-0 rounded-full w-10 h-10 p-0"
              >
                <Camera className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 pt-16 md:pt-8">
            {!isEditing ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold">{profile.name}</h1>
                  {profile.verified && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground mb-4">{profile.bio}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                  {profile.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {profile.location}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Joined {new Date(profile.joinedDate).toLocaleDateString('en-US', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </div>
                </div>
              </>
            ) : (
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="max-w-md"
                  />
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    className="max-w-md"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="max-w-md"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" size="sm">Save Changes</Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            {/* Action Buttons */}
            {!isEditing && (
              <div className="flex flex-wrap gap-2">
                {profile.isOwner ? (
                  <Button onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button>
                      {profile.isFollowing ? (
                        <>
                          <UserMinus className="w-4 h-4 mr-2" />
                          Unfollow
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Follow
                        </>
                      )}
                    </Button>
                    <Button variant="outline">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Profile Completion */}
        {profile.isOwner && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="w-5 h-5" />
                Profile Completion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Progress value={calculateProfileCompletion()} className="flex-1" />
                <span className="text-sm font-medium">{calculateProfileCompletion()}%</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Complete your profile to attract more bookings
              </p>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="text-center">
            <CardContent className="p-4">
              <Users className="w-6 h-6 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{profile.stats.followers.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Followers</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-4">
              <Heart className="w-6 h-6 mx-auto mb-2 text-red-500" />
              <div className="text-2xl font-bold">{profile.stats.following.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Following</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-4">
              <BookOpen className="w-6 h-6 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">{profile.stats.posts}</div>
              <div className="text-sm text-muted-foreground">Posts</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-4">
              <Calendar className="w-6 h-6 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold">{profile.stats.bookings}</div>
              <div className="text-sm text-muted-foreground">Bookings</div>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-4">
              <Star className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold">{profile.stats.rating}</div>
              <div className="text-sm text-muted-foreground">Rating</div>
            </CardContent>
          </Card>
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <Grid3X3 className="w-4 h-4" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Reviews
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Posts Tab */}
          <TabsContent value="posts" className="mt-6">
            {posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-48 object-cover"
                      />
                      <Badge className="absolute top-2 left-2">
                        {post.category}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">{post.title}</h3>
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          {post.rating}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {post.views}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold">${post.price}</span>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                <p className="text-muted-foreground">Start sharing your experiences!</p>
              </div>
            )}
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="mt-6">
            {profile.isOwner && profile.stats.totalEarnings && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Earnings Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="text-3xl font-bold">${profile.stats.totalEarnings.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Total Earnings</div>
                    </div>
                    <div className="flex items-center gap-1 text-green-600">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm">+12% this month</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{booking.serviceName}</h3>
                          <p className="text-sm text-muted-foreground">
                            Customer: {booking.customerName}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{new Date(booking.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold">${booking.amount}</div>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
                <p className="text-muted-foreground">Your bookings will appear here</p>
              </div>
            )}
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="mt-6">
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarImage src={review.reviewerAvatar} alt={review.reviewerName} />
                          <AvatarFallback>{review.reviewerName[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{review.reviewerName}</h4>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {new Date(review.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Service: {review.serviceName}
                          </p>
                          <p>{review.comment}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Star className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
                <p className="text-muted-foreground">Reviews from customers will appear here</p>
              </div>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            {profile.isOwner ? (
              <div className="space-y-6">
                {/* Account Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Account Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Public Profile</Label>
                        <p className="text-sm text-muted-foreground">
                          Make your profile visible to everyone
                        </p>
                      </div>
                      <Switch
                        checked={settings.publicProfile}
                        onCheckedChange={(checked) =>
                          setSettings({ ...settings, publicProfile: checked })
                        }
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Show Email</Label>
                        <p className="text-sm text-muted-foreground">
                          Display your email on your profile
                        </p>
                      </div>
                      <Switch
                        checked={settings.showEmail}
                        onCheckedChange={(checked) =>
                          setSettings({ ...settings, showEmail: checked })
                        }
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Show Location</Label>
                        <p className="text-sm text-muted-foreground">
                          Display your location on your profile
                        </p>
                      </div>
                      <Switch
                        checked={settings.showLocation}
                        onCheckedChange={(checked) =>
                          setSettings({ ...settings, showLocation: checked })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Privacy Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Privacy Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Manage your privacy preferences and data settings.
                    </p>
                    <Button variant="outline" className="mt-4">
                      View Privacy Policy
                    </Button>
                  </CardContent>
                </Card>

                {/* Notification Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      Notification Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications via email
                        </p>
                      </div>
                      <Switch
                        checked={settings.emailNotifications}
                        onCheckedChange={(checked) =>
                          setSettings({ ...settings, emailNotifications: checked })
                        }
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Booking Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified about new bookings
                        </p>
                      </div>
                      <Switch
                        checked={settings.bookingNotifications}
                        onCheckedChange={(checked) =>
                          setSettings({ ...settings, bookingNotifications: checked })
                        }
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Marketing Emails</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive promotional emails and updates
                        </p>
                      </div>
                      <Switch
                        checked={settings.marketingEmails}
                        onCheckedChange={(checked) =>
                          setSettings({ ...settings, marketingEmails: checked })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Connected Accounts */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Link2 className="w-5 h-5" />
                      Connected Accounts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Connect your social media accounts to enhance your profile.
                    </p>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <Link2 className="w-4 h-4 mr-2" />
                        Connect Instagram
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Link2 className="w-4 h-4 mr-2" />
                        Connect Facebook
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-12">
                <Settings className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Settings not available</h3>
                <p className="text-muted-foreground">You can only view settings for your own profile</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export const UserProfileComponent = UserProfile;
export default UserProfile;