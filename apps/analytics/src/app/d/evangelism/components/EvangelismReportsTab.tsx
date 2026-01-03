'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { 
  getAllEvangelismReports, 
  getWorkerEvangelismHistory,
  deleteEvangelismReport,
  EvangelismReport,
  EvangelismReportListParams 
} from '@/services/evangelism';
import { Eye, Edit, Trash2, Plus, Filter } from 'lucide-react';

interface EvangelismReportsTabProps {
  onViewDetails: (id: string) => void;
  onEditReport?: (report: EvangelismReport) => void;
  onAddReport?: () => void;
  userRole?: 'admin' | 'worker';
}

export default function EvangelismReportsTab({ 
  onViewDetails, 
  onEditReport, 
  onAddReport,
  userRole = 'admin'
}: EvangelismReportsTabProps): React.JSX.Element {
  const [reports, setReports] = useState<EvangelismReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalReports, setTotalReports] = useState(0);
  const [filters, setFilters] = useState<EvangelismReportListParams>({
    status: '',
    date_from: '',
    date_to: '',
    limit: 10
  });

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params: EvangelismReportListParams = {
        ...filters,
        page: currentPage,
        limit: 10
      };

      const response = userRole === 'admin' 
        ? await getAllEvangelismReports(params)
        : await getWorkerEvangelismHistory(params);
      
      setReports(response.data || []);
      setTotalReports(response.total || 0);
    } catch (err) {
      console.error('Failed to fetch evangelism reports:', err);
      setError('Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [currentPage, filters, userRole]);

  const handleDeleteReport = async (id: string) => {
    if (!confirm('Are you sure you want to delete this report?')) {
      return;
    }

    try {
      await deleteEvangelismReport(id);
      await fetchReports(); // Refresh the list
    } catch (error) {
      console.error('Failed to delete report:', error);
      alert('Failed to delete report. Please try again.');
    }
  };

  const handleFilterChange = (field: keyof EvangelismReportListParams, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value || undefined
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      draft: 'bg-gray-100 text-gray-600',
      submitted: 'bg-blue-100 text-blue-600',
      approved: 'bg-green-100 text-green-600',
      rejected: 'bg-red-100 text-red-600'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-600'
      }`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">
          {userRole === 'admin' ? 'All Evangelism Reports' : 'My Evangelism Reports'}
        </h3>
        {onAddReport && (
          <button 
            onClick={onAddReport}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Report
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-border p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
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
                <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">Location</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">Souls Impact</th>
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
                  <td colSpan={userRole === 'admin' ? 6 : 5} className="p-8 text-center text-gray-500">
                    {error ? 'Failed to load reports' : 'No reports found'}
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <div className="text-sm font-medium text-gray-900">
                        {formatDate(report.date)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(report.created_at)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-900">{report.location}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center gap-4">
                          <span className="text-red-600">★ {report.souls_saved}</span>
                          <span className="text-blue-600">○ {report.souls_filled}</span>
                          <span className="text-green-600">♡ {report.souls_healed}</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {report.total_attendees} attendees
                      </div>
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