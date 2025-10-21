import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Droplets, 
  Waves, 
  FlaskConical, 
  Zap,
  History as HistoryIcon,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  Search,
  ChevronDown,
  ChevronUp,
  Gauge
} from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isMobile?: boolean;
}

interface MenuItem {
  icon: any;
  label: string;
  path?: string;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  { 
    icon: LayoutDashboard, 
    label: 'Dashboard', 
    path: '/',
    children: [
      { icon: Gauge, label: 'All Parameters', path: '/' },
      { icon: Droplets, label: 'PH Level', path: '/ph-level' },
      { icon: Waves, label: 'Turbidity', path: '/turbidity' },
      { icon: FlaskConical, label: 'TDS', path: '/tds' }
    ]
  },
  { icon: Zap, label: 'Filter + UV', path: '/filter-uv' },
  { icon: HistoryIcon, label: 'History', path: '/history' },
  { icon: Bell, label: 'Notification', path: '/notification' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function Sidebar({ isOpen, onToggle, isMobile = false }: SidebarProps) {
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['Dashboard']);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  // Auto-expand Dashboard submenu yang mengandung current route
  useEffect(() => {
    const currentPath = location.pathname;
    const dashboardPaths = ['/', '/ph-level', '/turbidity', '/tds'];
    
    if (dashboardPaths.includes(currentPath) && !expandedMenus.includes('Dashboard')) {
      setExpandedMenus(prev => [...prev, 'Dashboard']);
    }
  }, [location.pathname, expandedMenus]);

  const toggleSubmenu = (label: string) => {
    setExpandedMenus(prev => 
      prev.includes(label)
        ? prev.filter((item: string) => item !== label)
        : [...prev, label]
    );
  };

  const isSubmenuExpanded = (label: string) => {
    return expandedMenus.includes(label);
  };

  // Filter menu items based on search query
  const filteredMenuItems = menuItems.filter((item) => {
    const query = searchQuery.toLowerCase();
    
    // Check if parent menu matches
    if (item.label.toLowerCase().includes(query)) {
      return true;
    }
    
    // Check if any child menu matches
    if (item.children) {
      return item.children.some(child => 
        child.label.toLowerCase().includes(query)
      );
    }
    
    return false;
  });

  // Auto-expand menu yang match dengan search
  useEffect(() => {
    if (searchQuery.trim()) {
      const menusToExpand = menuItems
        .filter(item => {
          if (item.children) {
            return item.children.some(child =>
              child.label.toLowerCase().includes(searchQuery.toLowerCase())
            );
          }
          return false;
        })
        .map(item => item.label);
      
      setExpandedMenus(menusToExpand);
    }
  }, [searchQuery]);

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-white dark:bg-primary border-r border-slate-300 dark:border-slate-700 z-50
        ${isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
        transition-all duration-300 ease-in-out
        ${isOpen ? 'w-64' : 'w-16'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-slate-300 dark:border-slate-700">
            <div className="flex items-center justify-between">
              {isOpen && (
                <h1 className="text-xl font-bold text-slate-800 dark:text-white">AquaSmart</h1>
              )}
              
              {/* Close button for mobile */}
              {isMobile && isOpen && (
                <button
                  onClick={onToggle}
                  className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white lg:hidden"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              
              {/* Toggle button for desktop */}
              {!isMobile && (
                <button
                  onClick={onToggle}
                  className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hidden lg:block"
                >
                  {isOpen ? (
                    <ChevronLeft className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Search Bar */}
          {isOpen && (
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search menu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              {searchQuery && (
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    {filteredMenuItems.length} result{filteredMenuItems.length !== 1 ? 's' : ''}
                  </span>
                  {filteredMenuItems.length === 0 && (
                    <span className="text-xs text-red-500">Try different keywords</span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Navigation Menu */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {filteredMenuItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500 dark:text-slate-400 text-sm">No menu found</p>
              </div>
            ) : (
              filteredMenuItems.map((item) => (
              <div key={item.label}>
                {/* Parent Menu Item */}
                {item.children ? (
                  <button
                    onClick={() => toggleSubmenu(item.label)}
                    className={cn(
                      "w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors",
                      !isOpen && "lg:justify-center lg:px-2"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {(isOpen || isMobile) && (
                        <span className="text-sm font-medium">{item.label}</span>
                      )}
                    </div>
                    {(isOpen || isMobile) && (
                      isSubmenuExpanded(item.label) ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )
                    )}
                  </button>
                ) : (
                  <NavLink
                    to={item.path!}
                    onClick={isMobile ? onToggle : undefined}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700/50 transition-colors",
                        isActive && "bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700",
                        !isOpen && "lg:justify-center lg:px-2"
                      )
                    }
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {(isOpen || isMobile) && (
                      <span className="text-sm font-medium">{item.label}</span>
                    )}
                  </NavLink>
                )}

                {/* Submenu Items */}
                {item.children && isSubmenuExpanded(item.label) && (isOpen || isMobile) && (
                  <div className="ml-6 mt-2 space-y-1">
                    {item.children.map((subItem) => (
                      <NavLink
                        key={subItem.path}
                        to={subItem.path!}
                        onClick={isMobile ? onToggle : undefined}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700/30 transition-colors text-sm",
                            isActive && "bg-blue-500/80 dark:bg-blue-600/80 text-white hover:bg-blue-600/80 dark:hover:bg-blue-700/80"
                          )
                        }
                      >
                        <subItem.icon className="w-4 h-4 flex-shrink-0" />
                        <span className="font-medium">{subItem.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
              ))
            )}
          </nav>

          {/* Footer */}
          {isOpen && (
            <div className="p-4 border-t border-slate-700">
              <div className="text-xs text-slate-500 text-center">
                AquaSmart v1.0
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
