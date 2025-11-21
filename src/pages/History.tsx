import { useState, useMemo } from 'react';
import { Filter, Download, ChevronLeft, ChevronRight, RefreshCw, Trash2 } from 'lucide-react';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useHistoryData } from '../hooks/useHistoryData';
import { apiService } from '../services/api';
import { useSettings } from '../contexts/SettingsContext';
import type { SensorData } from '../services/api';

// Data interface untuk history
interface HistoryData {
  id: number;
  device_id: string;
  time: string;
  date: string;
  ph: number;
  turbidity: number;
  tds: number;
  flow: number;
  filter_mode: string;
  status: 'normal' | 'warning' | 'danger';
}

export function History() {
  const [sensorFilter, setSensorFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const itemsPerPage = 20;
  const { settings } = useSettings();

  const { historyData: allData, isLoading, error, refetch } = useHistoryData(100); // Get 50 recent readings

  // Convert sensor data to history format
  const historyData: HistoryData[] = useMemo(() => {
    return allData.map((data: SensorData, index: number) => {
      const { date, time } = apiService.formatTimestamp(data.timestamp);
      
      // Determine overall status based on all parameters
      const phStatus = apiService.getParameterStatus('ph', data.ph);
      const turbidityStatus = apiService.getParameterStatus('turbidity', data.turbidity);
      const tdsStatus = apiService.getParameterStatus('tds', data.tds);
      
      // Overall status is the worst of all parameters
      let overallStatus: 'normal' | 'warning' | 'danger' = 'normal';
      const statuses = [phStatus, turbidityStatus, tdsStatus];
      
      if (statuses.includes('danger')) {
        overallStatus = 'danger';
      } else if (statuses.includes('warning')) {
        overallStatus = 'warning';
      }

      return {
        id: index + 1,
        device_id: data.device_id || 'N/A',
        time,
        date,
        ph: data.ph,
        turbidity: data.turbidity,
        tds: data.tds,
        flow: data.flow,
        filter_mode: data.filter_mode,
        status: overallStatus
      };
    });
  }, [allData]);

  if (isLoading) {
    return <LoadingSkeleton variant="page" />;
  }

  if (error) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-white mb-2">History</h1>
          <p className="text-slate-800 dark:text-slate-400 text-sm lg:text-base">View historical water quality data</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400">Error loading history data: {error}</p>
        </div>
      </div>
    );
  }

  // Filter data berdasarkan sensor reading dan status
  const filteredData = historyData.filter(item => {
    const matchesSensor = 
      sensorFilter === 'all' || 
      (sensorFilter === 'pre' && item.device_id.toLowerCase().includes('stm32_pre')) ||
      (sensorFilter === 'post' && item.device_id.toLowerCase().includes('stm32_post'));
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    
    return matchesSensor && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  // Status color helper
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-400 bg-green-400/20';
      case 'warning': return 'text-yellow-400 bg-yellow-400/20';
      case 'danger': return 'text-red-400 bg-red-400/20';
      default: return 'text-slate-800 dark:text-slate-400 bg-slate-400/20';
    }
  };

  // Delete all data function
  const handleDeleteAllData = async () => {
    setIsDeleting(true);
    try {
      const result = await apiService.deleteAllSensorData();
      if (result.success) {
        // Close modal and refresh data
        setShowDeleteModal(false);
        await refetch();
        alert('All sensor data has been deleted successfully');
      } else {
        alert(`Failed to delete data: ${result.message}`);
      }
    } catch (error) {
      console.error('Error deleting all data:', error);
      alert('An error occurred while deleting data');
    } finally {
      setIsDeleting(false);
    }
  };

  // Export function
  const handleExport = () => {
    const format = settings.data.exportFormat;
    const timestamp = new Date().toISOString().split('T')[0];

    if (format === 'csv') {
      // CSV Export
      const csvContent = [
        ['Sensor Reading', 'Time', 'Date', 'pH', 'Turbidity (NTU)', 'TDS', 'Flow', 'Filter Mode', 'Status'].join(','),
        ...filteredData.map(item => 
          [item.device_id, item.time, item.date, item.ph, item.turbidity, item.tds, item.flow, item.filter_mode, item.status].join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `water_quality_history_${timestamp}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } else if (format === 'json') {
      // JSON Export
      const jsonContent = JSON.stringify(filteredData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `water_quality_history_${timestamp}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    } else if (format === 'excel') {
      // Excel Export (as HTML table that Excel can open)
      const htmlContent = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
        <head>
          <meta charset="utf-8">
          <style>
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #4CAF50; color: white; }
          </style>
        </head>
        <body>
          <table>
            <thead>
              <tr>
                <th>Sensor Reading</th>
                <th>Time</th>
                <th>Date</th>
                <th>pH</th>
                <th>Turbidity (NTU)</th>
                <th>TDS</th>
                <th>Flow</th>
                <th>Filter Mode</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData.map(item => `
                <tr>
                  <td>${item.device_id}</td>
                  <td>${item.time}</td>
                  <td>${item.date}</td>
                  <td>${item.ph}</td>
                  <td>${item.turbidity}</td>
                  <td>${item.tds}</td>
                  <td>${item.flow}</td>
                  <td>${item.filter_mode}</td>
                  <td>${item.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `;
      
      const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `water_quality_history_${timestamp}.xls`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-black dark:text-white mb-2">History</h1>
        <p className="text-slate-800 dark:text-slate-400 text-sm lg:text-base">
          View recent water quality data ({allData.length} readings)
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Sensor Reading Filter Buttons */}
          <div className="flex items-center gap-2 flex-1">
            <Filter className="text-slate-800 dark:text-slate-400 w-4 h-4" />
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSensorFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  sensorFilter === 'all'
                    ? 'bg-accent text-black dark:text-white shadow-lg shadow-accent/30'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-white/20'
                }`}
              >
                All Sensors
              </button>
              <button
                onClick={() => setSensorFilter('pre')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  sensorFilter === 'pre'
                    ? 'bg-blue-500 text-black dark:text-white shadow-lg shadow-blue-500/30'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-white/20'
                }`}
              >
                Pre-Filter
              </button>
              <button
                onClick={() => setSensorFilter('post')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  sensorFilter === 'post'
                    ? 'bg-green-500 text-black dark:text-white shadow-lg shadow-green-500/30'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-white/20'
                }`}
              >
                Post-Filter
              </button>
            </div>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-4 pr-8 py-2 bg-slate-700/50 border border-white/20 rounded-lg text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="all">All Status</option>
              <option value="normal">Normal</option>
              <option value="warning">Warning</option>
              <option value="danger">Danger</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={refetch}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-black dark:text-white rounded-lg transition-colors whitespace-nowrap"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-black dark:text-white rounded-lg transition-colors whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export {settings.data.exportFormat.toUpperCase()}</span>
            <span className="sm:hidden">Export</span>
          </button>

          {/* Delete All Data Button */}
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-black dark:text-white rounded-lg transition-colors whitespace-nowrap"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Delete All</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-3 px-4 text-slate-900 dark:text-slate-300 font-medium">Sensor Reading</th>
                <th className="text-left py-3 px-4 text-slate-900 dark:text-slate-300 font-medium">Time</th>
                <th className="text-left py-3 px-4 text-slate-900 dark:text-slate-300 font-medium">Date</th>
                <th className="text-left py-3 px-4 text-slate-900 dark:text-slate-300 font-medium">pH</th>
                <th className="text-left py-3 px-4 text-slate-900 dark:text-slate-300 font-medium">Turbidity</th>
                <th className="text-left py-3 px-4 text-slate-900 dark:text-slate-300 font-medium">TDS</th>
                <th className="text-left py-3 px-4 text-slate-900 dark:text-slate-300 font-medium">Flow</th>
                <th className="text-left py-3 px-4 text-slate-900 dark:text-slate-300 font-medium">Filter Mode</th>
                <th className="text-left py-3 px-4 text-slate-900 dark:text-slate-300 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item) => (
                <tr key={item.id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                  <td className="py-3 px-4 text-black dark:text-white font-mono text-sm">{item.device_id}</td>
                  <td className="py-3 px-4 text-black dark:text-white">{item.time}</td>
                  <td className="py-3 px-4 text-black dark:text-white">{item.date}</td>
                  <td className="py-3 px-4 text-black dark:text-white">{item.ph.toFixed(1)}</td>
                  <td className="py-3 px-4 text-black dark:text-white">{item.turbidity.toFixed(2)}</td>
                  <td className="py-3 px-4 text-black dark:text-white">{item.tds}</td>
                  <td className="py-3 px-4 text-black dark:text-white">{item.flow.toFixed(1)}</td>
                  <td className="py-3 px-4 text-black dark:text-white capitalize">{item.filter_mode.replace('_', ' ')}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-slate-800 dark:text-slate-400">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} entries
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-white/20 text-slate-800 dark:text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    currentPage === page
                      ? 'bg-accent text-black dark:text-white'
                      : 'text-slate-800 dark:text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-white/20 text-slate-800 dark:text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-white/20 p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-500/20 rounded-lg">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Delete All Data</h3>
                <p className="text-sm text-slate-800 dark:text-slate-400">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-slate-300 mb-6">
              Are you sure you want to delete all sensor data? This will permanently remove all {allData.length} readings from the database.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAllData}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete All
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
