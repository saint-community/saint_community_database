'use client';

import { redirect } from 'next/navigation';

export default function Page() {
  // redirect to churches
  redirect('/d/churches');
  // return (
  //   <div className='flex-1 flex p-4 sm:p-6 w-full flex-col sm:gap-6 gap-4'>
  //     <div className='flex sm:flex-row flex-col gap-6'>
  //       <div className='flex-auto'>
  //         <ChurchChart />
  //       </div>
  //       <div className='flex-auto'>
  //         <ChurchChart />
  //       </div>
  //     </div>
  //     <div className='flex sm:flex-row flex-col gap-6'>
  //       <div className='flex-auto'>
  //         <ChurchChart />
  //       </div>
  //       <div className='flex-auto'>
  //         <ChurchChart />
  //       </div>
  //     </div>
  //     <div className='flex sm:flex-row flex-col gap-6'>
  //       <div className='flex-auto'>
  //         <ChurchChart />
  //       </div>
  //       <div className='flex-auto'>
  //         <ChurchChart />
  //       </div>
  //     </div>
  //   </div>
  // );
}
