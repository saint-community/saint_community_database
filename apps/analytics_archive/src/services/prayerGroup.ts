import { QUERY_PATHS } from '@/utils/constants';
import { ApiCaller } from './init';

export interface PrayerGroup {
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

export interface CreatePrayerGroupData {
  name: string;
  description?: string;
  church_id: string;
  leader_id?: string;
  meeting_day?: string;
  meeting_time?: string;
  location?: string;
  max_participants?: number;
}

export interface UpdatePrayerGroupData extends Partial<CreatePrayerGroupData> {
  id: string;
  is_active?: boolean;
}

export interface PrayerMeeting {
  id: string;
  prayer_group_id: string;
  prayer_group_name?: string;
  date: string;
  time: string;
  location?: string;
  participants: number;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
  prayergroup_day: string
  period: string
  church: string
  prayergroup_leader: string
  start_time: string
  end_time: string
  number_of_attendees: string
  _id: string
}

export interface CreatePrayerMeetingData {
  prayer_group_id: string;
  date: string;
  start_time: string;
  end_time: string;
  location?: string;
  notes?: string;
}

export interface CreatePrayerMeetingResponse {
  id: string;
  prayer_group_id: string;
  date: string;
  time: string;
  status: 'scheduled';
  created_at: string;
  access_code?: string;
  prayer_code?: string
}

export interface PrayerGroupListParams {
  church_id?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
}

export interface PrayerMeetingsListParams {
  prayer_group_id?: string;
  church_id?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

export interface PrayerGroupAttendance {
  id: string;
  prayer_group_id: string;
  prayer_group_name?: string;
  meeting_id: string;
  member_id: string;
  member_name: string;
  member_email?: string;
  member_phone?: string;
  attendance_status: 'present' | 'absent' | 'pending';
  date: string;
  checked_in_at?: string;
  notes?: string;
}

export interface PrayerGroupAttendanceParams {
  prayergroup_id?: string;
  meeting_id?: string;
  member_id?: string;
  date_from?: string;
  date_to?: string;
  attendance_status?: 'present' | 'absent' | 'pending';
  page?: number;
  limit?: number;
}

// Prayer Group CRUD operations
export const createPrayerGroup = async (data: CreatePrayerGroupData): Promise<PrayerGroup> => {
  const response = await ApiCaller.post(QUERY_PATHS.PRAYER_GROUP_CREATE, data);
  return response.data?.data || response.data;
};

export const getPrayerGroups = async (params?: PrayerGroupListParams): Promise<{
  data: PrayerGroup[];
  total: number;
  page: number;
  limit: number;
}> => {
  const response = await ApiCaller.get(QUERY_PATHS.PRAYER_GROUP_LIST, { params });
  return response.data?.data || { data: [], total: 0, page: 1, limit: 10 };
};

export const updatePrayerGroup = async (data: UpdatePrayerGroupData): Promise<PrayerGroup> => {
  const response = await ApiCaller.put(`${QUERY_PATHS.PRAYER_GROUP_UPDATE}/${data.id}`, data);
  return response.data?.data || response.data;
};

export const deletePrayerGroup = async (id: string): Promise<void> => {
  await ApiCaller.delete(`${QUERY_PATHS.PRAYER_GROUP_DELETE}/${id}`);
};

// Prayer Meetings operations
export const createPrayerMeeting = async (data: CreatePrayerMeetingData): Promise<CreatePrayerMeetingResponse> => {
  const response = await ApiCaller.post(QUERY_PATHS. PRAYER_GROUP_CREATE, data);
  return response.data?.data || response.data;
};

export const getPrayerMeetings = async (params?: PrayerMeetingsListParams) => {
  const response = await ApiCaller.get(QUERY_PATHS.PRAYER_GROUP_LIST, { params });
  return response.data?.data || { data: [], total: 0, page: 1, limit: 10 };
};

export const deletePrayerMeeting = async (id: string): Promise<void> => {
  await ApiCaller.delete(`${QUERY_PATHS.PRAYER_MEETINGS_DELETE}/${id}`);
};

// Helper functions for transforming data
export const formatPrayerMeetingForTable = (meeting: PrayerMeeting) => ({
  id: meeting._id,
  day: meeting.prayergroup_day,
  period: meeting.period,
  leader: meeting.prayergroup_leader,
  date: new Date(meeting.date).toLocaleDateString('en-GB'),
  time: `${meeting.start_time}  - ${meeting.end_time} `,
  church: meeting.church|| 'Unknown',
  participants: meeting.number_of_attendees,
  status: meeting.status,
});

export const generateMockPrayerMeetings = async (): Promise<any[]> => {
  try {
    const response = await getPrayerMeetings({ limit: 10 });
    return response.data.map(formatPrayerMeetingForTable);
  } catch (error) {
    console.error('Failed to fetch prayer meetings:', error);
    return [];
  }
};

// Prayer Group Attendance operations
export const getPrayerGroupAttendance = async (params?: PrayerGroupAttendanceParams): Promise<{
  data: any[];
  total: number;
  page: number;
  limit: number;
  start_time?: string;
  end_time?: string;
  date?: string;
  number_of_attendees?: number;
}> => {  
  const response = await ApiCaller.get(QUERY_PATHS.PRAYER_GROUP_RECORDS, { params });
  // The API returns data directly in the response, not nested under data.data
  return response.data || { data: [], total: 0, page: 1, limit: 10 };
};

export const formatAttendanceForDisplay = (attendance: PrayerGroupAttendance) => ({
  id: attendance.id,
  memberName: attendance.member_name,
  email: attendance.member_email || '',
  phone: attendance.member_phone || '',
  status: attendance.attendance_status,
  date: new Date(attendance.date).toLocaleDateString('en-GB'),
  checkedInAt: attendance.checked_in_at ? new Date(attendance.checked_in_at).toLocaleTimeString() : null,
  prayerGroup: attendance.prayer_group_name || 'Unknown',
  notes: attendance.notes || ''
});

// Attendance Management operations
export interface MarkAttendanceParams {
  attendee_id: string;
  prayergroup_id?: string;
  meeting_id?: string;
}

export interface MarkAllAttendanceParams {
  prayergroup_id?: string;
  meeting_id?: string;
}

export const markOnePresent = async (params: MarkAttendanceParams): Promise<void> => {
  await ApiCaller.put(`${QUERY_PATHS.PRAYER_GROUP_ATTENDANCE_APPROVE_ONE}?prayergroup_id=${params.prayergroup_id}&attendee_id=${params.attendee_id}`);
};

export const markAllPresent = async (params: MarkAllAttendanceParams): Promise<void> => {
  await ApiCaller.put(`${QUERY_PATHS.PRAYER_GROUP_ATTENDANCE_APPROVE_ALL}?prayergroup_id=${params.prayergroup_id}`, params);
};

export const markOneAbsent = async (params: MarkAttendanceParams): Promise<void> => {
  await ApiCaller.put(`${QUERY_PATHS.PRAYER_GROUP_ATTENDANCE_REJECT_ONE}?prayergroup_id=${params.prayergroup_id}&attendee_id=${params.attendee_id}`);
};

// Participant Management operations
export interface AddParticipantParams {
  prayergroup_id: string;
  member_id?: string;
  name?: string;
  fellowship_id?: string;
  member_phone?: string;
}

export interface RemoveParticipantParams {
  prayergroup_id: string;
  attendee_id: string;
}

export const addParticipant = async (params: AddParticipantParams): Promise<void> => {
  await ApiCaller.post(QUERY_PATHS.PRAYER_GROUP_ADD_PARTICIPANT, params);
};

export const removeParticipant = async (params: RemoveParticipantParams): Promise<void> => {
  await ApiCaller.delete(`${QUERY_PATHS.PRAYER_GROUP_REMOVE_PARTICIPANT}?prayergroup_id=${params.prayergroup_id}&attendee_id=${params.attendee_id}`);
};