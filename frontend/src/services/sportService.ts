import { fetchWithAuth } from './apiClient'; // Adjust this path if your apiClient is elsewhere

export const sportService = {
  // ==========================================
  // PUBLIC ENDPOINTS
  // ==========================================

  /**
   * Get the list of allowed sport categories 
   * (indoor, outdoor, water, combat, team, individual)
   */
  getCategories: async () => {
    return fetchWithAuth('/sports/categories/list');
  },

  /**
   * Get all sports
   * @param queryParams Optional query string (e.g., "category=team")
   */
  getAll: async (queryParams = "") => {
    return fetchWithAuth(`/sports${queryParams ? `?${queryParams}` : ''}`);
  },

  /**
   * Get a single sport by its ID
   */
  getById: async (id: string) => {
    return fetchWithAuth(`/sports/${id}`);
  },

  // ==========================================
  // ADMIN ENDPOINTS
  // ==========================================

  /**
   * Create a new sport
   * Expected data: { name, description, category }
   */
  create: async (data: { name: string; description: string; category: string }) => {
    return fetchWithAuth('/sports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update an existing sport
   */
  update: async (id: string, data: any) => {
    return fetchWithAuth(`/sports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a sport
   */
  delete: async (id: string) => {
    return fetchWithAuth(`/sports/${id}`, {
      method: 'DELETE',
    });
  }
};