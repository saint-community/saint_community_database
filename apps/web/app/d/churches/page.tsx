'use client';
import { AddNewChurchSheet } from '@/components/AddNewChurch';
import { ChurchChart } from '@/components/church-graph';
import { ListLinkSection } from '@/components/ListLinkSection';
import { TableCard } from '@/components/TableCard';
import { Church, ListCheck, User2, Users2 } from 'lucide-react';

export default function Page() {
  const onAddAChurch = () => {};
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
                value: 5,
                icon: <Church size={24} className='stroke-red-500' />,
              },
              {
                title: 'Total no of Fellowships/PCFs:',
                value: 5,
                icon: <ListCheck size={24} className='stroke-red-500' />,
              },
              {
                title: 'Total no of Cells:',
                value: 5,
                icon: <Users2 size={24} className='stroke-red-500' />,
              },
              {
                title: 'Total members:',
                value: 5,
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
          data={data}
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
        />
      </div>
    </div>
  );
}

const data = [
  {
    id: 'tstss',
    name: 'm5gr84i9',
    location: 'success',
    pastor: 'ken99',
  },
  {
    id: 'tstss',
    name: '3u1reuv4',
    location: 'success',
    pastor: 'Abe45',
  },
  {
    id: 'tstss',
    name: 'derv1ws0',
    location: 'processing',
    pastor: 'Monserrat44',
  },
  {
    id: 'tstss',
    name: '5kma53ae',
    location: 'success',
    pastor: 'Silas22',
  },
  {
    id: 'tstss',
    name: 'bhqecj4p',
    location: 'failed',
    pastor: 'carmella',
  },
  {
    id: 'tstss',
    name: '3u1reuv4',
    location: 'success',
    pastor: 'Abe45',
  },
  {
    id: 'tstss',
    name: 'derv1ws0',
    location: 'processing',
    pastor: 'Monserrat44',
  },
  {
    id: 'tstss',
    name: '5kma53ae',
    location: 'success',
    pastor: 'Silas22',
  },
  {
    id: 'tstss',
    name: 'bhqecj4p',
    location: 'failed',
    pastor: 'carmella',
  },
  {
    id: 'tstss',
    name: '3u1reuv4',
    location: 'success',
    pastor: 'Abe45',
  },
  {
    id: 'tstss',
    name: 'derv1ws0',
    location: 'processing',
    pastor: 'Monserrat44',
  },
  {
    id: 'tstss',
    name: '5kma53ae',
    location: 'success',
    pastor: 'Silas22',
  },
  {
    id: 'tstss',
    name: 'bhqecj4p',
    location: 'failed',
    pastor: 'carmella',
  },
  {
    id: 'tstss',
    name: '3u1reuv4',
    location: 'success',
    pastor: 'Abe45',
  },
  {
    id: 'tstss',
    name: 'derv1ws0',
    location: 'processing',
    pastor: 'Monserrat44',
  },
  {
    id: 'tstss',
    name: '5kma53ae',
    location: 'success',
    pastor: 'Silas22',
  },
  {
    id: 'tstss',
    name: 'bhqecj4p',
    location: 'failed',
    pastor: 'carmella',
  },
];
