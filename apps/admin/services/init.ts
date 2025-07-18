import axios from 'axios';
import { STORAGE_KEYS } from '@/utils/constants';

// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://209.97.189.88';

export const ApiCaller = axios.create({
  baseURL: 'https://staging.lwmportal.com',
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
