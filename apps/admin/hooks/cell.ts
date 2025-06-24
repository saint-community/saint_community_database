import { getCellById, getCells } from '@/services/cell';
import { QUERY_PATHS } from '@/utils/constants';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

export const useCells = () => {
  return useInfiniteQuery({
    queryKey: [QUERY_PATHS.CELLS],
    queryFn: ({ pageParam = 1 }) => getCells(pageParam),
    getNextPageParam: (lastPage) => lastPage.next_page_url,
    initialPageParam: 1,
  });
};

export const useCellById = (id: string) => {
  return useQuery({
    queryKey: [QUERY_PATHS.CELL_DETAIL.replace(':id', id)],
    queryFn: () => getCellById(id),
  });
};

// export const useCellByFellowshipId = (fellowshipId: string) => {
//   return useQuery({
//     queryKey: [QUERY_PATHS.CELL_BY_FELLOWSHIP_ID.replace(':fellowshipId', fellowshipId)],
//     queryFn: () => getCellByFellowshipId(fellowshipId),
//   });
// };

export const useCellsOption = () => {
  return useQuery({
    queryKey: [QUERY_PATHS.CELLS, 'option'],
    queryFn: () => getCells(1),
    select: (data) =>
      data.map((cell: { id: string; name: string }) => ({
        value: cell.id,
        label: cell.name,
      })),
  });
};
