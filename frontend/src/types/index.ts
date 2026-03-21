export type UserRole = "admin" | "coach" | "student";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Sport {
  id: string;
  name: string;
  description: string;
  coachIds: string[];
  maxStudents: number;
  icon: string;
}

export interface Coach {
  id: string;
  name: string;
  email: string;
  sportIds: string[];
  phone: string;
  specialization: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  enrolledSports: string[];
  year: number;
}

export interface Location {
  id: string;
  name: string;
  type: "ground" | "court" | "gym" | "pool";
  capacity: number;
}

export interface PracticeSession {
  id: string;
  sportId: string;
  coachId: string;
  locationId: string;
  date: string;
  startTime: string;
  endTime: string;
  enrolledStudents: string[];
  maxCapacity: number;
  status: "scheduled" | "cancelled" | "completed";
}

export interface JoinRequest {
  id: string;
  studentId: string;
  sportId: string;
  sessionId: string;
  status: "pending" | "accepted" | "rejected";
  requestDate: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "destructive";
  read: boolean;
  createdAt: string;
}

export interface EventRegistration {
  studentId: string;
  status: "pending" | "confirmed" | "waitlisted" | "cancelled";
  registeredAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  sportId: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  venue: string;
  maxParticipants: number;
  registrationFormUrl?: string;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  registrations: EventRegistration[];
}