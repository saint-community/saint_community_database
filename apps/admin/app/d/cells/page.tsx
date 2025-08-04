'use client';
import { AddNewCellSheet } from '@/components/AddNewCell';
import { ChurchChart } from '@/components/church-graph';
import { ListLinkSection } from '@/components/ListLinkSection';
import { TableCard } from '@/components/TableCard';
import { User, Users2 } from 'lucide-react';
import { useStatistics } from '@/hooks/statistics';
import { useCells } from '@/hooks/cell';
import { useMemo, useState } from 'react';

export default function Page() {
  const { data: stats } = useStatistics();
  const [page, setPage] = useState(1);
  const { data } = useCells(page);

  const cells = data?.data || [];

  const perPage = useMemo(() => {
    return data?.per_page || 10;
  }, [data]);

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
                title: 'Cell Leaders:',
                value: stats?.cells || 0,
                icon: <Users2 size={24} className='stroke-red-500' />,
              },
              {
                title: 'Workers-In-Training:',
                value: stats?.workers || 0,
                icon: <User size={24} className='stroke-red-500' />,
              },
            ]}
          />
        </div>
      </div>
      <div className=''>
        <TableCard
          title='Cells List'
          action={<AddNewCellSheet />}
          data={cells || []}
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
              name: 'leader_id',
              title: 'Leader',
            },
          ]}
          searchKeys={['name']}
          pathName='d/cells'
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
