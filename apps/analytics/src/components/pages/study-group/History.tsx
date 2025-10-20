'use client';
import * as React from 'react';
import { Button } from '@/@workspace/ui/components/button';
import { Card, CardContent } from '@/@workspace/ui/components/card';
import { Badge } from '@/@workspace/ui/components/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/@workspace/ui/components/avatar';
import { useState, useEffect, useRef } from 'react';
import { Filter, X, Calendar, Search, FileText, Star, Sparkles, Diamond } from 'lucide-react';
import { submissionsApi, StudyGroupSubmission, mapSubmissionStatusToFrontend } from '@/src/services/submissions';
import dayjs from 'dayjs';

// Mock data for graded assignments (history) - fallback data
const mockHistorySubmissions = [
  {
    id: 'h1',
    title: 'Kings and Priests in the Earth (2020) - Track 3',
    status: 'approved',
    submitter: {
      name: 'John Smith',
      email: 'Johnsmith@gmail.com',
      phone: '+234 8129969837',
      role: 'member',
      avatar: '/avatars/john-smith.jpg'
    },
    submittedAt: '24 June, 2025 at 8:05 AM',
    gradedAt: '25 June, 2025 at 2:30 PM',
    grade: 92,
    graderNotes: 'Excellent work! Student demonstrated deep understanding of the material.',
    grader: 'Pastor Michael'
  },
  {
    id: 'h2',
    title: 'Understanding Prayer and Intercession',
    status: 'approved',
    submitter: {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@gmail.com',
      phone: '+234 8129969838',
      role: 'cell-leader',
      avatar: '/avatars/sarah-johnson.jpg'
    },
    submittedAt: '20 June, 2025 at 3:30 PM',
    gradedAt: '21 June, 2025 at 10:15 AM',
    grade: 88,
    graderNotes: 'Good understanding of intercessory prayer concepts. Well done!',
    grader: 'Pastor Michael'
  },
  {
    id: 'h3',
    title: 'The Power of Faith and Healing',
    status: 'approved',
    submitter: {
      name: 'David Wilson',
      email: 'david.wilson@gmail.com',
      phone: '+234 8129969839',
      role: 'worker-in-training',
      avatar: '/avatars/david-wilson.jpg'
    },
    submittedAt: '18 June, 2025 at 11:20 AM',
    gradedAt: '19 June, 2025 at 4:45 PM',
    grade: 95,
    graderNotes: 'Outstanding submission! Clear understanding of faith principles and excellent examples.',
    grader: 'Pastor Sarah'
  },
  {
    id: 'h4',
    title: 'Building Strong Relationships in Ministry',
    status: 'approved',
    submitter: {
      name: 'Mary Brown',
      email: 'mary.brown@gmail.com',
      phone: '+234 8129969840',
      role: 'member',
      avatar: '/avatars/mary-brown.jpg'
    },
    submittedAt: '15 June, 2025 at 2:15 PM',
    gradedAt: '16 June, 2025 at 9:30 AM',
    grade: 85,
    graderNotes: 'Good insights on relationship building. Could benefit from more practical examples.',
    grader: 'Pastor Michael'
  }
];

function FilterModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }): React.JSX.Element | null {
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');

  const handleClearAll = () => {
    setSearchTerm('');
    setFromDate('');
    setToDate('');
    setGradeFilter('');
  };

  const handleApplyFilters = () => {
    // Apply filter logic here
    console.log('Applying filters:', { searchTerm, fromDate, toDate, gradeFilter });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Filter History</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {/* Search Input */}
          <div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search for member"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg pr-10"
              />
              <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From date</label>
              <div className="relative">
                <input
                  type="date"
                  placeholder="Pick start date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg pr-10"
                />
                <Calendar className="absolute right-3 top-2.5 w-4 h-4 text-yellow-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To date</label>
              <div className="relative">
                <input
                  type="date"
                  placeholder="Pick end date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg pr-10"
                />
                <Calendar className="absolute right-3 top-2.5 w-4 h-4 text-yellow-500" />
              </div>
            </div>
          </div>

          {/* Grade Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grade Range</label>
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Grades</option>
              <option value="90-100">90-100% (Excellent)</option>
              <option value="80-89">80-89% (Good)</option>
              <option value="70-79">70-79% (Average)</option>
              <option value="60-69">60-69% (Below Average)</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={handleClearAll}
              className="flex-1 border-red-500 text-red-500 hover:bg-red-50"
            >
              Clear All
            </Button>
            <Button 
              onClick={handleApplyFilters}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState(): React.JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      {/* Decorative Elements */}
      <div className="relative mb-8">
        {/* Main Document Icon */}
        <div className="relative">
          <div className="w-24 h-32 bg-gray-200 rounded-lg shadow-lg">
            <div className="p-4 space-y-2">
              <div className="h-2 bg-gray-300 rounded w-full"></div>
              <div className="h-2 bg-gray-300 rounded w-3/4"></div>
              <div className="h-2 bg-gray-300 rounded w-full"></div>
              <div className="h-2 bg-gray-300 rounded w-1/2"></div>
              <div className="h-2 bg-gray-300 rounded w-5/6"></div>
            </div>
          </div>
          {/* Second Document */}
          <div className="absolute top-2 left-2 w-24 h-32 bg-gray-300 rounded-lg -z-10"></div>
        </div>

        {/* Decorative Elements */}
        <Star className="absolute -top-2 -left-2 w-4 h-4 text-gray-400" />
        <Sparkles className="absolute top-4 -left-3 w-3 h-3 text-gray-400" />
        <Diamond className="absolute -bottom-2 -left-2 w-3 h-3 text-gray-400" />
        <div className="absolute -top-1 right-2 w-2 h-2 bg-gray-400 rounded-full"></div>
        <div className="absolute top-8 right-0 w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
        <div className="absolute top-12 right-4 w-2.5 h-2.5 bg-gray-400 rounded-full"></div>
        <div className="absolute -bottom-1 right-6 w-1 h-1 bg-gray-400 rounded-full"></div>
        <div className="absolute top-6 right-8 w-3 h-3 border border-gray-400 rounded-full"></div>
      </div>

      {/* Text Content */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No History yet</h2>
        <p className="text-gray-600">All graded assignments will appear here</p>
      </div>
    </div>
  );
}

function HistoryCard({ submission }: { submission: any }): React.JSX.Element {
  const getStatusBadge = (status: string, grade: number) => {
    if (status === 'pending' || status === 'submitted') {
      return (
        <Badge className="bg-orange-100 text-orange-800">
          Pending Review
        </Badge>
      );
    } else if (status === 'approved' || grade > 0) {
      return (
        <Badge className="bg-blue-100 text-blue-800">
          Approved ({grade}%)
        </Badge>
      );
    } else if (status === 'late') {
      return (
        <Badge className="bg-red-100 text-red-800">
          Late Submission
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-gray-100 text-gray-800">
          {status}
        </Badge>
      );
    }
  };

  return (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              {submission.title}
            </h3>
            {submission.week_number && submission.year && (
              <p className="text-sm text-gray-500 mt-1">
                Week {submission.week_number}, {submission.year}
                {submission.is_late && (
                  <span className="ml-2 text-red-500">• Late Submission</span>
                )}
              </p>
            )}
          </div>
          {getStatusBadge(submission.status, submission.grade)}
        </div>

        <div className="flex items-center gap-4 mb-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={submission.submitter.avatar} />
            <AvatarFallback>
              {submission.submitter.name.split(' ').map((n: string) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-gray-900">{submission.submitter.name}</span>
              <Badge className="bg-blue-100 text-blue-800">
                {submission.submitter.role.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
              </Badge>
            </div>
            <p className="text-sm text-gray-600">
              {submission.submitter.phone}, {submission.submitter.email}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm text-gray-600">
            <div>
              <span>Submitted: {submission.submittedAt}</span>
              {submission.submission_method && (
                <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                  {submission.submission_method.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                </span>
              )}
            </div>
            <span>Graded: {submission.gradedAt}</span>
          </div>
          
          {/* Assignment Link */}
          {submission.assignment_link && (
            <div className="text-sm">
              <a 
                href={submission.assignment_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                📎 View Assignment Submission
              </a>
            </div>
          )}
          
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-700">
              <strong>Grader Feedback:</strong> {submission.graderNotes}
            </p>
            <p className="text-xs text-gray-500 mt-1">Graded by: {submission.grader}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function HistoryTab(): React.JSX.Element {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [hasHistory, setHasHistory] = useState(true); // Set to true to show history cards
  const [historyData, setHistoryData] = useState<StudyGroupSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load history data on component mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // TEMPORARY: Test with the actual API response you provided for history
      const testHistoryData = [
        {
          "id": "68c97b9ce0081c0a47c3e6b7",
          "worker_id": 1,
          "study_group_id": "68c7e09ebb41e2bb5a9b9266",
          "study_group_title": "Discipleship Week 8",
          "assignment_link": "https://google.com",
          "submitted_at": "2025-09-16T15:00:44.595Z",
          "status": "submitted",
          "is_late": false,
          "week_number": 38,
          "year": 2025,
          "redo_requested": false,
          "submission_method": "online_by_member",
          "submitter_role": "worker",
          "submitter_id": 1,
          "created_at": "2025-09-16T15:00:44.596Z",
          "updated_at": "2025-09-16T15:00:44.596Z"
        },
        {
          "id": "68c7d5e5bb41e2bb5a9b9109",
          "worker_id": 1,
          "study_group_id": "68c7d5dbbb41e2bb5a9b90c4",
          "study_group_title": "Discipleship Week 7",
          "assignment_link": "https://google.com",
          "submitted_at": "2025-09-15T09:01:25.295Z",
          "status": "submitted",
          "is_late": false,
          "week_number": 38,
          "year": 2025,
          "redo_requested": false,
          "submission_method": "online_by_member",
          "submitter_role": "worker",
          "created_at": "2025-09-15T09:01:25.296Z",
          "updated_at": "2025-09-15T11:03:03.391Z"
        },
        {
          "id": "68c7d002bb41e2bb5a9b6520",
          "worker_id": 1,
          "study_group_id": "68c7cf69bb41e2bb5a9b6511",
          "study_group_title": "Discipleship Week 6",
          "assignment_link": "https://go.com",
          "submitted_at": "2025-09-15T08:36:18.060Z",
          "status": "submitted",
          "is_late": false,
          "week_number": 38,
          "year": 2025,
          "redo_requested": false,
          "submission_method": "online_by_member",
          "submitter_role": "worker",
          "created_at": "2025-09-15T08:36:18.060Z",
          "updated_at": "2025-09-15T11:04:10.571Z"
        },
        {
          "id": "68c7ce5dbb41e2bb5a9b6508",
          "worker_id": 1,
          "study_group_id": "68c7ce4ebb41e2bb5a9b64fc",
          "study_group_title": "Discipleship Week 5",
          "assignment_link": "",
          "submitted_at": "2025-09-15T08:29:17.562Z",
          "status": "submitted",
          "is_late": false,
          "week_number": 38,
          "year": 2025,
          "redo_requested": false,
          "submission_method": "online_by_member",
          "submitter_role": "worker",
          "created_at": "2025-09-15T08:29:17.564Z",
          "updated_at": "2025-09-15T08:29:17.564Z"
        },
        {
          "id": "68c7c3fabb41e2bb5a9b64b1",
          "worker_id": 1,
          "study_group_id": "68c7b8dabb41e2bb5a9b6487",
          "study_group_title": "Discipleship Week 2",
          "assignment_link": "",
          "submitted_at": "2025-09-15T07:44:58.519Z",
          "status": "late",
          "is_late": true,
          "week_number": 36,
          "year": 2025,
          "redo_requested": false,
          "submission_method": "online_by_member",
          "submitter_role": "worker",
          "created_at": "2025-09-15T07:44:58.519Z",
          "updated_at": "2025-09-15T07:44:58.519Z"
        },
        {
          "id": "68c7bf00bb41e2bb5a9b6493",
          "worker_id": 1,
          "study_group_id": "68c0aaedbb41e2bb5a9b639f",
          "study_group_title": "Discipleship Week 1",
          "assignment_link": null,
          "submitted_at": "2025-09-15T07:23:44.943Z",
          "status": "late",
          "is_late": true,
          "week_number": 36,
          "year": 2025,
          "redo_requested": false,
          "submission_method": "online_by_member",
          "submitter_role": "worker",
          "created_at": "2025-09-15T07:23:44.943Z",
          "updated_at": "2025-09-15T07:23:44.943Z"
        }
      ];
      
      console.log('Using test history data:', testHistoryData); // Debug log
      
      // Get graded submissions (history)
      // const data = await submissionsApi.getHistory({ church_id: 1 });
      const data = testHistoryData;
      console.log('Extracted history data:', data); // Debug log
      
      if (!Array.isArray(data)) {
        console.log('History data is not an array:', typeof data, data);
        setHistoryData(mockHistorySubmissions);
        setHasHistory(true);
        return;
      }
      
      if (data.length === 0) {
        console.log('History data array is empty');
        setHistoryData([]);
        setHasHistory(false);
        return;
      }
      
      // Map API data to include submitter object for HistoryCard component
      const mappedData = data.map((submission: any) => {
        const mapped = {
          ...submission,
          // Map API fields to component expectations
          title: submission.study_group_title || 'Untitled Assignment',
          submittedAt: dayjs(submission.submitted_at).format('MMMM D, YYYY [at] h:mm A'),
          gradedAt: submission.graded_at ? dayjs(submission.graded_at).format('MMMM D, YYYY [at] h:mm A') : 'Not graded yet',
          grade: submission.score || 0,
          graderNotes: submission.feedback || 'No feedback provided',
          status: mapSubmissionStatusToFrontend(submission.status),
          // Add the submitter object that HistoryCard expects
          submitter: {
            name: `Worker ${submission.worker_id}`, // API doesn't provide worker name
            email: 'worker@example.com',
            phone: '+234 000 000 0000',
            role: submission.submitter_role === 'worker' ? 'worker-in-training' : 'member',
            avatar: '/avatars/default-avatar.jpg'
          },
          grader: 'Pastor Michael' // Default grader name
        };
        console.log('Original history submission:', submission);
        console.log('Mapped history submission:', mapped);
        return mapped;
      });
      
      console.log('Final mapped history data:', mappedData); // Debug log
      setHistoryData(mappedData);
      setHasHistory(mappedData.length > 0);
    } catch (err) {
      setError('Failed to load history');
      console.error('Error loading history:', err);
      // Fallback to mock data
      setHistoryData(mockHistorySubmissions);
      setHasHistory(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex flex-col gap-4 min-h-[calc(100vh-250px)]'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>History</h1>
          <p className='text-sm text-gray-600 mt-1'>
            {loading ? 'Loading history...' : hasHistory ? `Showing ${historyData.length} graded assignments` : 'No graded assignments yet'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline"
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filter
          </Button>
          <Button 
            variant="outline"
            onClick={() => setHasHistory(!hasHistory)}
            className="text-sm"
          >
            {hasHistory ? 'Show Empty State' : 'Show History'}
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      {!loading && historyData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-900">{historyData.length}</div>
              <div className="text-sm text-gray-600">Total Submissions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {historyData.filter(s => s.status === 'approved' || s.grade > 0).length}
              </div>
              <div className="text-sm text-gray-600">Approved</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">
                {historyData.filter(s => s.is_late).length}
              </div>
              <div className="text-sm text-gray-600">Late Submissions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {historyData.length > 0 ? 
                  Math.round(historyData.reduce((sum, s) => sum + (s.grade || 0), 0) / historyData.length) 
                  : 0}%
              </div>
              <div className="text-sm text-gray-600">Average Grade</div>
            </CardContent>
          </Card>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Loading history...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500 text-lg">{error}</p>
          <Button onClick={loadHistory} className="mt-4">
            Try Again
          </Button>
        </div>
      ) : hasHistory ? (
        <div className="space-y-4">
          {historyData.map((submission) => (
            <HistoryCard key={submission.id} submission={submission} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}

      <FilterModal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
    </div>
  );
}
