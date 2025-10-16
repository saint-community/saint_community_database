import { AdminApiCaller } from './init';
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

// Submissions API Functions
export const submissionsApi = {
  // Get all submissions (alias for getForReview)
  async getAll(filters: SubmissionFilters = {}): Promise<StudyGroupSubmission[]> {
    const response = await this.getForReview(filters);
    return response.data || [];
  },

  // Get submissions for review with pagination and filtering
  async getForReview(filters: SubmissionFilters = {}): Promise<PaginatedResponse<StudyGroupSubmission>> {
    const { data } = await AdminApiCaller.get(QUERY_PATHS.SUBMISSIONS_REVIEW, {
      params: filters,
    });
    return data?.data || data;
  },

  // Get submission history (alias for getFilteredHistory)
  async getHistory(filters: SubmissionFilters = {}): Promise<StudyGroupSubmission[]> {
    return this.getFilteredHistory(filters);
  },

  // Get submission by ID
  async getById(id: string): Promise<StudyGroupSubmission> {
    const { data } = await AdminApiCaller.get(
      QUERY_PATHS.SUBMISSION_DETAIL.replace(':id', id)
    );
    return data?.data || data;
  },

  // Grade a submission
  async grade(id: string, gradeData: GradeSubmissionDto): Promise<StudyGroupSubmission> {
    const { data } = await AdminApiCaller.patch(
      QUERY_PATHS.SUBMISSION_GRADE.replace(':id', id),
      gradeData
    );
    return data?.data || data;
  },

  // Grade a submission (alias for grade)
  async gradeSubmission(id: string, gradeData: GradeSubmissionDto): Promise<StudyGroupSubmission> {
    return this.grade(id, gradeData);
  },

  // Request redo for a submission
  async requestRedo(id: string, redoData: RequestRedoDto): Promise<StudyGroupSubmission> {
    const { data } = await AdminApiCaller.patch(
      QUERY_PATHS.SUBMISSION_REQUEST_REDO.replace(':id', id),
      redoData
    );
    return data?.data || data;
  },

  // Bulk grade submissions
  async bulkGrade(bulkData: BulkGradeDto): Promise<void> {
    await AdminApiCaller.patch(QUERY_PATHS.SUBMISSIONS_BULK_GRADE, bulkData);
  },

  // Bulk request redo
  async bulkRequestRedo(bulkData: BulkRedoDto): Promise<void> {
    await AdminApiCaller.patch(QUERY_PATHS.SUBMISSIONS_BULK_REDO, bulkData);
  },

  // Get submission statistics
  async getStats(churchId?: number, dateFrom?: string, dateTo?: string): Promise<SubmissionStats> {
    const { data } = await AdminApiCaller.get(QUERY_PATHS.SUBMISSIONS_STATS, {
      params: {
        church_id: churchId,
        date_from: dateFrom,
        date_to: dateTo,
      },
    });
    return data?.data || data;
  },

  // Get filtered submission history
  async getFilteredHistory(filters: SubmissionFilters = {}): Promise<StudyGroupSubmission[]> {
    const { data } = await AdminApiCaller.get(QUERY_PATHS.SUBMISSIONS_HISTORY, {
      params: filters,
    });
    return data?.data || data || [];
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
