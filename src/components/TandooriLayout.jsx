import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './tandoori/Navbar';
import Footer from './tandoori/Footer';
import MobileBottomBar from './tandoori/MobileBottomBar';

export default function TandooriLayout() {
  return (
    <div className="bg-charcoal text-gray-200 font-sans min-h-screen selection:bg-gold/30 selection:text-gold-light overflow-x-hidden flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomBar />
    </div>
  );
}
