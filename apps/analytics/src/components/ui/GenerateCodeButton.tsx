'use client';

import { Plus, Heart } from 'lucide-react';
import { cn } from '@/libutils';

interface GenerateCodeButtonProps {
  className?: string;
  onClick?: () => void;
}

export function GenerateCodeButton({ className, onClick }: GenerateCodeButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
        className
      )}
    >
      <Plus className="w-5 h-5" />
      <span className="font-medium">Generate Code</span>
    </button>
  );
}