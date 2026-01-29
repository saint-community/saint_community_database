'use client';
import { AddNewFellowshipSheet } from '@/components/AddNewFellowship';
import { ChurchChart } from '@/components/church-graph';
import { ListLinkSection } from '@/components/ListLinkSection';
import { TableCard } from '@/components/TableCard';
import { useFellowships } from '@/hooks/fellowships';
import { useStatistics } from '@/hooks/statistics';
import { useMe } from '@/hooks/useMe';
import { ROLES } from '@/utils/constants';
import { ListCheck, User, Users2 } from 'lucide-react';
import { redirect } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';
import { useFellowshipUrlParams } from '@/hooks/useFellowshipUrlParams';
import { useDebounced } from '@/hooks/useDebounced';
import { FellowshipFilters } from '@/components/FellowshipFilters';

export default function Page() {
  const { data: user } = useMe();
  const { filters, updateParams, clearFilters } = useFellowshipUrlParams();
  
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

  // For non-admin users, always filter by their church
  const effectiveFilters = useMemo(() => {
    const baseFilters = { ...filters };
    
    // If user is not admin and has no church filter, use their church
    if (user && 
        ![ROLES.ADMIN, ROLES.PASTOR].includes(user.role) && 
        !baseFilters.church && 
        user.church_id) {
      baseFilters.church = user.church_id.toString();
    }
    
    return baseFilters;
  }, [filters, user]);

  const { data } = useFellowships(effectiveFilters);

  const isAdmin =
    user?.role === ROLES.ADMIN ||
    user?.role === ROLES.PASTOR ||
    user?.role === ROLES.CHURCH_PASTOR;

  if (user && !isAdmin) {
    redirect('/d/cells');
  }

  const fellowships = data?.data || [];
  const currentPage = filters.page || 1;

  const { data: stats } = useStatistics();

  const perPage = useMemo(() => {
    return data?.per_page || 10;
  }, [data]);

  return (
    <div className='flex-1 flex p-4 sm:p-6 w-full flex-col sm:gap-6 gap-4 bg-[#fafafa]'>
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
          title='Fellowships List'
          action={<AddNewFellowshipSheet />}
          data={fellowships}
          placeholder='Search by fellowship name'
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
              <FellowshipFilters
                church={filters.church}
                onChurchChange={(church) => updateParams({ church })}
                onClear={clearFilters}
              />
            ) : undefined
          }
        />
      </div>
    </div>
  );
}
