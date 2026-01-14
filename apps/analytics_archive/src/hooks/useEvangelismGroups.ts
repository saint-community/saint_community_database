import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getEvangelismGroups,
  getEvangelismSessions,
  createEvangelismGroup,
  createEvangelismSession,
  updateEvangelismGroup,
  deleteEvangelismGroup,
  deleteEvangelismSession,
  getEvangelismGroupAttendance,
  markOnePresent,
  markAllPresent,
  markOneAbsent,
  addParticipant,
  removeParticipant,
  EvangelismGroupListParams,
  EvangelismSessionsListParams,
  EvangelismGroupAttendanceParams,
  CreateEvangelismGroupData,
  CreateEvangelismSessionData,
  UpdateEvangelismGroupData,
  MarkAttendanceParams,
  MarkAllAttendanceParams,
  AddParticipantParams,
  RemoveParticipantParams,
} from '@/services/evangelism';

export const EVANGELISM_QUERY_KEYS = {
  groups: ['evangelism-groups'] as const,
  group: (id: string) => ['evangelism-group', id] as const,
  sessions: ['evangelism-sessions'] as const,
  session: (id: string) => ['evangelism-session', id] as const,
  attendance: ['evangelism-attendance'] as const,
};

export const useEvangelismGroups = (params?: EvangelismGroupListParams) => {
  return useQuery({
    queryKey: [...EVANGELISM_QUERY_KEYS.groups, params],
    queryFn: () => getEvangelismGroups(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useEvangelismSessions = (params?: EvangelismSessionsListParams) => {
  return useQuery({
    queryKey: [...EVANGELISM_QUERY_KEYS.sessions, params],
    queryFn: () => getEvangelismSessions(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useEvangelismGroupAttendance = (params?: EvangelismGroupAttendanceParams) => {
  return useQuery({
    queryKey: [...EVANGELISM_QUERY_KEYS.attendance, params],
    queryFn: () => getEvangelismGroupAttendance(params),
    staleTime: 1 * 60 * 1000,
  });
};

export const useCreateEvangelismGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEvangelismGroupData) => createEvangelismGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVANGELISM_QUERY_KEYS.groups });
    },
  });
};

export const useCreateEvangelismSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEvangelismSessionData) => createEvangelismSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVANGELISM_QUERY_KEYS.sessions });
    },
  });
};

export const useUpdateEvangelismGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateEvangelismGroupData) => updateEvangelismGroup(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: EVANGELISM_QUERY_KEYS.groups });
      queryClient.invalidateQueries({ queryKey: EVANGELISM_QUERY_KEYS.group(variables.id) });
    },
  });
};

export const useDeleteEvangelismGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteEvangelismGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVANGELISM_QUERY_KEYS.groups });
    },
  });
};

export const useDeleteEvangelismSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteEvangelismSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVANGELISM_QUERY_KEYS.sessions });
    },
  });
};

export const useMarkEvangelismAttendanceOnePresent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: MarkAttendanceParams) => markOnePresent(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVANGELISM_QUERY_KEYS.attendance });
    },
  });
};

export const useMarkEvangelismAttendanceAllPresent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: MarkAllAttendanceParams) => markAllPresent(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVANGELISM_QUERY_KEYS.attendance });
    },
  });
};

export const useMarkEvangelismAttendanceOneAbsent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: MarkAttendanceParams) => markOneAbsent(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVANGELISM_QUERY_KEYS.attendance });
    },
  });
};

export const useAddEvangelismParticipant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: AddParticipantParams) => addParticipant(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVANGELISM_QUERY_KEYS.groups });
      queryClient.invalidateQueries({ queryKey: EVANGELISM_QUERY_KEYS.attendance });
    },
  });
};

export const useRemoveEvangelismParticipant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: RemoveParticipantParams) => removeParticipant(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVANGELISM_QUERY_KEYS.groups });
      queryClient.invalidateQueries({ queryKey: EVANGELISM_QUERY_KEYS.attendance });
    },
  });
};