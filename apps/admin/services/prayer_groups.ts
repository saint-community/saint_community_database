import { QUERY_PATHS } from '@/utils/constants';
import { ApiCaller } from './init';

export interface PrayerGroup {
  church_id: number;
  leader_id: number;
  day: string;
  schedule: string;
}

export const getPrayerGroups = async () => {
  const { data } = await ApiCaller.get(QUERY_PATHS.PRAYER_GROUPS);
  return data || [];
};

export const getPrayerGroupsByChurchId = async (church_id: number) => {
  const { data } = await ApiCaller.get(`${QUERY_PATHS.PRAYER_GROUPS}/${church_id}`);
  return data || [];
};

export const getPrayerGroupById = async (id: string) => {
  const { data } = await ApiCaller.get(
    QUERY_PATHS.PRAYER_GROUP_DETAIL.replace(':id', id)
  );
  return data || {};
};

export const createPrayerGroup = async (body: PrayerGroup) => {
  const { data } = await ApiCaller.post(QUERY_PATHS.PRAYER_GROUP_CREATE, body);
  return data || {};
};

export const updatePrayerGroup = async (id: string, body: PrayerGroup) => {
  const { data } = await ApiCaller.put(
    QUERY_PATHS.PRAYER_GROUP_UPDATE.replace(':id', id),
    body
  );
  return data || {};
};

export const deletePrayerGroup = async (id: string) => {
  const { data } = await ApiCaller.delete(
    QUERY_PATHS.PRAYER_GROUP_DELETE.replace(':id', id)
  );
  return data || {};
};
