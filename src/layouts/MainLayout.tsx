import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { FloatingSupport } from '../components/ui/FloatingSupport';

export const MainLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Announcement Bar */}
     

      {/* Main Navbar */}
      <Navbar />

      {/* Page Content wrapper */}
      <main className="flex-grow pt-[72px] min-h-[calc(100vh-72px)] flex flex-col">
        <Outlet />
      </main>

      {/* Floating Customer Helpdesk */}
      <FloatingSupport />

      {/* Global Footer */}
      <Footer />
    </div>
  );
};
