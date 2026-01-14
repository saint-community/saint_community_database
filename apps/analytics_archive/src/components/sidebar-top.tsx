'use client';
import * as React from 'react';
import { usePathname } from 'next/navigation';
import { Bell, Settings } from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@workspace/ui/components/avatar';
import { useMe } from '@/src/hooks/useMe';

export const SideBarTop = (): React.JSX.Element => {
  const pathname = usePathname();
  // const { data } = useMe();
  const data = {}

  return (
    <div className='flex-row flex items-center w-full justify-between p-2 sm:p-0'>
      <div className='flex items-center gap-4 md:0 ml-4'>
        <Avatar className='sm:w-12 sm:h-12 w-12 h-12'>
          <AvatarImage src='https://github.com/shadcn.png' />
          {/* <AvatarFallback>{data?.name?.charAt(0) || ''}</AvatarFallback> */}
        </Avatar>
        <div>
          {/* <p className='text-lg font-medium'>{data?.name}</p> */}
          {/* <p className='text-[#705C2F] text-xs'>{data?.email}</p> */}
        </div>
      </div>
      <div className='flex sm:hidden' />
      <div className='flex items-center gap-4'>
        <div className='cursor-pointer'>
          <Bell className='w-6 h-6 sm:w-8 sm:h-8' />
        </div>
        <div className='cursor-pointer'>
          <Settings className='w-6 h-6 sm:w-8 sm:h-8' />
        </div>
      </div>
    </div>
  );
};
