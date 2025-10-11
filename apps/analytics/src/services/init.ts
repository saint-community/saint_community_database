// import axios from 'axios';
// import { STORAGE_KEYS } from '@/src/utils/constants';

// const API_URL =
//   process.env.NEXT_PUBLIC_API_URL || 'https://staging.lwmportal.com';

// export const ApiCaller = axios.create({
//   baseURL: API_URL,
//   headers: {
//     'Content-Type': 'application/json',
//     // Authorization: `Bearer ${storage.getString(StorageKeys.TOKEN)}`,
//   },
// });

// ApiCaller.interceptors.request.use(async (config) => {
//   const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

//   if (token) {
//     config.headers.Authorization = `Bearer ${token.trim()}`;
//   }

//   return config;
// });

import axios from 'axios';
import { STORAGE_KEYS } from '@/utils/constants';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||  'https://memberapi.lwmportal.com';

export const ApiCaller = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': '2e4c9b93f5d18e72a1b0c6d4f8e7a9b1c3d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9',
  },
});

ApiCaller.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

    if (token) {
      config.headers.Authorization = `Bearer ${token.trim()}`;
    }
  }

  return config;
});

ApiCaller.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

const ADMIN_URL =
  process.env.NEXT_PUBLIC_ADMIN_URL || 'https://staging.lwmportal.com';

export const AdminApiCaller = axios.create({
  baseURL: ADMIN_URL,
  headers: {
     'Content-Type': 'application/json',
    'x-api-key': '2e4c9b93f5d18e72a1b0c6d4f8e7a9b1c3d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9',
  },
});

AdminApiCaller.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);

    if (token) {
      config.headers.Authorization = `Bearer ${token.trim()}`;
    }
  }

  return config;
});

AdminApiCaller.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);