import { getCellById, getCells } from '@/services/cell';
import { QUERY_PATHS } from '@/utils/constants';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

export const useCells = (page: number = 1) => {
  return useQuery({
    queryKey: [QUERY_PATHS.CELLS, page],
    queryFn: () => getCells(page),
    // select: (data) => data.data,
    placeholderData: keepPreviousData,
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
      data?.data?.map((cell: { id: string; name: string }) => ({
        value: cell.id,
        label: cell.name,
      })),
  });
};
