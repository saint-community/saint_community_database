import { QUERY_PATHS } from '@/utils/constants';
import { ApiCaller } from './init';

interface ChurchFilters {
  page?: number;
  name?: string;
  country?: string;
}

export const getChurches = async (filters: ChurchFilters = {}) => {
  const { page = 1, ...searchFilters } = filters;
  
  // Only include non-empty filter values
  const params: Record<string, any> = { page };
  
  Object.entries(searchFilters).forEach(([key, value]) => {
    if (value && value.trim() !== '') {
      params[key] = value;
    }
  });

  const { data } = await ApiCaller.get(QUERY_PATHS.CHURCHES, {
    params,
  });
  // console.log('getChurches API response:', data);
  const result = data?.data || [];
  // console.log('getChurches final return:', result);
  return result;
};

// Dedicated function for getting all churches as options (without pagination)
export const getChurchesOptions = async () => {
  try {
    const { data } = await ApiCaller.get(QUERY_PATHS.CHURCHES, {
      params: { limit: 1000 } // Get a large number to avoid pagination
    });
    // console.log('getChurchesOptions API response:', data);
    
    // Handle both paginated and non-paginated responses
    const churches = data?.data || data || [];
    // console.log('getChurchesOptions final return:', churches);
    return churches;
  } catch (error) {
    // console.error('Error fetching church options:', error);
    return [];
  }
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
