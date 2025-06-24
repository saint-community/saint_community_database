import { getChurchById, getChurches } from '@/services/churches';
import { QUERY_PATHS } from '@/utils/constants';
import { useQuery } from '@tanstack/react-query';

export const useChurches = () => {
  return useQuery({
    queryKey: [QUERY_PATHS.CHURCHES],
    queryFn: () => getChurches(),
  });
};

export const useChurchById = (id: string) => {
  return useQuery({
    queryKey: [QUERY_PATHS.CHURCH_DETAIL.replace(':id', id)],
    queryFn: () => getChurchById(id),
    enabled: !!id,
  });
};

export const useChurchesOption = () => {
  return useQuery({
    queryKey: [QUERY_PATHS.CHURCHES],
    queryFn: () => getChurches(),
    select: (data) => {
      return data.map((church: { id: string; name: string }) => ({
        label: church.name,
        value: church.id,
      }));
    },
  });
};
