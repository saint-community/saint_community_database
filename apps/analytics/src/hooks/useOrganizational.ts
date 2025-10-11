import { useQuery } from '@tanstack/react-query';
import { getChurches, getFellowships, getCells } from '@/services/organizational';

export const useChurches = () => {
  return useQuery({
    queryKey: ['churches'],
    queryFn: getChurches,
  });
};

export const useFellowships = (church_id?: string | number) => {
  return useQuery({
    queryKey: ['fellowships', church_id],
    queryFn: () => getFellowships(church_id),
    enabled: !!church_id,
  });
};

export const useCells = (fellowship_id?: string | number, church_id?: string | number) => {
  return useQuery({
    queryKey: ['cells', fellowship_id, church_id],
    queryFn: () => getCells(fellowship_id, church_id),
    enabled: !!fellowship_id,
  });
};