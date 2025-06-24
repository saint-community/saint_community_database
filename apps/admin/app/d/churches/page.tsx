'use client';
import { ChurchChart } from '@/components/church-graph';
import { ListLinkSection } from '@/components/ListLinkSection';
import { Church, ListCheck, User2, Users2 } from 'lucide-react';
import { useChurches } from '@/hooks/churches';
import { AddNewChurchSheet } from '@/components/AddNewChurch';
import { TableCard } from '@/components/TableCard';
import { useStatistics } from '@/hooks/statistics';

export default function Page() {
  const { data: churches } = useChurches();
  const { data: stats } = useStatistics();

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
                title: 'Total no of Churches:',
                value: stats?.Churches || 0,
                icon: <Church size={24} className='stroke-red-500' />,
              },
              {
                title: 'Total no of Fellowships/PCFs:',
                value: stats?.fellowships || 0,
                icon: <ListCheck size={24} className='stroke-red-500' />,
              },
              {
                title: 'Total no of Cells:',
                value: stats?.cells || 0,
                icon: <Users2 size={24} className='stroke-red-500' />,
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
          action={<AddNewChurchSheet />}
          data={churches || []}
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
              name: 'state',
              title: 'State',
            },
            {
              name: 'country',
              title: 'Country',
            },
          ]}
          searchKeys={['name']}
          pathName='d/churches'
        />
      </div>
    </div>
  );
}
