'use client';
import { AddNewWorkerSheet } from '@/components/AddNewWorker';
import { ChurchChart } from '@/components/church-graph';
import { ListLinkSection } from '@/components/ListLinkSection';
import { TableCard } from '@/components/TableCard';
import { useStatistics } from '@/hooks/statistics';
import { useMe } from '@/hooks/useMe';
import { useWorkers } from '@/hooks/workers';
import { Church, ListCheck, User, User2, Users2 } from 'lucide-react';
import { useMemo, useState } from 'react';

export default function Page() {
  const { data: user } = useMe();
  // const isAdmin = user?.role === ROLES.ADMIN || user?.role === ROLES.PASTOR;
  const [page, setPage] = useState(1);
  const { data: workers } = useWorkers({
    church_id: user?.church_id?.toString() || '',
    page,
  });
  const { data: stats } = useStatistics();

  const workersData = workers?.data || [];

  const perPage = useMemo(() => {
    return workers?.per_page || 10;
  }, [workers]);

  return (
    <div className='flex-1 flex p-4 sm:p-6 w-full flex-col sm:gap-6 gap-4 bg-[#fafafa]'>
      <div className='flex sm:flex-row flex-col gap-6'>
        <div className='flex-auto'>
          <ChurchChart />
        </div>
        <div className='flex-1 sm:min-w-[400px] w-auto'>
          <ListLinkSection
            list={[
              {
                title: 'Pastors',
                value: stats?.Churches,
                icon: <Church size={24} className='stroke-red-500' />,
              },
              {
                title: 'Fellowships/PCF Coordinators:',
                value: stats?.fellowships,
                icon: <ListCheck size={24} className='stroke-red-500' />,
              },
              {
                title: 'Cell Leaders:',
                value: stats?.cells,
                icon: <Users2 size={24} className='stroke-red-500' />,
              },
              {
                title: 'Workers-In-Training:',
                value: stats?.workers,
                icon: <User size={24} className='stroke-red-500' />,
              },
              {
                title: 'Members:',
                value: 5000,
                icon: <User2 size={24} className='stroke-red-500' />,
              },
            ]}
          />
        </div>
      </div>
      <div className=''>
        <TableCard
          title='Workers List'
          action={<AddNewWorkerSheet page={page} church_id={user?.church_id} />}
          data={workersData}
          columnKeys={[
            {
              name: 'name',
              title: 'Name',
              compoundKey: 'first_name,last_name',
            },
            {
              name: 'email',
              title: 'Email',
            },
            {
              name: 'status',
              title: 'Status',
            },
          ]}
          searchKeys={['email']}
          pathName='d/workers'
          perPage={perPage}
          onNextPage={() => setPage((prev) => prev + 1)}
          hasNextPage={workers?.next_page_url !== null}
          onPreviousPage={() => setPage((prev) => prev - 1)}
          hasPreviousPage={workers?.prev_page_url !== null}
          page={page}
          totalPages={workers?.last_page}
        />
      </div>
    </div>
  );
}
