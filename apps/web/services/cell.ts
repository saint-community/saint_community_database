import { QUERY_PATHS } from '@/utils/constants';
import { ApiCaller } from './init';

export const getCells = async () => {
  const { data } = await ApiCaller.get(QUERY_PATHS.CELLS);
  return data?.data || [];
};

export const createCell = async (body: {
  name: string;
  church_id: number;
  fellowship_id: number;
  leader_id: number;
  address: string;
  active: boolean;
  meeting_days: number;
}) => {
  const { data } = await ApiCaller.post(QUERY_PATHS.CELL_CREATE, {
    ...body,
  });
  return data || {};
};

export const getCellById = async (id: string) => {
  const { data } = await ApiCaller.get(
    QUERY_PATHS.CELL_DETAIL.replace(':id', id)
  );
  return data?.data || {};
};

export const updateCell = async (
  id: string,
  body: {
    name: string;
    church_id: number;
    fellowship_id: number;
    leader_id: number;
    address: string;
    active: boolean;
    meeting_days: number;
  }
) => {
  const { data } = await ApiCaller.put(
    QUERY_PATHS.CELL_UPDATE.replace(':id', id),
    {
      ...body,
    }
  );
  return data || {};
};
