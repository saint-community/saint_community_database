import { getWorkerById, getWorkers, getWorkerForm } from '@/services/workers';
import { QUERY_PATHS } from '@/utils/constants';
import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from '@tanstack/react-query';

export const useWorkers = (churchId?: string, page: number = 1) => {
  return useQuery({
    queryKey: [QUERY_PATHS.WORKERS, churchId, page],
    queryFn: () => getWorkers(churchId, page),
    // select: (data) => data.data,
    placeholderData: keepPreviousData,
  });
};

export const useInfiniteWorkers = (churchId?: string) => {
  return useInfiniteQuery({
    queryKey: [QUERY_PATHS.WORKERS, churchId],
    queryFn: () => getWorkers(churchId),
    getNextPageParam: (lastPage) =>
      lastPage.next_page_url ? lastPage?.current_page + 1 : undefined,
    initialPageParam: 1,
  });
};

export const useWorkerById = (id: string) => {
  return useQuery({
    queryKey: [QUERY_PATHS.WORKER_DETAIL.replace(':id', id)],
    queryFn: () => getWorkerById(id),
    enabled: !!id,
  });
};

export const useWorkerForm = (token: string) => {
  return useQuery({
    queryKey: [QUERY_PATHS.WORKER_FORM_DETAIL.replace(':token', token)],
    queryFn: () => getWorkerForm(token),
    enabled: !!token,
  });
};

export const useWorkerOption = () => {
  return useQuery({
    queryKey: [QUERY_PATHS.WORKERS],
    queryFn: () => getWorkers(),
    select: (data) => {
      return data?.data?.map(
        (worker: {
          id: string;
          first_name: string;
          last_name: string;
          status: string;
        }) => ({
          label: `${worker.first_name} ${worker.last_name} (${worker.status})`,
          value: worker.id,
        })
      );
    },
  });
};
