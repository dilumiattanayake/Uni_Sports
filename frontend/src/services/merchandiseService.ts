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
  
  update: async (id: string, formData: FormData) => {
    return fetchWithAuth(`/merchandise/${id}`, { method: "PUT", body: formData }, true);
  },
  
  // NEW: Add the delete method
  delete: async (id: string) => {
    return fetchWithAuth(`/merchandise/${id}`, { method: "DELETE" });
  },
  
  createOrder: async (id: string, data: { quantity: number; selectedSize: string }) => {
    return fetchWithAuth(`/merchandise/${id}/order`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getMyOrders: async () => {
    return fetchWithAuth(`/merchandise/my-orders`);
  },

  getAllOrders: async () => {
    return fetchWithAuth(`/merchandise/orders`);
  },
  
  updateOrderStatus: async (id: string, data: { paymentStatus?: string; fulfillmentStatus?: string }) => {
    return fetchWithAuth(`/merchandise/orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }
};