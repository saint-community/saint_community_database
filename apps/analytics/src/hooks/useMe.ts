import { ROLES, STORAGE_KEYS } from '@/src/utils/constants';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
// import { useStatistics } from './statistics';

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
}

export const useMe = () => {
  const [data, setData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // const { error, isLoading: isStatisticsLoading } = useStatistics();
  const [error, setError] = useState<Error | null>(null);
  const [isStatisticsLoading, setIsStatisticsLoading] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    setData(user ? (JSON.parse(user) as User) : null);
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

  return { data, isLoading: isLoading || isStatisticsLoading, isAdmin };
};


export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEYS.IS_AUTHENTICATED) === 'true';
};

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
};


export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      const currentUser = getCurrentUser();
      
      setIsLoggedIn(authenticated);
      setUser(currentUser);
      setIsLoading(false);
    };

    checkAuth();

    // Listen for storage changes (logout from another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'isAuthenticated' || e.key === 'user') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    user,
    isLoggedIn,
    isLoading,
  };
};

export const useRequireAuth = () => {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, isLoading, router]);

  return { isLoggedIn, isLoading };
};

export const useRedirectIfAuthenticated = () => {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      router.push('/d');
    }
  }, [isLoggedIn, isLoading, router]);

  return { isLoggedIn, isLoading };
};