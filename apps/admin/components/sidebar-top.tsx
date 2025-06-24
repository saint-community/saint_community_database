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
import { getRouteNameFromPath } from './app-sidebar';
import { useMe } from '@/hooks/useMe';

export const SideBarTop = () => {
  const pathname = usePathname();
  const { data } = useMe();

  return (
    <div className='bg-white flex-row flex items-center w-full justify-between'>
      <Image src={decoration} alt='' />
      <p className='text-[38px] font-light'>{getRouteNameFromPath(pathname)}</p>
      <div className='flex items-center'>
        <div className='cursor-pointer text-primary'>
          <Bell size={32} />
        </div>
        <div className='h-[33px] mx-[33px] w-[0.5px] bg-[#D6B978]' />
        <div className='flex items-center pr-[18px] gap-5'>
          <Avatar className='w-12 h-12'>
            <AvatarImage src='https://github.com/shadcn.png' />
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
          <div>
            <p className='text-lg font-medium'>{data?.name}</p>
            <p className='text-[#705C2F] text-xs'>{data?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
