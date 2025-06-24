import { QUERY_PATHS } from '@/utils/constants';
import { ApiCaller } from './init';

export const getChurches = async () => {
  const { data } = await ApiCaller.get(QUERY_PATHS.CHURCHES);
  return data?.data || [];
};

export const createChurch = async (body: {
  name: string;
  country: string;
  state: string;
  address: string;
  active: boolean;
  start_date: string;
}) => {
  const { data } = await ApiCaller.post(QUERY_PATHS.CHURCH_CREATE, {
    ...body,
  });
  return data || {};
};

export const getChurchById = async (id: string) => {
  const { data } = await ApiCaller.get(
    QUERY_PATHS.CHURCH_DETAIL.replace(':id', id)
  );
  return data?.data || {};
};

export const updateChurch = async (
  id: string,
  body: {
    name: string;
    // country: string;
    state: string;
    address: string;
    active: boolean;
  }
) => {
  const { data } = await ApiCaller.put(
    QUERY_PATHS.CHURCH_UPDATE.replace(':id', id),
    {
      ...body,
    }
  );
  return data || {};
};
