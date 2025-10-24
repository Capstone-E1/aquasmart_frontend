import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { NotificationProvider } from './contexts/NotificationContext';
import { useSettings } from './contexts/SettingsContext';
import { Layout } from './components';
import { Dashboard } from './pages/Dashboard';
import { PHLevel } from './pages/PHLevel';
import { Turbidity } from './pages/Turbidity';
import { TDS } from './pages/TDS';
import { History } from './pages/History';
import { FilterUV } from './pages/FilterUV';
import { Settings } from './pages/Settings';
import { Notification } from './pages/OtherPages';

function DefaultRoute() {
  const { settings } = useSettings();
  const routeMap = {
    'dashboard': '/',
    'ph': '/ph-level',
    'tds': '/tds',
    'turbidity': '/turbidity'
  };
  
  const defaultPath = routeMap[settings.data.defaultView] || '/';
  return <Navigate to={defaultPath} replace />;
}

function App() {
  return (
    <NotificationProvider>
      <Router>
        <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DefaultRoute />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="ph-level" element={<PHLevel />} />
          <Route path="turbidity" element={<Turbidity />} />
          <Route path="tds" element={<TDS />} />
          <Route path="filter-uv" element={<FilterUV />} />
          <Route path="history" element={<History />} />
          <Route path="notification" element={<Notification />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
    </NotificationProvider>
  );
}

export default App
