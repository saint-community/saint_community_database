
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
    <div className="flex items-center justify-between w-full">
      <span className="text-[17px] font-[900] tracking-[0.05em] text-[#1A1C1E] uppercase leading-tight">
        Saints<br />Community<br />Church
      </span>
    </div>
  </div>
);

