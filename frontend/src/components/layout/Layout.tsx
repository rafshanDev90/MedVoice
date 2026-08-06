import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { ToastContainer } from '../common/Toast';

export const Layout: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] font-sans text-[#1E293B] overflow-hidden">
      <ToastContainer />

      {/* High Density Sidebar */}
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Right Column (Header, Content, Footer) */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <Header onToggleSidebarMobile={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

        <main className="p-6 flex-1 overflow-y-auto">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
};

