import { getChurchById, getChurches } from '@/services/churches';
import { QUERY_PATHS } from '@/utils/constants';
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
    queryFn: () => getChurches(),
    enabled,
    select: (data) => {
      return data?.data?.map((church: { id: string; name: string }) => ({
        label: church.name,
        value: church.id,
      }));
    },
  });
};
