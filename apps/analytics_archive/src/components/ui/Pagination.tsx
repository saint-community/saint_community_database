'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/libutils';

interface PaginationProps {
  className?: string;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function Pagination({ 
  className,
  currentPage = 1,
  totalPages = 10,
  onPageChange 
}: PaginationProps): React.JSX.Element {
  const pages = [];
  
  // Show first few pages
  for (let i = 1; i <= Math.min(5, totalPages); i++) {
    pages.push(i);
  }
  
  // Show ellipsis if needed
  if (totalPages > 7) {
    pages.push('...');
    pages.push(totalPages);
  } else if (totalPages > 5) {
    for (let i = 6; i <= totalPages; i++) {
      pages.push(i);
    }
  }

  return (
    <div className={cn(
      'flex items-center justify-center gap-3',
      className
    )}>
      <button
        onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="p-2 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages.map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === 'number' ? onPageChange?.(page) : undefined}
          disabled={page === '...'}
          className={cn(
            'min-w-[32px] h-8 px-2 border rounded text-sm font-medium',
            page === currentPage
              ? 'border-blue-500 bg-white text-blue-600'
              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
            page === '...' && 'cursor-default hover:bg-white'
          )}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange?.(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="p-2 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}