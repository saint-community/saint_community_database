import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@workspace/ui/components/dialog';
import { Input } from '@workspace/ui/components/input';
import { useInfiniteWorkers } from '@/hooks/workers';
import { useMemo, useState } from 'react';
import { Badge } from '@workspace/ui/components/badge';
import { formatDate } from 'date-fns';
import { Button } from '@workspace/ui/components/button';
import { Loader2 } from 'lucide-react';

export function LeaderSelector({
  selectedWorker,
  setSelectedWorker,
  churchId,
}: {
  selectedWorker?: string;
  setSelectedWorker?: (worker: string) => void;
  churchId?: string;
}) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteWorkers(churchId);
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const workers = data?.pages.flatMap((page) => page.data);

  const selectedWorkerData = useMemo(
    () =>
      workers?.find((worker) => worker.id === Number(selectedWorker)) || null,
    [workers, selectedWorker]
  );

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
      <DialogContent className='sm:max-w-md max-h-[500px] overflow-y-auto'>
        <DialogHeader className='mb-0 pb-0'>
          <DialogTitle>Select a leader</DialogTitle>
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
          <div className='flex flex-col gap-2 flex-1 overflow-y-auto'>
            {workers?.map((worker) => (
              <div
                key={worker.id}
                className={`p-2 cursor-pointer hover:bg-red-200 rounded-md transition-all duration-300 ${
                  Number(selectedWorker || 0) === worker.id ? 'bg-red-300' : ''
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
                  Worker since: {formatDate(worker.worker_since, 'MMM d, yyyy')}
                </p>
              </div>
            ))}
          </div>
          {isFetchingNextPage ? (
            <Loader2 className='animate-spin self-center mt-4' />
          ) : (
            hasNextPage && (
              <Button
                onClick={() => fetchNextPage()}
                className='self-center mt-4'
                disabled={isFetchingNextPage}
              >
                Load more
              </Button>
            )
          )}
        </div>
        {/* <DialogFooter className='sm:justify-start'>
          <DialogClose asChild>
            <Button type='button' variant='secondary'>
              Close
            </Button>
          </DialogClose>
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
}
