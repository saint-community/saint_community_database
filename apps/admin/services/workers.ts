import { QUERY_PATHS } from '@/utils/constants';
import { ApiCaller } from './init';

export interface Worker {
  church_id: number;
  fellowship_id: number;
  cell_id: number;
  first_name: string;
  last_name: string;
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
  member_since?: string;
  worker_since?: string;
  active: boolean;
  prayer_group_id?: number;
  // department_id?: number;
}

export interface FormGenerateRequest {
  church_id: number;
  expires_at?: number;
  fellowship_id?: number;
  cell_id?: number;
}

export const getWorkers = async () => {
  const { data } = await ApiCaller.get(QUERY_PATHS.WORKERS);

  return data?.data || [];
};

export const getWorkerById = async (id: string) => {
  const { data } = await ApiCaller.get(
    QUERY_PATHS.WORKER_DETAIL.replace(':worker_id', id)
  );
  return data || {};
};

export const createWorker = async (body: Worker) => {
  const { data } = await ApiCaller.post(QUERY_PATHS.WORKER_CREATE, body);
  return data || {};
};

export const updateWorker = async (id: string, body: Worker) => {
  const { data } = await ApiCaller.put(
    QUERY_PATHS.WORKER_UPDATE.replace(':worker_id', id),
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
