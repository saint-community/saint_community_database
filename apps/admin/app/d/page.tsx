'use client';

import { ChurchChart } from '@/components/church-graph';
import { useStatistics } from '@/hooks/statistics';

export default function Page() {
  const { data: stats } = useStatistics();
  console.log(stats);

  return (
    <div className='flex-1 flex p-6 w-full flex-col gap-6'>
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
