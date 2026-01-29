'use client';
import { AddNewWorkerSheet } from '@/components/AddNewWorker';
import { ChurchChart } from '@/components/church-graph';
import { ListLinkSection } from '@/components/ListLinkSection';
import { TableCard } from '@/components/TableCard';
import { WorkerFilters } from '@/components/WorkerFilters';
import { useStatistics } from '@/hooks/statistics';
import { useMe } from '@/hooks/useMe';
import { useWorkers } from '@/hooks/workers';
import { useWorkerUrlParams } from '@/hooks/useWorkerUrlParams';
import { useDebounced } from '@/hooks/useDebounced';
import { Church, ListCheck, Search, User, Users2 } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { ROLES } from '@/utils/constants';
import _ from 'lodash';

export default function Page() {
  const { data: user } = useMe();
  const { data: stats } = useStatistics();
  const { filters, updateParams, clearFilters } = useWorkerUrlParams();
  
  // Internal state for search inputs (for immediate UI feedback)
  const [nameSearchValue, setNameSearchValue] = useState('');
  const [phoneSearchValue, setPhoneSearchValue] = useState(filters.phone || '');
  
  // Debounce search inputs to reduce API calls
  const debouncedNameSearch = useDebounced(nameSearchValue, 300);
  const debouncedPhoneSearch = useDebounced(phoneSearchValue, 300);
  
  // Update URL when debounced searches change
  useEffect(() => {
    if (debouncedNameSearch !== filters.name) {
      updateParams({ name: debouncedNameSearch || undefined });
    }
  }, [debouncedNameSearch, filters.name, updateParams]);
  
  // useEffect(() => {
  //   if (debouncedPhoneSearch !== filters.phone) {
  //     updateParams({ phone: debouncedPhoneSearch || undefined });
  //   }
  // }, [debouncedPhoneSearch, filters.phone, updateParams]);
  
  // Sync search inputs with URL params (for browser back/forward)
  useEffect(() => {
    if (filters.name !== nameSearchValue) {
      setNameSearchValue(filters.name || '');
    }
  }, [filters.name]);
  
  // useEffect(() => {
  //   if (filters.phone !== phoneSearchValue) {
  //     setPhoneSearchValue(filters.phone || '');
  //   }
  // }, [filters.phone]);


  // Apply role-based filter defaults
  const effectiveFilters = useMemo(() => {
    const baseFilters = { ...filters };
    
    // Map URL param names to API param names
    const apiFilters = {
      church_id: baseFilters.church,
      fellowship_id: baseFilters.fellowship,
      cell_id: baseFilters.cell,
      department_id: baseFilters.department,
      // name: baseFilters.name,
      phone: baseFilters.phone,
      gender: baseFilters.gender,
      status: baseFilters.status,
      page: baseFilters.page,
      name: nameSearchValue || undefined,
    };
   
   
    
    // console.log('Workers Page - Effective filters passed to useWorkers:', apiFilters);
    return _.omitBy(apiFilters, (value) => value === '' || value === undefined);
  }, [filters, user]);

  const { data: workers } = useWorkers(effectiveFilters);
 
  
  const workersData = workers || [];
  const currentPage = filters.page || 1;

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
            ]}
          />
        </div>
      </div>
      <div className=''>
        <TableCard
          title='Workers List'
          action={<AddNewWorkerSheet page={currentPage} church_id={user?.church_id} />}
          data={workersData}
          placeholder='Search by name'
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
          onNextPage={() => updateParams({ page: currentPage + 1 })}
          hasNextPage={workers?.next_page_url !== null}
          onPreviousPage={() => updateParams({ page: Math.max(1, currentPage - 1) })}
          hasPreviousPage={workers?.prev_page_url !== null}
          page={currentPage}
          totalPages={workers?.last_page}
          // Remove default search since we have comprehensive filters
          searchValue={nameSearchValue}
          onSearchChange={setNameSearchValue}
          filterComponent={
            // Show filters for ADMIN and PASTOR roles (same pattern as other pages)
            (user?.role === ROLES.ADMIN || user?.role === ROLES.PASTOR) ? (
              <WorkerFilters
             setNameSearchValue={setNameSearchValue}
           
              />
            ) : undefined
          }
        />
      </div>
    </div>
  );
}
