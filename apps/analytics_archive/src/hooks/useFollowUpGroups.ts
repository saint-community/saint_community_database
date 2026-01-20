import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getFollowUpGroups,
  getFollowUpSessions,
  createFollowUpGroup,
  createFollowUpSession,
  updateFollowUpGroup,
  deleteFollowUpGroup,
  deleteFollowUpSession,
  getFollowUpGroupAttendance,
  markOnePresent,
  markAllPresent,
  markOneAbsent,
  addParticipant,
  removeParticipant,
  FollowUpGroupListParams,
  FollowUpSessionsListParams,
  FollowUpGroupAttendanceParams,
  CreateFollowUpGroupData,
  CreateFollowUpSessionData,
  UpdateFollowUpGroupData,
  MarkAttendanceParams,
  MarkAllAttendanceParams,
  AddParticipantParams,
  RemoveParticipantParams,
} from '@/services/followUp';

export const FOLLOWUP_QUERY_KEYS = {
  groups: ['followup-groups'] as const,
  group: (id: string) => ['followup-group', id] as const,
  sessions: ['followup-sessions'] as const,
  session: (id: string) => ['followup-session', id] as const,
  attendance: ['followup-attendance'] as const,
};

export const useFollowUpGroups = (params?: FollowUpGroupListParams) => {
  return useQuery({
    queryKey: [...FOLLOWUP_QUERY_KEYS.groups, params],
    queryFn: () => getFollowUpGroups(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useFollowUpSessions = (params?: FollowUpSessionsListParams) => {
  return useQuery({
    queryKey: [...FOLLOWUP_QUERY_KEYS.sessions, params],
    queryFn: () => getFollowUpSessions(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useFollowUpGroupAttendance = (params?: FollowUpGroupAttendanceParams) => {
  return useQuery({
    queryKey: [...FOLLOWUP_QUERY_KEYS.attendance, params],
    queryFn: () => getFollowUpGroupAttendance(params),
    staleTime: 1 * 60 * 1000,
  });
};

export const useCreateFollowUpGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFollowUpGroupData) => createFollowUpGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FOLLOWUP_QUERY_KEYS.groups });
    },
  });
};

export const useCreateFollowUpSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFollowUpSessionData) => createFollowUpSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FOLLOWUP_QUERY_KEYS.sessions });
    },
  });
};

export const useUpdateFollowUpGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateFollowUpGroupData) => updateFollowUpGroup(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: FOLLOWUP_QUERY_KEYS.groups });
      queryClient.invalidateQueries({ queryKey: FOLLOWUP_QUERY_KEYS.group(variables.id) });
    },
  });
};

export const useDeleteFollowUpGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteFollowUpGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FOLLOWUP_QUERY_KEYS.groups });
    },
  });
};

export const useDeleteFollowUpSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteFollowUpSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FOLLOWUP_QUERY_KEYS.sessions });
    },
  });
};

export const useMarkFollowUpAttendanceOnePresent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: MarkAttendanceParams) => markOnePresent(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FOLLOWUP_QUERY_KEYS.attendance });
    },
  });
};

export const useMarkFollowUpAttendanceAllPresent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: MarkAllAttendanceParams) => markAllPresent(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FOLLOWUP_QUERY_KEYS.attendance });
    },
  });
};

export const useMarkFollowUpAttendanceOneAbsent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: MarkAttendanceParams) => markOneAbsent(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FOLLOWUP_QUERY_KEYS.attendance });
    },
  });
};

export const useAddFollowUpParticipant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: AddParticipantParams) => addParticipant(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FOLLOWUP_QUERY_KEYS.groups });
      queryClient.invalidateQueries({ queryKey: FOLLOWUP_QUERY_KEYS.attendance });
    },
  });
};

export const useRemoveFollowUpParticipant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: RemoveParticipantParams) => removeParticipant(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FOLLOWUP_QUERY_KEYS.groups });
      queryClient.invalidateQueries({ queryKey: FOLLOWUP_QUERY_KEYS.attendance });
    },
  });
};