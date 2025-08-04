import axios from 'axios';
import { STORAGE_KEYS } from '@/utils/constants';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://staging.lwmportal.com';

export const ApiCaller = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    // Authorization: `Bearer ${storage.getString(StorageKeys.TOKEN)}`,
  },
});

ApiCaller.interceptors.request.use(async (config) => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

  if (token) {
    config.headers.Authorization = `Bearer ${token.trim()}`;
  }

  return config;
});
