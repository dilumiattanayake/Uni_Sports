import React, { createContext, useContext, useState, ReactNode } from "react";
import { User, UserRole } from "@/types";

const mockUsers: Record<UserRole, User> = {
  admin: { id: "admin-1", name: "Dr. Robert Clark", email: "admin@uni.edu", role: "admin" },
  coach: { id: "coach-1", name: "James Anderson", email: "james.a@uni.edu", role: "coach" },
  student: { id: "stu-1", name: "Alex Thompson", email: "alex.t@student.uni.edu", role: "student" },
};

interface AuthContextType {
  user: User;
  role: UserRole;
  switchRole: (role: UserRole) => void;
  // TODO: Integrate with backend auth
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<UserRole>("admin");

  const switchRole = (newRole: UserRole) => setRole(newRole);

  return (
    <AuthContext.Provider value={{ user: mockUsers[role], role, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
