import { getAccountById, getAccounts } from '@/services/auth';
import { QUERY_PATHS } from '@/utils/constants';
import { useQuery } from '@tanstack/react-query';

export const useAccounts = () => {
  return useQuery({
    queryKey: [QUERY_PATHS.ACCOUNTS],
    queryFn: () => getAccounts(),
  });
};

export const useAccountById = (id: string) => {
  return useQuery({
    queryKey: [QUERY_PATHS.ACCOUNT_DETAIL.replace(':id', id)],
    queryFn: () => getAccountById(id),
    enabled: !!id,
  });
};
