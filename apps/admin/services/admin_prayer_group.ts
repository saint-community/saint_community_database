'use client';

import { ApiCaller, MemberApiCaller } from './init';
import { QUERY_PATHS } from '@/utils/constants';

export interface AdminPrayerGroupMeetingPayload {
  church_id: number;
  leader_id: number;
  start_time: string;
  end_time: string;
  period: string;
  day: string;
  schedule: string;
}

export const getAdminPrayerGroupMeetings = async (church_id: number) => {
  const { data } = await ApiCaller.get(
    QUERY_PATHS.ADMIN_PRAYER_GROUP_ALL.replace(':church_id', String(church_id))
  );
  return data || [];
};

export const createAdminPrayerGroupMeeting = async (
  body: AdminPrayerGroupMeetingPayload
) => {
  const { data } = await ApiCaller.post(
    QUERY_PATHS.ADMIN_PRAYER_GROUP_CREATE,
    body
  );
  return data || {};
};

export const updateAdminPrayerGroupMeeting = async (
  meetingId: string,
  body: AdminPrayerGroupMeetingPayload
) => {
  const { data } = await ApiCaller.patch(
    QUERY_PATHS.ADMIN_PRAYER_GROUP_UPDATE.replace(':id', meetingId),
    body
  );
  return data || {};
};

export const deleteAdminPrayerGroupMeeting = async (meetingId: string) => {
  const { data } = await ApiCaller.delete(
    QUERY_PATHS.ADMIN_PRAYER_GROUP_DELETE.replace(':id', meetingId)
  );
  return data || {};
};

export interface CreatePrayerGroupPayload {
  start_time: string;
  end_time: string;
}

export interface PrayerGroupAttendanceQuery {
  prayergroup_id: string;
  status?: string;
  attendee_id?: string;
}

export interface AddAttendeePayload {
  prayergroup_id: string;
  name: string;
  fellowship: string;
  fellowship_id: number;
}

export const createAdminPrayerGroup = async (
  body: CreatePrayerGroupPayload
) => {
  const { data } = await MemberApiCaller.post(
    QUERY_PATHS.ADMIN_PRAYER_GROUP_CREATE_GROUP,
    body
  );
  return data || {};
};

export const getAdminPrayerGroups = async () => {
  const { data } = await MemberApiCaller.get(
    QUERY_PATHS.ADMIN_PRAYER_GROUP_GET_ALL_GROUPS
  );
  return data?.data || [];
};

export const getReportedAttendance = async (params: { prayergroup_id: string }) => {
  const { data } = await MemberApiCaller.get(
    QUERY_PATHS.ADMIN_PRAYER_GROUP_ATTENDANCE_SUBMITTED,
    { params }
  );
  return data?.data || [];
};

export const getPrayerGroupRecord = async (params: { prayergroup_id: string }) => {
  const { data } = await MemberApiCaller.get(
    QUERY_PATHS.ADMIN_PRAYER_GROUP_RECORD,
    { params }
  );
  return data?.data || [];
};

export const markAllPresent = async (params: { prayergroup_id: string }) => {
  const { data } = await MemberApiCaller.put(
    QUERY_PATHS.ADMIN_PRAYER_GROUP_MARK_ALL_PRESENT,
    null,
    { params }
  );
  return data || {};
};

export const markOnePresent = async (params: { prayergroup_id: string, attendee_id: string }) => {
  const { data } = await MemberApiCaller.put(
    QUERY_PATHS.ADMIN_PRAYER_GROUP_MARK_ONE_PRESENT,
    null,
    { params }
  );
  return data || {};
};

export const markOneAbsent = async (params: { prayergroup_id: string, attendee_id: string }) => {
  const { data } = await MemberApiCaller.put(
    QUERY_PATHS.ADMIN_PRAYER_GROUP_MARK_ONE_ABSENT,
    null,
    { params }
  );
  return data || {};
};

export const addMemberToPrayerGroup = async (body: AddAttendeePayload) => {
  const { data } = await MemberApiCaller.post(
    QUERY_PATHS.ADMIN_PRAYER_GROUP_ADD_MEMBER,
    body
  );
  return data || {};
};

export const removeMemberFromPrayerGroup = async (params: { prayergroup_id: string, attendee_id: string }) => {
  const { data } = await MemberApiCaller.delete(
    QUERY_PATHS.ADMIN_PRAYER_GROUP_REMOVE_ATTENDEE,
    { params }
  );
  return data || {};
};
