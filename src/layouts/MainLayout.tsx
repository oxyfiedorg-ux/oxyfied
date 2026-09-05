import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { FloatingSupport } from '../components/ui/FloatingSupport';
import { motion } from 'framer-motion';

export const MainLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Announcement Bar */}
     

      {/* Main Navbar */}
      <Navbar />

      {/* Page Content wrapper with Framer Motion transitions */}
      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="flex-grow pt-[72px]" // Offset for sticky navbar
      >
        <Outlet />
      </motion.main>

      {/* Floating Customer Helpdesk */}
      <FloatingSupport />

      {/* Global Footer */}
      <Footer />
    </div>
  );
};
