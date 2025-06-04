'use client';
import { SidebarProvider } from '@workspace/ui/components/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { MainContent } from '@/components/main-content';
import { useEffect } from 'react';
import { useMe } from '@/hooks/useMe';
import { useRouter } from 'next/navigation';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = useMe();
  const router = useRouter();

  console.log({ data });

  useEffect(() => {
    if (!data && !isLoading) {
      router.push('/login');
    }
  }, [data, router, isLoading]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <MainContent>{children}</MainContent>
    </SidebarProvider>
  );
}
