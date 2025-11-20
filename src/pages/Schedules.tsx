import { useState } from 'react';
import { Clock, Plus, Edit2, Trash2, Power, Calendar, RefreshCw } from 'lucide-react';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useSchedules } from '../hooks/useSchedules';
import { apiService, type Schedule, type CreateScheduleData } from '../services/api';
const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Mon' },
  { value: 'tuesday', label: 'Tue' },
  { value: 'wednesday', label: 'Wed' },
  { value: 'thursday', label: 'Thu' },
  { value: 'friday', label: 'Fri' },
  { value: 'saturday', label: 'Sat' },
  { value: 'sunday', label: 'Sun' },
];

const FILTER_MODES = [
  { value: 'household_water', label: 'Household Water', color: 'bg-blue-500', icon: '🏠' },
  { value: 'drinking_water', label: 'Drinking Water', color: 'bg-cyan-500', icon: '💧' },
];

export function Schedules() {
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const { schedules, isLoading, error, refetch } = useSchedules(showActiveOnly);

  const showNotification = (message: string, type: 'success' | 'error' | 'warning') => {
    console.log(`[${type}] ${message}`);
    alert(message);
  };

  const [formData, setFormData] = useState<CreateScheduleData>({
    name: '',
    filter_mode: 'household_water',
    start_time: '08:00:00',
    duration_minutes: 60,
    days_of_week: [],
    is_active: true,
    timezone: 'Asia/Jakarta',
  });

  const handleOpenModal = (schedule?: Schedule) => {
    if (schedule) {
      setEditingSchedule(schedule);
      const timeOnly = schedule.start_time.split('T')[1]?.substring(0, 8) || schedule.start_time;
      setFormData({
        name: schedule.name,
        filter_mode: schedule.filter_mode,
        start_time: timeOnly,
        duration_minutes: schedule.duration_minutes,
        days_of_week: schedule.days_of_week,
        is_active: schedule.is_active,
        timezone: 'Asia/Jakarta',
      });
    } else {
      setEditingSchedule(null);
      setFormData({
        name: '',
        filter_mode: 'household_water',
        start_time: '08:00:00',
        duration_minutes: 60,
        days_of_week: [],
        is_active: true,
        timezone: 'Asia/Jakarta',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSchedule(null);
  };

  // Helper function to convert time string to minutes
  const timeToMinutes = (timeString: string): number => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Check if two schedules overlap
  const checkScheduleConflict = (
    newStartTime: string,
    newDuration: number,
    newDays: string[],
    excludeId?: number
  ): { hasConflict: boolean; conflictSchedule?: Schedule } => {
    const newStart = timeToMinutes(newStartTime);
    const newEnd = newStart + newDuration;

    for (const { schedule } of schedules) {
      // Skip if it's the same schedule we're editing
      if (excludeId && schedule.id === excludeId) continue;
      
      // Only check active schedules
      if (!schedule.is_active) continue;

      // Check if there's any overlapping day
      const hasCommonDay = schedule.days_of_week.some(day => newDays.includes(day));
      if (!hasCommonDay) continue;

      // Get existing schedule time range
      const existingTime = schedule.start_time.split('T')[1]?.substring(0, 5) || schedule.start_time.substring(0, 8);
      const existingStart = timeToMinutes(existingTime);
      const existingEnd = existingStart + schedule.duration_minutes;

      // Check if times overlap
      // Two time ranges overlap if: (start1 < end2) AND (start2 < end1)
      const hasTimeOverlap = (newStart < existingEnd) && (existingStart < newEnd);

      if (hasTimeOverlap) {
        return { hasConflict: true, conflictSchedule: schedule };
      }
    }

    return { hasConflict: false };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.days_of_week.length === 0) {
      showNotification('Please select at least one day', 'warning');
      return;
    }

    // Check for conflicts
    const { hasConflict, conflictSchedule } = checkScheduleConflict(
      formData.start_time.substring(0, 5),
      formData.duration_minutes,
      formData.days_of_week,
      editingSchedule?.id
    );

    if (hasConflict && conflictSchedule) {
      const conflictTime = formatTime(conflictSchedule.start_time);
      const conflictDuration = formatDuration(conflictSchedule.duration_minutes);
      const conflictDays = conflictSchedule.days_of_week.map(d => 
        DAYS_OF_WEEK.find(day => day.value === d)?.label
      ).join(', ');
      
      showNotification(
        `Schedule conflict detected!\n"${conflictSchedule.name}" runs at ${conflictTime} for ${conflictDuration} on ${conflictDays}.\nPlease choose a different time or days.`,
        'error'
      );
      return;
    }

    try {
      if (editingSchedule) {
        await apiService.updateSchedule(editingSchedule.id, formData);
        showNotification('Schedule updated successfully', 'success');
      } else {
        await apiService.createSchedule(formData);
        showNotification('Schedule created successfully', 'success');
      }
      handleCloseModal();
      refetch();
    } catch (err) {
      showNotification(err instanceof Error ? err.message : 'Failed to save schedule', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;
    
    try {
      await apiService.deleteSchedule(id);
      showNotification('Schedule deleted successfully', 'success');
      refetch();
    } catch (err) {
      showNotification(err instanceof Error ? err.message : 'Failed to delete schedule', 'error');
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await apiService.toggleScheduleStatus(id, !currentStatus);
      showNotification(`Schedule ${!currentStatus ? 'activated' : 'deactivated'}`, 'success');
      refetch();
    } catch (err) {
      showNotification(err instanceof Error ? err.message : 'Failed to toggle schedule', 'error');
    }
  };

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(day)
        ? prev.days_of_week.filter(d => d !== day)
        : [...prev.days_of_week, day]
    }));
  };

  const getFilterModeInfo = (mode: string) => {
    return FILTER_MODES.find(m => m.value === mode) || FILTER_MODES[0];
  };

  const formatTime = (timeString: string) => {
    const timeOnly = timeString.split('T')[1]?.substring(0, 5) || timeString.substring(0, 5);
    return timeOnly;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h`;
    return `${mins}m`;
  };

  if (isLoading) {
    return <LoadingSkeleton variant="page" />;
  }

  if (error) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-white mb-2">Schedule Management</h1>
          <p className="text-slate-400 text-sm lg:text-base">Manage your filter mode schedules</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400">Error loading schedules: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-white mb-2">Schedule Management</h1>
        <p className="text-slate-400 text-sm lg:text-base">
          Automate your water filtration modes ({schedules.length} schedules)
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowActiveOnly(!showActiveOnly)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              showActiveOnly
                ? 'bg-accent text-white shadow-lg shadow-accent/30'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-white/20'
            }`}
          >
            {showActiveOnly ? 'Active Only' : 'All Schedules'}
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={refetch}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Schedule
          </button>
        </div>
      </div>

      {/* Schedule Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {schedules.map(({ schedule, next_execution }) => {
          const modeInfo = getFilterModeInfo(schedule.filter_mode);
          return (
            <div
              key={schedule.id}
              className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4 lg:p-6 hover:border-slate-500 transition-colors"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 ${modeInfo.color} rounded-lg flex items-center justify-center text-2xl`}>
                    {modeInfo.icon}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">{schedule.name}</h3>
                    <p className="text-slate-400 text-sm">{modeInfo.label}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleStatus(schedule.id, schedule.is_active)}
                    className={`p-2 rounded-lg transition-colors ${
                      schedule.is_active
                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        : 'bg-slate-600/20 text-slate-400 hover:bg-slate-600/30'
                    }`}
                    title={schedule.is_active ? 'Active' : 'Inactive'}
                  >
                    <Power className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenModal(schedule)}
                    className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(schedule.id)}
                    className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Schedule Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-300">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-sm">
                    {formatTime(schedule.start_time)} • {formatDuration(schedule.duration_minutes)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <div className="flex flex-wrap gap-1">
                    {DAYS_OF_WEEK.map(day => (
                      <span
                        key={day.value}
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          schedule.days_of_week.includes(day.value)
                            ? 'bg-accent/20 text-accent'
                            : 'bg-slate-600/20 text-slate-500'
                        }`}
                      >
                        {day.label}
                      </span>
                    ))}
                  </div>
                </div>

                {next_execution && (
                  <div className="mt-3 pt-3 border-t border-white/20">
                    <p className="text-xs text-slate-400">
                      Next run: <span className="text-slate-300">
                        {new Date(next_execution).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          timeZone: 'Asia/Jakarta',
                        })} (WIB)
                      </span>
                    </p>
                  </div>
                )}
              </div>

              {/* Status Badge */}
              <div className="mt-4">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  schedule.is_active
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-slate-600/20 text-slate-400'
                }`}>
                  {schedule.is_active ? '● Active' : '○ Inactive'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {schedules.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No schedules yet</h3>
          <p className="text-slate-400 mb-4">Create your first schedule to automate filter modes</p>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Schedule
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-xl border border-white/20 p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingSchedule ? 'Edit Schedule' : 'Create Schedule'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Schedule Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="e.g., Morning Drinking Water"
                  required
                />
              </div>

              {/* Filter Mode */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Filter Mode
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {FILTER_MODES.map(mode => (
                    <button
                      key={mode.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, filter_mode: mode.value })}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                        formData.filter_mode === mode.value
                          ? `${mode.color} border-white/30 text-white`
                          : 'bg-slate-700/30 border-white/20 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      <span className="text-2xl">{mode.icon}</span>
                      <span className="font-medium">{mode.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Start Time */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  value={formData.start_time.substring(0, 5)}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value + ':00' })}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent"
                  min="1"
                  required
                />
              </div>

              {/* Days of Week */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Days of Week
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {DAYS_OF_WEEK.map(day => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDay(day.value)}
                      className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                        formData.days_of_week.includes(day.value)
                          ? 'bg-accent text-white'
                          : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Conflict Warning */}
              {(() => {
                if (formData.days_of_week.length === 0) return null;
                
                const { hasConflict, conflictSchedule } = checkScheduleConflict(
                  formData.start_time.substring(0, 5),
                  formData.duration_minutes,
                  formData.days_of_week,
                  editingSchedule?.id
                );

                if (hasConflict && conflictSchedule) {
                  const conflictTime = formatTime(conflictSchedule.start_time);
                  const conflictDuration = formatDuration(conflictSchedule.duration_minutes);
                  const endTime = timeToMinutes(formData.start_time.substring(0, 5)) + formData.duration_minutes;
                  const endHours = Math.floor(endTime / 60);
                  const endMins = endTime % 60;
                  const formattedEndTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
                  
                  return (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <div className="flex items-start gap-2">
                        <span className="text-red-400 text-xl">⚠️</span>
                        <div className="flex-1">
                          <p className="text-red-400 font-medium text-sm mb-1">Schedule Conflict Detected!</p>
                          <p className="text-red-300 text-xs">
                            Your schedule ({formData.start_time.substring(0, 5)} - {formattedEndTime}) overlaps with:
                          </p>
                          <p className="text-white text-xs mt-1 font-medium">
                            "{conflictSchedule.name}"
                          </p>
                          <p className="text-red-300 text-xs">
                            {conflictTime} for {conflictDuration} on {conflictSchedule.days_of_week.map(d => 
                              DAYS_OF_WEEK.find(day => day.value === d)?.label
                            ).join(', ')}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }
                
                return (
                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-green-400 text-lg">✓</span>
                      <p className="text-green-400 text-sm">No conflicts detected</p>
                    </div>
                  </div>
                );
              })()}

              {/* Active Status */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-accent bg-slate-700 border-white/20 rounded focus:ring-accent"
                />
                <label htmlFor="is_active" className="text-sm text-slate-300">
                  Activate schedule immediately
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors"
                >
                  {editingSchedule ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
