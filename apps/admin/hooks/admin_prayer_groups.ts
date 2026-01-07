'use client';

import { getAdminPrayerGroupMeetings } from '@/services/admin_prayer_group';
import { QUERY_PATHS } from '@/utils/constants';
import { useQuery } from '@tanstack/react-query';

export const useAdminPrayerGroupMeetings = () => {
  return useQuery({
    queryKey: [QUERY_PATHS.ADMIN_PRAYER_GROUP_ALL],
    queryFn: () => getAdminPrayerGroupMeetings(),
  });
};
