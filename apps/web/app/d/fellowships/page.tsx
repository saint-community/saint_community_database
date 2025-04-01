'use client';
import { AddNewFellowshipSheet } from '@/components/AddNewFellowship';
import { ChurchChart } from '@/components/church-graph';
import { ListLinkSection } from '@/components/ListLinkSection';
import { TableCard } from '@/components/TableCard';
import { useFellowships } from '@/hooks/fellowships';
import { useStatistics } from '@/hooks/statistics';
import { ListCheck, User, User2, Users2 } from 'lucide-react';

export default function Page() {
  const { data: fellowships } = useFellowships();
  const { data: stats } = useStatistics();

  console.log({ fellowships });

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
                title: 'Fellowships/PCF Coordinators:',
                value: stats?.fellowships || 0,
                icon: <ListCheck size={24} className='stroke-red-500' />,
              },
              {
                title: 'Cell Leaders:',
                value: stats?.workers || 0,
                icon: <Users2 size={24} className='stroke-red-500' />,
              },
              {
                title: 'Workers-In-Training:',
                value: stats?.workers || 0,
                icon: <User size={24} className='stroke-red-500' />,
              },
              {
                title: 'Total members:',
                value: stats?.members || 0,
                icon: <User2 size={24} className='stroke-red-500' />,
              },
            ]}
          />
        </div>
      </div>
      <div className=''>
        <TableCard
          title='Churches List'
          action={<AddNewFellowshipSheet />}
          data={fellowships || []}
          columnKeys={[
            {
              name: 'name',
              title: 'Name',
            },
            {
              name: 'address',
              title: 'Address',
            },
            {
              name: 'cordinator_id',
              title: 'Cordinator',
            },
          ]}
          searchKeys={['name']}
          pathName='d/fellowships'
        />
      </div>
    </div>
  );
}
