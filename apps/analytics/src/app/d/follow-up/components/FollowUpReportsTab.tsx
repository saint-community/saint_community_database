'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { 
  getAllFollowUpReports, 
  getWorkerFollowUpHistory,
  deleteFollowUpReport,
  FollowUpReport,
  FollowUpReportListParams 
} from '@/services/followUp';
import { Eye, Edit, Trash2, Plus, Filter, Clock, User, MapPin } from 'lucide-react';

interface FollowUpReportsTabProps {
  onViewDetails: (id: string) => void;
  onEditReport?: (report: FollowUpReport) => void;
  onAddReport?: () => void;
  userRole?: 'admin' | 'worker';
}

export default function FollowUpReportsTab({ 
  onViewDetails, 
  onEditReport, 
  onAddReport,
  userRole = 'admin'
}: FollowUpReportsTabProps): React.JSX.Element {
  const [reports, setReports] = useState<FollowUpReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalReports, setTotalReports] = useState(0);
  const [filters, setFilters] = useState<FollowUpReportListParams>({
    status: '',
    progress_level: '',
    date_from: '',
    date_to: '',
    limit: 10
  });

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params: FollowUpReportListParams = {
        ...filters,
        page: currentPage,
        limit: 10
      };

      const response = userRole === 'admin' 
        ? await getAllFollowUpReports(params)
        : await getWorkerFollowUpHistory(params);
      
      setReports(response.data || []);
      setTotalReports(response.total || 0);
    } catch (err) {
      console.error('Failed to fetch follow-up reports:', err);
      setError('Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [currentPage, filters, userRole]);

  const handleDeleteReport = async (id: string) => {
    if (!confirm('Are you sure you want to delete this follow-up record?')) {
      return;
    }

    try {
      await deleteFollowUpReport(id);
      await fetchReports(); // Refresh the list
    } catch (error) {
      console.error('Failed to delete report:', error);
      alert('Failed to delete follow-up record. Please try again.');
    }
  };

  const handleFilterChange = (field: keyof FollowUpReportListParams, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value || undefined
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      draft: 'bg-gray-100 text-gray-600',
      completed: 'bg-green-100 text-green-600',
      reviewed: 'bg-blue-100 text-blue-600',
      archived: 'bg-purple-100 text-purple-600'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-600'
      }`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const getProgressBadge = (level: string) => {
    const progressColors = {
      beginner: 'bg-yellow-100 text-yellow-600',
      intermediate: 'bg-orange-100 text-orange-600',
      advanced: 'bg-blue-100 text-blue-600',
      mature: 'bg-green-100 text-green-600'
    };
    
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${
        progressColors[level as keyof typeof progressColors] || 'bg-gray-100 text-gray-600'
      }`}>
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const formatMethod = (method: string) => {
    return method.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading follow-up reports...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">
          {userRole === 'admin' ? 'All Follow-Up Reports' : 'My Follow-Up Reports'}
        </h3>
        {onAddReport && (
          <button 
            onClick={onAddReport}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded font-semibold text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Follow-Up Record
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-border p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="completed">Completed</option>
              <option value="reviewed">Reviewed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Progress Level</label>
            <select
              value={filters.progress_level || ''}
              onChange={(e) => handleFilterChange('progress_level', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="mature">Mature</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Date From</label>
            <input
              type="date"
              value={filters.date_from || ''}
              onChange={(e) => handleFilterChange('date_from', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Date To</label>
            <input
              type="date"
              value={filters.date_to || ''}
              onChange={(e) => handleFilterChange('date_to', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilters({
                  status: '',
                  progress_level: '',
                  date_from: '',
                  date_to: '',
                  limit: 10
                });
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-gray-100 text-gray-600 rounded text-sm hover:bg-gray-200"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">Date</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">Member</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">Topic</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">Progress</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">Duration</th>
                {userRole === 'admin' && (
                  <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">Worker</th>
                )}
                <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">Status</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={userRole === 'admin' ? 8 : 7} className="p-8 text-center text-gray-500">
                    {error ? 'Failed to load reports' : 'No follow-up reports found'}
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <div className="text-sm font-medium text-gray-900">
                        {formatDate(report.date)}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(report.created_at)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-900 flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {report.member_name || 'Unknown'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatMethod(report.method)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-900">{report.topic}</div>
                      {report.location && (
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {report.location}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      {getProgressBadge(report.progress_level)}
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-900">{report.duration} min</div>
                      <div className="text-xs text-gray-500">{report.attendance_status}</div>
                    </td>
                    {userRole === 'admin' && (
                      <td className="p-4">
                        <div className="text-sm text-gray-900">{report.worker_name || 'Unknown'}</div>
                      </td>
                    )}
                    <td className="p-4">
                      {getStatusBadge(report.status)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onViewDetails(report.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {onEditReport && (
                          <button
                            onClick={() => onEditReport(report)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded"
                            title="Edit Report"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {userRole === 'admin' && (
                          <button
                            onClick={() => handleDeleteReport(report.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                            title="Delete Report"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalReports > 10 && (
          <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalReports)} of {totalReports} reports
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm">
                Page {currentPage} of {Math.ceil(totalReports / 10)}
              </span>
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage >= Math.ceil(totalReports / 10)}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}