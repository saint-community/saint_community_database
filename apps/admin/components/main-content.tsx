'use client';
import { useSidebar, SidebarTrigger } from '@workspace/ui/components/sidebar';
import { SideBarTop } from './sidebar-top';
import useWindowDimensions from '@workspace/ui/hooks/useWindowDimensions';
import { useMemo } from 'react';
import ConfirmDialog from './ConfirmAlertDialog';

export const MainContent = ({ children }: { children: React.ReactNode }) => {
  const sidebarData = useSidebar();
  const { width } = useWindowDimensions();

  const expandedWidth = useMemo(() => width - 256, [width]);

  const mainClass = useMemo(
    () =>
      `bg-[#EFE4CB] w-${sidebarData.state === 'expanded' ? `[${expandedWidth}px]` : 'svw'} flex-1`,
    [sidebarData.state, expandedWidth]
  );

  return (
    <main className={'relative flex flex-col w-full'}>
      <SidebarTrigger className='absolute' />
      <SideBarTop />
      <div className={mainClass}>{children}</div>
      <ConfirmDialog  />
    </main>
  );
};
