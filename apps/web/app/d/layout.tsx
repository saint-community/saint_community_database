'use client';
import { SidebarProvider } from '@workspace/ui/components/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { MainContent } from '@/components/main-content';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <MainContent>{children}</MainContent>
    </SidebarProvider>
  );
}
