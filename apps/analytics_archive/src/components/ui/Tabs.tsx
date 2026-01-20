'use client';

import * as React from 'react';
import { cn } from '@/libutils';

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
  tabsClassName?: string;
  contentClassName?: string;
}

export function Tabs({
  tabs,
  defaultTab,
  className,
  tabsClassName,
  contentClassName,
}: TabsProps): React.JSX.Element {
  const [activeTab, setActiveTab] = React.useState(defaultTab || tabs[0]?.id);

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className={cn('w-full', className)}>
      {/* Tab Headers */}
      <div className={cn('flex gap-8 mb-8 border-b border-border', tabsClassName)}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'pb-4 px-1 text-sm font-semibold transition-colors relative',
              activeTab === tab.id
                ? 'text-foreground border-b-2 border-red-500'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className={cn('w-full', contentClassName)}>
        {activeTabContent}
      </div>
    </div>
  );
}