import { STORAGE_KEYS, QUERY_PATHS } from '@/src/utils/constants';
import { AdminApiCaller, ApiCaller } from './init';

export interface LoginResponse {
  error: string;
  message: string;
}

export async function loginUser(body: {
  email: string;
  password: string;
}): Promise<LoginResponse> {
  const { data: adminData } = await AdminApiCaller.post(
    QUERY_PATHS.ADMIN_LOGIN,
    body
  );
  const { data } = await AdminApiCaller.post(QUERY_PATHS.LOGIN, body);

  if (!data.error && data.token && typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, data.token);
    localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, 'true');
    localStorage.setItem(STORAGE_KEYS.TOKEN, adminData.access_token);
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
  const { data } = await AdminApiCaller.post(QUERY_PATHS.REGISTER, body);
  return data;
}

export async function resetPassword(body: { email: string }): Promise<{
  error: string;
  message: string;
}> {
  const { data } = await AdminApiCaller.post(QUERY_PATHS.RESET_PASSWORD, body);
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
  const { data } = await AdminApiCaller.post(QUERY_PATHS.UPDATE_PASSWORD, body);
  return data;
}

export async function updateAccount(body: {
  current_password: string;
  new_password: string;
}): Promise<{
  error?: string;
  message?: string;
}> {
  const { data } = await AdminApiCaller.put(QUERY_PATHS.UPDATE_ACCOUNT, body);
  return data;
}

export const logoutUser = async () => {
  await AdminApiCaller.get(QUERY_PATHS.LOGOUT);
  localStorage.removeItem(STORAGE_KEYS.IS_AUTHENTICATED);
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
};

export const getAccounts = async (page: number) => {
  const { data } = await AdminApiCaller.get(QUERY_PATHS.ACCOUNTS, {
    params: {
      page,
    },
  });
  return data?.data;
};

export const getAccountById = async (id: string) => {
  const { data } = await AdminApiCaller.get(
    QUERY_PATHS.ACCOUNT_DETAIL.replace(':id', id)
  );
  return data || {};
};

export const removeAccount = async (id: number) => {
  const { data } = await AdminApiCaller.delete(
    QUERY_PATHS.DELETE_ACCOUNT.replace(':id', id.toString())
  );
  return data;
};
