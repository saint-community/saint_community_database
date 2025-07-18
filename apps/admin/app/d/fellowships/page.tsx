'use client';
import { AddNewFellowshipSheet } from '@/components/AddNewFellowship';
import { ChurchChart } from '@/components/church-graph';
import { ListLinkSection } from '@/components/ListLinkSection';
import { TableCard } from '@/components/TableCard';
import { useFellowships } from '@/hooks/fellowships';
import { useStatistics } from '@/hooks/statistics';
import { useMe } from '@/hooks/useMe';
import { ListCheck, User, User2, Users2 } from 'lucide-react';
import { useMemo, useState } from 'react';

export default function Page() {
  const { data: user } = useMe();
  const [page, setPage] = useState(1);
  const { data } = useFellowships(user?.church_id?.toString(), page);

  const fellowships = data?.data || [];

  const { data: stats } = useStatistics();

  const perPage = useMemo(() => {
    return data?.per_page || 10;
  }, [data]);

  return (
    <div className='flex-1 flex p-4 sm:p-6 w-full flex-col sm:gap-6 gap-4'>
      <div className='flex gap-6 sm:flex-row flex-col'>
        <div className='flex-auto'>
          <ChurchChart />
        </div>
        <div className='flex-1 sm:min-w-[400px] w-auto'>
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
          title='Fellowships List'
          action={<AddNewFellowshipSheet />}
          data={fellowships}
          columnKeys={[
            {
              name: 'name',
              title: 'Name',
            },
            {
              name: 'address',
              title: 'Address',
            },
          ]}
          searchKeys={['name']}
          pathName='d/fellowships'
          perPage={perPage}
          onNextPage={() => setPage((prev) => prev + 1)}
          hasNextPage={data?.next_page_url !== null}
          onPreviousPage={() => setPage((prev) => prev - 1)}
          hasPreviousPage={data?.prev_page_url !== null}
          page={page}
          totalPages={data?.last_page}
        />
      </div>
    </div>
  );
}
