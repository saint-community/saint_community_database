import { AdminApiCaller, ApiCaller } from './init';
import { QUERY_PATHS } from '@/src/utils/constants';

// Types for Study Group Submissions
export interface StudyGroupSubmission {
  id: string;
  member_id: string;
  worker_id: number;
  study_group_id: string;
  study_group_title?: string;
  assignment_link?: string;
  submitted_at: string;
  status: 'submitted' | 'late' | 'approved' | 'rejected' | 'redo_requested' | 'graded';
  score?: number;
  feedback?: string;
  is_late: boolean;
  week_number: number;
  year: number;
  graded_at?: string;
  graded_by?: number;
  redo_requested: boolean;
  redo_note?: string;
  redo_requested_at?: string;
  redo_requested_by?: number;
  submission_method: 'online_by_member' | 'online_by_leader' | 'offline_by_leader';
  leader_id?: number;
  submitter_role: 'worker' | 'leader';
  submitter_id?: number;
  member_name?: string;
  member_church_id?: number;
  member_fellowship_id?: number;
  member_cell_id?: number;
  created_at: string;
  updated_at: string;
}

export interface SubmissionFilters {
  church_id?: number;
  status?: string;
  page?: number;
  limit?: number;
  member_name?: string;
  date_from?: string;
  date_to?: string;
  fellowship_id?: number;
  cell_id?: number;
}

export interface GradeSubmissionDto {
  score: number;
  feedback?: string;
}

export interface RequestRedoDto {
  redo_note: string;
}

export interface CreateSubmissionDto {
  worker_id?: number;
  member_name: string;
  study_group_id: string;
  assignment_link?: string;
  submission_method: 'online_by_member' | 'online_by_leader' | 'offline_by_leader';
  submitter_role: 'worker' | 'leader';
  member_church_id: number;
  member_fellowship_id?: number;
  member_id?: number;
  feedback?: string;
}

export interface BulkGradeDto {
  submission_ids: string[];
  score: number;
  feedback?: string;
}

export interface BulkRedoDto {
  submission_ids: string[];
  redo_note: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SubmissionStats {
  total_submissions: number;
  pending_review: number;
  approved: number;
  rejected: number;
  redo_requested: number;
  average_score: number;
  submission_rate: number;
}

// Submissions API Functions with enhanced error handling and edge case management
export const submissionsApi = {
  // Get submissions for review with pagination and filtering
  async getForReview(filters: SubmissionFilters = {}): Promise<PaginatedResponse<StudyGroupSubmission>> {
<<<<<<< HEAD
    try {
      // Validate input parameters
      const validatedFilters = {
        ...filters,
        page: Math.max(1, filters.page || 1),
        limit: Math.min(100, Math.max(1, filters.limit || 10)),
      };

      const response = await ApiCaller.get(QUERY_PATHS.SUBMISSIONS, {
        params: validatedFilters,
      });

      // Handle different response structures
      const responseData = response.data;
      
      if (!responseData) {
        return { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
      }

      // Check if response has pagination structure
      if (responseData.data && Array.isArray(responseData.data)) {
        return {
          data: responseData.data,
          pagination: responseData.pagination || {
            page: validatedFilters.page,
            limit: validatedFilters.limit,
            total: responseData.data.length,
            totalPages: Math.ceil(responseData.data.length / validatedFilters.limit)
          }
        };
      }

      // Handle direct array response
      if (Array.isArray(responseData)) {
        return {
          data: responseData,
          pagination: {
            page: validatedFilters.page,
            limit: validatedFilters.limit,
            total: responseData.length,
            totalPages: Math.ceil(responseData.length / validatedFilters.limit)
          }
        };
      }

      // Fallback for unexpected response structure
      return { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };

    } catch (error: any) {
      console.error('Error fetching submissions for review:', error);
      
      // Handle specific error types
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      } else if (error.response?.status === 403) {
        throw new Error('You do not have permission to view submissions.');
      } else if (error.response?.status === 404) {
        throw new Error('Submissions endpoint not found.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      }
      
      throw new Error('Failed to load submissions. Please check your connection and try again.');
    }
=======
    const { data } = await ApiCaller.get(QUERY_PATHS.SUBMISSIONS_REVIEW, {
      params: filters,
    });
    return data?.data || data;
>>>>>>> b93c96d (fix styudy group)
  },

  // Get all submissions (alias for getForReview)
  async getAll(filters: SubmissionFilters = {}): Promise<StudyGroupSubmission[]> {
    try {
      const response = await this.getForReview(filters);
      return response.data || [];
    } catch (error) {
      console.error('Error in getAll:', error);
      throw error;
    }
  },

  // Get submission by ID with enhanced validation
  async getById(id: string): Promise<StudyGroupSubmission> {
<<<<<<< HEAD
    try {
      // Validate ID parameter
      if (!id || typeof id !== 'string' || id.trim().length === 0) {
        throw new Error('Invalid submission ID provided.');
      }

      const response = await AdminApiCaller.get(
        QUERY_PATHS.SUBMISSION_DETAIL.replace(':id', id.trim())
      );

      const submissionData = response.data?.data || response.data;
      
      if (!submissionData) {
        throw new Error('Submission not found.');
      }

      return submissionData;
    } catch (error: any) {
      console.error('Error fetching submission by ID:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Submission not found.');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication required.');
      } else if (error.response?.status === 403) {
        throw new Error('You do not have permission to view this submission.');
      }
      
      throw error.message ? new Error(error.message) : new Error('Failed to load submission details.');
    }
=======
    const { data } = await ApiCaller.get(
      QUERY_PATHS.SUBMISSION_DETAIL.replace(':id', id)
    );
    return data?.data || data;
>>>>>>> b93c96d (fix styudy group)
  },

  // Grade a submission with validation
  async grade(id: string, gradeData: GradeSubmissionDto): Promise<StudyGroupSubmission> {
<<<<<<< HEAD
    try {
      // Validate input parameters
      if (!id || typeof id !== 'string' || id.trim().length === 0) {
        throw new Error('Invalid submission ID provided.');
      }

      if (!gradeData || typeof gradeData.score !== 'number') {
        throw new Error('Invalid grade data provided.');
      }

      if (gradeData.score < 0 || gradeData.score > 100) {
        throw new Error('Score must be between 0 and 100.');
      }

      const response = await AdminApiCaller.patch(
        QUERY_PATHS.SUBMISSION_GRADE.replace(':id', id.trim()),
        gradeData
      );

      const submissionData = response.data?.data || response.data;
      
      if (!submissionData) {
        throw new Error('Failed to grade submission.');
      }

      return submissionData;
    } catch (error: any) {
      console.error('Error grading submission:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Submission not found.');
      } else if (error.response?.status === 400) {
        throw new Error(error.response?.data?.message || 'Invalid grade data provided.');
      } else if (error.response?.status === 403) {
        throw new Error('You do not have permission to grade this submission.');
      }
      
      throw error.message ? new Error(error.message) : new Error('Failed to grade submission.');
    }
=======
    const { data } = await ApiCaller.patch(
      QUERY_PATHS.SUBMISSION_GRADE.replace(':id', id),
      gradeData
    );
    return data?.data || data;
>>>>>>> b93c96d (fix styudy group)
  },

  // Grade a submission (alias for grade)
  async gradeSubmission(id: string, gradeData: GradeSubmissionDto): Promise<StudyGroupSubmission> {
    return this.grade(id, gradeData);
  },

  // Request redo for a submission with validation
  async requestRedo(id: string, redoData: RequestRedoDto): Promise<StudyGroupSubmission> {
<<<<<<< HEAD
    try {
      // Validate input parameters
      if (!id || typeof id !== 'string' || id.trim().length === 0) {
        throw new Error('Invalid submission ID provided.');
      }

      if (!redoData || !redoData.redo_note || redoData.redo_note.trim().length === 0) {
        throw new Error('Redo note is required.');
      }

      if (redoData.redo_note.trim().length > 1000) {
        throw new Error('Redo note must be less than 1000 characters.');
      }

      const response = await AdminApiCaller.patch(
        QUERY_PATHS.SUBMISSION_REQUEST_REDO.replace(':id', id.trim()),
        { redo_note: redoData.redo_note.trim() }
      );

      const submissionData = response.data?.data || response.data;
      
      if (!submissionData) {
        throw new Error('Failed to request redo for submission.');
      }

      return submissionData;
    } catch (error: any) {
      console.error('Error requesting redo:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Submission not found.');
      } else if (error.response?.status === 400) {
        throw new Error(error.response?.data?.message || 'Invalid redo request data.');
      } else if (error.response?.status === 403) {
        throw new Error('You do not have permission to request redo for this submission.');
      }
      
      throw error.message ? new Error(error.message) : new Error('Failed to request redo.');
    }
=======
    const { data } = await ApiCaller.patch(
      QUERY_PATHS.SUBMISSION_REQUEST_REDO.replace(':id', id),
      redoData
    );
    return data?.data || data;
>>>>>>> b93c96d (fix styudy group)
  },

  // Bulk grade submissions with validation
  async bulkGrade(bulkData: BulkGradeDto): Promise<void> {
<<<<<<< HEAD
    try {
      // Validate input parameters
      if (!bulkData || !Array.isArray(bulkData.submission_ids) || bulkData.submission_ids.length === 0) {
        throw new Error('At least one submission ID is required.');
      }

      if (bulkData.submission_ids.length > 50) {
        throw new Error('Cannot grade more than 50 submissions at once.');
      }

      if (typeof bulkData.score !== 'number' || bulkData.score < 0 || bulkData.score > 100) {
        throw new Error('Score must be between 0 and 100.');
      }

      // Validate all submission IDs
      const validIds = bulkData.submission_ids.filter(id => 
        id && typeof id === 'string' && id.trim().length > 0
      );

      if (validIds.length !== bulkData.submission_ids.length) {
        throw new Error('All submission IDs must be valid.');
      }

      await AdminApiCaller.patch(QUERY_PATHS.SUBMISSIONS_BULK_GRADE, {
        ...bulkData,
        submission_ids: validIds.map(id => id.trim())
      });
    } catch (error: any) {
      console.error('Error bulk grading submissions:', error);
      
      if (error.response?.status === 400) {
        throw new Error(error.response?.data?.message || 'Invalid bulk grade data provided.');
      } else if (error.response?.status === 403) {
        throw new Error('You do not have permission to grade these submissions.');
      }
      
      throw error.message ? new Error(error.message) : new Error('Failed to bulk grade submissions.');
    }
=======
    await ApiCaller.patch(QUERY_PATHS.SUBMISSIONS_BULK_GRADE, bulkData);
>>>>>>> b93c96d (fix styudy group)
  },

  // Bulk request redo with validation
  async bulkRequestRedo(bulkData: BulkRedoDto): Promise<void> {
<<<<<<< HEAD
    try {
      // Validate input parameters
      if (!bulkData || !Array.isArray(bulkData.submission_ids) || bulkData.submission_ids.length === 0) {
        throw new Error('At least one submission ID is required.');
      }

      if (bulkData.submission_ids.length > 50) {
        throw new Error('Cannot request redo for more than 50 submissions at once.');
      }

      if (!bulkData.redo_note || bulkData.redo_note.trim().length === 0) {
        throw new Error('Redo note is required.');
      }

      if (bulkData.redo_note.trim().length > 1000) {
        throw new Error('Redo note must be less than 1000 characters.');
      }

      // Validate all submission IDs
      const validIds = bulkData.submission_ids.filter(id => 
        id && typeof id === 'string' && id.trim().length > 0
      );

      if (validIds.length !== bulkData.submission_ids.length) {
        throw new Error('All submission IDs must be valid.');
      }

      await AdminApiCaller.patch(QUERY_PATHS.SUBMISSIONS_BULK_REDO, {
        submission_ids: validIds.map(id => id.trim()),
        redo_note: bulkData.redo_note.trim()
      });
    } catch (error: any) {
      console.error('Error bulk requesting redo:', error);
      
      if (error.response?.status === 400) {
        throw new Error(error.response?.data?.message || 'Invalid bulk redo data provided.');
      } else if (error.response?.status === 403) {
        throw new Error('You do not have permission to request redo for these submissions.');
      }
      
      throw error.message ? new Error(error.message) : new Error('Failed to bulk request redo.');
    }
=======
    await ApiCaller.patch(QUERY_PATHS.SUBMISSIONS_BULK_REDO, bulkData);
>>>>>>> b93c96d (fix styudy group)
  },

  // Get submission statistics with validation
  async getStats(churchId?: number, dateFrom?: string, dateTo?: string): Promise<SubmissionStats> {
<<<<<<< HEAD
    try {
      const params: any = {};
      
      if (churchId !== undefined) {
        if (!Number.isInteger(churchId) || churchId <= 0) {
          throw new Error('Invalid church ID provided.');
        }
        params.church_id = churchId;
      }

      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        if (isNaN(fromDate.getTime())) {
          throw new Error('Invalid date_from format. Use YYYY-MM-DD.');
        }
        params.date_from = dateFrom;
      }

      if (dateTo) {
        const toDate = new Date(dateTo);
        if (isNaN(toDate.getTime())) {
          throw new Error('Invalid date_to format. Use YYYY-MM-DD.');
        }
        params.date_to = dateTo;
      }

      // Validate date range
      if (dateFrom && dateTo) {
        const fromDate = new Date(dateFrom);
        const toDate = new Date(dateTo);
        if (fromDate > toDate) {
          throw new Error('date_from cannot be later than date_to.');
        }
      }

      const response = await AdminApiCaller.get(QUERY_PATHS.SUBMISSIONS_STATS, { params });

      const statsData = response.data?.data || response.data;
      
      if (!statsData) {
        // Return default stats if no data
        return {
          total_submissions: 0,
          pending_review: 0,
          approved: 0,
          rejected: 0,
          redo_requested: 0,
          average_score: 0,
          submission_rate: 0
        };
      }

      return statsData;
    } catch (error: any) {
      console.error('Error fetching submission statistics:', error);
      
      if (error.response?.status === 400) {
        throw new Error(error.response?.data?.message || 'Invalid parameters provided.');
      } else if (error.response?.status === 403) {
        throw new Error('You do not have permission to view submission statistics.');
      }
      
      throw error.message ? new Error(error.message) : new Error('Failed to load submission statistics.');
    }
=======
    const { data } = await ApiCaller.get(QUERY_PATHS.SUBMISSIONS_STATS, {
      params: {
        church_id: churchId,
        date_from: dateFrom,
        date_to: dateTo,
      },
    });
    return data?.data || data;
>>>>>>> b93c96d (fix styudy group)
  },

  // Get filtered submission history with validation
  async getFilteredHistory(filters: SubmissionFilters = {}): Promise<StudyGroupSubmission[]> {
<<<<<<< HEAD
    try {
      // Validate and sanitize filters
      const validatedFilters = {
        ...filters,
        page: Math.max(1, filters.page || 1),
        limit: Math.min(100, Math.max(1, filters.limit || 50)),
      };

      if (filters.church_id !== undefined) {
        if (!Number.isInteger(filters.church_id) || filters.church_id <= 0) {
          throw new Error('Invalid church ID provided.');
        }
      }

      if (filters.fellowship_id !== undefined) {
        if (!Number.isInteger(filters.fellowship_id) || filters.fellowship_id <= 0) {
          throw new Error('Invalid fellowship ID provided.');
        }
      }

      if (filters.cell_id !== undefined) {
        if (!Number.isInteger(filters.cell_id) || filters.cell_id <= 0) {
          throw new Error('Invalid cell ID provided.');
        }
      }

      const response = await AdminApiCaller.get(QUERY_PATHS.SUBMISSIONS_HISTORY, {
        params: validatedFilters,
      });

      const historyData = response.data?.data || response.data || [];
      
      return Array.isArray(historyData) ? historyData : [];
    } catch (error: any) {
      console.error('Error fetching submission history:', error);
      
      if (error.response?.status === 400) {
        throw new Error(error.response?.data?.message || 'Invalid filter parameters.');
      } else if (error.response?.status === 403) {
        throw new Error('You do not have permission to view submission history.');
      }
      
      throw error.message ? new Error(error.message) : new Error('Failed to load submission history.');
    }
  },

  // Get submission history (alias for getFilteredHistory)
  async getHistory(filters: SubmissionFilters = {}): Promise<StudyGroupSubmission[]> {
    return this.getFilteredHistory(filters);
  },

  // Create new submission
  async create(submissionData: CreateSubmissionDto): Promise<StudyGroupSubmission> {
    try {
      // Validate input parameters
      if (!submissionData.member_name || submissionData.member_name.trim().length === 0) {
        throw new Error('Member name is required.');
      }

      if (!submissionData.study_group_id || submissionData.study_group_id.trim().length === 0) {
        throw new Error('Study group assignment is required.');
      }

      if (!Number.isInteger(submissionData.member_church_id) || submissionData.member_church_id <= 0) {
        throw new Error('Valid church selection is required.');
      }

      if (submissionData.member_fellowship_id !== undefined) {
        if (!Number.isInteger(submissionData.member_fellowship_id) || submissionData.member_fellowship_id <= 0) {
          throw new Error('Invalid fellowship selection.');
        }
      }

      if (submissionData.member_id !== undefined) {
        if (!Number.isInteger(submissionData.member_id) || submissionData.member_id <= 0) {
          throw new Error('Invalid cell selection.');
        }
      }

      // Validate submission method and link
      const isOfflineSubmission = submissionData.submission_method === 'offline_by_leader';
      if (!isOfflineSubmission && (!submissionData.assignment_link || submissionData.assignment_link.trim().length === 0)) {
        throw new Error('Submission link is required for online submissions.');
      }

      if (submissionData.assignment_link && submissionData.assignment_link.trim().length > 0) {
        try {
          new URL(submissionData.assignment_link.trim());
        } catch {
          throw new Error('Please provide a valid submission link URL.');
        }
      }

      // Sanitize data
      const sanitizedData = {
        ...submissionData,
        member_name: submissionData.member_name.trim(),
        study_group_id: submissionData.study_group_id.trim(),
        assignment_link: submissionData.assignment_link?.trim() || null,
        feedback: submissionData.feedback?.trim() || '',
      };

      const response = await ApiCaller.post(QUERY_PATHS.SUBMISSIONS, sanitizedData);

      const submissionResult = response.data?.data || response.data;
      
      if (!submissionResult) {
        throw new Error('Failed to create submission.');
      }

      return submissionResult;
    } catch (error: any) {
      console.error('Error creating submission:', error);
      
      if (error.response?.status === 400) {
        throw new Error(error.response?.data?.message || 'Invalid submission data provided.');
      } else if (error.response?.status === 403) {
        throw new Error('You do not have permission to create submissions.');
      } else if (error.response?.status === 409) {
        throw new Error('A submission for this assignment already exists for this member.');
      }
      
      throw error.message ? new Error(error.message) : new Error('Failed to create submission.');
    }
=======
    const { data } = await ApiCaller.get(QUERY_PATHS.SUBMISSIONS_HISTORY, {
      params: filters,
    });
    return data?.data || data || [];
>>>>>>> b93c96d (fix styudy group)
  },
};

// Helper function to map frontend submission status to backend status
export const mapSubmissionStatusToBackend = (frontendStatus: string): string => {
  const statusMap: Record<string, string> = {
    pending: 'submitted',
    approved: 'approved',
    redo: 'redo_requested',
  };
  return statusMap[frontendStatus] || frontendStatus;
};

// Helper function to map backend submission status to frontend status
export const mapSubmissionStatusToFrontend = (backendStatus: string): string => {
  const statusMap: Record<string, string> = {
    submitted: 'pending',
    approved: 'approved',
    redo_requested: 'redo',
    graded: 'approved', // Treat graded as approved for frontend
    rejected: 'redo', // Treat rejected as redo for frontend
    late: 'pending', // Treat late as pending for frontend
  };
  return statusMap[backendStatus] || backendStatus;
};
