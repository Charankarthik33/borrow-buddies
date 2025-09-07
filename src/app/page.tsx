"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import { SocialFeed } from '@/components/SocialFeed';
import { ListingsAndBooking } from '@/components/ListingsAndBooking';
import { CommunicationPanel } from '@/components/CommunicationPanel';
import UserProfile from '@/components/UserProfile';
import { AdminDashboard } from '@/components/AdminDashboard';
import { AuthSection } from '@/components/AuthSection';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Home,
  Search,
  MessageSquare,
  Calendar,
  User,
  Settings,
  TrendingUp,
  Users,
  Heart,
  MapPin,
  Star,
  Verified,
  UserPlus,
  Loader2
} from 'lucide-react';

export default function HomePage() {
  // All hooks must be called at the top before any conditional logic
  const { data: session, isPending: sessionLoading } = useSession();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<string>('home');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Protected sections that require authentication
  const protectedSections = ['profile', 'messages', 'bookings', 'admin'];
  
  // If user tries to access protected section without being logged in, redirect to login
  useEffect(() => {
    if (!session?.user && protectedSections.includes(activeSection)) {
      router.push('/login');
    }
  }, [session, activeSection, router, protectedSections]);

  // Now we can do conditional rendering after all hooks are called
  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  const renderMainContent = () => {
    // If user is not authenticated and trying to access protected content
    if (!session?.user && protectedSections.includes(activeSection)) {
      return (
        <div className="flex-1 flex items-center justify-center p-8">
          <AuthSection />
        </div>
      );
    }

    switch (activeSection) {
      case 'home':
        return <SocialFeed />;
      case 'social':
        return <SocialFeed />;
      case 'search':
        return <ListingsAndBooking />;
      case 'messages':
        return session?.user ? <CommunicationPanel /> : <AuthSection />;
      case 'bookings':
        return session?.user ? <ListingsAndBooking /> : <AuthSection />;
      case 'profile':
        return session?.user ? <UserProfile /> : <AuthSection />;
      case 'admin':
        return session?.user ? <AdminDashboard /> : <AuthSection />;
      case 'auth':
        return <AuthSection />;
      default:
        return <SocialFeed />;
    }
  };

  const sidebarItems = [
    { id: 'home', label: 'Home', icon: Home, public: true },
    { id: 'social', label: 'Social', icon: Users, public: true },
    { id: 'search', label: 'Search', icon: Search, public: true },
    { id: 'messages', label: 'Messages', icon: MessageSquare, protected: true },
    { id: 'bookings', label: 'Bookings', icon: Calendar, protected: true },
    { id: 'profile', label: 'Profile', icon: User, protected: true },
    { id: 'admin', label: 'Admin', icon: Settings, protected: true },
  ];

  // Filter items based on authentication state
  const visibleSidebarItems = sidebarItems.filter(item => {
    if (item.protected && !session?.user) {
      return false; // Hide protected items for non-authenticated users
    }
    return true;
  });

  const suggestedUsers = [
    {
      id: '1',
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
      location: 'San Francisco, CA',
      rating: 4.9,
      verified: true,
      mutualConnections: 12,
      tags: ['Photography', 'Travel']
    },
    {
      id: '2', 
      name: 'Mike Chen',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      location: 'Los Angeles, CA',
      rating: 4.8,
      verified: true,
      mutualConnections: 8,
      tags: ['Music', 'Tech']
    },
    {
      id: '3',
      name: 'Emma Davis',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
      location: 'New York, NY', 
      rating: 4.9,
      verified: false,
      mutualConnections: 5,
      tags: ['Art', 'Design']
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar - No longer passing user prop since NavBar uses useSession directly */}
      <NavBar 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      <div className="flex pt-16">
        {/* Left Sidebar */}
        <div className={`${isSidebarCollapsed ? 'w-16' : 'w-64'} border-r border-border bg-card/30 h-[calc(100vh-4rem)] sticky top-16 transition-all duration-300`}>
          <div className="p-4">
            <h2 className={`font-display font-bold text-xl mb-6 ${isSidebarCollapsed ? 'hidden' : 'block'}`}>
              Rent My Life
            </h2>
            
            <nav className="space-y-2">
              {visibleSidebarItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activeSection === item.id ? 'default' : 'ghost'}
                  className={`w-full justify-start ${isSidebarCollapsed ? 'px-2' : 'px-4'}`}
                  onClick={() => {
                    if (item.protected && !session?.user) {
                      router.push('/login');
                    } else {
                      setActiveSection(item.id);
                    }
                  }}
                >
                  <item.icon className={`h-5 w-5 ${isSidebarCollapsed ? '' : 'mr-3'}`} />
                  {!isSidebarCollapsed && (
                    <span className="flex-1 text-left">{item.label}</span>
                  )}
                  {!isSidebarCollapsed && item.protected && !session?.user && (
                    <Badge variant="secondary" className="ml-2 text-xs">Auth</Badge>
                  )}
                </Button>
              ))}
            </nav>

            {!isSidebarCollapsed && session?.user && (
              <>
                <Separator className="my-6" />
                
                {/* Quick Stats */}
                <div className="space-y-3">
                  <h3 className="font-medium text-sm text-muted-foreground">Quick Stats</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Card className="p-3">
                      <div className="text-center">
                        <div className="text-lg font-bold">12</div>
                        <div className="text-xs text-muted-foreground">Active Bookings</div>
                      </div>
                    </Card>
                    <Card className="p-3">
                      <div className="text-center">
                        <div className="text-lg font-bold">4.9</div>
                        <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          Rating
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-4rem)]">
          {renderMainContent()}
        </main>

        {/* Right Sidebar - Only show when user is authenticated */}
        {session?.user && !isSidebarCollapsed && (
          <div className="w-80 border-l border-border bg-card/30 h-[calc(100vh-4rem)] sticky top-16 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-6">
                {/* Trending Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-4 h-4" />
                    <h3 className="font-semibold">Trending</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">#Photography</p>
                        <p className="text-xs text-muted-foreground">2.4k posts today</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">#TechRentals</p>
                        <p className="text-xs text-muted-foreground">1.8k posts today</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">#Tutoring</p>
                        <p className="text-xs text-muted-foreground">1.2k posts today</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Suggested Users */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <UserPlus className="w-4 h-4" />
                      <h3 className="font-semibold">Suggested for You</h3>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs">
                      See all
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {suggestedUsers.map((user) => (
                      <Card key={user.id} className="p-3 hover:bg-accent/50 cursor-pointer transition-colors">
                        <div className="flex items-start gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 mb-1">
                              <h4 className="font-medium text-sm truncate">{user.name}</h4>
                              {user.verified && (
                                <Verified className="w-3 h-3 text-blue-500" />
                              )}
                            </div>
                            <div className="flex items-center gap-1 mb-2">
                              <MapPin className="w-3 h-3 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground truncate">{user.location}</p>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs">{user.rating}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {user.mutualConnections} mutual
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1 mb-3">
                              {user.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <Button size="sm" className="w-full text-xs">
                              <UserPlus className="w-3 h-3 mr-1" />
                              Connect
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Recent Activity */}
                <div>
                  <h3 className="font-semibold mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span className="text-muted-foreground">Sarah liked your post</span>
                      <span className="text-xs text-muted-foreground ml-auto">2m</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <MessageSquare className="w-4 h-4 text-blue-500" />
                      <span className="text-muted-foreground">New message from Mike</span>
                      <span className="text-xs text-muted-foreground ml-auto">5m</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="w-4 h-4 text-green-500" />
                      <span className="text-muted-foreground">Booking confirmed</span>
                      <span className="text-xs text-muted-foreground ml-auto">1h</span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
}