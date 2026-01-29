import { getChurchById, getChurches } from '@/services/churches';
import { QUERY_PATHS, STORAGE_KEYS } from '@/utils/constants';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

export const useChurches = (page: number = 1) => {
  return useQuery({
    queryKey: [QUERY_PATHS.CHURCHES, page],
    queryFn: () => getChurches(page),
    // select: (data) => data.data,
    placeholderData: keepPreviousData,
  });
};

export const useChurchById = (id: string) => {
  return useQuery({
    queryKey: [QUERY_PATHS.CHURCH_DETAIL.replace(':id', id)],
    queryFn: () => getChurchById(id),
    enabled: !!id,
  });
};

export const useChurchesOption = (enabled: boolean = true) => {
  return useQuery({
    queryKey: [QUERY_PATHS.CHURCHES],
    queryFn: () => {
      // Try getting from local storage first as per user request
      if (typeof window !== 'undefined') {
        const userStr = localStorage.getItem(STORAGE_KEYS.USER);
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            // Check for various potential locations of the church list
            const churches = user.churches || user.admin_meta?.churches || [];
            if (Array.isArray(churches) && churches.length > 0) {
              return { data: churches };
            }
          } catch (e) {
            console.error("Error parsing user for churches", e);
          }
        }
      }
      return getChurches();
    },
    enabled,
    select: (data) => {
      // Handle both API response structure and direct array
      const list = Array.isArray(data) ? data : (data?.data || []);

      return list.map((church: { id: string; name: string }) => ({
        label: church.name,
        value: church.id,
      }));
    },
  });
};
