import { QUERY_PATHS } from '@/utils/constants';
import { ApiCaller } from './init';

export interface FollowUpGroup {
  id: string;
  name: string;
  description?: string;
  church_id: string;
  church_name?: string;
  leader_id?: string;
  leader_name?: string;
  meeting_day?: string;
  meeting_time?: string;
  location?: string;
  max_participants?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateFollowUpGroupData {
  name: string;
  description?: string;
  church_id: string;
  leader_id?: string;
  meeting_day?: string;
  meeting_time?: string;
  location?: string;
  max_participants?: number;
}

export interface UpdateFollowUpGroupData extends Partial<CreateFollowUpGroupData> {
  id: string;
  is_active?: boolean;
}

export interface FollowUpSession {
  id: string;
  followup_group_id: string;
  followup_group_name?: string;
  date: string;
  time: string;
  location?: string;
  participants: number;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
  followup_day: string;
  period: string;
  church: string;
  followup_leader: string;
  start_time: string;
  end_time: string;
  number_of_attendees: string;
  _id: string;
}

export interface CreateFollowUpSessionData {
  followup_group_id: string;
  date: string;
  start_time: string;
  end_time: string;
  location?: string;
  notes?: string;
}

export interface CreateFollowUpSessionResponse {
  id: string;
  followup_group_id: string;
  date: string;
  time: string;
  status: 'scheduled';
  created_at: string;
  access_code?: string;
  followup_code?: string;
}

export interface FollowUpGroupListParams {
  church_id?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
}

export interface FollowUpSessionsListParams {
  followup_group_id?: string;
  church_id?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

export interface FollowUpGroupAttendance {
  id: string;
  followup_group_id: string;
  followup_group_name?: string;
  session_id: string;
  member_id: string;
  member_name: string;
  member_email?: string;
  member_phone?: string;
  attendance_status: 'present' | 'absent' | 'pending';
  date: string;
  checked_in_at?: string;
  notes?: string;
}

export interface FollowUpGroupAttendanceParams {
  followup_group_id?: string;
  session_id?: string;
  member_id?: string;
  date_from?: string;
  date_to?: string;
  attendance_status?: 'present' | 'absent' | 'pending';
  page?: number;
  limit?: number;
}

// Follow-Up Group CRUD operations
export const createFollowUpGroup = async (data: CreateFollowUpGroupData): Promise<FollowUpGroup> => {
  const response = await ApiCaller.post(QUERY_PATHS.FOLLOWUP_GROUP_CREATE, data);
  return response.data?.data || response.data;
};

export const getFollowUpGroups = async (params?: FollowUpGroupListParams): Promise<{
  data: FollowUpGroup[];
  total: number;
  page: number;
  limit: number;
}> => {
  const response = await ApiCaller.get(QUERY_PATHS.FOLLOWUP_GROUP_LIST, { params });
  return response.data?.data || { data: [], total: 0, page: 1, limit: 10 };
};

export const updateFollowUpGroup = async (data: UpdateFollowUpGroupData): Promise<FollowUpGroup> => {
  const response = await ApiCaller.put(`${QUERY_PATHS.FOLLOWUP_GROUP_UPDATE}/${data.id}`, data);
  return response.data?.data || response.data;
};

export const deleteFollowUpGroup = async (id: string): Promise<void> => {
  await ApiCaller.delete(`${QUERY_PATHS.FOLLOWUP_GROUP_DELETE}/${id}`);
};

// Follow-Up Sessions operations
export const createFollowUpSession = async (data: CreateFollowUpSessionData): Promise<CreateFollowUpSessionResponse> => {
  const response = await ApiCaller.post(QUERY_PATHS.FOLLOWUP_SESSION_CREATE, data);
  return response.data?.data || response.data;
};

export const getFollowUpSessions = async (params?: FollowUpSessionsListParams) => {
  const response = await ApiCaller.get(QUERY_PATHS.FOLLOWUP_SESSION_LIST, { params });
  return response.data?.data || { data: [], total: 0, page: 1, limit: 10 };
};

export const deleteFollowUpSession = async (id: string): Promise<void> => {
  await ApiCaller.delete(`${QUERY_PATHS.FOLLOWUP_SESSION_DELETE}/${id}`);
};

// Helper functions for transforming data
export const formatFollowUpSessionForTable = (session: FollowUpSession) => ({
  id: session._id,
  day: session.followup_day,
  period: session.period,
  leader: session.followup_leader,
  date: new Date(session.date).toLocaleDateString('en-GB'),
  time: `${session.start_time} - ${session.end_time}`,
  church: session.church || 'Unknown',
  participants: session.number_of_attendees,
  status: session.status,
});

export const generateMockFollowUpSessions = async (): Promise<any[]> => {
  try {
    const response = await getFollowUpSessions({ limit: 10 });
    return response.data.map(formatFollowUpSessionForTable);
  } catch (error) {
    console.error('Failed to fetch follow-up sessions:', error);
    return [];
  }
};

// Follow-Up Group Attendance operations
export const getFollowUpGroupAttendance = async (params?: FollowUpGroupAttendanceParams): Promise<{
  data: any[];
  total: number;
  page: number;
  limit: number;
  start_time?: string;
  end_time?: string;
  date?: string;
  number_of_attendees?: number;
}> => {
  const response = await ApiCaller.get(QUERY_PATHS.FOLLOWUP_GROUP_RECORDS, { params });
  return response.data || { data: [], total: 0, page: 1, limit: 10 };
};

export const formatAttendanceForDisplay = (attendance: FollowUpGroupAttendance) => ({
  id: attendance.id,
  memberName: attendance.member_name,
  email: attendance.member_email || '',
  phone: attendance.member_phone || '',
  status: attendance.attendance_status,
  date: new Date(attendance.date).toLocaleDateString('en-GB'),
  checkedInAt: attendance.checked_in_at ? new Date(attendance.checked_in_at).toLocaleTimeString() : null,
  followUpGroup: attendance.followup_group_name || 'Unknown',
  notes: attendance.notes || ''
});

// Attendance Management operations
export interface MarkAttendanceParams {
  attendee_id: string;
  followup_group_id?: string;
  session_id?: string;
}

export interface MarkAllAttendanceParams {
  followup_group_id?: string;
  session_id?: string;
}

export const markOnePresent = async (params: MarkAttendanceParams): Promise<void> => {
  await ApiCaller.put(`${QUERY_PATHS.FOLLOWUP_GROUP_ATTENDANCE_APPROVE_ONE}?followup_group_id=${params.followup_group_id}&attendee_id=${params.attendee_id}`);
};

export const markAllPresent = async (params: MarkAllAttendanceParams): Promise<void> => {
  await ApiCaller.put(`${QUERY_PATHS.FOLLOWUP_GROUP_ATTENDANCE_APPROVE_ALL}?followup_group_id=${params.followup_group_id}`, params);
};

export const markOneAbsent = async (params: MarkAttendanceParams): Promise<void> => {
  await ApiCaller.put(`${QUERY_PATHS.FOLLOWUP_GROUP_ATTENDANCE_REJECT_ONE}?followup_group_id=${params.followup_group_id}&attendee_id=${params.attendee_id}`);
};

// Participant Management operations
export interface AddParticipantParams {
  followup_group_id: string;
  member_id?: string;
  name?: string;
  fellowship_id?: string;
  member_phone?: string;
}

export interface RemoveParticipantParams {
  followup_group_id: string;
  attendee_id: string;
}

export const addParticipant = async (params: AddParticipantParams): Promise<void> => {
  await ApiCaller.post(QUERY_PATHS.FOLLOWUP_GROUP_ADD_PARTICIPANT, params);
};

export const removeParticipant = async (params: RemoveParticipantParams): Promise<void> => {
  await ApiCaller.delete(`${QUERY_PATHS.FOLLOWUP_GROUP_REMOVE_PARTICIPANT}?followup_group_id=${params.followup_group_id}&attendee_id=${params.attendee_id}`);
};

// Follow-Up Report interfaces and operations
export interface FollowUpReport {
  id: string;
  worker_id: string;
  worker_name?: string;
  member_id: string;
  member_name?: string;
  fellowship_id?: string;
  fellowship_name?: string;
  church_id?: string;
  church_name?: string;
  date: string;
  duration: number; // in minutes
  topic: string;
  method: 'in_person' | 'phone_call' | 'video_call' | 'text_message' | 'other';
  location?: string;
  progress_level: 'beginner' | 'intermediate' | 'advanced' | 'mature';
  areas_discussed: string[];
  prayer_requests?: string[];
  challenges_faced?: string;
  next_steps?: string[];
  follow_up_needed: boolean;
  follow_up_date?: string;
  notes?: string;
  materials_used?: string[];
  spiritual_growth_indicators?: string[];
  attendance_status: 'present' | 'absent' | 'partial';
  created_at: string;
  updated_at: string;
  status: 'draft' | 'completed' | 'reviewed' | 'archived';
}

export interface CreateFollowUpReportData {
  member_id: string;
  fellowship_id?: string;
  church_id?: string;
  date: string;
  duration: number;
  topic: string;
  method: 'in_person' | 'phone_call' | 'video_call' | 'text_message' | 'other';
  location?: string;
  progress_level: 'beginner' | 'intermediate' | 'advanced' | 'mature';
  areas_discussed: string[];
  prayer_requests?: string[];
  challenges_faced?: string;
  next_steps?: string[];
  follow_up_needed: boolean;
  follow_up_date?: string;
  notes?: string;
  materials_used?: string[];
  spiritual_growth_indicators?: string[];
  attendance_status: 'present' | 'absent' | 'partial';
}

export interface UpdateFollowUpReportData extends Partial<CreateFollowUpReportData> {
  id: string;
  status?: 'draft' | 'completed' | 'reviewed' | 'archived';
}

export interface FollowUpReportListParams {
  worker_id?: string;
  member_id?: string;
  fellowship_id?: string;
  church_id?: string;
  status?: string;
  progress_level?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

export interface FollowUpStats {
  total_reports: number;
  total_members_followed: number;
  total_sessions_conducted: number;
  total_hours_invested: number;
  total_workers_involved: number;
  average_session_duration: number;
  reports_by_status: {
    draft: number;
    completed: number;
    reviewed: number;
    archived: number;
  };
  progress_distribution: {
    beginner: number;
    intermediate: number;
    advanced: number;
    mature: number;
  };
  method_distribution: {
    in_person: number;
    phone_call: number;
    video_call: number;
    text_message: number;
    other: number;
  };
  monthly_growth: Array<{
    month: string;
    total_sessions: number;
    unique_members: number;
    total_hours: number;
  }>;
  top_performing_workers: Array<{
    worker_id: string;
    worker_name: string;
    total_sessions: number;
    total_members: number;
    total_hours: number;
  }>;
  fellowship_stats: Array<{
    fellowship_id: string;
    fellowship_name: string;
    total_reports: number;
    total_members_followed: number;
  }>;
}

// POST /api/follow-up - Record a new follow-up session
export const submitFollowUpReport = async (data: CreateFollowUpReportData): Promise<FollowUpReport> => {
  const response = await ApiCaller.post(QUERY_PATHS.FOLLOWUP_REPORT_SUBMIT, data);
  return response.data?.data || response.data;
};

// GET /api/follow-up/worker/history - Get history for the logged-in worker
export const getWorkerFollowUpHistory = async (params?: FollowUpReportListParams): Promise<{
  data: FollowUpReport[];
  total: number;
  page: number;
  limit: number;
}> => {
  const response = await ApiCaller.get(QUERY_PATHS.FOLLOWUP_WORKER_HISTORY, { params });
  return response.data?.data || { data: [], total: 0, page: 1, limit: 10 };
};

// GET /api/follow-up/admin/all - Get all records (Admin usage)
export const getAllFollowUpReports = async (params?: FollowUpReportListParams): Promise<{
  data: FollowUpReport[];
  total: number;
  page: number;
  limit: number;
}> => {
  const response = await ApiCaller.get(QUERY_PATHS.FOLLOWUP_ADMIN_ALL, { params });
  return response.data?.data || { data: [], total: 0, page: 1, limit: 10 };
};

// GET /api/follow-up/admin/stats - Get aggregate stats (Admin usage)
export const getFollowUpStats = async (): Promise<FollowUpStats> => {
  const response = await ApiCaller.get(QUERY_PATHS.FOLLOWUP_ADMIN_STATS);
  return response.data?.data || response.data;
};

// GET /api/follow-up/{id} - Get a specific record by ID
export const getFollowUpReportById = async (id: string): Promise<FollowUpReport> => {
  const response = await ApiCaller.get(`${QUERY_PATHS.FOLLOWUP_REPORT_DETAIL}/${id}`);
  return response.data?.data || response.data;
};

// PATCH /api/follow-up/{id} - Update a record
export const updateFollowUpReport = async (data: UpdateFollowUpReportData): Promise<FollowUpReport> => {
  const response = await ApiCaller.patch(`${QUERY_PATHS.FOLLOWUP_REPORT_UPDATE}/${data.id}`, data);
  return response.data?.data || response.data;
};

// DELETE /api/follow-up/{id} - Delete a record
export const deleteFollowUpReport = async (id: string): Promise<void> => {
  await ApiCaller.delete(`${QUERY_PATHS.FOLLOWUP_REPORT_DELETE}/${id}`);
};