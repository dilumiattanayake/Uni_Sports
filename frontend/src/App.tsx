import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import NotFound from "./pages/NotFound";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSports from "./pages/admin/AdminSports";
import AdminCoaches from "./pages/admin/AdminCoaches";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminLocations from "./pages/admin/AdminLocations";
import AdminEvents from  "./pages/admin/AdminEvents";

// Coach pages
import CoachDashboard from "./pages/coach/CoachDashboard";
import CoachSessions from "./pages/coach/CoachSessions";
import CoachRequests from "./pages/coach/CoachRequests";

// Student pages
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentBrowseSports from "./pages/student/StudentBrowseSports";
import StudentSessions from "./pages/student/StudentSessions";
import StudentRequests from "./pages/student/StudentRequests";
import StudentEvents from "./pages/student/StudentEvents";

const queryClient = new QueryClient();

function AppRoutes() {
  const { role } = useAuth();

  // Redirect root to role-specific dashboard
  const homeRedirect = role === "admin" ? "/admin" : role === "coach" ? "/coach" : "/student";

  return (
    <Routes>
      <Route path="/" element={<Navigate to={homeRedirect} replace />} />

      {/* Admin routes */}
      <Route path="/admin" element={<DashboardLayout><AdminDashboard /></DashboardLayout>} />
      <Route path="/admin/sports" element={<DashboardLayout><AdminSports /></DashboardLayout>} />
      <Route path="/admin/coaches" element={<DashboardLayout><AdminCoaches /></DashboardLayout>} />
      <Route path="/admin/students" element={<DashboardLayout><AdminStudents /></DashboardLayout>} />
      <Route path="/admin/locations" element={<DashboardLayout><AdminLocations /></DashboardLayout>} />
      <Route path="/admin/events" element={<DashboardLayout><AdminEvents/></DashboardLayout>}/>

      {/* Coach routes */}
      <Route path="/coach" element={<DashboardLayout><CoachDashboard /></DashboardLayout>} />
      <Route path="/coach/sessions" element={<DashboardLayout><CoachSessions /></DashboardLayout>} />
      <Route path="/coach/requests" element={<DashboardLayout><CoachRequests /></DashboardLayout>} />

      {/* Student routes */}
      <Route path="/student" element={<DashboardLayout><StudentDashboard /></DashboardLayout>} />
      <Route path="/student/sports" element={<DashboardLayout><StudentBrowseSports /></DashboardLayout>} />
      <Route path="/student/sessions" element={<DashboardLayout><StudentSessions /></DashboardLayout>} />
      <Route path="/student/requests" element={<DashboardLayout><StudentRequests /></DashboardLayout>} />
      <Route path="/student/events" element={<DashboardLayout><StudentEvents/></DashboardLayout>}/>

      {/* TODO: Future module routes */}
      {/* <Route path="/users/*" element={...} /> */}
      {/* <Route path="/events/*" element={...} /> */}
      {/* <Route path="/payments/*" element={...} /> */}

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
