// services/equipmentRequest.service.ts
import { fetchWithAuth } from './apiClient';

export const equipmentRequestService = {
  getMyRequests: async () => {
    return fetchWithAuth(`/equipment-requests/my-requests`);
  },
  
  getAll: async (queryParams = "") => {
    return fetchWithAuth(`/equipment-requests${queryParams ? `?${queryParams}` : ''}`);
  },
  
  create: async (data: { items: any[]; expectedReturnDate: string; notes?: string }) => {
    return fetchWithAuth(`/equipment-requests`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  
  updateStatus: async (id: string, data: { status: string; notes?: string }) => {
    return fetchWithAuth(`/equipment-requests/${id}/status`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
  
  reportIssue: async (id: string, data: { itemId: string; damagedQuantity: number; lostQuantity: number; issueNote: string }) => {
    return fetchWithAuth(`/equipment-requests/${id}/report-issue`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  processQrPickup: async (qrData: string) => {
    return fetchWithAuth(`/equipment-requests/scan-qr`, {
      method: 'POST',
      body: JSON.stringify({ qrData }),
    });
  }
};