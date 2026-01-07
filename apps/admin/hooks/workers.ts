import {
  getWorkerById,
  getWorkers,
  getWorkerForm,
  rejectWorker,
  approveWorker,
  getWorkersRegistration,
} from '@/services/workers';
import { QUERY_PATHS } from '@/utils/constants';
import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from '@tanstack/react-query';

export const useWorkers = (
  {
    church_id,
    page,
  }: {
    page?: number;
    church_id?: string;
  } = {} as any
) => {
  return useQuery({
    queryKey: [QUERY_PATHS.WORKERS, church_id, page],
    queryFn: () => getWorkers({ church_id, page }),
    // select: (data) => data.data,
    placeholderData: keepPreviousData,
  });
};

export const useInfiniteWorkers = (churchId?: string) => {
  return useInfiniteQuery({
    queryKey: [QUERY_PATHS.WORKERS, churchId],
    queryFn: () => getWorkers({ church_id: churchId }),
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

export const useWorkerOption = (church_id?: string) => {
  return useQuery({
    queryKey: [QUERY_PATHS.WORKERS, church_id],
    queryFn: () => getWorkers({ church_id: church_id || '' }),
    select: (data) => {
      return data?.data?.map(
        (worker: {
          id: string;
          first_name: string;
          last_name: string;
          status: string;
        }) => ({
          label: `${worker.first_name} ${worker.last_name} (${worker.status})`,
          // Ensure the value is always a string to match Select expectations
          value: String(worker.id),
        })
      );
    },
  });
};

export const useInfiniteWorkersRegistration = ({
  action,
}: {
  action: string;
  page?: number;
}) => {
  return useInfiniteQuery({
    queryKey: [`${QUERY_PATHS.WORKERS}${action}`, action],
    queryFn: ({ pageParam }) =>
      getWorkersRegistration({ action, page: pageParam }),
    enabled: !!action,
    getNextPageParam: (lastPage) => {
      return lastPage.data.current_page < lastPage.data.last_page
        ? lastPage.data.current_page + 1
        : undefined;
    },
    initialPageParam: 1,
  });
};

export const useApproveWorker = (id: string) => {
  return useQuery({
    queryKey: [QUERY_PATHS.WORKER_APPROVE.replace(':id', id)],
    queryFn: () => approveWorker(id),
    enabled: !!id,
  });
};

export const useRejectWorker = (id: string) => {
  return useQuery({
    queryKey: [QUERY_PATHS.WORKER_REJECT.replace(':id', id)],
    queryFn: () => rejectWorker(id),
    enabled: !!id,
  });
};
