import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useEffect } from 'react';

interface CellFilters {
  name?: string;
  church?: string;
  fellowship?: string;
  page?: number;
}

export const useCellUrlParams = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const filters = useMemo<CellFilters>(() => {
 
    
    const church = searchParams.get('church') || undefined;
    const fellowship = searchParams.get('fellowship') || undefined;
 
    
    const result = {
      name: searchParams.get('name') || undefined,
      church,
      fellowship,
      page: parseInt(searchParams.get('page') || '1', 10),
    };
    
    // console.log('useCellUrlParams - final filters object:', result);
    return result;
  }, [searchParams]);

 

  const updateParams = useCallback(
    (newFilters: Partial<CellFilters>) => {

      
      const params = new URLSearchParams(searchParams);
      
      // Remove empty values and update with new ones
      Object.entries(newFilters).forEach(([key, value]) => {
        // console.log(`useCellUrlParams - processing ${key}: ${value}`);
        if (value === undefined || value === '' || value === null) {
          params.delete(key);
          // console.log(`useCellUrlParams - deleted ${key} from params`);
        } else {
          params.set(key, String(value));
          // console.log(`useCellUrlParams - set ${key}=${value} in params`);
        }
      });

      // Reset to page 1 when filters change (except for page updates)
      if (!newFilters.hasOwnProperty('page') && Object.keys(newFilters).length > 0) {
        params.set('page', '1');
        // console.log('useCellUrlParams - reset page to 1');
      }

      // Special logic: Clear fellowship when church is cleared
      if (newFilters.hasOwnProperty('church') && !newFilters.church) {
        params.delete('fellowship');
        // console.log('useCellUrlParams - cleared fellowship because church was cleared');
      }

      // Use replace to avoid polluting browser history with every keystroke
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      // console.log('useCellUrlParams - updating URL to:', newUrl);
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