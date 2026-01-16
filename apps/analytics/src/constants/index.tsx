
import React from 'react';

export const COLORS = {
  bg: '#F8F9FA',
  gold: '#CCA856',
  red: '#E74C3C',
  slate: '#64748b',
  border: '#F1F3F5',
  dark: '#2D3E50' // Slightly bluer dark from the image
};

export const Logo = ({ className = "" }: { className?: string }) => (
  <div className={`flex flex-col ${className} relative`}>
    <div className="flex items-center justify-between w-full pr-4">
      <span className="text-[17px] font-[900] tracking-[0.05em] text-[#1A1C1E] uppercase">
        Saints Community
      </span>
      <div className="flex gap-1 mb-6">
        <div className="w-2.5 h-2.5 rounded-full bg-[#E74C3C]"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-[#CCA856] -translate-y-1"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-[#E2E8F0]"></div>
      </div>
    </div>
    <div className="flex justify-end pr-4 -mt-4">
      <span className="text-[13px] font-bold text-[#E74C3C] italic lowercase opacity-80">Database</span>
    </div>
  </div>
);

