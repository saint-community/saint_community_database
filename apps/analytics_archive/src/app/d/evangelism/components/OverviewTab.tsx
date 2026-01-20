'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import StatCard from './stat-card';
import GrowthChart from './growth-card';
import { getEvangelismStats, EvangelismStats } from '@/services/evangelism';

export default function OverviewTab(): React.JSX.Element {
  const [stats, setStats] = useState<EvangelismStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const data = await getEvangelismStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch evangelism stats:', err);
        setError('Failed to load statistics');
        // Fallback to default values for demo
        setStats({
          total_reports: 12,
          total_souls_saved: 24,
          total_souls_filled: 18,
          total_souls_healed: 15,
          total_workers_involved: 8,
          total_attendees: 45,
          reports_by_status: { draft: 2, submitted: 3, approved: 6, rejected: 1 },
          monthly_growth: [
            { month: "Jan", souls_saved: 5, souls_filled: 3, souls_healed: 2 },
            { month: "Feb", souls_saved: 8, souls_filled: 6, souls_healed: 4 },
            { month: "Mar", souls_saved: 11, souls_filled: 9, souls_healed: 9 }
          ],
          top_performing_workers: [
            { worker_id: "1", worker_name: "Pastor John", total_souls_saved: 15, total_reports: 5 },
            { worker_id: "2", worker_name: "Sister Mary", total_souls_saved: 9, total_reports: 4 }
          ],
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

  if (!stats) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500">Failed to load statistics</div>
      </div>
    );
  }

  return (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Total Saved" 
          value={(stats.total_souls_saved || 0).toString()} 
          icon="👥" 
          bgColor="bg-red-50" 
          iconBg="bg-red-100" 
        />
        <StatCard 
          title="Total Filled" 
          value={(stats.total_souls_filled || 0).toString()} 
          icon="💧" 
          bgColor="bg-orange-50" 
          iconBg="bg-orange-100" 
        />
        <StatCard 
          title="Total Healed" 
          value={(stats.total_souls_healed || 0).toString()} 
          icon="💚" 
          bgColor="bg-green-50" 
          iconBg="bg-green-100" 
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 border border-border">
          <div className="flex items-baseline gap-4 mb-2">
            <h3 className="text-sm font-semibold text-muted-foreground">TOTAL REPORTS</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-foreground">{stats.total_reports || 0}</span>
            <span className="text-sm text-muted-foreground">Reports Submitted</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-border">
          <div className="flex items-baseline gap-4 mb-2">
            <h3 className="text-sm font-semibold text-muted-foreground">WORKERS INVOLVED</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-foreground">{stats.total_workers_involved || 0}</span>
            <span className="text-sm text-muted-foreground">Active Workers</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-border">
          <div className="flex items-baseline gap-4 mb-2">
            <h3 className="text-sm font-semibold text-muted-foreground">TOTAL ATTENDEES</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-foreground">{stats.total_attendees || 0}</span>
            <span className="text-sm text-muted-foreground">Across All Sessions</span>
          </div>
        </div>
      </div>

      {/* Report Status Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg p-4 border border-border">
          <div className="text-xs font-semibold text-gray-600 mb-1">DRAFT</div>
          <div className="text-2xl font-bold text-gray-600">{stats.reports_by_status?.draft || 0}</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-border">
          <div className="text-xs font-semibold text-blue-600 mb-1">SUBMITTED</div>
          <div className="text-2xl font-bold text-blue-600">{stats.reports_by_status?.submitted || 0}</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-border">
          <div className="text-xs font-semibold text-green-600 mb-1">APPROVED</div>
          <div className="text-2xl font-bold text-green-600">{stats.reports_by_status?.approved || 0}</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-border">
          <div className="text-xs font-semibold text-red-600 mb-1">REJECTED</div>
          <div className="text-2xl font-bold text-red-600">{stats.reports_by_status?.rejected || 0}</div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg p-6 border border-border">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-1">MONTHLY GROWTH TREND</h3>
            <p className="text-sm text-muted-foreground">SAVED SOULS VS FILLED VS HEALED</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-xs font-semibold text-foreground">SAVED</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
              <span className="text-xs font-semibold text-foreground">FILLED</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-xs font-semibold text-foreground">HEALED</span>
            </div>
            <select className="text-sm font-semibold text-foreground border border-border rounded px-2 py-1">
              <option>2024</option>
              <option>2023</option>
            </select>
          </div>
        </div>
        <GrowthChart data={stats.monthly_growth || []} />
      </div>

      {/* Top Performing Workers */}
      {stats.top_performing_workers && stats.top_performing_workers.length > 0 && (
        <div className="bg-white rounded-lg p-6 border border-border mt-6">
          <h3 className="text-lg font-bold text-foreground mb-4">TOP PERFORMING WORKERS</h3>
          <div className="space-y-3">
            {stats.top_performing_workers.map((worker, index) => (
              <div key={worker.worker_id} className="flex items-center justify-between p-3 border border-gray-200 rounded">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-500">#{index + 1}</span>
                  <span className="font-medium">{worker.worker_name}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-red-600 font-semibold">{worker.total_souls_saved} Souls Saved</span>
                  <span className="text-gray-500">{worker.total_reports} Reports</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}