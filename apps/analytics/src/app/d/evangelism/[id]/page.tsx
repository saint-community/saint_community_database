'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Calendar, MapPin, Users, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { getEvangelismReportById, deleteEvangelismReport, EvangelismReport } from '@/services/evangelism';

export default function EvangelismDetailsPage(): React.JSX.Element {
  const params = useParams();
  const reportId = params?.id as string;
  const [report, setReport] = useState<EvangelismReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      if (!reportId) return;
      
      try {
        setIsLoading(true);
        const data = await getEvangelismReportById(reportId);
        setReport(data);
      } catch (err) {
        console.error('Failed to fetch evangelism report:', err);
        setError('Failed to load report details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [reportId]);

  const handleDeleteReport = async () => {
    if (!confirm('Are you sure you want to delete this report?')) {
      return;
    }

    try {
      await deleteEvangelismReport(reportId);
      window.location.href = '/d/evangelism';
    } catch (error) {
      console.error('Failed to delete report:', error);
      alert('Failed to delete report. Please try again.');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      draft: 'bg-gray-100 text-gray-600',
      submitted: 'bg-blue-100 text-blue-600',
      approved: 'bg-green-100 text-green-600',
      rejected: 'bg-red-100 text-red-600'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
        statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-600'
      }`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading report details...</div>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="p-8">
        <div className="flex items-center space-x-4 mb-6">
          <Link 
            href="/d/evangelism" 
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Evangelism</span>
          </Link>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500">{error || 'Report not found'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <Link 
          href="/d/evangelism" 
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Evangelism</span>
        </Link>
        
        <div className="flex items-center gap-3">
          {getStatusBadge(report.status)}
          <button
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded border border-blue-200"
          >
            <Edit className="w-4 h-4" />
            Edit Report
          </button>
          <button
            onClick={handleDeleteReport}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded border border-red-200"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">
            Evangelism Report Details
          </h1>
          <p className="text-gray-600 mt-2">
            Report submitted on {formatDate(report.created_at)}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Session Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium">{formatDate(report.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium">{report.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Total Attendees</p>
                    <p className="font-medium">{report.total_attendees}</p>
                  </div>
                </div>
                {report.worker_name && (
                  <div>
                    <p className="text-sm text-gray-500">Submitted by</p>
                    <p className="font-medium">{report.worker_name}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Impact Results */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Impact Results</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-red-600 mb-2">★ {report.souls_saved}</div>
                  <div className="text-sm text-gray-600">Souls Saved</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">○ {report.souls_filled}</div>
                  <div className="text-sm text-gray-600">Souls Filled</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">♡ {report.souls_healed}</div>
                  <div className="text-sm text-gray-600">Souls Healed</div>
                </div>
              </div>
            </div>

            {/* Testimonies */}
            {report.testimonies && report.testimonies.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Testimonies</h2>
                <div className="space-y-3">
                  {report.testimonies.map((testimony, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-700">{testimony}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Challenges and Prayer Requests */}
            {(report.challenges_faced || (report.prayer_requests && report.prayer_requests.length > 0)) && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Challenges & Prayer Requests</h2>
                <div className="space-y-4">
                  {report.challenges_faced && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Challenges Faced</h3>
                      <p className="text-gray-700 p-3 bg-gray-50 rounded">{report.challenges_faced}</p>
                    </div>
                  )}
                  {report.prayer_requests && report.prayer_requests.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Prayer Requests</h3>
                      <ul className="space-y-2">
                        {report.prayer_requests.map((request, index) => (
                          <li key={index} className="text-gray-700 p-3 bg-gray-50 rounded">
                            {request}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Additional Notes */}
            {report.notes && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Notes</h2>
                <p className="text-gray-700 p-4 bg-gray-50 rounded">{report.notes}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Workers Involved */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Workers Involved</h3>
              <div className="space-y-2">
                {report.workers_involved.map((worker, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                    {worker}
                  </div>
                ))}
              </div>
            </div>

            {/* Materials Used */}
            {report.materials_used && report.materials_used.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Materials Used</h3>
                <div className="space-y-2">
                  {report.materials_used.map((material, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                      {material}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Follow-up Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Follow-up</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Follow-up needed:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    report.follow_up_needed 
                      ? 'bg-orange-100 text-orange-600' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {report.follow_up_needed ? 'YES' : 'NO'}
                  </span>
                </div>
                {report.follow_up_needed && report.follow_up_notes && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Follow-up notes:</p>
                    <p className="text-sm text-gray-700 p-2 bg-gray-50 rounded">
                      {report.follow_up_notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Report Metadata */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Created:</span>
                  <span>{formatDate(report.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Last Updated:</span>
                  <span>{formatDate(report.updated_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  {getStatusBadge(report.status)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}