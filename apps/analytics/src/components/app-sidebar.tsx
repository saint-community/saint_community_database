'use client';
import {
  Settings,
  Church,
  LogOut,
  Folder,
  ListCheck,
  LineChart,
  User2,
  LayoutDashboard,
  UserCheck,
} from 'lucide-react';
import Logo from '@/src/assets/svgs/logo.svg';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@workspace/ui/components/sidebar';
import Image from 'next/image';
import Link from 'next/link';

const mainItems = [
  {
    title: 'Dashboard',
    url: '/d',
    icon: LayoutDashboard,
  },
  {
    title: 'Analytics',
    url: '/d/analytics',
    icon: Folder,
  },
  {
    title: 'Church meetings',
    url: '/d/church-meetings',
    icon: ListCheck,
  },
  {
    title: 'Prayer',
    url: '/d/prayer',
    icon: LineChart,
  },
  {
    title: 'Study Group',
    url: '/d/study-group',
    icon: User2,
  },
  {
    title: 'Evangelism',
    url: '/d/evangelism',
    icon: Church,
  },
  {
    title: 'Follow Up',
    url: '/d/follow-up',
    icon: UserCheck,
  },
  {
    title: 'Settings',
    url: '/d/settings/general',
    icon: Settings,
  },
  {
    title: 'Sign Out',
    url: '#',
    icon: LogOut,
    isSignOut: true,
  },
];

export function AppSidebar() {
  const { isMobile, toggleSidebar } = useSidebar();

  const signOutUser = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <Sidebar className='h-dvh shadow-xl'>
      <SidebarContent className='bg-white border-white shadow-2xl'>
        <SidebarGroup className='gap-5'>
          <SidebarHeader className=''>
            {/* <SidebarGroupLabel>Application</SidebarGroupLabel> */}
            <div className='flex flex-col items-center '>
              <div className='flex flex-col items-end'>
                <Image src={Logo} alt='Logo' />
                <span className='text-red-500 text-xs place-self-end mt-[-5px]'>
                  Analytics
                </span>
              </div>
            </div>
          </SidebarHeader>
          <SidebarGroupContent className='mt-8'>
            <SidebarMenu className='gap-3'>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className='rounded-none px-4 h-[56px]'
                  >
                    <Link
                      href={item.url}
                      className='text-lg'
                      onClick={() => {
                        if (item.isSignOut) {
                          signOutUser();
                        }

                        if (isMobile) {
                          toggleSidebar();
                        }
                      }}
                    >
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
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
