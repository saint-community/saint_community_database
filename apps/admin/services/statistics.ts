import { QUERY_PATHS } from '@/utils/constants';
import { ApiCaller } from './init';

export const getStatistics = async () => {
  const { data } = await ApiCaller.get(QUERY_PATHS.STATISTICS);
  return data?.data;
};
