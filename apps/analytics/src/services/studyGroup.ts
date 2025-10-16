import { AdminApiCaller } from './init';
import { QUERY_PATHS } from '@/src/utils/constants';

// Types for Study Group (Assignments)
export interface StudyGroup {
  id: string;
  title: string;
  description?: string;
  questions: string[];
  week_start_date: string;
  week_end_date: string;
  due_date: string;
  is_current_week: boolean;
  church_id: number;
  created_by: number;
  status: 'active' | 'inactive' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface CreateStudyGroupDto {
  title: string;
  description?: string;
  questions?: string[];
  week_start_date: string;
  week_end_date: string;
  due_date: string;
  is_current_week?: boolean;
  church_id: number;
  created_by?: number;
  status?: 'active' | 'inactive' | 'completed';
}

export interface UpdateStudyGroupDto {
  title?: string;
  description?: string;
  questions?: string[];
  week_start_date?: string;
  week_end_date?: string;
  due_date?: string;
  is_current_week?: boolean;
  status?: 'active' | 'inactive' | 'completed';
}

export interface StudyGroupFilters {
  church_id?: number;
  status?: string;
  page?: number;
  limit?: number;
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

// Study Group API Functions
export const studyGroupApi = {
  // Get all study groups with optional filtering
  async getAll(filters: StudyGroupFilters = {}): Promise<StudyGroup[]> {
    const { data } = await AdminApiCaller.get(QUERY_PATHS.STUDY_GROUPS, {
      params: filters,
    });
    return data?.data || data || [];
  },

  // Get study group by ID
  async getById(id: string): Promise<StudyGroup> {
    const { data } = await AdminApiCaller.get(
      QUERY_PATHS.STUDY_GROUP_DETAIL.replace(':id', id)
    );
    return data?.data || data;
  },

  // Create new study group
  async create(studyGroup: CreateStudyGroupDto): Promise<StudyGroup> {
    const { data } = await AdminApiCaller.post(QUERY_PATHS.STUDY_GROUP_CREATE, studyGroup);
    return data?.data || data;
  },

  // Update study group
  async update(id: string, studyGroup: UpdateStudyGroupDto): Promise<StudyGroup> {
    const { data } = await AdminApiCaller.patch(
      QUERY_PATHS.STUDY_GROUP_UPDATE.replace(':id', id),
      studyGroup
    );
    return data?.data || data;
  },

  // Delete study group
  async delete(id: string): Promise<void> {
    await AdminApiCaller.delete(QUERY_PATHS.STUDY_GROUP_DELETE.replace(':id', id));
  },

  // Get current week assignment
  async getCurrentWeek(churchId?: number): Promise<StudyGroup> {
    const { data } = await AdminApiCaller.get(QUERY_PATHS.STUDY_GROUP_CURRENT_WEEK, {
      params: { church_id: churchId },
    });
    return data?.data || data;
  },

  // Get weekly assignments by year
  async getWeeklyByYear(year: number, churchId?: number): Promise<StudyGroup[]> {
    const { data } = await AdminApiCaller.get(
      QUERY_PATHS.STUDY_GROUP_WEEKLY.replace(':year', year.toString()),
      {
        params: { church_id: churchId },
      }
    );
    return data?.data || data || [];
  },
};

// Helper function to map frontend status to backend status
export const mapStatusToBackend = (frontendStatus: string): string => {
  const statusMap: Record<string, string> = {
    waiting: 'inactive',
    active: 'active',
    overdue: 'completed',
  };
  return statusMap[frontendStatus] || frontendStatus;
};

// Helper function to map backend status to frontend status
export const mapStatusToFrontend = (backendStatus: string): string => {
  const statusMap: Record<string, string> = {
    inactive: 'waiting',
    active: 'active',
    completed: 'overdue',
  };
  return statusMap[backendStatus] || backendStatus;
};

