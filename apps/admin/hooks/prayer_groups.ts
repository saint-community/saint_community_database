import { getPrayerGroupById, getPrayerGroups } from '@/services/prayer_groups';
import { QUERY_PATHS } from '@/utils/constants';
import { useQuery } from '@tanstack/react-query';

export const usePrayerGroups = (churchId?: number | string) => {
  return useQuery({
    queryKey: [QUERY_PATHS.PRAYER_GROUPS, churchId],
    queryFn: () => getPrayerGroups(churchId),
  });
};

export const usePrayerGroupById = (id: string) => {
  return useQuery({
    queryKey: [QUERY_PATHS.PRAYER_GROUP_DETAIL.replace(':id', id)],
    queryFn: () => getPrayerGroupById(id),
    enabled: !!id,
  });
};

export const usePrayerGroupOption = (churchId?: number | string) => {
  return useQuery({
    queryKey: [QUERY_PATHS.PRAYER_GROUPS, 'option', churchId],
    queryFn: () => getPrayerGroups(churchId),
    enabled: churchId === undefined || churchId !== '',
    select: (data) => {
      return data.map(
        (prayerGroup: { id: string; day: string; schedule: string }) => ({
          label: `${prayerGroup.day} - ${prayerGroup.schedule}`,
          value: prayerGroup.id,
        })
      );
    },
  });
};
