import HomePage from "./pages/HomePage"
import Register from "./pages/Register"
import Login from "./pages/Login"

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSports from "./pages/admin/AdminSports";
import AdminCoaches from "./pages/admin/AdminCoaches";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminLocations from "./pages/admin/AdminLocations";
import AdminEvents from  "./pages/admin/AdminEvents";
import StudentDashboard from "./pages/student/StudentDashboard"
import StudentPayments from "./pages/student/StudentPayments"
import StudentInventory from "./pages/student/inventory/StudentInventory"
import StudentMyRequest from "./pages/student/inventory/StudentMyRequests"
import StudentMerchandise from "./pages/student/merchandise/StudentMerchandise"
import StudentMyOrders from "./pages/student/merchandise/StudentMyOrders"

import AdminHome from "./pages/admin/AdminHome"
import AdminInventory from "./pages/admin/inventory/AdminInventory"
import AdminEquipmentRequests from "./pages/admin/inventory/AdminEquipmentRequests"
import AdminMerchandise from "./pages/admin/merchandise/AdminMerchandise"
import AdminMerchandiseOrders from "./pages/admin/merchandise/AdminMerchandiseOrders"

// Student pages
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentBrowseSports from "./pages/student/StudentBrowseSports";
import StudentSessions from "./pages/student/StudentSessions";
import StudentRequests from "./pages/student/StudentRequests";
import StudentEvents from "./pages/student/StudentEvents";
import CoachDashboard from "./pages/coach/CoachDashboard"
import AdminSports from "./pages/admin/AdminSports"
import AdminCoaches from "./pages/admin/AdminCoaches"
import SettingsPage from "./pages/ProfileSettings"
import NotFound from "./pages/NotFound"
import Navbar from "./components/common/Navbar"
import { Route, Routes, useLocation } from "react-router-dom"

const NO_NAVBAR_PATHS = ["/StudentDashboard", "/CoachDashboard", "/AdminDashboard", "/admin/sports", "/admin/settings", "/coach/settings", "/student/settings", "/auth/login", "/auth/register", "/admin/coaches", "/student/payments"
  ,"/admin/home"
]

const App = () => {
  const { pathname } = useLocation()
  const shouldHideNavbar = NO_NAVBAR_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))

  return (
    <div>
      {!shouldHideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/auth/login" element={<Login />} />

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
        <Route path="/admin/home" element={<AdminHome />} />
        <Route path="/admin/inventory/" element={<AdminInventory />} />
        <Route path="/admin/inventory/:id" element={<AdminInventory />} />
        <Route path="/admin/requests" element={<AdminEquipmentRequests />} />
        <Route path="/admin/merchandise" element={<AdminMerchandise />} />
        <Route path="/admin/orders" element={<AdminMerchandiseOrders />} />

        <Route path="/StudentDashboard"element={<StudentDashboard /> }/>
        <Route path="/student/inventory" element={<StudentInventory />} />
        <Route path="/student/inventory/my-requests" element={<StudentMyRequest />} />
        <Route path="/student/merchandise" element={<StudentMerchandise />} />
        <Route path="/student/merchandise/my-orders" element={<StudentMyOrders />} />
        
        <Route path="/CoachDashboard" element={ <CoachDashboard />}/>
        <Route path="/admin/sports" element={<AdminSports />} />
        <Route path="/admin/settings" element={<SettingsPage />} />
        <Route path="/coach/settings" element={<SettingsPage />} />
        <Route path="/student/settings" element={<SettingsPage />} />
        <Route path="/student/payments" element={<StudentPayments />} />
        <Route path="/admin/coaches" element={<AdminCoaches />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default App
