import { QUERY_PATHS } from '@/utils/constants';
import { ApiCaller } from './init';

export const getStatistics = async () => {
  const { data } = await ApiCaller.get(QUERY_PATHS.STATISTICS);
  return data?.data;
};

export const getWorkerStatistics = async (year: number) => {
  const { data } = await ApiCaller.get(QUERY_PATHS.WORKER_STATISTICS, {
    params: { year },
  });
  return data?.data;
};
