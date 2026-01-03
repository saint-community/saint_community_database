'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/libutils';

interface FollowUpGroupSelectorProps {
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export function FollowUpGroupSelector({ 
  className, 
  value = "Weekly Follow-Up",
  onChange 
}: FollowUpGroupSelectorProps): React.JSX.Element {
  return (
    <div className={cn("relative", className)}>
      <button className="flex items-center justify-between gap-2 px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors w-full max-w-[319px]">
        <span className="text-2xl font-semibold text-gray-900">{value}</span>
        <ChevronDown className="w-6 h-6 text-gray-600" />
      </button>
    </div>
  );
}