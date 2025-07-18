'use client';
import { usePathname } from 'next/navigation';
import decoration from '@/assets/svgs/top-bar-decorate.svg';
import Image from 'next/image';
import { Bell } from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@workspace/ui/components/avatar';
import { useMe } from '@/hooks/useMe';
import { getRouteNameFromPath } from '@/utils/helper';

export const SideBarTop = () => {
  const pathname = usePathname();
  const { data } = useMe();

  return (
    <div className='bg-white flex-row flex items-center w-full justify-between p-4 sm:p-0'>
      <Image src={decoration} alt='' className='hidden sm:block' />
      <p className='sm:text-[38px] text-md font-light ml-[50px] sm:ml-0'>
        {getRouteNameFromPath(pathname)}
      </p>
      <div className='flex sm:hidden' />
      <div className='flex items-center'>
        <div className='cursor-pointer text-primary'>
          <Bell className='w-6 h-6 sm:w-8 sm:h-8' />
        </div>
        <div className='h-[33px] sm:mx-[33px] mx-4 w-[0.5px] bg-[#D6B978]' />
        <div className='flex items-center sm:pr-[18px] gap-5'>
          <Avatar className='sm:w-12 sm:h-12 w-8 h-8'>
            <AvatarImage src='https://github.com/shadcn.png' />
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
          <div className='hidden sm:block'>
            <p className='text-lg font-medium'>{data?.name}</p>
            <p className='text-[#705C2F] text-xs'>{data?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
