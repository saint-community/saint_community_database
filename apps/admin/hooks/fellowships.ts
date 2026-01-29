import { getChurchById } from '@/services/churches';
import { getFellowshipById, getFellowships, getFellowshipsOptions } from '@/services/fellowships';
import { QUERY_PATHS } from '@/utils/constants';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

interface FellowshipFilters {
  page?: number;
  name?: string;
  church?: string;
}

export const useFellowships = (filters: FellowshipFilters = {}) => {
  const { page = 1, ...searchFilters } = filters;
  
  return useQuery({
    queryKey: [QUERY_PATHS.FELLOWSHIPS, page, searchFilters],
    queryFn: () => getFellowships(filters),
    placeholderData: keepPreviousData,
  });
};

export const useFellowshipById = (id: string) => {
  return useQuery({
    queryKey: [QUERY_PATHS.FELLOWSHIP_DETAIL.replace(':id', id)],
    queryFn: () => getFellowshipById(id),
  });
};

// export const useFellowshipByChurchId = (churchId: string) => {
//   return useQuery({
//     queryKey: [QUERY_PATHS.FELLOWSHIP_BY_CHURCH_ID.replace(':churchId', churchId)],
//     queryFn: () => getFellowshipByChurchId(churchId),
//   });
// };

export const useFellowshipsOption = (churchId?: string) => {
  return useQuery({
    queryKey: [QUERY_PATHS.FELLOWSHIPS, 'options', churchId],
    queryFn: () => getFellowshipsOptions(churchId),
    select: (data) => {
      // console.log('Fellowship data received:', data);
      
      // Handle paginated response structure
      const fellowships = data?.data || data;
      
      if (!Array.isArray(fellowships)) {
        // console.log('Fellowship data is not an array:', fellowships);
        return [];
      }
      
      return fellowships.map((fellowship: { id: string | number; name: string }) => ({
        value: String(fellowship.id),
        label: fellowship.name,
      }));
    },
    enabled: true, // Always enabled to support both filtered and unfiltered scenarios
  });
};
