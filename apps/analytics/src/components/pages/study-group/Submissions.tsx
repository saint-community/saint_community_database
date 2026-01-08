'use client';
import * as React from 'react';
import { Button } from '@/@workspace/ui/components/button';
import { Card, CardContent } from '@/@workspace/ui/components/card';
import { Badge } from '@/@workspace/ui/components/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/@workspace/ui/components/avatar';
import { useState, useEffect, useRef } from 'react';
import { Plus, ExternalLink, ChevronDown, ChevronUp, AlertTriangle, User, Filter } from 'lucide-react';
import { submissionsApi, StudyGroupSubmission, GradeSubmissionDto, RequestRedoDto, mapSubmissionStatusToFrontend } from '@/src/services/submissions';
<<<<<<< HEAD
import { AddSubmissionModal } from '@/components/ui/AddSubmissionModal';
=======
>>>>>>> b93c96d (fix styudy group)
import dayjs from 'dayjs';

// Helper interface for submission display
interface SubmissionForDisplay extends StudyGroupSubmission {
  title: string;
  submittedAt: string;
  submissionType: 'online' | 'offline';
  submissionUrl: string;
  isLate: boolean;
  notes: string;
  grade?: number | null;
  graderNotes: string;
  deadline?: string;
  displayStatus: 'pending' | 'approved' | 'redo' | 'rejected';
  submitter: {
    name: string;
    email: string;
    phone: string;
    role: string;
    avatar: string;
  };
}

function FilterDropdown({ onFilterChange }: { onFilterChange: (filter: string) => void }): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filterOptions = [
    { value: 'all', label: 'All Submissions' },
    { value: 'pending', label: 'Pending Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'redo', label: 'Needs Redo' }
  ];

  const handleFilterSelect = (value: string) => {
    setSelectedFilter(value);
    onFilterChange(value);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <Filter className="w-4 h-4" />
        Filter
        <ChevronDown className="w-4 h-4" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleFilterSelect(option.value)}
              className={`w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                selectedFilter === option.value ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status, grade }: { status: string; grade?: number | null }): React.JSX.Element {
  const statusConfig = {
    pending: { label: 'Pending Review', className: 'bg-orange-100 text-orange-800', icon: null },
    approved: { 
      label: grade ? `Approved (${grade}%)` : 'Approved', 
      className: 'bg-blue-100 text-blue-800',
      icon: <User className="w-3 h-3 mr-1" />
    },
    redo: { label: 'Needs Redo', className: 'bg-red-100 text-red-800', icon: null },
    rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800', icon: null }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <Badge className={config.className}>
      {config.icon}
      {config.label}
    </Badge>
  );
}

function UserRoleBadge({ role }: { role: string }): React.JSX.Element {
  const roleConfig = {
    'worker-in-training': { label: 'Worker in Training', className: 'bg-blue-100 text-blue-800' },
    'cell-leader': { label: 'Cell Leader', className: 'bg-purple-100 text-purple-800' },
    'member': { label: 'Member', className: 'bg-gray-100 text-gray-800' }
  };

  const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.member;

  return (
    <Badge className={config.className}>
      {config.label}
    </Badge>
  );
}

function SubmissionCard({ 
  submission, 
  onGradeSubmission, 
  onRequestRedo 
}: { 
  submission: SubmissionForDisplay;
  onGradeSubmission?: (id: string, gradeData: GradeSubmissionDto) => Promise<void>;
  onRequestRedo?: (id: string, redoData: RequestRedoDto) => Promise<void>;
}): React.JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);
  const [grade, setGrade] = useState(submission.grade || '');
  const [graderNotes, setGraderNotes] = useState(submission.graderNotes || '');
  const [redoNote, setRedoNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGradeSubmission = async () => {
    if (!onGradeSubmission) return;
    
    const gradeNumber = Number(grade);
    if (isNaN(gradeNumber) || gradeNumber < 0 || gradeNumber > 100) {
      alert('Please enter a valid grade between 0 and 100');
      return;
    }

    setLoading(true);
    try {
      await onGradeSubmission(submission.id, {
        score: gradeNumber,
        feedback: graderNotes
      });
    } catch (error) {
      console.error('Failed to grade submission:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestRedo = async () => {
    if (!onRequestRedo) return;
    
    if (!redoNote.trim()) {
      alert('Please provide a reason for requesting redo');
      return;
    }

    setLoading(true);
    try {
      await onRequestRedo(submission.id, {
        redo_note: redoNote.trim()
      });
    } catch (error) {
      console.error('Failed to request redo:', error);
    } finally {
      setLoading(false);
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
              </p>
            )}
          </div>
<<<<<<< HEAD
          <StatusBadge status={submission.displayStatus} grade={submission.grade} />
=======
          <StatusBadge status={submission.status} grade={submission.grade} />
>>>>>>> b93c96d (fix styudy group)
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
              <UserRoleBadge role={submission.submitter.role} />
            </div>
            <p className="text-sm text-gray-600">
              {submission.submitter.phone}, {submission.submitter.email}
            </p>
          </div>
        </div>

        {/* Late Submission Warning */}
        {submission.isLate && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium">Late Submission</span>
            </div>
            <p className="text-sm text-red-700 mt-1">
              Deadline was {submission.deadline}, submitted {submission.submittedAt}
            </p>
          </div>
        )}

        <div className="flex justify-between items-center mb-4">
          <div>
            {submission.submissionType === 'online' ? (
              <Button 
                variant="link" 
                className="p-0 h-auto text-blue-600"
                onClick={() => submission.submissionUrl && window.open(submission.submissionUrl, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                View Submission
              </Button>
            ) : (
              <span className="text-gray-600">Submitted offline</span>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Submitted: {submission.submittedAt} 
              {submission.submission_method && (
                <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
<<<<<<< HEAD
                  {submission.submission_method.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
=======
                  {submission.submission_method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
>>>>>>> b93c96d (fix styudy group)
                </span>
              )}
            </p>
          </div>
          
          <Button 
            variant="ghost" 
            className="text-gray-600"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Collapse' : 'Expand'}
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 ml-1" />
            ) : (
              <ChevronDown className="w-4 h-4 ml-1" />
            )}
          </Button>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t pt-4 space-y-4">
            {/* Student Notes Section */}
            {submission.notes && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Student Notes:</h4>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {submission.notes}
                </p>
              </div>
            )}

            {/* Grader Notes Section */}
            {submission.displayStatus === 'approved' && submission.graderNotes && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Grader Feedback:</h4>
                <p className="text-gray-700 bg-blue-50 p-3 rounded-lg border border-blue-200">
                  {submission.graderNotes}
                </p>
              </div>
            )}

            {/* Grading Interface */}
            {submission.displayStatus === 'pending' ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="font-medium text-gray-900">Grade:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                      placeholder="0"
                    />
                    <span className="text-gray-500">%</span>
                  </div>
                </div>
                
                {/* Grader Notes Input */}
                <div>
                  <label className="font-medium text-gray-900 mb-2 block">Grader Notes:</label>
                  <textarea
                    value={graderNotes}
                    onChange={(e) => setGraderNotes(e.target.value)}
                    placeholder="Add feedback for the student..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                    rows={3}
                  />
                </div>
              </div>
            ) : submission.displayStatus === 'approved' && submission.grade ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="font-medium text-gray-900">Grade:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-center bg-green-50"
                      placeholder="0"
                    />
                    <span className="text-gray-500">%</span>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button variant="outline" size="sm" className="border-red-500 text-red-500 hover:bg-red-50">
                      Cancel
                    </Button>
                    <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                      Approve
                    </Button>
                  </div>
                </div>
                
                {/* Grader Notes Display for Approved */}
                {submission.graderNotes && (
                  <div>
                    <label className="font-medium text-gray-900 mb-2 block">Grader Notes:</label>
                    <textarea
                      value={graderNotes}
                      onChange={(e) => setGraderNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none bg-green-50"
                      rows={3}
                    />
                  </div>
                )}
              </div>
            ) : null}

            {/* Redo Note Input - Only show for pending submissions */}
            {submission.displayStatus === 'pending' && (
              <div className="mt-4">
                <label className="font-medium text-gray-900 mb-2 block">Redo Note (optional):</label>
                <textarea
                  value={redoNote}
                  onChange={(e) => setRedoNote(e.target.value)}
                  placeholder="Provide reason for requesting redo..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                  rows={2}
                />
              </div>
            )}

            {/* Action Buttons - Only show for pending submissions */}
            {submission.displayStatus === 'pending' && (
              <div className="flex gap-3 mt-4">
                <Button 
                  variant="outline" 
                  className="border-orange-500 text-orange-500 hover:bg-orange-50"
                  onClick={handleRequestRedo}
                  disabled={loading || !redoNote.trim()}
                >
                  {loading ? 'Requesting...' : 'Request Redo'}
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleGradeSubmission}
                  disabled={loading || !grade}
                >
                  {loading ? 'Grading...' : 'Grade & Approve'}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: { 
  currentPage: number; 
  totalPages: number; 
  onPageChange: (page: number) => void; 
}): React.JSX.Element {
  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        ←
      </Button>
      
      {visiblePages.map((page, index) => (
        <div key={index}>
          {page === '...' ? (
            <span className="px-2">...</span>
          ) : (
            <Button
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              className={currentPage === page ? "bg-blue-600 text-white" : ""}
              onClick={() => onPageChange(page as number)}
            >
              {page}
            </Button>
          )}
        </div>
      ))}
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        →
      </Button>
    </div>
  );
}

export default function SubmissionsTab(): React.JSX.Element {
  const [submissionsData, setSubmissionsData] = useState<SubmissionForDisplay[]>([]);
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    late: 0,
    online: 0
  });
  const itemsPerPage = 10; // Show 10 submissions per page

  // Load submissions on component mount and when filters change
  useEffect(() => {
    loadSubmissions();
  }, [currentPage, filter]);

  // Helper function to transform API submission to display format
  const transformSubmission = (submission: StudyGroupSubmission): SubmissionForDisplay => {
    const displayStatus = mapSubmissionStatusToFrontend(submission.status) as 'pending' | 'approved' | 'redo' | 'rejected';
    
    return {
      ...submission,
      title: submission.study_group_title || 'Untitled Assignment',
      submittedAt: dayjs(submission.submitted_at).format('MMMM D, YYYY [at] h:mm A'),
      submissionType: submission.assignment_link ? 'online' : 'offline',
      submissionUrl: submission.assignment_link || '',
      isLate: submission.is_late || false,
      notes: submission.feedback || '',
      grade: submission.score || null,
      graderNotes: submission.feedback || '',
      deadline: dayjs(submission.submitted_at).add(7, 'days').format('MMMM D, YYYY'), // Example deadline calculation
      displayStatus,
      submitter: {
        name: submission.member_name || `Worker ${submission.worker_id}`,
        email: 'worker@example.com', // Could be fetched from worker/member API
        phone: '+234 000 000 0000', // Could be fetched from worker/member API
        role: submission.submitter_role === 'worker' ? 'worker-in-training' : 'member',
        avatar: '/avatars/default-avatar.jpg'
      }
    };
  };

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      
<<<<<<< HEAD
      // Prepare filters for API call
      const apiFilters = {
        page: currentPage,
        limit: itemsPerPage,
        status: filter === 'all' ? undefined : filter,
        church_id: 1 // TODO: Get from user context or props
      };

      // Fetch submissions using the enhanced API
      const response = await submissionsApi.getForReview(apiFilters);
      
      // Transform submissions to display format
      const transformedSubmissions = response.data.map(transformSubmission);
      
      setSubmissionsData(transformedSubmissions);
      setTotalPages(response.pagination?.totalPages || 1);
      
      // Calculate stats from all submissions (not just current page)
      const allSubmissions = await submissionsApi.getAll({ church_id: 1 });
      const calculatedStats = {
        total: allSubmissions.length,
        pending: allSubmissions.filter(s => mapSubmissionStatusToFrontend(s.status) === 'pending').length,
        late: allSubmissions.filter(s => s.is_late).length,
        online: allSubmissions.filter(s => s.submission_method === 'online_by_member').length
      };
      setStats(calculatedStats);

    } catch (err: any) {
      console.error('Error loading submissions:', err);
      setError(err.message || 'Failed to load submissions. Please try again.');
      setSubmissionsData([]);
      setTotalPages(0);
      setStats({ total: 0, pending: 0, late: 0, online: 0 });
=======
      // TEMPORARY: Test with the actual API response you provided
      const testData = [
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
        }
      ];
      
      console.log('Using test data:', testData); // Debug log
      
      // Use getForReview directly to get the full paginated response
      // const response = await submissionsApi.getForReview({ church_id: 1 });
      // console.log('API Response:', response); // Debug log
      
      // Extract data array from response
      const data = testData; // response?.data || [];
      console.log('Extracted data:', data); // Debug log
      
      if (!Array.isArray(data)) {
        console.log('Data is not an array:', typeof data, data);
        setSubmissionsData(mockSubmissions);
        return;
      }
      
      if (data.length === 0) {
        console.log('Data array is empty, using mock data for testing');
        // Even if empty, still set the empty array so we can see stats
        setSubmissionsData([]);
        return;
      }
      
      // Map API data to match SubmissionCard expectations
      const mappedData = data.map((submission: any) => {
        const mapped = {
          ...submission,
          // Map API fields to component expectations
          title: submission.study_group_title || 'Untitled Assignment',
          submittedAt: dayjs(submission.submitted_at).format('MMMM D, YYYY [at] h:mm A'),
          submissionType: submission.assignment_link ? 'online' : 'offline',
          submissionUrl: submission.assignment_link || '',
          isLate: submission.is_late || false,
          notes: '', // No notes field in API response
          grade: submission.score || null, // Use score from API
          graderNotes: submission.feedback || '',
          // Map API status to UI status using the helper function
          status: mapSubmissionStatusToFrontend(submission.status),
          // Create submitter object from API data
          submitter: {
            name: `Worker ${submission.worker_id}`, // API doesn't provide worker name
            email: 'worker@example.com', // Default email
            phone: '+234 000 000 0000', // Default phone
            role: submission.submitter_role === 'worker' ? 'worker-in-training' : 'member',
            avatar: '/avatars/default-avatar.jpg'
          }
        };
        console.log('Original submission:', submission);
        console.log('Mapped submission:', mapped);
        return mapped;
      });
      
      console.log('Final mapped data:', mappedData); // Debug log
      setSubmissionsData(mappedData);
    } catch (err) {
      setError('Failed to load submissions');
      console.error('Error loading submissions:', err);
      // For development, use mock data to show the UI
      setSubmissionsData(mockSubmissions);
>>>>>>> b93c96d (fix styudy group)
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
=======
  const filteredSubmissions = submissionsData.filter(submission => {
    if (filter === 'all') return true;
    const matches = submission.status === filter;
    console.log(`Filter: ${filter}, Submission status: ${submission.status}, Matches: ${matches}`); // Debug log
    return matches;
  });
  
  console.log('Total submissions:', submissionsData.length);
  console.log('Filtered submissions:', filteredSubmissions.length);
  console.log('Current filter:', filter);

  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSubmissions = filteredSubmissions.slice(startIndex, endIndex);

>>>>>>> b93c96d (fix styudy group)
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleGradeSubmission = async (id: string, gradeData: GradeSubmissionDto) => {
    try {
      await submissionsApi.gradeSubmission(id, gradeData);
      await loadSubmissions(); // Reload submissions
    } catch (err: any) {
      console.error('Error grading submission:', err);
      setError(err.message || 'Failed to grade submission');
    }
  };

  const handleRequestRedo = async (id: string, redoData: RequestRedoDto) => {
    try {
      await submissionsApi.requestRedo(id, redoData);
      await loadSubmissions(); // Reload submissions
    } catch (err: any) {
      console.error('Error requesting redo:', err);
      setError(err.message || 'Failed to request redo');
    }
  };

  return (
    <div className='flex flex-col gap-4 min-h-[calc(100vh-250px)]'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Review Submissions</h1>
          <p className='text-sm text-gray-600 mt-1'>
            {loading ? 'Loading submissions...' : `Showing ${submissionsData.length} of ${stats.total} submissions`}
            {filter !== 'all' && (
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                Filtered by: {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <FilterDropdown onFilterChange={handleFilterChange} />
          <Button 
            className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-3'
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className='w-4 h-4 mr-2' />
            Add Submission
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
<<<<<<< HEAD
      {!loading && stats.total > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
=======
      {!loading && submissionsData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-900">{submissionsData.length}</div>
>>>>>>> b93c96d (fix styudy group)
              <div className="text-sm text-gray-600">Total Submissions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
<<<<<<< HEAD
              <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
=======
              <div className="text-2xl font-bold text-orange-600">
                {submissionsData.filter(s => s.status === 'pending').length}
              </div>
>>>>>>> b93c96d (fix styudy group)
              <div className="text-sm text-gray-600">Pending Review</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
<<<<<<< HEAD
              <div className="text-2xl font-bold text-red-600">{stats.late}</div>
=======
              <div className="text-2xl font-bold text-red-600">
                {submissionsData.filter(s => s.isLate).length}
              </div>
>>>>>>> b93c96d (fix styudy group)
              <div className="text-sm text-gray-600">Late Submissions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
<<<<<<< HEAD
              <div className="text-2xl font-bold text-blue-600">{stats.online}</div>
=======
              <div className="text-2xl font-bold text-blue-600">
                {submissionsData.filter(s => s.submissionType === 'online').length}
              </div>
>>>>>>> b93c96d (fix styudy group)
              <div className="text-sm text-gray-600">Online Submissions</div>
            </CardContent>
          </Card>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Loading submissions...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500 text-lg">{error}</p>
          <Button onClick={loadSubmissions} className="mt-4">
            Try Again
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {submissionsData.length > 0 ? (
            submissionsData.map((submission) => (
              <SubmissionCard 
                key={submission.id} 
                submission={submission}
                onGradeSubmission={handleGradeSubmission}
                onRequestRedo={handleRequestRedo}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No submissions found for the selected filter.</p>
            </div>
          )}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {/* Add Submission Modal */}
      <AddSubmissionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          loadSubmissions(); // Refresh submissions list
        }}
      />
    </div>
  );
}
