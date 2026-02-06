'use client';
import React from 'react';
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
import { useRouter } from 'next/navigation';
import { useUrlParams } from '@/hooks/useUrlParams';
import { useDebounced } from '@/hooks/useDebounced';
import { ChurchFilters } from '@/components/ChurchFilters';

export default function Page() {
  const router = useRouter();
  const { data: user, isLoading } = useMe();
  const redirected = React.useRef(false);
  const { filters, updateParams, clearFilters } = useUrlParams();
  
  // Internal state for search input (for immediate UI feedback)
  const [searchValue, setSearchValue] = useState(filters.name || '');
  
  // Debounce search input to reduce API calls
  const debouncedSearch = useDebounced(searchValue, 300);
  
  // Update URL when debounced search changes
  React.useEffect(() => {
    if (debouncedSearch !== filters.name) {
      updateParams({ name: debouncedSearch || undefined });
    }
  }, [debouncedSearch, filters.name, updateParams]);
  
  // Sync search input with URL params (for browser back/forward)
  React.useEffect(() => {
    if (filters.name !== searchValue) {
      setSearchValue(filters.name || '');
    }
  }, [filters.name]);
  
  // Always call hooks first, before any conditional logic
  const { data } = useChurches(filters as any);
  const { data: stats } = useStatistics();
  
  const isAdmin = React.useMemo(() => {
    return user?.role === ROLES.ADMIN || user?.role === ROLES.PASTOR;
  }, [user?.role]);

  const churches = data?.data || [];

  const perPage = useMemo(() => {
    return data?.per_page || 10;
  }, [data]);
  
  const currentPage = filters.page || 1;

  React.useEffect(() => {
    if (!isLoading && user && !isAdmin && !redirected.current) {
      redirected.current = true;
      router.replace('/d/fellowships');
    }
  }, [isLoading, user, isAdmin, router]);

  // Show loading while checking user permissions
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Don't render if user is not admin
  if (user && !isAdmin) {
    return null;
  }

  return (
    <div className='flex-1 flex p-4 sm:p-6 w-full flex-col sm:gap-6 gap-4 bg-[#fafafa]'>
      <div className='flex gap-6 flex-col sm:flex-row'>
        <div className='flex-auto'>
          <ChurchChart />
        </div>
        <div className='flex-1 sm:min-w-[400px] w-auto'>
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
                value: stats?.workers || 0,
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
             placeholder='Search by church name'
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
          onNextPage={() => updateParams({ page: currentPage + 1 })}
          hasNextPage={data?.next_page_url !== null}
          onPreviousPage={() => updateParams({ page: Math.max(1, currentPage - 1) })}
          hasPreviousPage={data?.prev_page_url !== null}
          page={currentPage}
          totalPages={data?.last_page}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          filterComponent={
            <ChurchFilters
              country={filters.country}
              onCountryChange={(country) => updateParams({ country })}
              onClear={clearFilters}
            />
          }
        />
      </div>
    </div>
  );
}
