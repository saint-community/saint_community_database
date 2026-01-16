import { QUERY_PATHS } from '@/utils/constants';
import { ApiCaller } from './init';

export interface Worker {
  profile_image?: any;
  church_id: number;
  fellowship_id: number;
  cell_id: string;
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
  prayer_group_id?: string;
  department_id?: number;
  country?: string;
  state?: string;
  date_joined_church?: string
  date_became_worker?: string
}

export interface FormGenerateRequest {
  church_id: number;
  expires_at?: number;
  fellowship_id?: number;
  cell_id?: number;
}

export const getWorkers = async ({
  church_id,
  page = 1,
}: {
  church_id?: string;
  page?: number;
}) => {
  const { data } = await ApiCaller.get(QUERY_PATHS.WORKERS, {
    params: {
      ...(church_id && { church_id }),
      ...(page && { page }),
    },
  });

  return data?.data;
};

export const getWorkerById = async (id: string) => {
  const { data } = await ApiCaller.get(
    QUERY_PATHS.WORKER_DETAIL.replace(':id', id)
  );
  return data?.data;
};

export const createWorker = async (body: Worker | FormData) => {
  const { data } = await ApiCaller.post(QUERY_PATHS.WORKER_CREATE, body, {headers: {
    "Content-Type": "multipart/form-data",
  }});
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

export const rejectWorker = async (id: string) => {
  const { data } = await ApiCaller.get(
    QUERY_PATHS.WORKER_REJECT.replace(':id', id)
  );
  return data?.data;
};