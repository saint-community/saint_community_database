'use client';
import { SidebarProvider } from '@workspace/ui/components/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { MainContent } from '@/components/main-content';
import { useEffect } from 'react';
import { useMe } from '@/hooks/useMe';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = useMe();
  const router = useRouter();

  useEffect(() => {
    if (!data && !isLoading) {
      router.push('/login');
    }
  }, [data, router, isLoading]);

  if (isLoading) {
    return (
      <div className='flex flex-col items-center justify-center min-h-svh'>
        <Loader2 className='animate-spin w-10 h-10 text-primary mb-2' />
        <p className='text-sm text-muted-foreground'>Setting things right...</p>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <MainContent>{children}</MainContent>
    </SidebarProvider>
  );
}
