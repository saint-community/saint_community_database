'use client';

import React from 'react';
import { StatCard } from './StatCard';
import { Music, BookOpen, Users, Home, Flame, Sparkles, TrendingUp, CheckCircle2 } from 'lucide-react';

export const OverviewTab: React.FC = () => {
  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Sunday Service" value="450" icon={<Music size={18} />} variant="default" trend="+5%" />
        <StatCard title="Midweek Service" value="280" icon={<BookOpen size={18} />} variant="default" trend="+2%" />
        <StatCard title="Fellowship Meeting" value="120" icon={<Users size={18} />} variant="default" />
        <StatCard title="Cell Meeting" value="85" icon={<Home size={18} />} variant="default" />
        <StatCard title="Charis Campmeeting" value="1,200" icon={<Flame size={18} />} variant="gold" />
        <StatCard title="Believers Convention" value="950" icon={<Sparkles size={18} />} variant="gold" />
        <StatCard title="World Changers" value="1,100" icon={<TrendingUp size={18} />} variant="gold" />
        <StatCard title="Avg. Retention" value="78%" icon={<CheckCircle2 size={18} />} variant="green" />
      </div>
      <div className="bg-white p-8 rounded border border-slate-200 shadow-sm">
        {/* Chart placeholder - can be added later */}
        <div className="h-[350px] flex items-center justify-center text-slate-400">
          <p>Chart component can be added here</p>
        </div>
      </div>
    </div>
  );
};