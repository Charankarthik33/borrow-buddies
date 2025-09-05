"use client";

import React, { useState } from "react";
import NavBar from "@/components/NavBar";
import AuthSection from "@/components/AuthSection";
import SocialFeed from "@/components/SocialFeed";
import ListingsAndBooking from "@/components/ListingsAndBooking";
import CommunicationPanel from "@/components/CommunicationPanel";
import AdminDashboard from "@/components/AdminDashboard";
import UserProfile from "@/components/UserProfile";

export default function HomePage() {
  const [activeSection, setActiveSection] = useState<string>("home");
  const [user, setUser] = useState(null);

  // Mock user profile data for demonstration
  const mockUserProfile = {
    id: "current-user",
    username: "your_username",
    displayName: "Your Name",
    email: "you@example.com",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face",
    coverImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=300&fit=crop",
    bio: "Welcome to my profile! I love connecting with new people and exploring amazing experiences.",
    location: "San Francisco, CA",
    isVerified: false,
    verificationStatus: "none" as const,
    interests: ["Travel", "Photography", "Food", "Technology"],
    followersCount: 247,
    followingCount: 183,
    trustScore: 85,
    isPrivate: false,
    allowMessages: true,
    allowFollows: true,
    joinDate: "2024-01-15"
  };

  const handleNavigation = (sectionId: string) => {
    setActiveSection(sectionId);
  };

  const renderMainContent = () => {
    switch (activeSection) {
      case "home":
        return <SocialFeed />;
      case "search":
      case "bookings":
        return <ListingsAndBooking />;
      case "social":
        return <SocialFeed />;
      case "messages":
        return (
          <div className="max-w-6xl mx-auto h-[calc(100vh-80px)]">
            <CommunicationPanel />
          </div>
        );
      case "profile":
        return (
          <div className="container mx-auto px-4 py-6">
            <UserProfile 
              profile={mockUserProfile}
              isOwnProfile={true}
              onUpdateProfile={async (updates) => {
                // Simulate API update
                await new Promise(resolve => setTimeout(resolve, 1000));
                console.log("Profile updated:", updates);
              }}
            />
          </div>
        );
      case "admin":
        return <AdminDashboard />;
      case "auth":
        return <AuthSection />;
      default:
        return <SocialFeed />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <div className="sticky top-0 z-50">
        <NavBar 
          activeItem={activeSection} 
          onNavigate={handleNavigation}
        />
      </div>

      {/* Main Layout */}
      <div className="flex">
        {/* Left Sidebar - Contextual Filters/Discovery */}
        <div className="hidden lg:block w-80 border-r border-border bg-card/50">
          <div className="sticky top-16 p-4 space-y-4">
            {(activeSection === "social" || activeSection === "home") && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3">Trending Topics</h3>
                  <div className="space-y-2">
                    {["#TravelGoals", "#CabinLife", "#Photography", "#Adventure"].map((tag) => (
                      <div key={tag} className="flex items-center justify-between p-2 rounded hover:bg-accent cursor-pointer">
                        <span className="text-sm">{tag}</span>
                        <span className="text-xs text-muted-foreground">1.2k posts</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Suggested Users</h3>
                  <div className="space-y-3">
                    {[
                      { name: "Alex Chen", username: "alexchen_photo", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop" },
                      { name: "Maria Rodriguez", username: "maria_designs", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop" }
                    ].map((user) => (
                      <div key={user.username} className="flex items-center gap-3">
                        <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{user.name}</p>
                          <p className="text-xs text-muted-foreground">@{user.username}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {(activeSection === "search" || activeSection === "bookings") && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3">Quick Filters</h3>
                  <div className="space-y-2">
                    {["Available Now", "Near Me", "Top Rated", "Budget Friendly"].map((filter) => (
                      <button key={filter} className="w-full text-left p-2 rounded hover:bg-accent text-sm">
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Popular Categories</h3>
                  <div className="space-y-2">
                    {["Photography", "Events", "Equipment", "Experiences"].map((category) => (
                      <button key={category} className="w-full text-left p-2 rounded hover:bg-accent text-sm">
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-h-screen">
          {renderMainContent()}
        </div>

        {/* Right Sidebar - User Widgets */}
        <div className="hidden lg:block w-80 border-l border-border bg-card/50">
          <div className="sticky top-16 p-4 space-y-4">
            {/* Mini User Profile */}
            <div className="bg-card rounded-lg p-4 border">
              <div className="flex items-center gap-3 mb-3">
                <img 
                  src={mockUserProfile.avatar} 
                  alt="Your avatar" 
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{mockUserProfile.displayName}</p>
                  <p className="text-sm text-muted-foreground">Trust Score: {mockUserProfile.trustScore}%</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div>
                  <div className="font-medium">{mockUserProfile.followersCount}</div>
                  <div className="text-muted-foreground">Followers</div>
                </div>
                <div>
                  <div className="font-medium">{mockUserProfile.followingCount}</div>
                  <div className="text-muted-foreground">Following</div>
                </div>
                <div>
                  <div className="font-medium">12</div>
                  <div className="text-muted-foreground">Posts</div>
                </div>
              </div>
            </div>

            {/* Communication Panel Summary */}
            <div className="bg-card rounded-lg p-4 border">
              <h3 className="font-semibold mb-3">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm">2 new messages</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">1 booking request</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Payment received</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-card rounded-lg p-4 border">
              <h3 className="font-semibold mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => handleNavigation("messages")}
                  className="w-full text-left p-2 rounded hover:bg-accent text-sm"
                >
                  📨 Check Messages
                </button>
                <button 
                  onClick={() => handleNavigation("bookings")}
                  className="w-full text-left p-2 rounded hover:bg-accent text-sm"
                >
                  📅 View Bookings
                </button>
                <button 
                  onClick={() => handleNavigation("profile")}
                  className="w-full text-left p-2 rounded hover:bg-accent text-sm"
                >
                  👤 Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Space */}
      <div className="md:hidden h-20"></div>
    </div>
  );
}