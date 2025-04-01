import { getPrayerGroupById, getPrayerGroups } from '@/services/prayer_groups';
import { QUERY_PATHS } from '@/utils/constants';
import { useQuery } from '@tanstack/react-query';

export const usePrayerGroups = () => {
  return useQuery({
    queryKey: [QUERY_PATHS.PRAYER_GROUPS],
    queryFn: () => getPrayerGroups(),
  });
};

export const usePrayerGroupById = (id: string) => {
  return useQuery({
    queryKey: [QUERY_PATHS.PRAYER_GROUP_DETAIL.replace(':id', id)],
    queryFn: () => getPrayerGroupById(id),
    enabled: !!id,
  });
};
