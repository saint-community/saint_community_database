import { QUERY_PATHS } from '@/utils/constants';
import { ApiCaller } from './init';

export interface Worker {
  profile_image?: any;
  church_id: number;
  fellowship_id: number;
  cell_id: string | number | null;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  dob?: string;
  gender: string;
  status: string;
  phone_number?: string;
  email?: string;
  facebook_username?: string;
  twitter_username?: string;
  instagram_username?: string;
  house_address?: string;
  work_address?: string;
  school_address?: string;
  member_since?: string;
  worker_since?: string;
  active: boolean;
  prayer_group_id?: string;
  department_id?: number | null;
  country?: string;
  state?: string;
  area?: string;
  date_joined_church?: string
  date_became_worker?: string
}

export interface FormGenerateRequest {
  church_id: number;
  expires_at?: number;
  expires_in_hours?: number;
  fellowship_id?: number;
  cell_id?: number;
}

interface WorkerFilters {
  church_id?: string;
  fellowship_id?: string;
  cell_id?: string;
  department_id?: string;
  name?: string;
  phone?: string;
  gender?: string;
  status?: string;
  page?: number;
}

export const getWorkers = async (filters: WorkerFilters = {}) => {
  const { data } = await ApiCaller.get(QUERY_PATHS.WORKERS, {params: filters});

  const result = data?.data || [];

  
  return result;
};

export const getWorkerById = async (id: string) => {
  const { data } = await ApiCaller.get(
    QUERY_PATHS.WORKER_DETAIL.replace(':id', id)
  );
  return data?.data;
};

export const createWorker = async (body: Worker | FormData) => {
  const isFormData = body instanceof FormData;
  const { data } = await ApiCaller.post(
    QUERY_PATHS.WORKER_CREATE,
    body,
    isFormData
      ? {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      : undefined
  );
  return data || {};
};

export const updateWorker = async (id: string, body: Worker) => {
  const { data } = await ApiCaller.put(
    QUERY_PATHS.WORKER_UPDATE.replace(':id', id),
    body
  );
  return data || {};
};

export const generateWorkerForm = async (body: FormGenerateRequest) => {
  const { data } = await ApiCaller.get(QUERY_PATHS.WORKER_FORM_GENERATE, {
    params: body,
  });
  return data || {};
};

export const getWorkerForm = async (token: string) => {
  const { data } = await ApiCaller.get(
    QUERY_PATHS.WORKER_FORM_DETAIL.replace(':token', token)
  );
  return data || {};
};

export const invalidateWorkerForm = async (token: string) => {
  const { data } = await ApiCaller.post(
    QUERY_PATHS.WORKER_FORM_INVALIDATE.replace(':token', token)
  );
  return data || {};
};


export const getWorkersRegistration = async ({action, page = 1}: {action: string, page?: number}) => {
  const { data } = await ApiCaller.get(
    `${QUERY_PATHS.WORKERS}/${action}`, {
      params: {
        ...(page && { page }),
      }
    }
  );
  return data || {};
};

export const approveWorker = async (id: string) => {
  const { data } = await ApiCaller.get(
    QUERY_PATHS.WORKER_APPROVE.replace(':id', id)
  );
  return data?.data;
};

export const rejectWorker = async ({
  id,
  reason,
}: {
  id: string;
  reason?: string;
}) => {
  const { data } = await ApiCaller.post(
    QUERY_PATHS.WORKER_REJECT.replace(':id', id),
    { reason }
  );
  return data?.data;
};
