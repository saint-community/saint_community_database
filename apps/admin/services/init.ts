import axios from 'axios';
import { STORAGE_KEYS } from '@/utils/constants';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://admin-service.saintscommunityportal.com';
  const X_API_KEY = process.env.NEXT_PUBLIC_X_API_KEY || '113c53c9e26574039e24ce0cc63a6f7b3be020e5';

export const ApiCaller = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    // Authorization: `Bearer ${storage.getString(StorageKeys.TOKEN)}`,
    'x-api-key': X_API_KEY,
  },
});

ApiCaller.interceptors.request.use(async (config) => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

  if (token) {
    config.headers.Authorization = `Bearer ${token.trim()}`;
  }

  return config;
});

ApiCaller.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

const MEMBER_URL =
  process.env.NEXT_PUBLIC_MEMBER_URL ||
  'https://saintscommunity-members-analytics-staging.up.railway.app';

export const MemberApiCaller = axios.create({
  baseURL: MEMBER_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': X_API_KEY,
  },
});

MemberApiCaller.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);

    if (token) {
      config.headers.Authorization = `Bearer ${token.trim()}`;
    }
  }

  return config;
});

MemberApiCaller.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);
