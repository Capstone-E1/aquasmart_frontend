import { useState, useEffect } from 'react';
import { Search, Filter, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

// Data interface untuk history
interface HistoryData {
  id: number;
  time: string;
  date: string;
  ph: number;
  turbidity: number;
  tds: number;
  flow: number;
  status: 'normal' | 'warning' | 'danger';
}

const historyData: HistoryData[] = [
  { id: 1, time: '10:30', date: '2024-01-15', ph: 7.2, turbidity: 0.5, tds: 450, flow: 2.5, status: 'normal' },
  { id: 2, time: '10:25', date: '2024-01-15', ph: 6.8, turbidity: 0.8, tds: 520, flow: 2.3, status: 'warning' },
  { id: 3, time: '10:20', date: '2024-01-15', ph: 7.5, turbidity: 0.3, tds: 420, flow: 2.7, status: 'normal' },
  { id: 4, time: '10:15', date: '2024-01-15', ph: 8.2, turbidity: 1.2, tds: 680, flow: 2.1, status: 'danger' },
  { id: 5, time: '10:10', date: '2024-01-15', ph: 7.1, turbidity: 0.6, tds: 470, flow: 2.4, status: 'normal' },
  { id: 6, time: '10:05', date: '2024-01-15', ph: 6.9, turbidity: 0.9, tds: 510, flow: 2.2, status: 'warning' },
  { id: 7, time: '10:00', date: '2024-01-15', ph: 7.3, turbidity: 0.4, tds: 440, flow: 2.6, status: 'normal' },
  { id: 8, time: '09:55', date: '2024-01-15', ph: 7.8, turbidity: 0.7, tds: 490, flow: 2.4, status: 'normal' },
  { id: 9, time: '09:50', date: '2024-01-15', ph: 6.5, turbidity: 1.5, tds: 720, flow: 1.9, status: 'danger' },
  { id: 10, time: '09:45', date: '2024-01-15', ph: 7.0, turbidity: 0.8, tds: 480, flow: 2.3, status: 'warning' },
];

export function History() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 5;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingSkeleton variant="page" />;
  }

  // Filter data berdasarkan search dan status
  const filteredData = historyData.filter(item => {
    const matchesSearch = 
      item.time.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ph.toString().includes(searchTerm) ||
      item.turbidity.toString().includes(searchTerm) ||
      item.tds.toString().includes(searchTerm) ||
      item.flow.toString().includes(searchTerm);
    
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
      ['Time', 'Date', 'pH', 'Turbidity', 'TDS', 'Flow', 'Status'].join(','),
      ...filteredData.map(item => 
        [item.time, item.date, item.ph, item.turbidity, item.tds, item.flow, item.status].join(',')
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
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">History</h1>
        <p className="text-slate-400">View historical water quality data</p>
      </div>

      {/* Controls */}
      <div className="bg-primary-light/50 backdrop-blur-sm rounded-xl border border-slate-600 p-6">
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

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
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
                <th className="text-left py-3 px-4 text-slate-300 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item) => (
                <tr key={item.id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                  <td className="py-3 px-4 text-white">{item.time}</td>
                  <td className="py-3 px-4 text-white">{item.date}</td>
                  <td className="py-3 px-4 text-white">{item.ph}</td>
                  <td className="py-3 px-4 text-white">{item.turbidity}</td>
                  <td className="py-3 px-4 text-white">{item.tds}</td>
                  <td className="py-3 px-4 text-white">{item.flow}</td>
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
