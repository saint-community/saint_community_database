'use client';
import Link from 'next/link';
import { cn } from '@workspace/ui/lib/utils';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { Settings, IdCard, LineChart, ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useMe } from '@/hooks/useMe';
import { ROLES } from '@/utils/constants';

// export const metadata: Metadata = {
//   title: 'Settings',
//   description: 'Manage your account settings and preferences.',
// };

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: user } = useMe();
  const hideUsers =
    !!user &&
    ![ROLES.ADMIN, ROLES.PASTOR, ROLES.CHURCH_PASTOR].includes(user?.role);

  // const hidePrayerGroup = !!user && user?.role !== ROLES.ADMIN;

  const sidebarNavItems = [
    {
      title: 'General',
      href: '/d/settings/general',
      icon: Settings,
    },
    ...(!hideUsers
      ? [
          {
            title: 'Manage Users',
            href: '/d/settings/users',
            icon: IdCard,
          },
        ]
      : []),
    ...(!hideUsers
      ? [
          {
            title: 'Prayer Group',
            href: '/d/settings/prayer-group',
            icon: LineChart,
          },
        ]
      : []),
    // {
    //   title: 'Notifications',
    //   href: '/d/settings/notifications',
    //   icon: Bell,
    // },
    //   {
    //     title: 'Security',
    //     href: '/d/settings/security',
    //     icon: Shield,
    //   },
    //   {
    //     title: 'Billing',
    //     href: '/d/settings/billing',
    //     icon: CreditCard,
    //   },
    //   {
    //     title: 'Help & Support',
    //     href: '/d/settings/help',
    //     icon: HelpCircle,
    //   },
  ];

  return (
    <div className='flex h-full flex-col md:flex-row'>
      {/* Sidebar */}
      <div className='w-full md:w-64 border-r border-b md:border-b-0 bg-white'>
        <div className='p-4 md:p-6'>
          <h2 className='text-lg font-semibold'>Settings</h2>
          <p className='text-sm text-muted-foreground hidden md:block'>
            Manage your account settings and preferences.
          </p>
        </div>
        <ScrollArea className='h-auto md:h-[calc(100vh-8rem)]'>
          <div className='flex md:flex-col md:space-y-1 space-x-1 md:space-x-0 p-2 overflow-x-auto md:overflow-x-visible'>
            {sidebarNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 md:gap-3 rounded-lg px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground py-3 md:py-4 whitespace-nowrap md:whitespace-normal min-w-fit',
                  pathname === item.href
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground'
                )}
              >
                <item.icon className='h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0' />
                <span className='hidden sm:inline'>{item.title}</span>
                <ChevronRight className='ml-auto h-3 w-3 md:h-4 md:w-4 hidden md:block' />
              </Link>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className='flex-1 overflow-auto bg-white'>
        <div className='container max-w-5xl p-0 md:p-6'>{children}</div>
      </div>
    </div>
  );
}
