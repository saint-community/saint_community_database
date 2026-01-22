'use client';
import { useState } from 'react';

import { usePathname } from 'next/navigation';
import decoration from '@/assets/svgs/top-bar-decorate.svg';
import Image from 'next/image';
import { Bell, Building2, Check, ChevronDown, Loader2 } from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@workspace/ui/components/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { useMe } from '@/hooks/useMe';
import { getRouteNameFromPath } from '@/utils/helper';
import { switchChurch } from '@/services/auth';
import { ROLES } from '@/utils/constants';

export const SideBarTop = () => {
  const pathname = usePathname();
  const { data } = useMe();
  const [isSwitching, setIsSwitching] = useState(false);

  const isChurchPastor = data?.role === ROLES.CHURCH_PASTOR;
  const canSwitchChurches = isChurchPastor && data?.churches && data.churches.length > 0;

  const handleSwitchChurch = async (churchId: number) => {
    if (churchId === data?.church_id) return;

    setIsSwitching(true);
    try {
      await switchChurch(churchId);
      window.location.reload();
    } catch (error) {
      console.error('Failed to switch church:', error);
      setIsSwitching(false);
    }
  };

  return (
    <div className='bg-white flex-row flex items-center w-full justify-between p-4 sm:p-0'>
      <Image src={decoration} alt='' className='hidden sm:block' />
      <p className='sm:text-[38px] text-md font-light ml-[50px] sm:ml-0'>
        {getRouteNameFromPath(pathname)}
      </p>
      <div className='flex sm:hidden' />
      <div className='flex items-center'>
        {data?.church_name && (
          <>
            {canSwitchChurches ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  className='flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors focus:outline-none'
                  disabled={isSwitching}
                >
                  {isSwitching ? (
                    <Loader2 className='w-5 h-5 animate-spin text-primary' />
                  ) : (
                    <Building2 className='w-5 h-5 text-primary' />
                  )}
                  <span className='hidden sm:inline text-sm font-medium max-w-[150px] truncate'>
                    {data.church_name}
                  </span>
                  <ChevronDown className='w-4 h-4 text-gray-500' />
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-56'>
                  <DropdownMenuLabel>Switch Church</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {data.churches?.map((church) => (
                    <DropdownMenuItem
                      key={church.id}
                      onClick={() => handleSwitchChurch(church.church_id)}
                      className='cursor-pointer flex items-center justify-between'
                    >
                      <span>{church.church_name}</span>
                      {church.church_id === data?.church_id && (
                        <Check className='w-4 h-4 text-primary' />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className='flex items-center gap-2 px-3 py-2'>
                <Building2 className='w-5 h-5 text-primary' />
                <span className='hidden sm:inline text-sm font-medium max-w-[150px] truncate'>
                  {data.church_name}
                </span>
              </div>
            )}
            <div className='h-[33px] mx-4 w-[0.5px] bg-[#D6B978]' />
          </>
        )}
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
