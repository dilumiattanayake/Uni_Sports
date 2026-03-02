// TODO: Replace with actual Axios API calls to MERN backend

import { mockSports, mockCoaches, mockStudents, mockSessions, mockJoinRequests, mockLocations, mockNotifications } from "@/data/mockData";

// Simulates API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const sportsService = {
  getAll: async () => { await delay(100); return [...mockSports]; },
  getById: async (id: string) => { await delay(50); return mockSports.find(s => s.id === id); },
  // TODO: create, update, delete endpoints
};

export const coachService = {
  getAll: async () => { await delay(100); return [...mockCoaches]; },
  getById: async (id: string) => { await delay(50); return mockCoaches.find(c => c.id === id); },
};

export const studentService = {
  getAll: async () => { await delay(100); return [...mockStudents]; },
  getById: async (id: string) => { await delay(50); return mockStudents.find(s => s.id === id); },
};

export const sessionService = {
  getAll: async () => { await delay(100); return [...mockSessions]; },
  getByCoach: async (coachId: string) => { await delay(100); return mockSessions.filter(s => s.coachId === coachId); },
  getBySport: async (sportId: string) => { await delay(100); return mockSessions.filter(s => s.sportId === sportId); },
};

export const joinRequestService = {
  getAll: async () => { await delay(100); return [...mockJoinRequests]; },
  getByStudent: async (studentId: string) => { await delay(100); return mockJoinRequests.filter(r => r.studentId === studentId); },
  getByCoach: async (coachId: string) => {
    await delay(100);
    const coachSessions = mockSessions.filter(s => s.coachId === coachId).map(s => s.id);
    return mockJoinRequests.filter(r => coachSessions.includes(r.sessionId));
  },
};

export const locationService = {
  getAll: async () => { await delay(100); return [...mockLocations]; },
};

export const notificationService = {
  getAll: async () => { await delay(100); return [...mockNotifications]; },
};
