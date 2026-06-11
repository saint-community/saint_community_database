import { QUERY_PATHS } from '@/utils/constants';
import { ApiCaller } from './init';

export type OwnershipEntityType = 'church' | 'fellowship' | 'cell';

export type OwnershipPayload = {
  user_id: string | number;
  entity_type: OwnershipEntityType;
  entity_id: string | number;
};

export const getOwnershipOptions = async () => {
  const { data } = await ApiCaller.get(QUERY_PATHS.OWNERSHIP_OPTIONS);
  return data?.data || {};
};

export const getEntityOwnership = async (
  entityType: OwnershipEntityType,
  entityId: string
) => {
  const { data } = await ApiCaller.get(QUERY_PATHS.OWNERSHIP_ENTITY, {
    params: {
      entity_type: entityType,
      entity_id: entityId,
    },
  });

  return data?.data || {};
};

export const getUserOwnership = async (userId: string) => {
  const { data } = await ApiCaller.get(
    QUERY_PATHS.OWNERSHIP_USER.replace(':userId', userId)
  );

  return data?.data || {};
};

export const addOwnership = async (payload: OwnershipPayload) => {
  const { data } = await ApiCaller.post(QUERY_PATHS.OWNERSHIP_CREATE, payload);
  return data;
};

export const removeOwnership = async (id: string | number) => {
  const { data } = await ApiCaller.delete(
    QUERY_PATHS.OWNERSHIP_DELETE.replace(':id', String(id))
  );
  return data;
};
