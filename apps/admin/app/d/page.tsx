'use client';

import { ChurchChart } from '@/components/church-graph';
import { redirect } from 'next/navigation';

export default function Page() {
  return (
    <div className='flex-1 flex p-6 w-full flex-col gap-6 bg-[#fafafa]'>
      <div className='flex gap-6'>
        <div className='flex-auto'>
          <ChurchChart />
        </div>
        <div className='flex-auto'>
          <ChurchChart />
        </div>
      </div>
      <div className='flex gap-6'>
        <div className='flex-auto'>
          <ChurchChart />
        </div>
        <div className='flex-auto'>
          <ChurchChart />
        </div>
      </div>
      <div className='flex gap-6'>
        <div className='flex-auto'>
          <ChurchChart />
        </div>
        <div className='flex-auto'>
          <ChurchChart />
        </div>
      </div>
    </div>
  );
}
