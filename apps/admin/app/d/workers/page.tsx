'use client';
import { AddNewWorkerSheet } from '@/components/AddNewWorker';
import { ChurchChart } from '@/components/church-graph';
import { ListLinkSection } from '@/components/ListLinkSection';
import { TableCard } from '@/components/TableCard';
import { useStatistics } from '@/hooks/statistics';
import { useWorkers } from '@/hooks/workers';
import { Church, ListCheck, User, User2, Users2 } from 'lucide-react';

export default function Page() {
  const { data: workers, fetchNextPage, hasNextPage } = useWorkers();
  const { data: stats } = useStatistics();
  const workersData = workers?.pages.flatMap((page) => page.data?.data) || [];

  return (
    <div className='flex-1 flex p-6 w-full flex-col gap-6'>
      <div className='flex gap-6'>
        <div className='flex-auto'>
          <ChurchChart />
        </div>
        <div className='flex-1 min-w-[400px]'>
          <ListLinkSection
            list={[
              {
                title: 'Pastors',
                value: 30,
                icon: <Church size={24} className='stroke-red-500' />,
              },
              {
                title: 'Fellowships/PCF Coordinators:',
                value: 400,
                icon: <ListCheck size={24} className='stroke-red-500' />,
              },
              {
                title: 'Cell Leaders:',
                value: 500,
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
          action={<AddNewWorkerSheet />}
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
          onNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
        />
      </div>
    </div>
  );
}
