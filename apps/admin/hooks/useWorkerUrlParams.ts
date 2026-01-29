import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

interface WorkerFilters {
  name?: string;           // Search by name
  church?: string;         // Church ID
  fellowship?: string;     // Fellowship ID  
  cell?: string;          // Cell ID
  phone?: string;         // Phone number search
  gender?: string;        // male/female
  status?: string;        // Worker status
  department?: string;    // Department ID
  page?: number;          // Pagination
}

export const useWorkerUrlParams = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const filters = useMemo<WorkerFilters>(() => {
    return {
      name: searchParams.get('name') || '',
      church: searchParams.get('church') || '',
      fellowship: searchParams.get('fellowship') || '',
      cell: searchParams.get('cell') || '',
      phone: searchParams.get('phone') || '',
      gender: searchParams.get('gender') || '',
      status: searchParams.get('status') || '',
      department: searchParams.get('department') || '',
      page: parseInt(searchParams.get('page') || '1', 10),
    };
  }, [searchParams]);

  const updateParams = useCallback(
    (newFilters: Partial<WorkerFilters>) => {
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

      // Handle cascading filter logic
      // When church changes, clear fellowship and cell
      if (newFilters.hasOwnProperty('church') && !newFilters.church) {
        params.delete('fellowship');
        params.delete('cell');
      }
      
      // When fellowship changes, clear cell
      if (newFilters.hasOwnProperty('fellowship') && !newFilters.fellowship) {
        params.delete('cell');
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