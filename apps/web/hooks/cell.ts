import { getCellById, getCells } from '@/services/cell';
import { QUERY_PATHS } from '@/utils/constants';
import { useQuery } from '@tanstack/react-query';

export const useCells = () => {
  return useQuery({
    queryKey: [QUERY_PATHS.CELLS],
    queryFn: () => getCells(),
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
    queryFn: () => getCells(),
    select: (data) =>
      data.map((cell: { id: string; name: string }) => ({
        value: cell.id,
        label: cell.name,
      })),
  });
};
