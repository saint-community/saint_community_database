import { QUERY_PATHS } from '@/utils/constants';
import { ApiCaller } from './init';

export interface EvangelismGroup {
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

export interface CreateEvangelismGroupData {
  name: string;
  description?: string;
  church_id: string;
  leader_id?: string;
  meeting_day?: string;
  meeting_time?: string;
  location?: string;
  max_participants?: number;
}

export interface UpdateEvangelismGroupData extends Partial<CreateEvangelismGroupData> {
  id: string;
  is_active?: boolean;
}

export interface EvangelismSession {
  id: string;
  evangelism_group_id: string;
  evangelism_group_name?: string;
  date: string;
  time: string;
  location?: string;
  participants: number;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
  evangelism_day: string;
  period: string;
  church: string;
  evangelism_leader: string;
  start_time: string;
  end_time: string;
  number_of_attendees: string;
  _id: string;
}

export interface CreateEvangelismSessionData {
  evangelism_group_id: string;
  date: string;
  start_time: string;
  end_time: string;
  location?: string;
  notes?: string;
}

export interface CreateEvangelismSessionResponse {
  id: string;
  evangelism_group_id: string;
  date: string;
  time: string;
  status: 'scheduled';
  created_at: string;
  access_code?: string;
  evangelism_code?: string;
}

export interface EvangelismGroupListParams {
  church_id?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
}

export interface EvangelismSessionsListParams {
  evangelism_group_id?: string;
  church_id?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

export interface EvangelismGroupAttendance {
  id: string;
  evangelism_group_id: string;
  evangelism_group_name?: string;
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

export interface EvangelismGroupAttendanceParams {
  evangelism_group_id?: string;
  session_id?: string;
  member_id?: string;
  date_from?: string;
  date_to?: string;
  attendance_status?: 'present' | 'absent' | 'pending';
  page?: number;
  limit?: number;
}

// Evangelism Group CRUD operations
export const createEvangelismGroup = async (data: CreateEvangelismGroupData): Promise<EvangelismGroup> => {
  const response = await ApiCaller.post(QUERY_PATHS.EVANGELISM_GROUP_CREATE, data);
  return response.data?.data || response.data;
};

export const getEvangelismGroups = async (params?: EvangelismGroupListParams): Promise<{
  data: EvangelismGroup[];
  total: number;
  page: number;
  limit: number;
}> => {
  const response = await ApiCaller.get(QUERY_PATHS.EVANGELISM_GROUP_LIST, { params });
  return response.data?.data || { data: [], total: 0, page: 1, limit: 10 };
};

export const updateEvangelismGroup = async (data: UpdateEvangelismGroupData): Promise<EvangelismGroup> => {
  const response = await ApiCaller.put(`${QUERY_PATHS.EVANGELISM_GROUP_UPDATE}/${data.id}`, data);
  return response.data?.data || response.data;
};

export const deleteEvangelismGroup = async (id: string): Promise<void> => {
  await ApiCaller.delete(`${QUERY_PATHS.EVANGELISM_GROUP_DELETE}/${id}`);
};

// Evangelism Sessions operations
export const createEvangelismSession = async (data: CreateEvangelismSessionData): Promise<CreateEvangelismSessionResponse> => {
  const response = await ApiCaller.post(QUERY_PATHS.EVANGELISM_SESSION_CREATE, data);
  return response.data?.data || response.data;
};

export const getEvangelismSessions = async (params?: EvangelismSessionsListParams) => {
  const response = await ApiCaller.get(QUERY_PATHS.EVANGELISM_SESSION_LIST, { params });
  return response.data?.data || { data: [], total: 0, page: 1, limit: 10 };
};

export const deleteEvangelismSession = async (id: string): Promise<void> => {
  await ApiCaller.delete(`${QUERY_PATHS.EVANGELISM_SESSION_DELETE}/${id}`);
};

// Helper functions for transforming data
export const formatEvangelismSessionForTable = (session: EvangelismSession) => ({
  id: session._id,
  day: session.evangelism_day,
  period: session.period,
  leader: session.evangelism_leader,
  date: new Date(session.date).toLocaleDateString('en-GB'),
  time: `${session.start_time} - ${session.end_time}`,
  church: session.church || 'Unknown',
  participants: session.number_of_attendees,
  status: session.status,
});

export const generateMockEvangelismSessions = async (): Promise<any[]> => {
  try {
    const response = await getEvangelismSessions({ limit: 10 });
    return response.data.map(formatEvangelismSessionForTable);
  } catch (error) {
    console.error('Failed to fetch evangelism sessions:', error);
    return [];
  }
};

// Evangelism Group Attendance operations
export const getEvangelismGroupAttendance = async (params?: EvangelismGroupAttendanceParams): Promise<{
  data: any[];
  total: number;
  page: number;
  limit: number;
  start_time?: string;
  end_time?: string;
  date?: string;
  number_of_attendees?: number;
}> => {
  const response = await ApiCaller.get(QUERY_PATHS.EVANGELISM_GROUP_RECORDS, { params });
  return response.data || { data: [], total: 0, page: 1, limit: 10 };
};

export const formatAttendanceForDisplay = (attendance: EvangelismGroupAttendance) => ({
  id: attendance.id,
  memberName: attendance.member_name,
  email: attendance.member_email || '',
  phone: attendance.member_phone || '',
  status: attendance.attendance_status,
  date: new Date(attendance.date).toLocaleDateString('en-GB'),
  checkedInAt: attendance.checked_in_at ? new Date(attendance.checked_in_at).toLocaleTimeString() : null,
  evangelismGroup: attendance.evangelism_group_name || 'Unknown',
  notes: attendance.notes || ''
});

// Attendance Management operations
export interface MarkAttendanceParams {
  attendee_id: string;
  evangelism_group_id?: string;
  session_id?: string;
}

export interface MarkAllAttendanceParams {
  evangelism_group_id?: string;
  session_id?: string;
}

export const markOnePresent = async (params: MarkAttendanceParams): Promise<void> => {
  await ApiCaller.put(`${QUERY_PATHS.EVANGELISM_GROUP_ATTENDANCE_APPROVE_ONE}?evangelism_group_id=${params.evangelism_group_id}&attendee_id=${params.attendee_id}`);
};

export const markAllPresent = async (params: MarkAllAttendanceParams): Promise<void> => {
  await ApiCaller.put(`${QUERY_PATHS.EVANGELISM_GROUP_ATTENDANCE_APPROVE_ALL}?evangelism_group_id=${params.evangelism_group_id}`, params);
};

export const markOneAbsent = async (params: MarkAttendanceParams): Promise<void> => {
  await ApiCaller.put(`${QUERY_PATHS.EVANGELISM_GROUP_ATTENDANCE_REJECT_ONE}?evangelism_group_id=${params.evangelism_group_id}&attendee_id=${params.attendee_id}`);
};

// Participant Management operations
export interface AddParticipantParams {
  evangelism_group_id: string;
  member_id?: string;
  name?: string;
  fellowship_id?: string;
  member_phone?: string;
}

export interface RemoveParticipantParams {
  evangelism_group_id: string;
  attendee_id: string;
}

export const addParticipant = async (params: AddParticipantParams): Promise<void> => {
  await ApiCaller.post(QUERY_PATHS.EVANGELISM_GROUP_ADD_PARTICIPANT, params);
};

export const removeParticipant = async (params: RemoveParticipantParams): Promise<void> => {
  await ApiCaller.delete(`${QUERY_PATHS.EVANGELISM_GROUP_REMOVE_PARTICIPANT}?evangelism_group_id=${params.evangelism_group_id}&attendee_id=${params.attendee_id}`);
};

// Evangelism Report interfaces and operations
export interface EvangelismReport {
  id: string;
  worker_id: string;
  worker_name?: string;
  fellowship_id?: string;
  fellowship_name?: string;
  church_id?: string;
  church_name?: string;
  date: string;
  location: string;
  souls_saved: number;
  souls_filled: number;
  souls_healed: number;
  testimonies: string[];
  challenges_faced?: string;
  prayer_requests?: string[];
  follow_up_needed: boolean;
  follow_up_notes?: string;
  total_attendees: number;
  workers_involved: string[];
  materials_used?: string[];
  created_at: string;
  updated_at: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  notes?: string;
}

export interface TeamMember {
  id: string;
  type: "worker" | "member";
  name: string;
}

export interface Soul {
  name: string;
  gender: "Male" | "Female" | "Other";
  age: number;
  phone: string;
  address: string;
  status: "saved" | "filled" | "healed";
  impact_types: ("saved" | "filled" | "healed")[];
  note: string;
}

export interface CreateEvangelismReportData {
  date: string;
  session_date: string;
  start_time: string;
  location_area: string;
  team_members: TeamMember[];
  saved_count: number;
  filled_count: number;
  healed_count: number;
  souls: Soul[];
  details: string;
}

export interface UpdateEvangelismReportData extends Partial<CreateEvangelismReportData> {
  id: string;
  status?: 'draft' | 'submitted' | 'approved' | 'rejected';
}

export interface EvangelismReportListParams {
  worker_id?: string;
  fellowship_id?: string;
  church_id?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

export interface EvangelismStats {
  total_reports: number;
  total_souls_saved: number;
  total_souls_filled: number;
  total_souls_healed: number;
  total_workers_involved: number;
  total_attendees: number;
  reports_by_status: {
    draft: number;
    submitted: number;
    approved: number;
    rejected: number;
  };
  monthly_growth: Array<{
    month: string;
    souls_saved: number;
    souls_filled: number;
    souls_healed: number;
  }>;
  top_performing_workers: Array<{
    worker_id: string;
    worker_name: string;
    total_souls_saved: number;
    total_reports: number;
  }>;
  fellowship_stats: Array<{
    fellowship_id: string;
    fellowship_name: string;
    total_reports: number;
    total_souls_saved: number;
  }>;
}

// POST /api/evangelism - Submit a new evangelism report
export const submitEvangelismReport = async (data: CreateEvangelismReportData): Promise<EvangelismReport> => {
  const response = await ApiCaller.post(QUERY_PATHS.EVANGELISM_REPORT_SUBMIT, data);
  return response.data?.data || response.data;
};

// GET /api/evangelism/worker/history - Get history for the logged-in worker
export const getWorkerEvangelismHistory = async (params?: EvangelismReportListParams): Promise<{
  data: EvangelismReport[];
  total: number;
  page: number;
  limit: number;
}> => {
  const response = await ApiCaller.get(QUERY_PATHS.EVANGELISM_WORKER_HISTORY, { params });
  return response.data?.data || { data: [], total: 0, page: 1, limit: 10 };
};

// GET /api/evangelism/admin/all - Get all reports (Admin usage)
export const getAllEvangelismReports = async (params?: EvangelismReportListParams): Promise<{
  data: EvangelismReport[];
  total: number;
  page: number;
  limit: number;
}> => {
  const response = await ApiCaller.get(QUERY_PATHS.EVANGELISM_ADMIN_ALL, { params });
  return response.data?.data || { data: [], total: 0, page: 1, limit: 10 };
};

// GET /api/evangelism/admin/stats - Get aggregate stats (Admin usage)
export const getEvangelismStats = async (): Promise<EvangelismStats> => {
  const response = await ApiCaller.get(QUERY_PATHS.EVANGELISM_ADMIN_STATS);
  return response.data?.data || response.data;
};

// GET /api/evangelism/{id} - Get a specific report by ID
export const getEvangelismReportById = async (id: string): Promise<EvangelismReport> => {
  const response = await ApiCaller.get(`${QUERY_PATHS.EVANGELISM_REPORT_DETAIL}/${id}`);
  return response.data?.data || response.data;
};

// PATCH /api/evangelism/{id} - Update a report
export const updateEvangelismReport = async (data: UpdateEvangelismReportData): Promise<EvangelismReport> => {
  const response = await ApiCaller.patch(`${QUERY_PATHS.EVANGELISM_REPORT_UPDATE}/${data.id}`, data);
  return response.data?.data || response.data;
};

// DELETE /api/evangelism/{id} - Delete a report
export const deleteEvangelismReport = async (id: string): Promise<void> => {
  await ApiCaller.delete(`${QUERY_PATHS.EVANGELISM_REPORT_DELETE}/${id}`);
};