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
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  // All hooks must be called at the top before any conditional logic
  const { data: session, isPending: sessionLoading } = useSession();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<string>('home');

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

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <NavBar 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      {/* Main Content - Full Width */}
      <main className="pt-16 min-h-[calc(100vh-4rem)]">
        {renderMainContent()}
      </main>
    </div>
  );
}