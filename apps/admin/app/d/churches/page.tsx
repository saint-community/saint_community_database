'use client';
import { ChurchChart } from '@/components/church-graph';
import { ListLinkSection } from '@/components/ListLinkSection';
import { Church, ListCheck, User2, Users2 } from 'lucide-react';
import { useChurches } from '@/hooks/churches';
import { AddNewChurchSheet } from '@/components/AddNewChurch';
import { TableCard } from '@/components/TableCard';
import { useStatistics } from '@/hooks/statistics';
import { useMemo, useState } from 'react';
import { useMe } from '@/hooks/useMe';
import { ROLES } from '@/utils/constants';

export default function Page() {
  const [page, setPage] = useState(1);
  const { data: user } = useMe();
  const isAdmin = user?.role === ROLES.ADMIN || user?.role === ROLES.PASTOR;

  console.log({ isAdmin });

  const { data } = useChurches(page);
  const { data: stats } = useStatistics();

  const churches = data?.data || [];

  const perPage = useMemo(() => {
    return data?.per_page || 10;
  }, [data]);

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
