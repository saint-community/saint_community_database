import { getChurchById } from '@/services/churches';
import { getDepartments } from '@/services/departments';
import { QUERY_PATHS } from '@/utils/constants';
import { useQuery } from '@tanstack/react-query';

export const useDepartments = (churchId?: number | string) => {
  return useQuery({
    queryKey: [QUERY_PATHS.DEPARTMENTS, churchId],
    queryFn: () => getDepartments(churchId),
    enabled: churchId === undefined || churchId !== '',
  });
};

export const useChurchById = (id: string) => {
  return useQuery({
    queryKey: [QUERY_PATHS.CHURCH_DETAIL.replace(':id', id)],
    queryFn: () => getChurchById(id),
    enabled: !!id,
  });
};

export const useDepartmentsOption = (churchId?: number | string) => {
  return useQuery({
    queryKey: [QUERY_PATHS.DEPARTMENTS, 'option', churchId],
    queryFn: () => getDepartments(churchId),
    enabled: churchId !== undefined && churchId !== '',
    select: (data) => {
      return data.map((department: { id: string; name: string }) => ({
        label: department.name,
        value: department.id,
      }));
    },
  });
};
