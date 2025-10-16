'use client';
import { Button } from '@/@workspace/ui/components/button';
import { Card, CardContent } from '@/@workspace/ui/components/card';
import { Badge } from '@/@workspace/ui/components/badge';
import { useState, useEffect, useRef } from 'react';
import { Plus, Filter, X, Calendar, ChevronDown, ChevronUp, Edit, Trash2, ExternalLink, Star, Sparkles, Diamond } from 'lucide-react';
import { studyGroupApi, StudyGroup, CreateStudyGroupDto, UpdateStudyGroupDto, mapStatusToBackend, mapStatusToFrontend } from '@/src/services/studyGroup';

function CreateAssignmentModal({ isOpen, onClose, onSubmit }: { isOpen: boolean; onClose: () => void; onSubmit: (data: CreateStudyGroupDto) => Promise<void> }) {
  const [formData, setFormData] = useState({
    title: '',
    titleSummary: '',
    downloadLink: '',
    dueDate: '',
    studyQuestions: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.titleSummary.trim()) {
      newErrors.titleSummary = 'Title summary is required';
    }
    
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }
    
    if (!formData.studyQuestions.trim()) {
      newErrors.studyQuestions = 'Study questions are required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const assignmentData: CreateStudyGroupDto = {
        title: formData.title,
        description: formData.titleSummary,
        questions: formData.studyQuestions.split('\n').filter(q => q.trim()),
        week_start_date: new Date().toISOString(),
        week_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        due_date: formData.dueDate ? new Date(formData.dueDate).toISOString() : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        church_id: 1, // Default church_id
        status: 'active',
      };
      
      await onSubmit(assignmentData);
    } catch (error) {
      console.error('Error creating assignment:', error);
      // Error is handled by the parent component
    }
  };

  const handleCancel = () => {
    setFormData({
      title: '',
      titleSummary: '',
      downloadLink: '',
      dueDate: '',
      studyQuestions: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Create New Assignment</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assignment Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter assignment title"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title Summary *
            </label>
            <input
              type="text"
              value={formData.titleSummary}
              onChange={(e) => handleInputChange('titleSummary', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.titleSummary ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Brief description of the assignment"
            />
            {errors.titleSummary && (
              <p className="text-red-500 text-sm mt-1">{errors.titleSummary}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Download Link
            </label>
            <input
              type="url"
              value={formData.downloadLink}
              onChange={(e) => handleInputChange('downloadLink', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/download-link"
            />
            <p className="text-gray-500 text-sm mt-1">
              Optional: Link to download assignment materials
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date *
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                value={formData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.dueDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <Calendar className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>
            {errors.dueDate && (
              <p className="text-red-500 text-sm mt-1">{errors.dueDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Study Questions *
            </label>
            <textarea
              value={formData.studyQuestions}
              onChange={(e) => handleInputChange('studyQuestions', e.target.value)}
              rows={6}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.studyQuestions ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter study questions, one per line"
            />
            {errors.studyQuestions && (
              <p className="text-red-500 text-sm mt-1">{errors.studyQuestions}</p>
            )}
            <p className="text-gray-500 text-sm mt-1">
              Enter each question on a new line
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
            >
              Create Assignment
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative mb-8">
        {/* Triple document stack icon */}
        <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center relative">
          <div className="absolute -top-2 -left-2 w-20 h-20 bg-gray-200 rounded-lg"></div>
          <div className="absolute -top-1 -left-1 w-20 h-20 bg-gray-300 rounded-lg"></div>
          <div className="w-20 h-20 bg-gray-400 rounded-lg flex items-center justify-center">
            <span className="text-white text-2xl font-bold">📄</span>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -top-4 -right-4">
          <Star className="w-6 h-6 text-yellow-400" />
        </div>
        <div className="absolute -bottom-2 -left-6">
          <Sparkles className="w-5 h-5 text-blue-400" />
        </div>
        <div className="absolute top-8 -right-8">
          <Diamond className="w-4 h-4 text-purple-400" />
        </div>
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Assignment History</h3>
      <p className="text-gray-600 text-center max-w-md mb-6">
        You haven't created any assignments yet. Create your first assignment to get started with study group management.
      </p>
      
      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
        <Plus className="w-4 h-4 mr-2" />
        Create Your First Assignment
      </Button>
    </div>
  );
}

function AssignmentCard({ assignment, onUpdate, onDelete }: { assignment: StudyGroup; onUpdate: (id: string, data: UpdateStudyGroupDto) => Promise<void>; onDelete: (id: string) => Promise<void> }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'waiting':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Waiting
          </Badge>
        );
      case 'active':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Active
          </Badge>
        );
      case 'overdue':
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            Overdue
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            {status}
          </Badge>
        );
    }
  };

  return (
    <Card className="border border-gray-200 hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex-1">
            {assignment.title}
          </h3>
          {getStatusBadge(assignment.status)}
        </div>

        <div className="space-y-3 mb-4">
          <p className="text-gray-700">{assignment.description}</p>
          
          <div className="text-sm text-gray-600">
            <span>Created: {new Date(assignment.created_at).toLocaleDateString()}</span>
            <span className="mx-2">Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
          </div>
        </div>

        {isExpanded && (
          <div className="space-y-3 mb-4">
            <h4 className="font-semibold text-gray-900">Study Questions:</h4>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              {assignment.questions?.map((question: string, index: number) => (
                <li key={index} className="ml-4">{question}</li>
              )) || []}
            </ol>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-600 hover:text-gray-800"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-1" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" />
                  Show More
                </>
              )}
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdate(assignment.id, {})}
              className="text-blue-600 hover:text-blue-800"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(assignment.id)}
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FilterDropdown({ onFilterChange }: { onFilterChange: (filter: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filterOptions = [
    { value: 'all', label: 'All Assignments' },
    { value: 'waiting', label: 'Waiting' },
    { value: 'active', label: 'Active' },
    { value: 'overdue', label: 'Overdue' }
  ];

  const handleFilterSelect = (filter: string) => {
    setSelectedFilter(filter);
    onFilterChange(filter);
    setIsOpen(false);
  };

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
        {filterOptions.find(option => option.value === selectedFilter)?.label}
        <ChevronDown className="w-4 h-4" />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleFilterSelect(option.value)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
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

function Pagination({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (page: number) => void }) {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-2 mt-6">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3"
      >
        Previous
      </Button>
      
      {getVisiblePages().map((page, index) => (
        <Button
          key={index}
          variant={page === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => typeof page === 'number' && onPageChange(page)}
          disabled={page === '...'}
          className="px-3"
        >
          {page}
        </Button>
      ))}
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3"
      >
        Next
      </Button>
    </div>
  );
}

export default function AssignmentsTab() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [hasAssignments, setHasAssignments] = useState(true); // Set to false to show empty state
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const [assignments, setAssignments] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 5; // Show 5 assignments per page

  // Load assignments on component mount
  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await studyGroupApi.getAll({ church_id: 1 }); // Default church_id
      setAssignments(data);
      setHasAssignments(data.length > 0); // Update hasAssignments based on fetched data
    } catch (err) {
      setError('Failed to load assignments');
      console.error('Error loading assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    if (filter === 'all') return true;
    return mapStatusToFrontend(assignment.status) === filter;
  });

  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAssignments = filteredAssignments.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleCreateAssignment = async (assignmentData: CreateStudyGroupDto) => {
    try {
      await studyGroupApi.create(assignmentData);
      await loadAssignments(); // Reload assignments
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error('Error creating assignment:', err);
      throw err; // Re-throw to let the modal handle the error
    }
  };

  const handleUpdateAssignment = async (id: string, assignmentData: UpdateStudyGroupDto) => {
    try {
      await studyGroupApi.update(id, assignmentData);
      await loadAssignments(); // Reload assignments
    } catch (err) {
      console.error('Error updating assignment:', err);
      throw err;
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    try {
      await studyGroupApi.delete(id);
      await loadAssignments(); // Reload assignments
    } catch (err) {
      console.error('Error deleting assignment:', err);
    }
  };

  return (
    <div className='flex flex-col gap-4 min-h-[calc(100vh-250px)]'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Assignments</h1>
          <p className='text-sm text-gray-600 mt-1'>
            {hasAssignments ? `Showing ${currentAssignments.length} of ${filteredAssignments.length} assignments` : 'No assignments created yet'}
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
            className='bg-red-600 hover:bg-red-700 text-white px-6 py-3'
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className='w-4 h-4 mr-2' />
            Add Assignment
          </Button>
          <Button 
            variant="outline"
            onClick={() => setHasAssignments(!hasAssignments)}
            className="text-sm"
          >
            {hasAssignments ? 'Show Empty State' : 'Show Assignments'}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Loading assignments...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500 text-lg">{error}</p>
          <Button onClick={loadAssignments} className="mt-4">
            Try Again
          </Button>
        </div>
      ) : hasAssignments ? (
        <>
          {filteredAssignments.length > 0 ? (
            <>
              <div className="space-y-4">
                {currentAssignments.map((assignment) => (
                  <AssignmentCard 
                    key={assignment.id} 
                    assignment={assignment}
                    onUpdate={handleUpdateAssignment}
                    onDelete={handleDeleteAssignment}
                  />
                ))}
              </div>
              
              {totalPages > 1 && (
                <Pagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No assignments found for the selected filter.</p>
            </div>
          )}
        </>
      ) : (
        <EmptyState />
      )}

      <CreateAssignmentModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateAssignment}
      />
    </div>
  );
}