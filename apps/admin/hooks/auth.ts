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

export const useChurchAccountOptions = (churchId?: number) => {
  return useQuery({
    queryKey: [QUERY_PATHS.ACCOUNTS, 'church-options', churchId],
    queryFn: () => getAccounts(1, { church_id: churchId! }),
    enabled: !!churchId,
    select: (data) =>
      (data?.data || []).map(
        (account: {
          id: number;
          name?: string;
          first_name?: string;
          last_name?: string;
          email?: string;
          role?: string;
        }) => {
          const fullName =
            account.name ||
            [account.first_name, account.last_name].filter(Boolean).join(' ') ||
            account.email ||
            `User #${account.id}`;

          return {
            label: account.role
              ? `${fullName} (${account.role.replace('_', ' ')})`
              : fullName,
            value: account.id,
          };
        }
      ),
  });
};

export const useAccountById = (id: string) => {
  return useQuery({
    queryKey: [QUERY_PATHS.ACCOUNT_DETAIL.replace(':id', id)],
    queryFn: () => getAccountById(id),
    enabled: !!id,
  });
};
