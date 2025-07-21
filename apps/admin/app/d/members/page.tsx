'use client';
import { AddNewMemberSheet } from '@/components/AddNewMember';
import { ChurchChart } from '@/components/church-graph';
import { ListLinkSection } from '@/components/ListLinkSection';
import { TableCard } from '@/components/TableCard';
import { Church, ListCheck, User, User2, Users2 } from 'lucide-react';

export default function Page() {
  return (
    <div className='flex-1 flex p-6 w-full flex-col gap-6 bg-[#fafafa]'>
      <div className='flex gap-6'>
        <div className='flex-auto'>
          <ChurchChart />
        </div>
        <div className='flex-1 min-w-[400px]'>
          <ListLinkSection
            list={[
              {
                title: 'Pastors:',
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
                value: 4000,
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
          title='Churches List'
          action={<AddNewMemberSheet />}
          data={[]}
          columnKeys={[
            {
              name: 'name',
              title: 'Name',
            },
            {
              name: 'location',
              title: 'Location',
            },
            {
              name: 'pastor',
              title: 'Pastor',
            },
          ]}
          searchKeys={['location']}
          pathName='d/members'
        />
      </div>
    </div>
  );
}
