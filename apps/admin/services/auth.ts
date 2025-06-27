import { STORAGE_KEYS, QUERY_PATHS } from '@/utils/constants';
import { ApiCaller } from './init';

export interface LoginResponse {
  error: string;
  message: string;
}

export async function loginUser(body: {
  email: string;
  password: string;
}): Promise<LoginResponse> {
  const { data } = await ApiCaller.post(QUERY_PATHS.LOGIN, body);

  if (!data.error) {
    localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, 'true');
    localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.data));
  }

  return data;
}

export async function registerUser(body: {
  email: string;
  password: string;
  name: string;
  role: string;
  church_id: number;
  fellowship_id?: number;
  cell_id?: number;
}): Promise<{
  error: string;
  message: string;
}> {
  const { data } = await ApiCaller.post(QUERY_PATHS.REGISTER, body);
  return data;
}

export async function resetPassword(body: { email: string }): Promise<{
  error: string;
  message: string;
}> {
  const { data } = await ApiCaller.post(QUERY_PATHS.RESET_PASSWORD, body);
  return data;
}

export async function updatePassword(body: {
  email: string;
  password: string;
  token: string;
}): Promise<{
  error: string;
  message: string;
}> {
  const { data } = await ApiCaller.post(QUERY_PATHS.UPDATE_PASSWORD, body);
  return data;
}

export const logoutUser = async () => {
  await ApiCaller.get(QUERY_PATHS.LOGOUT);
  localStorage.removeItem(STORAGE_KEYS.IS_AUTHENTICATED);
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
};

export const getAccounts = async (page: number) => {
  const { data } = await ApiCaller.get(QUERY_PATHS.ACCOUNTS, {
    params: {
      page,
    },
  });
  return data?.data;
};

export const getAccountById = async (id: string) => {
  const { data } = await ApiCaller.get(
    QUERY_PATHS.ACCOUNT_DETAIL.replace(':id', id)
  );
  return data || {};
};
