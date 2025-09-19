import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Bell, HelpCircle, Menu } from 'lucide-react';
import { cn } from '../lib/utils';

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check if screen is mobile size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false); // Close sidebar on mobile by default
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-primary">
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={toggleSidebar} 
        isMobile={isMobile}
      />
      
      {/* Main Content */}
      <div className={cn(
        "transition-all duration-300",
        // Desktop margin adjustment
        !isMobile && (sidebarOpen ? "lg:ml-64" : "lg:ml-16"),
        // Mobile full width
        isMobile && "ml-0"
      )}>
        {/* Top Navigation */}
        <header className="bg-primary-light border-b border-slate-700 px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile Hamburger Menu */}
              {isMobile && (
                <button
                  onClick={toggleSidebar}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors lg:hidden"
                >
                  <Menu className="w-5 h-5" />
                </button>
              )}
              
              <h1 className="text-white font-medium text-sm lg:text-base">
                <span className="hidden sm:inline">AquaSmart Application Capstone Project E-01</span>
                <span className="sm:hidden">AquaSmart</span>
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Notification Icon */}
              <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              
              {/* Help Icon */}
              <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                <HelpCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
