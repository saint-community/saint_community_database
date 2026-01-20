'use client';

import * as React from 'react';
import { cn } from '@/libutils';

interface ActivityTabsProps {
  className?: string;
  activeTab?: 'prayer' | 'activity';
  onTabChange?: (tab: 'prayer' | 'activity') => void;
}

export function ActivityTabs({ 
  className, 
  activeTab = 'prayer',
  onTabChange 
}: ActivityTabsProps): React.JSX.Element {
  return (
    <div className={cn(
      'bg-gray-900 rounded-lg p-2 inline-flex',
      className
    )}>
      <button
        onClick={() => onTabChange?.('prayer')}
        className={cn(
          'px-4 py-2 rounded-lg text-sm font-semibold transition-colors',
          activeTab === 'prayer'
            ? 'bg-white text-gray-900'
            : 'text-gray-300 hover:text-white'
        )}
      >
        Prayer
      </button>
      <button
        onClick={() => onTabChange?.('activity')}
        className={cn(
          'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
          activeTab === 'activity'
            ? 'bg-white text-gray-900'
            : 'text-gray-300 hover:text-white'
        )}
      >
        Activity
      </button>
    </div>
  );
}