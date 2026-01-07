'use client';

import { ApiCaller } from './init';
import { QUERY_PATHS } from '@/utils/constants';

export interface AdminPrayerGroupMeetingPayload {
  start_time: string;
  end_time: string;
  prayergroup_leader: string;
  prayergroup_day: string;
  period: string;
}

export const getAdminPrayerGroupMeetings = async () => {
  const { data } = await ApiCaller.get(QUERY_PATHS.ADMIN_PRAYER_GROUP_ALL);
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
