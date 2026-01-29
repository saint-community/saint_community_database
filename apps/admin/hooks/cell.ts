import { getCellById, getCells } from '@/services/cell';
import { getFellowshipById } from '@/services/fellowships';
import { QUERY_PATHS } from '@/utils/constants';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

interface CellFilters {
  page?: number;
  name?: string;
  church?: string;
  fellowship?: string;
}

export const useCells = (filters: CellFilters = {}) => {
  const { page = 1, ...searchFilters } = filters;
  
  return useQuery({
    queryKey: [QUERY_PATHS.CELLS, page, searchFilters],
    queryFn: () => getCells(filters),
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

export const useCellsOption = (fellowshipId?: string) => {
  return useQuery({
    queryKey: [QUERY_PATHS.CELLS, 'option', fellowshipId],
    queryFn: () => getFellowshipById(fellowshipId || ''),
    select: (data) =>
      data?.cells?.map((cell: { id: string; name: string }) => ({
        value: cell.id,
        label: cell.name,
      })),
  });
};


export const useCellsByFellowship = (fellowshipId?: string) => {
  return useQuery({
    queryKey: [QUERY_PATHS.CELLS, 'option', fellowshipId],
    queryFn: () => getFellowshipById(fellowshipId || ''),
  });
};
