'use client';

import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  variant?: 'default' | 'gold' | 'red' | 'green';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  variant = 'default'
}) => {
  const variantStyles = {
    default: "text-[#2D3E50] group-hover:bg-[#CCA856] group-hover:text-white",
    gold: "text-[#CCA856] bg-gold/5 border-gold/10",
    red: "text-[#E74C3C] bg-red-50 border-red-100",
    green: "text-green-600 bg-green-50 border-green-100"
  };

  return (
    <div className="bg-white p-6 rounded border border-slate-200 shadow-sm hover:shadow-md transition-all group">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded transition-colors border ${variantStyles[variant]}`}>
            {icon}
          </div>
          <div className="flex flex-col">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{title}</p>
            <h3 className="text-2xl font-black text-[#1A1C1E] mt-0.5">{value}</h3>
          </div>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded ${
            trend.startsWith('+') 
              ? 'bg-green-50 text-green-600 border border-green-100' 
              : 'bg-red-50 text-red-600 border border-red-100'
          }`}>
            {trend}
          </div>
        )}
      </div>
    </div>
  );
};