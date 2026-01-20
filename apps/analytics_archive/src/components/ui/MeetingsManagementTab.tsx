'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { 
  getAllChurchMeetings,
  ChurchMeeting,
  ChurchMeetingListParams,
  formatMeetingDate,
  formatMeetingTime,
  getMeetingStatusColor,
  getMeetingTypeLabel,
  getFrequencyLabel,
  generateAttendanceCode
} from '@/services/churchMeetings';
import { 
  Clock, 
  MapPin, 
  Users, 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  Filter,
  Calendar,
  Hash,
  Copy
} from 'lucide-react';

interface MeetingsManagementTabProps {
  onViewDetails?: (id: string) => void;
  onEditMeeting?: (meeting: ChurchMeeting) => void;
  onAddMeeting?: () => void;
  userRole?: 'admin' | 'pastor';
}

export default function MeetingsManagementTab({ 
  onViewDetails, 
  onEditMeeting, 
  onAddMeeting,
  userRole = 'admin'
}: MeetingsManagementTabProps): React.JSX.Element {
  const [meetings, setMeetings] = useState<ChurchMeeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalMeetings, setTotalMeetings] = useState(0);
  const [filters, setFilters] = useState<ChurchMeetingListParams>({
    type: '',
    status: '',
    date_from: '',
    date_to: '',
    limit: 10
  });

  const fetchMeetings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params: ChurchMeetingListParams = {
        ...filters,
        page: currentPage,
        limit: 10
      };

      const response = await getAllChurchMeetings(params);
      
      setMeetings(response.data || []);
      setTotalMeetings(response.total || 0);
    } catch (err) {
      console.error('Failed to fetch church meetings:', err);
      setError('Failed to load meetings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, [currentPage, filters]);

  const handleFilterChange = (field: keyof ChurchMeetingListParams, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value || undefined
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleGenerateCode = async (meetingId: string) => {
    try {
      const code = generateAttendanceCode();
      // In a real app, this would make an API call to save the code
      alert(`Attendance code generated: ${code}\n\nThis code would be saved to the meeting and attendees can use it to mark their attendance.`);
    } catch (error) {
      console.error('Failed to generate attendance code:', error);
      alert('Failed to generate attendance code. Please try again.');
    }
  };

  const copyAttendanceCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert('Attendance code copied to clipboard!');
  };

  const getStatusBadge = (status: string) => {
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMeetingStatusColor(status)}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading meetings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">
          All Church Meetings
        </h3>
        {onAddMeeting && (
          <button 
            onClick={onAddMeeting}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded font-semibold text-sm"
          >
            <Plus className="w-4 h-4" />
            Create Meeting
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-border p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Meeting Type</label>
            <select
              value={filters.type || ''}
              onChange={(e) => handleFilterChange('type', e.target.value)}
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
            <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            >
              <option value="">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
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
                  type: '',
                  status: '',
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

      {/* Meetings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {meetings.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-gray-500">
            {error ? 'Failed to load meetings' : 'No meetings found'}
          </div>
        ) : (
          meetings.map((meeting) => (
            <div
              key={meeting.id}
              className="bg-white border border-border rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">🏛️</div>
                {getStatusBadge(meeting.status)}
              </div>

              {/* Meeting Title */}
              <h4 className="text-lg font-bold text-foreground mb-1">{meeting.name}</h4>
              <p className="text-xs text-muted-foreground font-medium mb-4">
                {getMeetingTypeLabel(meeting.type)} • {getFrequencyLabel(meeting.frequency || 'once')}
              </p>

              {/* Meeting Details */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{formatMeetingDate(meeting.date)}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{formatMeetingTime(meeting.start_time, meeting.end_time)}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{meeting.location}</span>
                </div>
                {meeting.max_participants && (
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>Max: {meeting.max_participants} participants</span>
                  </div>
                )}
                {meeting.attendance_count !== undefined && (
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>Attendance: {meeting.attendance_count}</span>
                  </div>
                )}
              </div>

              {/* Attendance Code */}
              {meeting.attendance_code && (
                <div className="bg-blue-50 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-blue-700 mb-1">ATTENDANCE CODE</p>
                      <p className="text-lg font-mono font-bold text-blue-900">{meeting.attendance_code}</p>
                    </div>
                    <button
                      onClick={() => copyAttendanceCode(meeting.attendance_code!)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                      title="Copy Code"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <button 
                  onClick={() => handleGenerateCode(meeting.id)}
                  className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Hash className="w-3 h-3" />
                  GENERATE CODE
                </button>
                <div className="flex items-center gap-2">
                  {onViewDetails && (
                    <button
                      onClick={() => onViewDetails(meeting.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  {onEditMeeting && (
                    <button
                      onClick={() => onEditMeeting(meeting)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded"
                      title="Edit Meeting"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                  {userRole === 'admin' && (
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this meeting?')) {
                          // Handle delete - would call delete API
                          alert('Delete functionality would be implemented here');
                        }
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Delete Meeting"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalMeetings > 10 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalMeetings)} of {totalMeetings} meetings
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
              Page {currentPage} of {Math.ceil(totalMeetings / 10)}
            </span>
            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={currentPage >= Math.ceil(totalMeetings / 10)}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}