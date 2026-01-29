import { QUERY_PATHS } from '@/utils/constants';
import { ApiCaller } from './init';

interface CellFilters {
  page?: number;
  name?: string;
  church?: string;
  fellowship?: string;
}

export const getCells = async (filters: CellFilters = {}) => {
  // console.log('getCells called with filters:', filters);
  const { page = 1, church, fellowship, ...searchFilters } = filters;
  
  // Build params object with only non-empty values
  const params: Record<string, any> = { page };
  
  if (church && church.trim() !== '') {
    params.church_id = church;
    // console.log('Added church_id to params:', church);
  }
  
  if (fellowship && fellowship.trim() !== '') {
    params.fellowship_id = fellowship;
    // console.log('Added fellowship_id to params:', fellowship);
  }
  
  Object.entries(searchFilters).forEach(([key, value]) => {
    if (value && value.trim() !== '') {
      params[key] = value;
    }
  });

  // console.log('Final API params for cells:', params);

  const { data } = await ApiCaller.get(QUERY_PATHS.CELLS, {
    params,
  });
  // console.log('getCells API response:', data);
  const result = data?.data || [];
  // console.log('getCells final return:', result);
  return result;
};

export const createCell = async (body: {
  name: string;
  church_id: number;
  fellowship_id: number;
  leader_id: number;
  address: string;
  active: boolean;
  meeting_days: number;
  start_date?: string;
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
