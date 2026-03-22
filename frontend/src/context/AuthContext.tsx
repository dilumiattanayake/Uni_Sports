import React, { createContext, useContext, useState, ReactNode } from "react";
import { User, UserRole } from "@/types";

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; role?: UserRole }>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize session from localStorage on load
  React.useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setRole(parsedUser.role);
      } catch (e) {
        console.error("Failed to parse stored user", e);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const switchRole = (newRole: UserRole) => setRole(newRole);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; role?: UserRole }> => {
    
    // =========================================================================
    // REAL BACKEND LOGIN 
    // =========================================================================
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data.user));
        setUser(data.data.user);
        setRole(data.data.user.role);
        return { success: true, role: data.data.user.role };
      } else {
        return { success: false, error: data.message || "Invalid email or password" };
      }
    } catch (error) {
      console.error("Login Error:", error);
      return { success: false, error: "Network error, please try again later" };
    }

    // =========================================================================
    // MOCK LOGIN - COMMENTED OUT
    // Previously used mock data for development. Now using real backend.
    // =========================================================================
    /*
    return new Promise((resolve) => {
      setTimeout(() => {
        let loggedInRole: UserRole | null = null;
        
        if (email === "admin@my.sliit.lk" && password === "123456") {
          loggedInRole = "admin";
        } else if (email === "coach@my.sliit.lk" && password === "123456") {
          loggedInRole = "coach";
        } else if (
          email.endsWith("@my.sliit.lk") && 
          password === "s12345" && 
          email !== "admin@my.sliit.lk" && 
          email !== "coach@my.sliit.lk"
        ) {
          loggedInRole = "student";
        }

        if (loggedInRole) {
          const userData = mockUsers[loggedInRole];
          // Save mock session data so refresh works
          localStorage.setItem("token", "dummy-mock-token");
          localStorage.setItem("user", JSON.stringify(userData));
          
          setUser(userData);
          setRole(loggedInRole);
          resolve({ success: true, role: loggedInRole });
        } else {
          resolve({ success: false, error: "Invalid email or password" });
        }
      }, 500); // 500ms fake delay
    });
    */
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, login, logout, switchRole, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }

  return context
}