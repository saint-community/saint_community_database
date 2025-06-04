import { getChurchById } from '@/services/churches';
import { getDepartments } from '@/services/departments';
import { QUERY_PATHS } from '@/utils/constants';
import { useQuery } from '@tanstack/react-query';

export const useDepartments = () => {
  return useQuery({
    queryKey: [QUERY_PATHS.DEPARTMENTS],
    queryFn: () => getDepartments(),
  });
};

export const useChurchById = (id: string) => {
  return useQuery({
    queryKey: [QUERY_PATHS.CHURCH_DETAIL.replace(':id', id)],
    queryFn: () => getChurchById(id),
    enabled: !!id,
  });
};

export const useDepartmentsOption = () => {
  return useQuery({
    queryKey: [QUERY_PATHS.DEPARTMENTS, 'option'],
    queryFn: () => getDepartments(),
    select: (data) => {
      return data.map((department: { id: string; name: string }) => ({
        label: department.name,
        value: department.id,
      }));
    },
  });
};
