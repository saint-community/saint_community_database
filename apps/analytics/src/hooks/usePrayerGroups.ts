import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getPrayerGroups,
  getPrayerMeetings,
  createPrayerGroup,
  createPrayerMeeting,
  updatePrayerGroup,
  deletePrayerGroup,
  deletePrayerMeeting,
  getPrayerGroupAttendance,
  markOnePresent,
  markAllPresent,
  markOneAbsent,
  addParticipant,
  removeParticipant,
  type PrayerGroupListParams,
  type PrayerMeetingsListParams,
  type CreatePrayerGroupData,
  type CreatePrayerMeetingData,
  type UpdatePrayerGroupData,
  type PrayerGroupAttendanceParams,
  type MarkAttendanceParams,
  type MarkAllAttendanceParams,
  type AddParticipantParams,
  type RemoveParticipantParams,
} from '@/services/prayerGroup';

export const usePrayerGroups = (params?: PrayerGroupListParams) => {
  return useQuery({
    queryKey: ['prayerGroups', params],
    queryFn: () => getPrayerGroups(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const usePrayerMeetings = (params?: PrayerMeetingsListParams) => {
  return useQuery({
    queryKey: ['prayerMeetings', params],
    queryFn: () => getPrayerMeetings(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCreatePrayerGroup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createPrayerGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayerGroups'] });
    },
  });
};

export const useCreatePrayerMeeting = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createPrayerMeeting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayerMeetings'] });
    },
  });
};

export const useUpdatePrayerGroup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updatePrayerGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayerGroups'] });
    },
  });
};

export const useDeletePrayerGroup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deletePrayerGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayerGroups'] });
    },
  });
};

export const useDeletePrayerMeeting = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deletePrayerMeeting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayerMeetings'] });
    },
  });
};

export const usePrayerGroupAttendance = (params?: PrayerGroupAttendanceParams) => {
  return useQuery({
    queryKey: ['prayerGroupAttendance', params],
    queryFn: () => getPrayerGroupAttendance(params),
    staleTime: 30 * 1000, // 30 seconds for real-time attendance
    
  });
};

// Attendance Management Hooks
export const useMarkOnePresent = (params: MarkAttendanceParams) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => markOnePresent(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayerGroupAttendance'] });
    },
  });
};

export const useMarkAllPresent = (params: PrayerGroupAttendanceParams) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => markAllPresent(params),
    mutationKey: ['markAllPresent',params],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayerGroupAttendance'] });
    },
  });
};

export const useMarkOneAbsent = (params: MarkAttendanceParams) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => markOneAbsent(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayerGroupAttendance'] });
    },
  });
};

// Participant Management Hooks
export const useAddParticipant = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: addParticipant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayerGroupAttendance'] });
    },
  });
};

export const useRemoveParticipant = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: removeParticipant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayerGroupAttendance'] });
    },
  });
};