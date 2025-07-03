import { getChurchById } from '@/services/churches';
import { getFellowshipById, getFellowships } from '@/services/fellowships';
import { QUERY_PATHS } from '@/utils/constants';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

export const useFellowships = (churchId?: string, page: number = 1) => {
  return useQuery({
    queryKey: [QUERY_PATHS.FELLOWSHIPS, churchId, page],
    queryFn: () => getFellowships(churchId, page),
    // select: (data) => data.data,
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
    queryKey: [QUERY_PATHS.FELLOWSHIPS, churchId],
    queryFn: () => getChurchById(churchId || ''),
    select: (data) =>
      data?.fellowships?.map((fellowship: { id: string; name: string }) => ({
        value: fellowship.id,
        label: fellowship.name,
      })),
  });
};
