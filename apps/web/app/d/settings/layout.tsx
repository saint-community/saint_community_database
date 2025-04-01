'use client';
import Link from 'next/link';
import { cn } from '@workspace/ui/lib/utils';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { Settings, IdCard, Bell, ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';

// export const metadata: Metadata = {
//   title: 'Settings',
//   description: 'Manage your account settings and preferences.',
// };

const sidebarNavItems = [
  {
    title: 'General',
    href: '/d/settings/general',
    icon: Settings,
  },
  {
    title: 'Manage Users',
    href: '/d/settings/users',
    icon: IdCard,
  },
  {
    title: 'Notifications',
    href: '/d/settings/notifications',
    icon: Bell,
  },
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

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className='flex h-full'>
      {/* Sidebar */}
      <div className='w-64 border-r bg-white'>
        <div className='p-6'>
          <h2 className='text-lg font-semibold'>Settings</h2>
          <p className='text-sm text-muted-foreground'>
            Manage your account settings and preferences.
          </p>
        </div>
        <ScrollArea className='h-[calc(100vh-8rem)]'>
          <div className='space-y-1 p-2'>
            {sidebarNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground py-4',
                  pathname === item.href
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground'
                )}
              >
                <item.icon className='h-5 w-5 text-primary' />
                {item.title}
                <ChevronRight className='ml-auto h-4 w-4' />
              </Link>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className='flex-1 overflow-auto bg-white'>
        <div className='container max-w-5xl py-6'>{children}</div>
      </div>
    </div>
  );
}
