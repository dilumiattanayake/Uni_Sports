// services/location.service.ts
import { fetchWithAuth } from './apiClient';

// Optional: You can export this interface to use throughout your frontend components
export interface LocationPayload {
  name: string;
  type: 'field' | 'court' | 'gym' | 'pool' | 'track' | 'hall' | 'other';
  capacity: number;
  address: string;
}

export const locationService = {
  // GET /api/locations/types/list
  getTypes: async () => {
    return fetchWithAuth('/locations/types/list');
  },

  // GET /api/locations
  getAll: async (queryParams = "") => {
    return fetchWithAuth(`/locations${queryParams ? `?${queryParams}` : ''}`);
  },
  
  // GET /api/locations/:id
  getById: async (id: string) => {
    return fetchWithAuth(`/locations/${id}`);
  },
  
  // POST /api/locations
  create: async (data: LocationPayload) => {
    return fetchWithAuth(`/locations`, { 
      method: "POST", 
      body: JSON.stringify(data) 
    });
  },
  
  // PUT /api/locations/:id
  update: async (id: string, data: Partial<LocationPayload>) => {
    return fetchWithAuth(`/locations/${id}`, { 
      method: "PUT", 
      body: JSON.stringify(data) 
    });
  },
  
  // DELETE /api/locations/:id
  delete: async (id: string) => {
    return fetchWithAuth(`/locations/${id}`, { 
      method: "DELETE" 
    });
  }
};