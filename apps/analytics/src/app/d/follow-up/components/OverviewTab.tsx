'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import StatCard from './stat-card';
import GrowthChart from './growth-card';
import { getFollowUpStats, FollowUpStats } from '@/services/followUp';

export default function OverviewTab(): React.JSX.Element {
  const [stats, setStats] = useState<FollowUpStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getFollowUpStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch follow-up stats:', err);
        setError('Failed to load statistics');
        // Set fallback data to prevent crashes
        setStats({
          total_reports: 0,
          total_members_followed: 0,
          total_sessions_conducted: 0,
          total_hours_invested: 0,
          total_workers_involved: 0,
          average_session_duration: 0,
          reports_by_status: { draft: 0, completed: 0, reviewed: 0, archived: 0 },
          progress_distribution: { beginner: 0, intermediate: 0, advanced: 0, mature: 0 },
          method_distribution: { in_person: 0, phone_call: 0, video_call: 0, text_message: 0, other: 0 },
          monthly_growth: [],
          top_performing_workers: [],
          fellowship_stats: []
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading statistics...</div>
      </div>
    );
  }

  const retentionRate = stats?.total_members_followed && stats?.total_sessions_conducted 
    ? Math.round((stats.total_sessions_conducted / stats.total_members_followed) * 100)
    : 0;
  
  const completionRate = stats?.reports_by_status 
    ? Math.round((stats.reports_by_status.completed / (stats.total_reports || 1)) * 100)
    : 0;

  return (
    <>
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Active Follow-Ups" 
          value={(stats?.total_members_followed || 0).toString()} 
          icon="👥" 
          bgColor="bg-blue-50" 
          iconBg="bg-blue-100" 
        />
        <StatCard 
          title="Completed Discipleship" 
          value={(stats?.reports_by_status?.completed || 0).toString()} 
          icon="📚" 
          bgColor="bg-green-50" 
          iconBg="bg-green-100" 
        />
        <StatCard 
          title="Total Sessions" 
          value={(stats?.total_sessions_conducted || 0).toString()} 
          icon="⭐" 
          bgColor="bg-yellow-50" 
          iconBg="bg-yellow-100" 
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 border border-border">
          <div className="flex items-baseline gap-4 mb-2">
            <h3 className="text-sm font-semibold text-muted-foreground">RETENTION RATE</h3>
            <span className="text-green-500 text-sm font-semibold">{retentionRate}%</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-foreground">{stats?.total_sessions_conducted || 0}</span>
            <span className="text-sm text-muted-foreground">/ {stats?.total_members_followed || 0} Active Members</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-border">
          <div className="flex items-baseline gap-4 mb-2">
            <h3 className="text-sm font-semibold text-muted-foreground">COMPLETION RATE</h3>
            <span className="text-amber-500 text-sm font-semibold">{completionRate}%</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-foreground">{stats?.reports_by_status?.completed || 0}</span>
            <span className="text-sm text-muted-foreground">/ {stats?.total_reports || 0} Total Reports</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg p-6 border border-border">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-1">MONTHLY PROGRESS TREND</h3>
            <p className="text-sm text-muted-foreground">ACTIVE FOLLOW-UPS VS COMPLETIONS</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-xs font-semibold text-foreground">ACTIVE</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-xs font-semibold text-foreground">COMPLETED</span>
            </div>
            <select className="text-sm font-semibold text-foreground border border-border rounded px-2 py-1">
              <option>2024</option>
              <option>2023</option>
            </select>
          </div>
        </div>
        <GrowthChart />
      </div>
    </>
  );
}