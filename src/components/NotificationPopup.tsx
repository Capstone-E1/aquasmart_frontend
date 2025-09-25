import { useState, useEffect } from 'react';
import { X, AlertTriangle, AlertCircle } from 'lucide-react';

interface NotificationPopupProps {
  show: boolean;
  type: 'warning' | 'danger';
  title: string;
  message: string;
  parameter: string;
  value: number;
  onClose: () => void;
  onGoToNotifications: () => void;
}

export function NotificationPopup({
  show,
  type,
  title,
  message,
  parameter,
  value,
  onClose,
  onGoToNotifications
}: NotificationPopupProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      // Auto close after 8 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleGoToNotifications = () => {
    onGoToNotifications();
    handleClose();
  };

  if (!show) return null;

  const bgColor = type === 'danger' ? 'bg-red-500' : 'bg-yellow-500';
  const textColor = type === 'danger' ? 'text-red-100' : 'text-yellow-100';
  const Icon = type === 'danger' ? AlertTriangle : AlertCircle;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-4 px-4">
      <div
        className={`
          ${bgColor} backdrop-blur-sm rounded-xl shadow-2xl border-2 border-white/20 p-6 max-w-md w-full
          transform transition-all duration-300 ease-out
          ${isVisible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95'}
        `}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Icon className="w-6 h-6 text-white" />
            <h3 className="text-lg font-bold text-white">{title}</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <p className={`${textColor} text-sm`}>{message}</p>
          
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">{parameter} Level:</span>
              <span className="text-white font-bold text-lg">{value}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleGoToNotifications}
              className="flex-1 bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              View All Notifications
            </button>
            <button
              onClick={handleClose}
              className="px-4 py-2 text-white/80 hover:text-white transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}