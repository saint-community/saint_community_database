import {
  getEntityOwnership,
  getOwnershipOptions,
  getUserOwnership,
  type OwnershipEntityType,
} from '@/services/ownership';
import { QUERY_PATHS } from '@/utils/constants';
import { useQuery } from '@tanstack/react-query';

export const useOwnershipOptions = () => {
  return useQuery({
    queryKey: [QUERY_PATHS.OWNERSHIP_OPTIONS],
    queryFn: getOwnershipOptions,
  });
};

export const useEntityOwnership = (
  entityType: OwnershipEntityType,
  entityId: string
) => {
  return useQuery({
    queryKey: [QUERY_PATHS.OWNERSHIP_ENTITY, entityType, entityId],
    queryFn: () => getEntityOwnership(entityType, entityId),
    enabled: !!entityType && !!entityId,
  });
};

export const useUserOwnership = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_PATHS.OWNERSHIP_USER, userId],
    queryFn: () => getUserOwnership(userId),
    enabled: !!userId,
  });
};
