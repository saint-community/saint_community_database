import { QUERY_PATHS } from '@/utils/constants';
import { ApiCaller } from './init';

export interface DepartmentPayload {
  church_id: number;
  leader_id: number | null;
  name: string;
}

export interface Department extends DepartmentPayload {
  id: number;
  leader?: {
    id: number;
    name?: string;
    email?: string;
    role?: string;
  } | null;
}

export const getDepartments = async (churchId?: number | string) => {
  const path = churchId
    ? `${QUERY_PATHS.DEPARTMENTS}/${churchId}`
    : QUERY_PATHS.DEPARTMENTS;
  const { data } = await ApiCaller.get(path);
  return data || [];
};

export const createDepartment = async (body: DepartmentPayload) => {
  const { data } = await ApiCaller.post(QUERY_PATHS.DEPARTMENT_CREATE, {
    ...body,
  });
  return data || {};
};

export const updateDepartment = async (
  id: string,
  body: DepartmentPayload
) => {
  const { data } = await ApiCaller.put(
    QUERY_PATHS.DEPARTMENT_UPDATE.replace(':id', id),
    {
      ...body,
    }
  );
  return data || {};
};

export const deleteDepartment = async (id: string) => {
  const { data } = await ApiCaller.delete(
    QUERY_PATHS.DEPARTMENT_DELETE.replace(':id', id)
  );
  return data || {};
};

export const getChurchById = async (id: string) => {
  const { data } = await ApiCaller.get(
    QUERY_PATHS.CHURCH_DETAIL.replace(':id', id)
  );
  return data?.data || {};
};

export const updateChurch = async (
  id: string,
  body: {
    name: string;
    country: string;
    state: string;
    address: string;
    active: boolean;
  }
) => {
  const { data } = await ApiCaller.put(
    QUERY_PATHS.CHURCH_UPDATE.replace(':id', id),
    {
      ...body,
    }
  );
  return data || {};
};
