'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { 
  getAttendanceHistory, 
  AttendanceRecord,
  AttendanceHistoryParams,
  AttendanceStats,
  formatMeetingDate,
  getMeetingTypeLabel,
  calculateAttendancePercentage
} from '@/services/churchMeetings';
import { Clock, Calendar, MapPin, User, BarChart3, Filter } from 'lucide-react';

interface AttendanceHistoryTabProps {
  userRole?: 'admin' | 'member';
}

export default function AttendanceHistoryTab({ 
  userRole = 'member'
}: AttendanceHistoryTabProps): React.JSX.Element {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [filters, setFilters] = useState<AttendanceHistoryParams>({
    meeting_type: '',
    date_from: '',
    date_to: '',
    limit: 10
  });

  const fetchAttendanceHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params: AttendanceHistoryParams = {
        ...filters,
        page: currentPage,
        limit: 10
      };

      const response = await getAttendanceHistory(params);
      
      setAttendance(response.data || []);
      setTotalRecords(response.total || 0);
      setStats(response.stats || null);
    } catch (err) {
      console.error('Failed to fetch attendance history:', err);
      setError('Failed to load attendance history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceHistory();
  }, [currentPage, filters]);

  const handleFilterChange = (field: keyof AttendanceHistoryParams, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value || undefined
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      present: 'bg-green-100 text-green-600',
      absent: 'bg-red-100 text-red-600',
      late: 'bg-yellow-100 text-yellow-600'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-600'
      }`}>
        {status.toUpperCase()}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading attendance history...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <BarChart3 className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">ATTENDANCE RATE</p>
                <p className="text-xl font-bold text-foreground">{stats.attendance_percentage}%</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <Calendar className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">MEETINGS ATTENDED</p>
                <p className="text-xl font-bold text-foreground">{stats.total_meetings_attended}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-full">
                <Clock className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">STREAK</p>
                <p className="text-xl font-bold text-foreground">{stats.consecutive_attendance_streak}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-full">
                <User className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">TOTAL AVAILABLE</p>
                <p className="text-xl font-bold text-foreground">{stats.total_meetings_available}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-border p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Meeting Type</label>
            <select
              value={filters.meeting_type || ''}
              onChange={(e) => handleFilterChange('meeting_type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            >
              <option value="">All Types</option>
              <option value="sunday_service">Sunday Service</option>
              <option value="midweek_service">Midweek Service</option>
              <option value="prayer_meeting">Prayer Meeting</option>
              <option value="special_service">Special Service</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Date From</label>
            <input
              type="date"
              value={filters.date_from || ''}
              onChange={(e) => handleFilterChange('date_from', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Date To</label>
            <input
              type="date"
              value={filters.date_to || ''}
              onChange={(e) => handleFilterChange('date_to', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilters({
                  meeting_type: '',
                  date_from: '',
                  date_to: '',
                  limit: 10
                });
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-gray-100 text-gray-600 rounded text-sm hover:bg-gray-200"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-foreground">Attendance History</h3>
        </div>
        
        {error && (
          <div className="p-4 bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">Meeting</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">Date & Time</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">Location</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">Status</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">Marked At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {attendance.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    {error ? 'Failed to load attendance history' : 'No attendance records found'}
                  </td>
                </tr>
              ) : (
                attendance.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <div className="text-sm font-medium text-gray-900">
                        {record.meeting_name || 'Unknown Meeting'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {getMeetingTypeLabel(record.meeting_type || '')}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-900 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatMeetingDate(record.date)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-900 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        Location info
                      </div>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(record.status)}
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-900">
                        {new Date(record.marked_at).toLocaleString('en-GB')}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalRecords > 10 && (
          <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalRecords)} of {totalRecords} records
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm">
                Page {currentPage} of {Math.ceil(totalRecords / 10)}
              </span>
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage >= Math.ceil(totalRecords / 10)}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}