import { STORAGE_KEYS } from '@/utils/constants';
import { useEffect, useState } from 'react';

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
}

export const useMe = () => {
  const [data, setData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    setData(user ? (JSON.parse(user) as User) : null);
    setIsLoading(false);
  }, []);

  return { data, isLoading };
};
