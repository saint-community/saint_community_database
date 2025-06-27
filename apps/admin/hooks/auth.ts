import { getAccountById, getAccounts } from '@/services/auth';
import { QUERY_PATHS } from '@/utils/constants';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

export const useAccounts = (page: number = 1) => {
  return useQuery({
    queryKey: [QUERY_PATHS.ACCOUNTS, page],
    queryFn: () => getAccounts(page),
    placeholderData: keepPreviousData,
  });
};

export const useAccountById = (id: string) => {
  return useQuery({
    queryKey: [QUERY_PATHS.ACCOUNT_DETAIL.replace(':id', id)],
    queryFn: () => getAccountById(id),
    enabled: !!id,
  });
};
