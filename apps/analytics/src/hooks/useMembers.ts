import { useQuery } from '@tanstack/react-query';
import { getMembers, getMemberById, Member } from '@/services/members';
import { QUERY_PATHS } from '@/utils/constants';
import { AdminApiCaller } from '@/services/init';

export const useMembers = ({
  church_id,
  page = 1,
}: {
  church_id?: string | number;
  page?: number;
} = {}) => {
  return useQuery({
    queryKey: [QUERY_PATHS.MEMBERS_ALL, church_id, page],
    queryFn: () => getMembers({ church_id, page }),
    enabled: !!church_id,
  });
};

export const useMemberById = (id: string) => {
  return useQuery({
    queryKey: [QUERY_PATHS.WORKER_DETAIL.replace(':id', id)],
    queryFn: () => getMemberById(id),
    enabled: !!id,
  });
};

export const useMembersOptions = (church_id?: string | number) => {
  return useQuery({
    queryKey: [QUERY_PATHS.WORKERS, 'options', church_id],
    queryFn: async () => {
      try {
        const response = await AdminApiCaller.get(QUERY_PATHS.WORKERS, {
          params: {
            ...(church_id && { church_id }),
          },
        });
        
        // Handle nested response structure: data.data.data[]
        let membersData = [];
        if (response.data?.data?.data) {
          membersData = response.data.data.data;
        } else if (response.data?.data) {
          membersData = response.data.data;
        } else if (Array.isArray(response.data)) {
          membersData = response.data;
        }
        
        return Array.isArray(membersData) ? membersData : [];
      } catch (error) {
        console.error('Failed to fetch members:', error);
        throw new Error('Failed to fetch members');
      }
    },
    enabled: !!church_id,
    select: (data) => {
      if (!data || !Array.isArray(data)) return [];
      
      return data.map((member: Member) => ({
        label: `${member.first_name} ${member.last_name}${member.status ? ` (${member.status})` : ''}`,
        value: member.id.toString(),
      }));
    },
  });
};