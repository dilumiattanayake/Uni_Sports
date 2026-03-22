import { fetchWithAuth } from './apiClient';

export const eventService = {
  // ==========================================
  // PUBLIC / GENERAL ENDPOINTS
  // ==========================================

  getAll: async (queryParams = "") => {
    return fetchWithAuth(`/events${queryParams ? `?${queryParams}` : ''}`);
  },

  getById: async (id: string) => {
    return fetchWithAuth(`/events/${id}`);
  },

  // ==========================================
  // ADMIN ENDPOINTS
  // ==========================================

  create: async (formData: FormData) => {
    // The 'true' flag tells your apiClient this is multipart/form-data for the image
    return fetchWithAuth(`/events`, { method: "POST", body: formData }, true);
  },

  update: async (id: string, formData: FormData) => {
    return fetchWithAuth(`/events/${id}`, { method: "PUT", body: formData }, true);
  },

  delete: async (id: string) => {
    return fetchWithAuth(`/events/${id}`, { method: "DELETE" });
  }
};