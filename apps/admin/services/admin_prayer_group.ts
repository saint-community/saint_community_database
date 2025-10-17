'use client';

import { MemberApiCaller } from './init';
import { QUERY_PATHS } from '@/utils/constants';

export interface AdminPrayerGroupMeetingPayload {
  start_time: string;
  end_time: string;
  prayergroup_leader: string;
  prayergroup_day: string;
  period: string;
}

export const getAdminPrayerGroupMeetings = async () => {
  const { data } = await MemberApiCaller.get(
    QUERY_PATHS.ADMIN_PRAYER_GROUP_ALL
  );
  return data?.data || [];
};

export const createAdminPrayerGroupMeeting = async (
  body: AdminPrayerGroupMeetingPayload
) => {
  const { data } = await MemberApiCaller.post(
    QUERY_PATHS.ADMIN_PRAYER_GROUP_CREATE,
    body
  );
  return data || {};
};

export const updateAdminPrayerGroupMeeting = async (
  meetingId: string,
  body: AdminPrayerGroupMeetingPayload
) => {
  const { data } = await MemberApiCaller.patch(
    QUERY_PATHS.ADMIN_PRAYER_GROUP_UPDATE.replace(':id', meetingId),
    body
  );
  return data || {};
};

export const deleteAdminPrayerGroupMeeting = async (meetingId: string) => {
  const { data } = await MemberApiCaller.delete(
    QUERY_PATHS.ADMIN_PRAYER_GROUP_DELETE.replace(':id', meetingId)
  );
  return data || {};
};
