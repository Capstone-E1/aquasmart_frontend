import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Bell, HelpCircle, Menu } from 'lucide-react';
import { cn } from '../lib/utils';
import { useNotifications } from '../contexts/NotificationContext';
import { useAccentColor } from '../hooks/useAccentColor';

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  useAccentColor(); // Apply accent color to CSS variables

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024; 
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
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
    <div className="min-h-screen bg-slate-200 dark:bg-primary relative">
      {/* Global Background Image */}
      <div 
        className="fixed inset-0 bg-slate-800"
        style={{ 
          backgroundImage: 'url("/background.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: 0
        }}
      >
        <div className="absolute inset-0 bg-slate-900/30"></div>
      </div>

      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={toggleSidebar} 
        isMobile={isMobile}
      />
      
      <div className={cn(
        "transition-all duration-300 relative z-10",
        !isMobile && (sidebarOpen ? "lg:ml-64" : "lg:ml-16"),
        isMobile && "ml-0"
      )}>
        <header className="sticky top-0 z-50 bg-white/10 dark:bg-slate-900/50 backdrop-blur-xl border-b border-white/20 dark:border-slate-700/50 px-4 lg:px-6 py-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {isMobile && (
                <button
                  onClick={toggleSidebar}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors lg:hidden"
                >
                  <Menu className="w-5 h-5" />
                </button>
              )}
              
              <h1 className="text-slate-800 dark:text-white font-medium text-sm lg:text-base">
                <span className="hidden sm:inline">AquaSmart Application Capstone Project E-01</span>
                <span className="sm:hidden">AquaSmart</span>
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/notification')}
                className="relative p-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-300 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
              
              <button className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-300 dark:hover:bg-slate-700 rounded-lg transition-colors">
                <HelpCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
