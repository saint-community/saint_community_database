import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

interface ChurchFilters {
  name?: string;
  country?: string;
  page?: number;
}

export const useUrlParams = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const filters = useMemo<ChurchFilters>(() => {
    return {
      name: searchParams.get('name') || undefined,
      country: searchParams.get('country') || undefined,
      page: parseInt(searchParams.get('page') || '1', 10),
    };
  }, [searchParams]);

  const updateParams = useCallback(
    (newFilters: Partial<ChurchFilters>) => {
      const params = new URLSearchParams(searchParams);
      
      // Remove empty values and update with new ones
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value === undefined || value === '' || value === null) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });

      // Reset to page 1 when filters change (except for page updates)
      if (!newFilters.hasOwnProperty('page') && Object.keys(newFilters).length > 0) {
        params.set('page', '1');
      }

      // Use replace to avoid polluting browser history with every keystroke
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      router.replace(newUrl);
    },
    [router, searchParams]
  );

  const clearFilters = useCallback(() => {
    router.replace(window.location.pathname);
  }, [router]);

  return {
    filters,
    updateParams,
    clearFilters,
  };
};