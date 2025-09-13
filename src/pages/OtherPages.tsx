import { useState, useEffect } from 'react';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export function FilterUV() {
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
        <h1 className="text-2xl font-bold text-white mb-2">Filter + UV System</h1>
        <p className="text-slate-400">Monitor and control water filtration and UV sterilization</p>
      </div>

      <div className="bg-primary-light/50 backdrop-blur-sm rounded-xl border border-slate-600 p-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔧</div>
          <h3 className="text-xl font-semibold text-white mb-2">Filter + UV System</h3>
          <p className="text-slate-400">This feature is under development</p>
        </div>
      </div>
    </div>
  );
}

export function UVTimer() {
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
        <h1 className="text-2xl font-bold text-white mb-2">UV Timer</h1>
        <p className="text-slate-400">Schedule and monitor UV sterilization cycles</p>
      </div>

      <div className="bg-primary-light/50 backdrop-blur-sm rounded-xl border border-slate-600 p-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⏲️</div>
          <h3 className="text-xl font-semibold text-white mb-2">UV Timer</h3>
          <p className="text-slate-400">This feature is under development</p>
        </div>
      </div>
    </div>
  );
}

export function Notification() {
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
        <h1 className="text-2xl font-bold text-white mb-2">Notifications</h1>
        <p className="text-slate-400">Manage alerts and system notifications</p>
      </div>

      <div className="bg-primary-light/50 backdrop-blur-sm rounded-xl border border-slate-600 p-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔔</div>
          <h3 className="text-xl font-semibold text-white mb-2">Notifications</h3>
          <p className="text-slate-400">This feature is under development</p>
        </div>
      </div>
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
