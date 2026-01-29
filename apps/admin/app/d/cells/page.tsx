'use client';
import { AddNewCellSheet } from '@/components/AddNewCell';
import { ChurchChart } from '@/components/church-graph';
import { ListLinkSection } from '@/components/ListLinkSection';
import { TableCard } from '@/components/TableCard';
import { User, Users2 } from 'lucide-react';
import { useStatistics } from '@/hooks/statistics';
import { useCells } from '@/hooks/cell';
import { useMemo, useState, useEffect } from 'react';
import { useCellUrlParams } from '@/hooks/useCellUrlParams';
import { useDebounced } from '@/hooks/useDebounced';
import { CellFilters } from '@/components/CellFilters';
import { useMe } from '@/hooks/useMe';
import { ROLES } from '@/utils/constants';

export default function Page() {
  const { data: user } = useMe();
  const { data: stats } = useStatistics();
  const { filters, updateParams } = useCellUrlParams();
  
  
  // Internal state for search input (for immediate UI feedback)
  const [searchValue, setSearchValue] = useState(filters.name || '');
  
  // Debounce search input to reduce API calls
  const debouncedSearch = useDebounced(searchValue, 300);
  
  // Update URL when debounced search changes
  useEffect(() => {
    if (debouncedSearch !== filters.name) {
      updateParams({ name: debouncedSearch || undefined });
    }
  }, [debouncedSearch, filters.name, updateParams]);
  
  // Sync search input with URL params (for browser back/forward)
  useEffect(() => {
    if (filters.name !== searchValue) {
      setSearchValue(filters.name || '');
    }
  }, [filters.name]);


 

  const { data } = useCells(filters);

  const cells = data?.data || [];
  const currentPage = filters.page || 1;

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
          onNextPage={() => updateParams({ page: currentPage + 1 })}
          hasNextPage={data?.next_page_url !== null}
          onPreviousPage={() => updateParams({ page: Math.max(1, currentPage - 1) })}
          hasPreviousPage={data?.prev_page_url !== null}
          page={currentPage}
          totalPages={data?.last_page}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          filterComponent={
              // Only show church filter for ADMIN and PASTOR roles
            (user?.role === ROLES.ADMIN || user?.role === ROLES.PASTOR) || user?.role === ROLES.CHURCH_PASTOR ? (
              <CellFilters
              />
            ) : undefined
          }
        />
      </div>
    </div>
  );
}
