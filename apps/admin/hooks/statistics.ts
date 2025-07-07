import { getStatistics } from '@/services/statistics';
import { QUERY_PATHS } from '@/utils/constants';
import { useQuery } from '@tanstack/react-query';

export const useStatistics = () => {
  return useQuery({
    queryKey: [QUERY_PATHS.STATISTICS],
    queryFn: () => getStatistics(),
    retry: false,
  });
};
