import { getChurchById, getChurches, getChurchesOptions } from '@/services/churches';
import { QUERY_PATHS } from '@/utils/constants';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

interface ChurchFilters {
  page?: number;
  name?: string;
  country?: string;
}

export const useChurches = (filters: ChurchFilters = {}) => {
  const { page = 1, ...searchFilters } = filters;
  
  return useQuery({
    queryKey: [QUERY_PATHS.CHURCHES, page, searchFilters],
    queryFn: () => getChurches(filters),
    placeholderData: keepPreviousData,
  });
};

export const useChurchById = (id: string) => {
  return useQuery({
    queryKey: [QUERY_PATHS.CHURCH_DETAIL.replace(':id', id)],
    queryFn: () => getChurchById(id),
    enabled: !!id,
  });
};

export const useChurchesOption = (enabled: boolean = true) => {
  return useQuery({
    queryKey: [QUERY_PATHS.CHURCHES, 'options'],
    queryFn: () => getChurchesOptions(),
    enabled,
    select: (data) => {
      // console.log('useChurchesOption - select data:', data);
      
      // Handle paginated response structure
      const churches = data?.data || data;
      
      if (!Array.isArray(churches)) {
        // console.log('Church data is not an array:', churches);
        return [];
      }
      
      const mapped = churches.map((church: { id: string | number; name: string }) => ({
        label: church.name,
        value: String(church.id),
      }));
      // console.log('useChurchesOption - mapped data:', mapped);
      return mapped;
    },
  });
};
