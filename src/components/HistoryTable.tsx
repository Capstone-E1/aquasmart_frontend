import { Download, Filter, Search } from 'lucide-react';

interface HistoryData {
  id: number;
  time: string;
  date: string;
  ph: number;
  turbidity: number;
  tds: number;
  temperature: number;
  status: 'Good' | 'Warning' | 'Critical';
  flow: number;
}

const historyData: HistoryData[] = [
  { id: 1, time: '08:00', date: '2025-09-12', ph: 7.1, turbidity: 0.78, tds: 434, temperature: 22, status: 'Good', flow: 2.5 },
  { id: 2, time: '08:30', date: '2025-09-12', ph: 7.2, turbidity: 0.82, tds: 428, temperature: 22.5, status: 'Good', flow: 2.4 },
  { id: 3, time: '09:00', date: '2025-09-12', ph: 6.8, turbidity: 1.2, tds: 445, temperature: 23, status: 'Warning', flow: 2.3 },
  { id: 4, time: '09:30', date: '2025-09-12', ph: 7.0, turbidity: 0.95, tds: 440, temperature: 22.8, status: 'Good', flow: 2.6 },
  { id: 5, time: '10:00', date: '2025-09-12', ph: 7.3, turbidity: 0.75, tds: 430, temperature: 22.2, status: 'Good', flow: 2.5 },
  { id: 6, time: '10:30', date: '2025-09-12', ph: 6.5, turbidity: 1.8, tds: 460, temperature: 24, status: 'Critical', flow: 2.1 },
  { id: 7, time: '11:00', date: '2025-09-12', ph: 7.1, turbidity: 0.68, tds: 425, temperature: 22.5, status: 'Good', flow: 2.7 },
  { id: 8, time: '11:30', date: '2025-09-12', ph: 7.4, turbidity: 0.85, tds: 438, temperature: 22.1, status: 'Good', flow: 2.4 },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Good':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'Warning':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'Critical':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};

export function HistoryTable() {
  return (
    <div className="bg-primary-light/50 backdrop-blur-sm rounded-xl border border-slate-600 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-white mb-1">Water Quality History</h3>
          <p className="text-slate-400 text-sm">Real-time monitoring data records</p>
        </div>
        
        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-slate-700 text-slate-300 placeholder-slate-500 px-3 py-2 pl-10 pr-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 w-40"
            />
          </div>
          
          {/* Filter */}
          <button className="flex items-center gap-2 px-3 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          
          {/* Export */}
          <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-600">
              <th className="text-left py-3 px-2 text-slate-300 font-medium text-sm">Time</th>
              <th className="text-left py-3 px-2 text-slate-300 font-medium text-sm">Date</th>
              <th className="text-left py-3 px-2 text-slate-300 font-medium text-sm">pH Level</th>
              <th className="text-left py-3 px-2 text-slate-300 font-medium text-sm">Turbidity</th>
              <th className="text-left py-3 px-2 text-slate-300 font-medium text-sm">TDS (ppm)</th>
              <th className="text-left py-3 px-2 text-slate-300 font-medium text-sm">Temp (°C)</th>
              <th className="text-left py-3 px-2 text-slate-300 font-medium text-sm">Flow (L/min)</th>
              <th className="text-left py-3 px-2 text-slate-300 font-medium text-sm">Status</th>
            </tr>
          </thead>
          <tbody>
            {historyData.map((record) => (
              <tr key={record.id} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                <td className="py-3 px-2 text-white font-mono text-sm">{record.time}</td>
                <td className="py-3 px-2 text-slate-300 text-sm">{record.date}</td>
                <td className="py-3 px-2 text-white font-medium text-sm">{record.ph}</td>
                <td className="py-3 px-2 text-white font-medium text-sm">{record.turbidity}</td>
                <td className="py-3 px-2 text-white font-medium text-sm">{record.tds}</td>
                <td className="py-3 px-2 text-white font-medium text-sm">{record.temperature}</td>
                <td className="py-3 px-2 text-white font-medium text-sm">{record.flow}</td>
                <td className="py-3 px-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(record.status)}`}>
                    {record.status}
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
          Showing 1-8 of 156 records
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 bg-slate-700 text-slate-300 rounded hover:bg-slate-600 transition-colors text-sm">
            Previous
          </button>
          <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">1</button>
          <button className="px-3 py-1 bg-slate-700 text-slate-300 rounded hover:bg-slate-600 transition-colors text-sm">
            2
          </button>
          <button className="px-3 py-1 bg-slate-700 text-slate-300 rounded hover:bg-slate-600 transition-colors text-sm">
            3
          </button>
          <button className="px-3 py-1 bg-slate-700 text-slate-300 rounded hover:bg-slate-600 transition-colors text-sm">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
