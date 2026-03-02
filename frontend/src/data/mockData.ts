import { Sport, Coach, Student, PracticeSession, JoinRequest, Location, Notification } from "@/types";

export const mockLocations: Location[] = [
  { id: "loc-1", name: "University Main Ground", type: "ground", capacity: 200 },
  { id: "loc-2", name: "Indoor Sports Complex", type: "gym", capacity: 80 },
  { id: "loc-3", name: "Tennis Court A", type: "court", capacity: 30 },
  { id: "loc-4", name: "Tennis Court B", type: "court", capacity: 30 },
  { id: "loc-5", name: "Swimming Pool", type: "pool", capacity: 40 },
  { id: "loc-6", name: "Basketball Court", type: "court", capacity: 50 },
];

export const mockSports: Sport[] = [
  { id: "sp-1", name: "Football", description: "University football team training and matches", coachIds: ["coach-1"], maxStudents: 30, icon: "⚽" },
  { id: "sp-2", name: "Basketball", description: "Basketball practice and inter-university competitions", coachIds: ["coach-2"], maxStudents: 20, icon: "🏀" },
  { id: "sp-3", name: "Tennis", description: "Individual and doubles tennis training", coachIds: ["coach-3"], maxStudents: 15, icon: "🎾" },
  { id: "sp-4", name: "Swimming", description: "Competitive swimming and water polo", coachIds: ["coach-1", "coach-4"], maxStudents: 25, icon: "🏊" },
  { id: "sp-5", name: "Cricket", description: "Cricket coaching and tournament preparation", coachIds: ["coach-5"], maxStudents: 22, icon: "🏏" },
  { id: "sp-6", name: "Badminton", description: "Badminton singles and doubles coaching", coachIds: ["coach-3"], maxStudents: 16, icon: "🏸" },
];

export const mockCoaches: Coach[] = [
  { id: "coach-1", name: "James Anderson", email: "james.a@uni.edu", sportIds: ["sp-1", "sp-4"], phone: "+1 555-0101", specialization: "Team Sports" },
  { id: "coach-2", name: "Sarah Mitchell", email: "sarah.m@uni.edu", sportIds: ["sp-2"], phone: "+1 555-0102", specialization: "Basketball" },
  { id: "coach-3", name: "David Chen", email: "david.c@uni.edu", sportIds: ["sp-3", "sp-6"], phone: "+1 555-0103", specialization: "Racquet Sports" },
  { id: "coach-4", name: "Maria Garcia", email: "maria.g@uni.edu", sportIds: ["sp-4"], phone: "+1 555-0104", specialization: "Aquatics" },
  { id: "coach-5", name: "Raj Patel", email: "raj.p@uni.edu", sportIds: ["sp-5"], phone: "+1 555-0105", specialization: "Cricket" },
];

export const mockStudents: Student[] = [
  { id: "stu-1", name: "Alex Thompson", email: "alex.t@student.uni.edu", enrolledSports: ["sp-1", "sp-2"], year: 2 },
  { id: "stu-2", name: "Emily Davis", email: "emily.d@student.uni.edu", enrolledSports: ["sp-3"], year: 1 },
  { id: "stu-3", name: "Michael Brown", email: "michael.b@student.uni.edu", enrolledSports: ["sp-1", "sp-5"], year: 3 },
  { id: "stu-4", name: "Jessica Wilson", email: "jessica.w@student.uni.edu", enrolledSports: ["sp-2", "sp-4"], year: 2 },
  { id: "stu-5", name: "Daniel Lee", email: "daniel.l@student.uni.edu", enrolledSports: ["sp-6"], year: 1 },
  { id: "stu-6", name: "Sofia Martinez", email: "sofia.m@student.uni.edu", enrolledSports: ["sp-4", "sp-3"], year: 4 },
  { id: "stu-7", name: "Ryan Johnson", email: "ryan.j@student.uni.edu", enrolledSports: ["sp-1"], year: 2 },
  { id: "stu-8", name: "Chloe White", email: "chloe.w@student.uni.edu", enrolledSports: ["sp-5", "sp-6"], year: 3 },
];

export const mockSessions: PracticeSession[] = [
  { id: "ses-1", sportId: "sp-1", coachId: "coach-1", locationId: "loc-1", date: "2026-03-05", startTime: "09:00", endTime: "11:00", enrolledStudents: ["stu-1", "stu-3", "stu-7"], maxCapacity: 25, status: "scheduled" },
  { id: "ses-2", sportId: "sp-2", coachId: "coach-2", locationId: "loc-6", date: "2026-03-05", startTime: "14:00", endTime: "16:00", enrolledStudents: ["stu-1", "stu-4"], maxCapacity: 20, status: "scheduled" },
  { id: "ses-3", sportId: "sp-3", coachId: "coach-3", locationId: "loc-3", date: "2026-03-06", startTime: "10:00", endTime: "12:00", enrolledStudents: ["stu-2", "stu-6"], maxCapacity: 8, status: "scheduled" },
  { id: "ses-4", sportId: "sp-4", coachId: "coach-4", locationId: "loc-5", date: "2026-03-06", startTime: "15:00", endTime: "17:00", enrolledStudents: ["stu-4", "stu-6"], maxCapacity: 20, status: "scheduled" },
  { id: "ses-5", sportId: "sp-5", coachId: "coach-5", locationId: "loc-1", date: "2026-03-07", startTime: "08:00", endTime: "10:30", enrolledStudents: ["stu-3", "stu-8"], maxCapacity: 22, status: "scheduled" },
  { id: "ses-6", sportId: "sp-1", coachId: "coach-1", locationId: "loc-1", date: "2026-03-08", startTime: "09:00", endTime: "11:00", enrolledStudents: ["stu-1", "stu-3"], maxCapacity: 25, status: "scheduled" },
  { id: "ses-7", sportId: "sp-6", coachId: "coach-3", locationId: "loc-2", date: "2026-03-07", startTime: "14:00", endTime: "16:00", enrolledStudents: ["stu-5", "stu-8"], maxCapacity: 16, status: "scheduled" },
];

export const mockJoinRequests: JoinRequest[] = [
  { id: "jr-1", studentId: "stu-5", sportId: "sp-2", sessionId: "ses-2", status: "pending", requestDate: "2026-03-01" },
  { id: "jr-2", studentId: "stu-2", sportId: "sp-1", sessionId: "ses-1", status: "accepted", requestDate: "2026-02-28" },
  { id: "jr-3", studentId: "stu-7", sportId: "sp-4", sessionId: "ses-4", status: "pending", requestDate: "2026-03-02" },
  { id: "jr-4", studentId: "stu-6", sportId: "sp-5", sessionId: "ses-5", status: "rejected", requestDate: "2026-02-27" },
  { id: "jr-5", studentId: "stu-8", sportId: "sp-1", sessionId: "ses-6", status: "pending", requestDate: "2026-03-02" },
];

export const mockNotifications: Notification[] = [
  { id: "notif-1", title: "Session Time Changed", message: "Football practice on Mar 5 moved to 10:00 AM", type: "warning", read: false, createdAt: "2026-03-02T08:00:00Z" },
  { id: "notif-2", title: "Request Accepted", message: "Your request to join Football has been accepted", type: "success", read: false, createdAt: "2026-03-01T14:30:00Z" },
  { id: "notif-3", title: "New Join Request", message: "Daniel Lee wants to join Basketball", type: "info", read: true, createdAt: "2026-03-01T10:00:00Z" },
  { id: "notif-4", title: "Session Cancelled", message: "Tennis practice on Mar 4 has been cancelled", type: "destructive", read: true, createdAt: "2026-02-28T16:00:00Z" },
];
