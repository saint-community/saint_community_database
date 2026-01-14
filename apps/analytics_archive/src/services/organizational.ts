import { QUERY_PATHS } from '@/utils/constants';
import { AdminApiCaller } from './init';

export interface Church {
  id: number;
  name: string;
  address?: string;
  state?: string;
  country?: string;
}

export interface Fellowship {
  id: number;
  name: string;
  church_id: number;
}

export interface Cell {
  id: number;
  name: string;
  fellowship_id: number;
  church_id: number;
}

export const getChurches = async () => {
  const { data } = await AdminApiCaller.get(QUERY_PATHS.CHURCHES);
  return data?.data || [];
};

export const getFellowships = async (church_id?: string | number) => {
  const { data } = await AdminApiCaller.get(QUERY_PATHS.FELLOWSHIPS, {
    params: {
      ...(church_id && { church_id }),
    },
  });
  return data?.data || [];
};

export const getCells = async (fellowship_id?: string | number, church_id?: string | number) => {
  const { data } = await AdminApiCaller.get(QUERY_PATHS.CELLS, {
    params: {
      ...(fellowship_id && { fellowship_id }),
      ...(church_id && { church_id }),
    },
  });
  return data?.data || [];
};