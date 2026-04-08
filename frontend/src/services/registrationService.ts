import { fetchWithAuth } from './apiClient';

// Define the exact shape of the data expected by your Zod Validator
export interface RegistrationPayload {
  registrationType: 'individual' | 'team';
  teamName?: string;
  teamMembers?: string[]; // Array of Student MongoDB ObjectIds
}

export const registrationService = {
  // ==========================================
  // STUDENT ENDPOINTS
  // ==========================================

  /**
   * Get all events the logged-in student is registered for
   */
  getMyRegistrations: async () => {
    return fetchWithAuth(`/registrations/my-registrations`);
  },

  /**
   * Register for an event (Handles both Solo and Team)
   */
  registerForEvent: async (eventId: string, data: RegistrationPayload) => {
    return fetchWithAuth(`/registrations/event/${eventId}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // ==========================================
  // ADMIN ENDPOINTS
  // ==========================================

  /**
   * Get all registrations (and team members) for a specific event
   */
  getEventRegistrations: async (eventId: string) => {
    return fetchWithAuth(`/registrations/event/${eventId}`);
  },

  /**
   * (Optional) Admin manually overriding a student's status
   */
  updateRegistrationStatus: async (registrationId: string, status: 'pending' | 'confirmed' | 'waitlisted' | 'cancelled') => {
    return fetchWithAuth(`/registrations/${registrationId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  },

  searchStudent: async (searchQuery: string) => {
    return fetchWithAuth(`/registrations/search-student?query=${encodeURIComponent(searchQuery)}`);
  },

  /**
   * Update an existing team's members
   */
  updateTeamMembers: async (registrationId: string, teamMembers: string[]) => {
    return fetchWithAuth(`/registrations/${registrationId}`, {
      method: "PUT",
      body: JSON.stringify({ teamMembers }),
    });
  },

  /**
   * Cancel an existing registration
   */
  cancelRegistration: async (registrationId: string) => {
    return fetchWithAuth(`/registrations/${registrationId}`, {
      method: "DELETE",
    });
  },
};