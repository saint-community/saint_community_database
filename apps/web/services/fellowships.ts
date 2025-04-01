import { QUERY_PATHS } from '@/utils/constants';
import { ApiCaller } from './init';

export const getFellowships = async () => {
  const { data } = await ApiCaller.get(QUERY_PATHS.FELLOWSHIPS);
  return data?.data || [];
};

export const createFellowship = async (body: {
  name: string;
  church_id: number;
  cordinator_id: number;
  address: string;
  active: boolean;
}) => {
  const { data } = await ApiCaller.post(QUERY_PATHS.FELLOWSHIP_CREATE, {
    ...body,
  });
  return data || {};
};

export const getFellowshipById = async (id: string) => {
  const { data } = await ApiCaller.get(
    QUERY_PATHS.FELLOWSHIP_DETAIL.replace(':id', id)
  );
  return data?.data || {};
};

export const updateFellowship = async (
  id: string,
  body: {
    name: string;
    church_id: number;
    cordinator_id: number;
    address: string;
    active: boolean;
  }
) => {
  const { data } = await ApiCaller.put(
    QUERY_PATHS.FELLOWSHIP_UPDATE.replace(':id', id),
    {
      ...body,
    }
  );
  return data || {};
};
