import { getStatistics, getWorkerStatistics } from '@/services/statistics';
import { QUERY_PATHS } from '@/utils/constants';
import { useQuery } from '@tanstack/react-query';

export const useStatistics = () => {
  return useQuery({
    queryKey: [QUERY_PATHS.STATISTICS],
    queryFn: () => getStatistics(),
    retry: false,
  });
};

export const useWorkerStatistics = (year: number) => {
  return useQuery({
    queryKey: [QUERY_PATHS.WORKER_STATISTICS, year],
    queryFn: () => getWorkerStatistics(year),
    retry: false,
  });
};
