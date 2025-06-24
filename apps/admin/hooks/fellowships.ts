import { getFellowshipById, getFellowships } from '@/services/fellowships';
import { QUERY_PATHS } from '@/utils/constants';
import { useQuery } from '@tanstack/react-query';

export const useFellowships = (churchId?: string) => {
  return useQuery({
    queryKey: [QUERY_PATHS.FELLOWSHIPS, churchId],
    queryFn: () => getFellowships(churchId),
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

export const useFellowshipsOption = () => {
  return useQuery({
    queryKey: [QUERY_PATHS.FELLOWSHIPS],
    queryFn: () => getFellowships(),
    select: (data) =>
      data?.map((fellowship: { id: string; name: string }) => ({
        value: fellowship.id,
        label: fellowship.name,
      })),
  });
};
