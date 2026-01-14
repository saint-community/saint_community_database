import { QUERY_PATHS } from '@/utils/constants';
import { AdminApiCaller } from './init';

export interface Member {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone_number?: string;
  church_id: number;
  fellowship_id: number;
  cell_id: number;
  status: string;
  active: boolean;
}

export const getMembers = async ({
  church_id,
  page = 1,
}: {
  church_id?: string | number;
  page?: number;
} = {}) => {
  try {
    const { data } = await AdminApiCaller.get(QUERY_PATHS.WORKERS, {
      params: {
        ...(church_id && { church_id }),
        ...(page && { page }),
      },
    });

    return data?.data || [];
  } catch (error) {
    console.error('Failed to fetch members:', error);
    throw new Error('Failed to fetch members');
  }
};

export const getMemberById = async (id: string) => {
  try {
    const { data } = await AdminApiCaller.get(
      QUERY_PATHS.WORKER_DETAIL.replace(':id', id)
    );
    return data?.data || {};
  } catch (error) {
    console.error('Failed to fetch member:', error);
    throw new Error('Failed to fetch member');
  }
};