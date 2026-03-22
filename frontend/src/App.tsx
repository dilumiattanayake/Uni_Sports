import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";

// Common & Auth Pages
import Navbar from "./components/common/Navbar";
import NotFound from "./pages/NotFound";
import HomePage from "./pages/HomePage";
import Register from "./pages/Register";
import Login from "./pages/Login";
import SettingsPage from "./pages/ProfileSettings";
import { DashboardLayout } from "@/components/DashboardLayout"; // Assuming this is your layout path

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminHome from "./pages/admin/AdminHome";
import AdminSports from "./pages/admin/AdminSports";
import AdminCoaches from "./pages/admin/AdminCoaches";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminLocations from "./pages/admin/AdminLocations";
import AdminEvents from "./pages/admin/events/AdminEvents";
import AdminInventory from "./pages/admin/inventory/AdminInventory";
import AdminEquipmentRequests from "./pages/admin/inventory/AdminEquipmentRequests";
import AdminMerchandise from "./pages/admin/merchandise/AdminMerchandise";
import AdminMerchandiseOrders from "./pages/admin/merchandise/AdminMerchandiseOrders";

// Coach Pages
import CoachDashboard from "./pages/coach/CoachDashboard";
import CoachSessions from "./pages/coach/CoachSessions"; // Added missing import
import CoachRequests from "./pages/coach/CoachRequests"; // Added missing import

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentBrowseSports from "./pages/student/StudentBrowseSports";
import StudentSessions from "./pages/student/StudentSessions";
import StudentRequests from "./pages/student/StudentRequests";
import StudentPayments from "./pages/student/StudentPayments";
import StudentInventory from "./pages/student/inventory/StudentInventory";
import StudentMyRequest from "./pages/student/inventory/StudentMyRequests";
import StudentMerchandise from "./pages/student/merchandise/StudentMerchandise";
import StudentMyOrders from "./pages/student/merchandise/StudentMyOrders";
import StudentEvents from "./pages/student/events/StudentEvents"; // Added missing import

const NO_NAVBAR_PATHS = [
  "/StudentDashboard", 
  "/CoachDashboard", 
  "/AdminDashboard", 
  "/admin/sports", 
  "/admin/settings", 
  "/coach/settings", 
  "/student/settings", 
  "/auth/login", 
  "/auth/register", 
  "/admin/coaches", 
  "/student/payments",
  "/admin/events",
  "/admin/inventory",
  "/admin/requests",
  "/admin/merchandise",
  "/admin/orders",
];

const App = () => {
  const { pathname } = useLocation();
  const shouldHideNavbar = NO_NAVBAR_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));

  return (
    <div>
      {!shouldHideNavbar && <Navbar />}
      <Routes>
        {/* Public / Auth Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/auth/login" element={<Login />} />

        {/* ----------------- ADMIN ROUTES ----------------- */}
        <Route path="/admin" element={<DashboardLayout><AdminDashboard /></DashboardLayout>} />
        <Route path="/admin/home" element={<AdminHome />} />
        <Route path="/admin/sports" element={<DashboardLayout><AdminSports /></DashboardLayout>} />
        <Route path="/admin/coaches" element={<DashboardLayout><AdminCoaches /></DashboardLayout>} />
        <Route path="/admin/students" element={<DashboardLayout><AdminStudents /></DashboardLayout>} />
        <Route path="/admin/locations" element={<DashboardLayout><AdminLocations /></DashboardLayout>} />
        <Route path="/admin/events" element={<DashboardLayout><AdminEvents /></DashboardLayout>} />
        
        {/* Admin Inventory & Merch */}
        <Route path="/admin/inventory" element={<AdminInventory />} />
        <Route path="/admin/inventory/:id" element={<AdminInventory />} />
        <Route path="/admin/requests" element={<AdminEquipmentRequests />} />
        <Route path="/admin/merchandise" element={<AdminMerchandise />} />
        <Route path="/admin/orders" element={<AdminMerchandiseOrders />} />
        <Route path="/admin/settings" element={<SettingsPage />} />

        {/* ----------------- COACH ROUTES ----------------- */}
        <Route path="/coach" element={<DashboardLayout><CoachDashboard /></DashboardLayout>} />
        <Route path="/CoachDashboard" element={<CoachDashboard />} /> {/* Kept for backward compatibility with your array */}
        <Route path="/coach/sessions" element={<DashboardLayout><CoachSessions /></DashboardLayout>} />
        <Route path="/coach/requests" element={<DashboardLayout><CoachRequests /></DashboardLayout>} />
        <Route path="/coach/settings" element={<SettingsPage />} />

        {/* ----------------- STUDENT ROUTES ----------------- */}
        <Route path="/student" element={<DashboardLayout><StudentDashboard /></DashboardLayout>} />
        <Route path="/StudentDashboard" element={<StudentDashboard />} /> {/* Kept for backward compatibility */}
        <Route path="/student/sports" element={<DashboardLayout><StudentBrowseSports /></DashboardLayout>} />
        <Route path="/student/sessions" element={<DashboardLayout><StudentSessions /></DashboardLayout>} />
        <Route path="/student/requests" element={<DashboardLayout><StudentRequests /></DashboardLayout>} />
        <Route path="/student/events" element={<DashboardLayout><StudentEvents /></DashboardLayout>} />
        <Route path="/student/payments" element={<StudentPayments />} />
        
        {/* Student Inventory & Merch */}
        <Route path="/student/inventory" element={<StudentInventory />} />
        <Route path="/student/inventory/my-requests" element={<StudentMyRequest />} />
        <Route path="/student/merchandise" element={<StudentMerchandise />} />
        <Route path="/student/merchandise/my-orders" element={<StudentMyOrders />} />
        <Route path="/student/settings" element={<SettingsPage />} />

        {/* 404 Not Found (Must be at the very bottom) */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

export default App;