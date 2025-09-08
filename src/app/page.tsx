"use client";

import React, { useState } from 'react';
import NavBar from '@/components/NavBar';

export default function HomePage() {
  const [activeSection, setActiveSection] = useState<string>('home');

  const renderMainContent = () => {
    switch (activeSection) {
      case 'home':
        return <div className="p-8">Welcome home.</div>;
      case 'search':
        return <div className="p-8">Search coming soon.</div>;
      case 'messages':
        return <div className="p-8">Messages coming soon.</div>;
      case 'bookings':
        return <div className="p-8">Bookings coming soon.</div>;
      case 'profile':
        return <div className="p-8">Profile coming soon.</div>;
      default:
        return <div className="p-8">Welcome home.</div>;
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