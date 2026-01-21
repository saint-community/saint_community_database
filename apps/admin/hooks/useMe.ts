import { ROLES, STORAGE_KEYS } from '@/utils/constants';
import { useEffect, useState } from 'react';
import { useStatistics } from './statistics';

interface Church {
  id: number;
  pastor_id: number;
  church_id: number;
  church_name: string;
}

interface User {
  cell_id: number;
  church_id: number;
  created_at: string | null;
  email: string;
  email_verified_at: string;
  fellowship_id: number;
  id: number;
  name: string;
  role: 'admin' | 'user';
  updated_at: string | null;
  phone?: string;
  church_name?: string;
  fellowship_name?: string;
  cell_name?: string;
  worker_id?: number | null;
  churches?: Church[];
}

export const useMe = () => {
  const [data, setData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { error, isLoading: isStatisticsLoading } = useStatistics();

  const refetch = () => {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    setData(user ? (JSON.parse(user) as User) : null);
  };

  useEffect(() => {
    refetch();
    setIsLoading(false);
  }, []);

  if (error) {
    console.log({ error });
    const isAuthError = (error as any)?.response?.status === 401;
    if (isAuthError) {
      console.log('Unauthorized');

      localStorage.clear();
      window.location.href = '/login';
    }
  }

  const isAdmin = data?.role === ROLES.ADMIN || data?.role === ROLES.PASTOR;

  return { data, isLoading: isLoading || isStatisticsLoading, isAdmin, refetch };
};
