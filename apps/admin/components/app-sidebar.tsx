'use client';
import {
  Settings,
  Church,
  User2,
  Users2,
  ListCheck,
  LayoutDashboard,
  LogOut,
  Settings2,
} from 'lucide-react';
import Logo from '@/assets/svgs/logo.svg';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@workspace/ui/components/sidebar';
import Image from 'next/image';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@workspace/ui/components/avatar';
import Link from 'next/link';
import { useMe } from '@/hooks/useMe';
import { ROLES } from '@/utils/constants';
import { useMemo } from 'react';

const otherItems = [
  {
    title: 'Settings',
    url: '/d/settings/general',
    icon: Settings,
  },
  {
    title: 'Advanced',
    url: '/d/registration-requests?status=pending',
    icon: Settings2,
  },
  {
    title: 'Sign Out',
    url: '#',
    icon: LogOut,
    isSignOut: true,
  },
];

export function AppSidebar() {
  const { data } = useMe();
  const hideChurch =
    !!data && ![ROLES.ADMIN, ROLES.PASTOR].includes(data?.role);

  const hideFellowship =
    !!data &&
    ![ROLES.ADMIN, ROLES.PASTOR, ROLES.CHURCH_PASTOR].includes(data?.role);

  const hideCells =
    !!data &&
    ![
      ROLES.ADMIN,
      ROLES.PASTOR,
      ROLES.CHURCH_PASTOR,
      ROLES.FELLOWSHIP_LEADER,
    ].includes(data?.role);

  // Menu items.
  const mainItems = useMemo(() => {
    const items = [
      {
        title: 'Dashboard',
        url: '/d',
        icon: LayoutDashboard,
      },
      ...(!hideChurch
        ? [
            {
              title: 'Churches',
              url: '/d/churches',
              icon: Church,
            },
          ]
        : []),
      ...(!hideFellowship
        ? [
            {
              title: 'Fellowships/PCF',
              url: '/d/fellowships',
              icon: ListCheck,
            },
          ]
        : []),
      ...(!hideCells
        ? [
            {
              title: 'Cells',
              url: '/d/cells',
              icon: Users2,
            },
          ]
        : []),
      {
        title: 'Workers in Training',
        url: '/d/workers',
        icon: User2,
      },
      {
        title: 'Members',
        url: '/d/members',
        icon: User2,
      },
    ];

    return items;
  }, [hideChurch, hideFellowship, hideCells]);
  return (
    <Sidebar className='h-dvh'>
      <SidebarContent>
        <SidebarGroup className='p-0'>
          <SidebarHeader className='pt-20'>
            {/* <SidebarGroupLabel>Application</SidebarGroupLabel> */}
            <div className='flex flex-col items-center pb-12'>
              <div>
                <Image src={Logo} alt='Logo' />
                <p className='text-[#B91507] text-xs place-self-end mt-[-5px]'>
                  Database
                </p>
              </div>
              <Avatar className='w-[100px] h-[100px] mt-12 mb-4'>
                <AvatarImage src='https://github.com/shadcn.png' alt='@user' />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <b className='text-[19px] font-medium m-0 p-0'>{data?.name}</b>
              <p className='text-sm m-0 p-0'>{data?.email}</p>
            </div>
          </SidebarHeader>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className='rounded-none px-4 h-[56px]'
                  >
                    <Link href={item.url} className=''>
                      <item.icon
                        size={24}
                        fontSize={24}
                        className='stroke-[#B91507]'
                      />
                      <span className='text-sm'>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
            <div className='h-[1.5px] bg-[#705C2F] my-6 w-full' />
            <SidebarMenu>
              {otherItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className='rounded-none px-4 h-[56px]'
                  >
                    <Link
                      href={item.url}
                      onClick={() => {
                        if (item.isSignOut) {
                          localStorage.clear();
                          location.reload();
                        }
                      }}
                    >
                      <item.icon size={24} className='stroke-[#B91507]' />
                      <span className='text-sm'>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
