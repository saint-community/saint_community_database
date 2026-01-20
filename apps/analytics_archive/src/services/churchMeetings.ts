import { QUERY_PATHS } from '@/utils/constants';
import { ApiCaller } from './init';

// Church Meeting interfaces
export interface ChurchMeeting {
  id: string;
  name: string;
  type: 'sunday_service' | 'midweek_service' | 'prayer_meeting' | 'special_service' | 'other';
  description?: string;
  church_id: string;
  church_name?: string;
  location: string;
  date: string;
  start_time: string;
  end_time?: string;
  frequency?: 'once' | 'weekly' | 'monthly' | 'yearly';
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  max_participants?: number;
  attendance_code?: string;
  code_expires_at?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  attendance_count?: number;
  scope?: string;
}

export interface CreateChurchMeetingData {
  name: string;
  type: 'sunday_service' | 'midweek_service' | 'prayer_meeting' | 'special_service' | 'other';
  description?: string;
  church_id: string;
  location: string;
  date: string;
  start_time: string;
  end_time?: string;
  frequency?: 'once' | 'weekly' | 'monthly' | 'yearly';
  max_participants?: number;
}

export interface UpdateChurchMeetingData extends Partial<CreateChurchMeetingData> {
  id: string;
  status?: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
}

export interface ChurchMeetingListParams {
  church_id?: string;
  type?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

// Attendance interfaces
export interface AttendanceRecord {
  id: string;
  meeting_id: string;
  meeting_name?: string;
  meeting_type?: string;
  member_id: string;
  member_name: string;
  member_email?: string;
  member_phone?: string;
  church_id?: string;
  church_name?: string;
  fellowship_id?: string;
  fellowship_name?: string;
  date: string;
  marked_at: string;
  attendance_code?: string;
  notes?: string;
  status: 'present' | 'absent' | 'late';
}

export interface MarkAttendanceData {
  attendance_code: string;
  notes?: string;
}

export interface AttendanceHistoryParams {
  member_id?: string;
  church_id?: string;
  fellowship_id?: string;
  meeting_type?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

export interface AttendanceStats {
  total_meetings_attended: number;
  total_meetings_available: number;
  attendance_percentage: number;
  consecutive_attendance_streak: number;
  last_attendance_date?: string;
  meetings_by_type: {
    sunday_service: number;
    midweek_service: number;
    prayer_meeting: number;
    special_service: number;
    other: number;
  };
  monthly_attendance: Array<{
    month: string;
    meetings_attended: number;
    meetings_available: number;
    percentage: number;
  }>;
}

// POST /api/attendance/admin/meeting - Create a new meeting (Admin)
export const createChurchMeeting = async (data: CreateChurchMeetingData): Promise<ChurchMeeting> => {
  const response = await ApiCaller.post(QUERY_PATHS.ATTENDANCE_ADMIN_MEETING_CREATE, data);
  return response.data?.data || response.data;
};

// POST /api/attendance/mark - Mark attendance using code
export const markAttendance = async (data: MarkAttendanceData): Promise<AttendanceRecord> => {
  const response = await ApiCaller.post(QUERY_PATHS.ATTENDANCE_MARK, data);
  return response.data?.data || response.data;
};

// GET /api/attendance/history - Get my attendance history
export const getAttendanceHistory = async (params?: AttendanceHistoryParams): Promise<{
  data: AttendanceRecord[];
  total: number;
  page: number;
  limit: number;
  stats?: AttendanceStats;
}> => {
  const response = await ApiCaller.get(QUERY_PATHS.ATTENDANCE_HISTORY, { params });
  return response.data?.data || { data: [], total: 0, page: 1, limit: 10 };
};

// GET /api/attendance/admin/meetings - Get all meetings (Admin)
export const getAllChurchMeetings = async (params?: ChurchMeetingListParams): Promise<{
  data: ChurchMeeting[];
  total: number;
  page: number;
  limit: number;
}> => {
  const response = await ApiCaller.get(QUERY_PATHS.ATTENDANCE_ADMIN_MEETINGS, { params });
  return response.data?.data || { data: [], total: 0, page: 1, limit: 10 };
};

// Helper functions for formatting and display
export const formatMeetingTime = (startTime: string, endTime?: string): string => {
  if (endTime) {
    return `${startTime} - ${endTime}`;
  }
  return startTime;
};

export const formatMeetingDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-GB');
};

export const formatMeetingDateTime = (dateString: string, timeString: string): string => {
  const date = new Date(`${dateString}T${timeString}`);
  return date.toLocaleString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getMeetingStatusColor = (status: string): string => {
  const statusColors = {
    scheduled: 'bg-blue-100 text-blue-600',
    ongoing: 'bg-green-100 text-green-600',
    completed: 'bg-gray-100 text-gray-600',
    cancelled: 'bg-red-100 text-red-600'
  };
  
  return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-600';
};

export const getMeetingTypeLabel = (type: string): string => {
  const typeLabels = {
    sunday_service: 'Sunday Service',
    midweek_service: 'Midweek Service',
    prayer_meeting: 'Prayer Meeting',
    special_service: 'Special Service',
    other: 'Other'
  };
  
  return typeLabels[type as keyof typeof typeLabels] || type;
};

export const getFrequencyLabel = (frequency: string): string => {
  const frequencyLabels = {
    once: 'One-time',
    weekly: 'Weekly',
    monthly: 'Monthly',
    yearly: 'Yearly'
  };
  
  return frequencyLabels[frequency as keyof typeof frequencyLabels] || frequency;
};

export const generateAttendanceCode = (): string => {
  // Generate a 6-digit random code
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const isAttendanceCodeExpired = (expiresAt?: string): boolean => {
  if (!expiresAt) return false;
  return new Date() > new Date(expiresAt);
};

export const calculateAttendancePercentage = (attended: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((attended / total) * 100);
};