import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@workspace/ui/components/dialog';
import { Input } from '@workspace/ui/components/input';
import { useMemo, useState } from 'react';
import { Badge } from '@workspace/ui/components/badge';
import { formatDate } from 'date-fns';
import { useChurchById } from '@/hooks/churches';
import { useFellowshipById } from '@/hooks/fellowships';
import { Loader2 } from 'lucide-react';

export function LeaderSelector({
  selectedWorker,
  setSelectedWorker,
  churchId,
  fellowshipId,
}: {
  selectedWorker?: string;
  setSelectedWorker?: (worker: string) => void;
  churchId?: string;
  fellowshipId?: string;
}) {
  const { data, isLoading } = useChurchById(churchId || '');
  const { data: fellowshipData, isLoading: fellowshipLoading } =
    useFellowshipById(fellowshipId || '');
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const leaders = useMemo(() => {
    if (fellowshipId) {
      return fellowshipData?.workers || [];
    }
    return data?.workers || [];
  }, [data, fellowshipData, fellowshipId]);

  const selectedWorkerData = useMemo(
    () =>
      leaders?.find((worker: any) => worker.id === Number(selectedWorker)) ||
      null,
    [leaders, selectedWorker]
  );

  const filteredLeaders = useMemo(() => {
    return leaders?.filter((worker: any) =>
      `${worker.first_name} ${worker.last_name}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [leaders, search]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Input
          type='text'
          placeholder='Search for a leader'
          className='w-full'
          value={
            !selectedWorkerData
              ? ''
              : `${selectedWorkerData?.first_name} ${selectedWorkerData?.last_name}`
          }
          readOnly
        />
      </DialogTrigger>
      <DialogContent className='sm:max-w-md max-h-[500px] overflow-y-auto  scrollbar-hide'>
        <DialogHeader className='mb-0 pb-0'>
          <DialogTitle>
            Select a {fellowshipId ? 'cell' : 'fellowship'} leader
          </DialogTitle>
          <DialogDescription>
            Select a leader from the list below.
          </DialogDescription>
        </DialogHeader>
        <div className='flex-1 gap-3 flex flex-col'>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Search for a leader'
          />
          <div className='flex flex-col gap-2 flex-1 overflow-y-auto scrollbar-hide'>
            {isLoading || fellowshipLoading ? (
              <div className='flex justify-center items-center h-[200px]'>
                <Loader2 className='animate-spin h-10 w-10' />
              </div>
            ) : filteredLeaders?.length === 0 ? (
              <div className='flex justify-center items-center h-[200px]'>
                <p className='text-sm text-gray-500'>No leaders found</p>
              </div>
            ) : (
              filteredLeaders?.map((worker: any) => (
                <div
                  key={worker.id}
                  className={`p-2 cursor-pointer hover:bg-red-200 rounded-md transition-all duration-300 ${
                    Number(selectedWorker || 0) === worker.id
                      ? 'bg-red-300'
                      : ''
                  }`}
                  onClick={() => {
                    setSelectedWorker?.(worker.id);
                    setIsOpen(false);
                  }}
                >
                  <div className='flex items-center justify-between'>
                    <h2 className='text-md font-bold'>
                      {worker.first_name} {worker.last_name}
                    </h2>
                    <Badge variant='secondary'>{worker.status}</Badge>
                  </div>
                  <p className='text-sm text-gray-500'>{worker.email}</p>
                  <p className='text-sm text-gray-500'>{worker.phone_number}</p>
                  <p className='text-xs text-gray-500 font-bold'>
                    Worker since:{' '}
                    {formatDate(worker.worker_since, 'MMM d, yyyy')}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
