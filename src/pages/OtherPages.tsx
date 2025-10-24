import { useState, useEffect } from 'react';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useNotifications } from '../contexts/NotificationContext';
import { AlertTriangle, AlertCircle, Bell, Trash2 } from 'lucide-react';

export function Notification() {
  const [isLoading, setIsLoading] = useState(true);
  const { notifications, markAsRead, markAllAsRead, clearNotifications, unreadCount } = useNotifications();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (isLoading) {
    return <LoadingSkeleton variant="page" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Notifications</h1>
          <p className="text-slate-400">Water quality alerts and system notifications</p>
        </div>
        
        {notifications.length > 0 && (
          <div className="flex gap-3">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors text-sm"
              >
                Mark All Read
              </button>
            )}
            <button
              onClick={clearNotifications}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          </div>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-primary-light/50 backdrop-blur-sm rounded-xl border border-slate-600 p-6">
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Notifications</h3>
            <p className="text-slate-400">All water parameters are being monitored. You'll receive alerts here if any values become unsafe.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => {
            const Icon = notification.type === 'danger' ? AlertTriangle : AlertCircle;
            const bgColor = notification.type === 'danger' ? 'bg-red-500/10 border-red-500/20' : 'bg-yellow-500/10 border-yellow-500/20';
            const iconColor = notification.type === 'danger' ? 'text-red-400' : 'text-yellow-400';
            
            return (
              <div
                key={notification.id}
                className={`${bgColor} ${!notification.read ? 'ring-2 ring-accent/30' : ''} backdrop-blur-sm rounded-xl border p-6 transition-all cursor-pointer hover:bg-slate-800/30`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start gap-4">
                  <Icon className={`w-6 h-6 ${iconColor} flex-shrink-0 mt-1`} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-semibold text-lg">{notification.title}</h3>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 text-sm">{formatDate(notification.timestamp)}</span>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-accent rounded-full"></div>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-slate-300 mb-3">{notification.message}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="bg-slate-700/50 rounded-lg px-3 py-2">
                        <span className="text-slate-300 text-sm">
                          {notification.parameter}: <span className="font-bold text-white">{notification.value}</span>
                        </span>
                      </div>
                      
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        notification.type === 'danger' 
                          ? 'bg-red-500 text-white' 
                          : 'bg-yellow-500 text-black'
                      }`}>
                        {notification.type === 'danger' ? 'CRITICAL' : 'WARNING'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Settings() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingSkeleton variant="page" />;
  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Settings</h1>
        <p className="text-slate-400">Configure system preferences and parameters</p>
      </div>

      <div className="bg-primary-light/50 backdrop-blur-sm rounded-xl border border-slate-600 p-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚙️</div>
          <h3 className="text-xl font-semibold text-white mb-2">System Settings</h3>
          <p className="text-slate-400">This feature is under development</p>
        </div>
      </div>
    </div>
  );
}
