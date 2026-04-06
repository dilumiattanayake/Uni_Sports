// services/inventory.service.ts
import { fetchWithAuth } from './apiClient';

export const inventoryService = {
  getAll: async (queryParams = "") => {
    return fetchWithAuth(`/inventory${queryParams ? `?${queryParams}` : ''}`);
  },
  
  getById: async (id: string) => {
    return fetchWithAuth(`/inventory/${id}`);
  },
  
  // Uses FormData to handle the image upload
  create: async (formData: FormData) => {
    return fetchWithAuth(`/inventory`, { method: "POST", body: formData }, true);
  },
  
  // Uses FormData to handle the image upload
  update: async (id: string, formData: FormData) => {
    return fetchWithAuth(`/inventory/${id}`, { method: "PUT", body: formData }, true);
  },
  
  delete: async (id: string) => {
    return fetchWithAuth(`/inventory/${id}`, { method: "DELETE" });
  },
  
  reportIssue: async (id: string, data: { damagedAmount: number; lostAmount: number }) => {
    return fetchWithAuth(`/inventory/${id}/report-issue`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  joinWaitlist: async (id: string) => {
    return fetchWithAuth(`/inventory/${id}/waitlist`, {
      method: "POST",
    });
  },

  leaveWaitlist: async (id: string) => {
    return fetchWithAuth(`/inventory/${id}/waitlist`, {
      method: "DELETE",
    });
  }
};