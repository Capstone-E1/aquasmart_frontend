import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';

export interface WaterParameter {
  type: 'pH' | 'TDS' | 'Turbidity';
  value: number;
  unit?: string;
}

interface SafeRanges {
  pH: { min: number; max: number };
  TDS: { min: number; max: number };
  Turbidity: { min: number; max: number };
}

const SAFE_RANGES: SafeRanges = {
  pH: { min: 6.5, max: 8.5 }, // WHO standards for drinking water
  TDS: { min: 300, max: 600 }, // ppm - optimal drinking water range
  Turbidity: { min: 0, max: 1.0 } // NTU - WHO standard for drinking water
};

export function useWaterParameterMonitoring() {
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const lastNotificationRef = useRef<Record<string, number>>({});

  const checkParameterSafety = (parameter: WaterParameter) => {
    const { type, value } = parameter;
    const range = SAFE_RANGES[type];
    const now = Date.now();
    
    // Prevent spam notifications - only notify once per 30 seconds for same parameter
    const lastNotification = lastNotificationRef.current[type] || 0;
    if (now - lastNotification < 30000) {
      return null;
    }

    let notification = null;

    if (value < range.min || value > range.max) {
      let title = '';
      let message = '';
      let notificationType: 'warning' | 'danger' = 'warning';

      switch (type) {
        case 'pH':
          if (value < 6.0 || value > 9.0) {
            notificationType = 'danger';
            title = 'CRITICAL: Dangerous pH Level!';
            message = `pH level of ${value} is extremely dangerous for human consumption. Safe range is 6.5-8.5.`;
          } else {
            title = 'WARNING: pH Level Alert';
            message = `pH level of ${value} is outside the optimal range of 6.5-8.5 for drinking water.`;
          }
          break;
          
        case 'TDS':
          if (value < 150 || value > 1000) {
            notificationType = 'danger';
            title = 'CRITICAL: Dangerous TDS Level!';
            message = `TDS level of ${value} ppm is extremely ${value < 150 ? 'low' : 'high'}. Optimal range is 300-600 ppm.`;
          } else {
            title = 'WARNING: TDS Level Alert';
            message = `TDS level of ${value} ppm is outside the optimal range of 300-600 ppm.`;
          }
          break;
          
        case 'Turbidity':
          if (value > 4.0) {
            notificationType = 'danger';
            title = 'CRITICAL: High Turbidity!';
            message = `Turbidity level of ${value} NTU is extremely high. Safe level should be below 1.0 NTU.`;
          } else {
            title = 'WARNING: Turbidity Alert';
            message = `Turbidity level of ${value} NTU exceeds safe drinking water standards (max 1.0 NTU).`;
          }
          break;
      }

      notification = {
        type: notificationType,
        title,
        message,
        parameter: type,
        value
      };

      addNotification(notification);
      lastNotificationRef.current[type] = now;
    }

    return notification;
  };

  const goToNotifications = () => {
    navigate('/notification');
  };

  return {
    checkParameterSafety,
    goToNotifications,
    SAFE_RANGES
  };
}