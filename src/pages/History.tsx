import { useState, useMemo } from 'react';
import { Search, Filter, Download, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useHistoryData } from '../hooks/useHistoryData';
import { apiService } from '../services/api';
import type { SensorData } from '../services/api';

// Data interface untuk history
interface HistoryData {
  id: number;
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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { historyData: allData, isLoading, error, refetch } = useHistoryData(50); // Get 50 recent readings

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
          <p className="text-slate-400 text-sm lg:text-base">View historical water quality data</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400">Error loading history data: {error}</p>
        </div>
      </div>
    );
  }

  // Filter data berdasarkan search dan status
  const filteredData = historyData.filter(item => {
    const matchesSearch = 
      item.time.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ph.toString().includes(searchTerm) ||
      item.turbidity.toString().includes(searchTerm) ||
      item.tds.toString().includes(searchTerm) ||
      item.flow.toString().includes(searchTerm) ||
      item.filter_mode.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    
    return matchesSearch && matchesStatus;
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
      default: return 'text-slate-400 bg-slate-400/20';
    }
  };

  // Export function
  const handleExport = () => {
    const csvContent = [
      ['Time', 'Date', 'pH', 'Turbidity (NTU)', 'TDS', 'Flow', 'Filter Mode', 'Status'].join(','),
      ...filteredData.map(item => 
        [item.time, item.date, item.ph, item.turbidity, item.tds, item.flow, item.filter_mode, item.status].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'water_quality_history.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-white mb-2">History</h1>
        <p className="text-slate-400 text-sm lg:text-base">
          View recent water quality data ({allData.length} readings)
        </p>
      </div>

      {/* Controls */}
      <div className="bg-primary-light/50 backdrop-blur-sm rounded-xl border border-slate-600 p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors whitespace-nowrap"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">Export</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-600">
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Time</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Date</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">pH</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Turbidity</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">TDS</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Flow</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Filter Mode</th>
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item) => (
                <tr key={item.id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                  <td className="py-3 px-4 text-white">{item.time}</td>
                  <td className="py-3 px-4 text-white">{item.date}</td>
                  <td className="py-3 px-4 text-white">{item.ph.toFixed(1)}</td>
                  <td className="py-3 px-4 text-white">{item.turbidity.toFixed(2)}</td>
                  <td className="py-3 px-4 text-white">{item.tds}</td>
                  <td className="py-3 px-4 text-white">{item.flow.toFixed(1)}</td>
                  <td className="py-3 px-4 text-white capitalize">{item.filter_mode.replace('_', ' ')}</td>
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
          <div className="text-sm text-slate-400">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} entries
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-slate-600 text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-slate-600 text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
