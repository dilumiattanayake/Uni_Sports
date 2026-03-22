// services/merchandise.service.ts
import { fetchWithAuth } from './apiClient';

export const merchandiseService = {
  getAll: async () => {
    return fetchWithAuth(`/merchandise`);
  },
  
  // Uses FormData to handle the image upload
  create: async (formData: FormData) => {
    return fetchWithAuth(`/merchandise`, { method: "POST", body: formData }, true);
  },
  
  // Uses FormData to handle the image upload
  update: async (id: string, formData: FormData) => {
    return fetchWithAuth(`/merchandise/${id}`, { method: "PUT", body: formData }, true);
  },
  
  createOrder: async (id: string, data: { quantity: number }) => {
    return fetchWithAuth(`/merchandise/${id}/order`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  
  updateOrderStatus: async (id: string, data: { paymentStatus?: string; fulfillmentStatus?: string }) => {
    return fetchWithAuth(`/merchandise/orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }
};