import HomePage from "./pages/HomePage"
import Register from "./pages/Register"
import Login from "./pages/Login"
import StudentDashboard from "./pages/student/StudentDashboard"
import StudentPayments from "./pages/student/StudentPayments.tsx"
import Checkout from "./pages/student/Checkout"
import StudentBrowseSports from "./pages/student/StudentBrowseSports"
import StudentSessions from "./pages/student/StudentSessions"
import StudentRequests from "./pages/student/StudentRequests"
import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminPayments from "./pages/admin/AdminPayments"
import PaymentVerification from "./pages/admin/PaymentVerification.tsx"
import PaymentReports from "./pages/admin/PaymentReports.tsx"
import CoachDashboard from "./pages/coach/CoachDashboard"
import CoachSessions from "./pages/coach/CoachSessions"
import CoachRequests from "./pages/coach/CoachRequests"
import CoachPayments from "./pages/coach/CoachPayments"
import AdminSports from "./pages/admin/AdminSports"
import AdminCoaches from "./pages/admin/AdminCoaches"
import AdminStudents from "./pages/admin/AdminStudents"
import AdminLocations from "./pages/admin/AdminLocations"
import SettingsPage from "./pages/ProfileSettings.tsx"
import NotFound from "./pages/NotFound"
import Navbar from "./components/common/Navbar"
import { DashboardLayout } from "./components/DashboardLayout"
import { Navigate, Route, Routes, useLocation } from "react-router-dom"

const NO_NAVBAR_PATH_PREFIXES = ["/admin", "/coach", "/student", "/auth/login", "/auth/register", "/StudentDashboard", "/CoachDashboard"]

const App = () => {
  const { pathname } = useLocation()
  const shouldHideNavbar = NO_NAVBAR_PATH_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"))

  return (
    <div>
      {!shouldHideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/admin" element={<Navigate to="/admin/home" replace />} />
        <Route path="/admin/home" element={<DashboardLayout><AdminDashboard /></DashboardLayout>} />
        <Route path="/admin/sports" element={<DashboardLayout><AdminSports /></DashboardLayout>} />
        <Route path="/admin/coaches" element={<DashboardLayout><AdminCoaches /></DashboardLayout>} />
        <Route path="/admin/students" element={<DashboardLayout><AdminStudents /></DashboardLayout>} />
        <Route path="/admin/locations" element={<DashboardLayout><AdminLocations /></DashboardLayout>} />
        <Route path="/admin/payments" element={<DashboardLayout><AdminPayments /></DashboardLayout>} />
        <Route path="/admin/payments/verify" element={<DashboardLayout><PaymentVerification /></DashboardLayout>} />
        <Route path="/admin/payment/reports" element={<DashboardLayout><PaymentReports /></DashboardLayout>} />

        <Route path="/coach" element={<CoachDashboard />} />
        <Route path="/coach/sessions" element={<DashboardLayout><CoachSessions /></DashboardLayout>} />
        <Route path="/coach/requests" element={<DashboardLayout><CoachRequests /></DashboardLayout>} />
        <Route path="/coach/payments" element={<DashboardLayout><CoachPayments /></DashboardLayout>} />

        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/student/sports" element={<DashboardLayout><StudentBrowseSports /></DashboardLayout>} />
        <Route path="/student/sessions" element={<DashboardLayout><StudentSessions /></DashboardLayout>} />
        <Route path="/student/requests" element={<DashboardLayout><StudentRequests /></DashboardLayout>} />
        <Route path="/student/payments" element={<DashboardLayout><StudentPayments /></DashboardLayout>} />
        <Route path="/student/checkout/:itemSlug" element={<DashboardLayout><Checkout /></DashboardLayout>} />

        <Route path="/StudentDashboard" element={<StudentDashboard />} />
        <Route path="/CoachDashboard" element={<CoachDashboard />} />
        <Route path="/admin/settings" element={<SettingsPage />} />
        <Route path="/coach/settings" element={<SettingsPage />} />
        <Route path="/student/settings" element={<SettingsPage />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default App
