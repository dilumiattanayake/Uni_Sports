import React from "react";
import { Route, Routes, useLocation, Navigate } from "react-router-dom";

// Common & Auth Pages
import Navbar from "./components/common/Navbar";
import NotFound from "./pages/NotFound";
import HomePage from "./pages/HomePage";
import Register from "./pages/Register";
import Login from "./pages/Login";
import SettingsPage from "./pages/ProfileSettings";
import { DashboardLayout } from "./components/DashboardLayout";
import ProfileSettings from "./pages/ProfileSettings";

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
import AdminPayments from "./pages/admin/AdminPayments";
import PaymentVerification from "./pages/admin/PaymentVerification";
import PaymentReports from "./pages/admin/PaymentReports";
import AdminUserView from "./pages/admin/AdminUserView";

// Coach Pages
import CoachDashboard from "./pages/coach/CoachDashboard";
import CoachSessions from "./pages/coach/CoachSessions";
import CoachRequests from "./pages/coach/CoachRequests";
import CoachPayments from "./pages/coach/CoachPayments";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentBrowseSports from "./pages/student/StudentBrowseSports";
import StudentSessions from "./pages/student/StudentSessions";
import StudentRequests from "./pages/student/StudentRequests";
import StudentPayments from "./pages/student/StudentPayments";
import Checkout from "./pages/student/Checkout";
import StudentInventory from "./pages/student/inventory/StudentInventory";
import StudentMyRequest from "./pages/student/inventory/StudentMyRequests";
import StudentMerchandise from "./pages/student/merchandise/StudentMerchandise";
import StudentMyOrders from "./pages/student/merchandise/StudentMyOrders";
import StudentEvents from "./pages/student/events/StudentEvents";
import StudentMyEvents from "./pages/student/events/StudentMyEvents";

// Hide navbar on dashboard-related pages
const NO_NAVBAR_PATH_PREFIXES = [
  "/admin",
  "/coach",
  "/student",
  "/auth/login",
  "/auth/register",
  "/AdminDashboard",
  "/StudentDashboard",
  "/CoachDashboard",
];

const App = () => {
  const { pathname } = useLocation();

  const shouldHideNavbar = NO_NAVBAR_PATH_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  return (
    <div>
      {!shouldHideNavbar && <Navbar />}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/auth/login" element={<Login />} />

        {/* ---------------- ADMIN ---------------- */}
        <Route path="/admin" element={<Navigate to="/admin/home" replace />} />
        <Route
          path="/admin/home"
          element={
              <AdminDashboard />
          }
        />
        <Route path="/admin/users" element={<DashboardLayout><AdminUserView /></DashboardLayout>} />
        <Route path="/admin/settings" element={<DashboardLayout><ProfileSettings /></DashboardLayout>} />
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

        {/* Admin Payments */}
        <Route path="/admin/payments" element={<DashboardLayout><AdminPayments /></DashboardLayout>} />
        <Route path="/admin/payment/transaction" element={<DashboardLayout><PaymentVerification /></DashboardLayout>} />
        <Route path="/admin/payment/report" element={<DashboardLayout><PaymentReports /></DashboardLayout>} />

        <Route path="/coach" element={<CoachDashboard />} />
        <Route path="/coach/sessions" element={<DashboardLayout><CoachSessions /></DashboardLayout>} />
        <Route path="/coach/requests" element={<DashboardLayout><CoachRequests /></DashboardLayout>} />
        <Route path="/coach/payments" element={<DashboardLayout><CoachPayments /></DashboardLayout>} />
        <Route path="/coach/settings" element={<DashboardLayout><ProfileSettings/></DashboardLayout>} />

        {/* ---------------- STUDENT ---------------- */}
        <Route path="/student" element={<DashboardLayout><StudentDashboard /></DashboardLayout>} />
        <Route path="/student/sports" element={<DashboardLayout><StudentBrowseSports /></DashboardLayout>} />
        <Route path="/student/sessions" element={<DashboardLayout><StudentSessions /></DashboardLayout>} />
        <Route path="/student/requests" element={<DashboardLayout><StudentRequests /></DashboardLayout>} />
        <Route path="/student/events" element={<DashboardLayout><StudentEvents /></DashboardLayout>} />
        <Route path="/student/events/my-events" element={<DashboardLayout><StudentMyEvents /></DashboardLayout>} />
        <Route path="/student/payments" element={<StudentPayments />} />
        <Route path="/student/checkout/:itemSlug" element={<Checkout />} />
        <Route path="/student/settings" element={<DashboardLayout><ProfileSettings/></DashboardLayout>} />

        {/* Student Inventory & Merch */}
        <Route path="/student/inventory" element={<StudentInventory />} />
        <Route path="/student/inventory/my-requests" element={<StudentMyRequest />} />
        <Route path="/student/merchandise" element={<StudentMerchandise />} />
        <Route path="/student/merchandise/my-orders" element={<StudentMyOrders />} />

        {/* Backward Compatibility */}
        <Route path="/AdminDashboard" element={<AdminDashboard />} />
        <Route path="/StudentDashboard" element={<StudentDashboard />} />
        <Route path="/CoachDashboard" element={<CoachDashboard />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

export default App;