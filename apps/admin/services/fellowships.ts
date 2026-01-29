import { QUERY_PATHS } from '@/utils/constants';
import { ApiCaller } from './init';

interface FellowshipFilters {
  page?: number;
  name?: string;
  church?: string;
}

export const getFellowships = async (filters: FellowshipFilters = {}) => {
  // console.log('getFellowships called with filters:', filters);
  const { page = 1, church, ...searchFilters } = filters;
  
  // Build params object with only non-empty values
  const params: Record<string, any> = { page };
  
  if (church && church.trim() !== '') {
    params.church_id = church;
    // console.log('Added church_id to fellowship params:', church);
  }
  
  Object.entries(searchFilters).forEach(([key, value]) => {
    if (value && value.trim() !== '') {
      params[key] = value;
    }
  });

  // console.log('Final fellowship API params:', params);

  const { data } = await ApiCaller.get(QUERY_PATHS.FELLOWSHIPS, {
    params,
  });
  // console.log('getFellowships API response:', data);
  const result = data?.data || [];
  // console.log('getFellowships final return:', result);
  return result;
};

export const createFellowship = async (body: {
  name: string;
  church_id: number;
  cordinator_id?: number;
  address: string;
  active: boolean;
  start_date: string;
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

// Dedicated function for getting fellowships as options
export const getFellowshipsOptions = async (churchId?: string) => {
  try {
    // console.log('getFellowshipsOptions called with churchId:', churchId);
    const params: Record<string, any> = { limit: 1000 }; // Get a large number to avoid pagination
    
    if (churchId && churchId.trim() !== '') {
      params.church_id = churchId;
      // console.log('Added church_id to fellowship options params:', churchId);
    }
    
    // console.log('Fellowship options API params:', params);
    
    const { data } = await ApiCaller.get(QUERY_PATHS.FELLOWSHIPS, { params });
    // console.log('getFellowshipsOptions API response:', data);
    
    // Handle both paginated and non-paginated responses
    const fellowships = data?.data || data || [];
    // console.log('getFellowshipsOptions final return:', fellowships);
    return fellowships;
  } catch (error) {
    // console.error('Error fetching fellowship options:', error);
    return [];
  }
};
