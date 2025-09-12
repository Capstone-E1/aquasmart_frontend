import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Droplets, 
  Waves, 
  FlaskConical, 
  Zap,
  Clock,
  History as HistoryIcon,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Droplets, label: 'PH Level', path: '/ph-level' },
  { icon: Waves, label: 'Turbidity', path: '/turbidity' },
  { icon: FlaskConical, label: 'Total Dissolve Solid', path: '/tds' },
  { icon: Zap, label: 'Filter + UV', path: '/filter-uv' },
  { icon: Clock, label: 'UV Timer', path: '/uv-timer' },
  { icon: HistoryIcon, label: 'History', path: '/history' },
  { icon: Bell, label: 'Notification', path: '/notification' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 h-full bg-primary-light border-r border-slate-700 z-50 transition-all duration-300",
        isOpen ? "w-64" : "w-0 lg:w-16",
        "overflow-hidden"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className={cn(
            "flex items-center gap-3 transition-opacity duration-200",
            isOpen ? "opacity-100" : "opacity-0 lg:opacity-100"
          )}>
            {isOpen && (
              <span className="text-white font-semibold text-lg">AquaSmart</span>
            )}
          </div>
          
          <button
            onClick={onToggle}
            className={cn(
              "p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors",
              !isOpen && "lg:mx-auto"
            )}
          >
            {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-200",
                isActive && "bg-blue-600 text-white hover:bg-blue-700",
                !isOpen && "lg:justify-center lg:px-2"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {isOpen && (
                <span className="font-medium truncate">{item.label}</span>
              )}
              {!isOpen && (
                <span className="sr-only">{item.label}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Search Bar - only show when sidebar is open */}
        {isOpen && (
          <div className="p-4 border-t border-slate-700 mt-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for..."
                className="w-full bg-slate-700 text-slate-300 placeholder-slate-500 px-3 py-2 pl-10 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
