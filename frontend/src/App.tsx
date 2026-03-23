import HomePage from "./pages/HomePage"
import Register from "./pages/Register"
import Login from "./pages/Login"
import StudentDashboard from "./pages/student/StudentDashboard"
import StudentPayments from "./pages/student/StudentPayments"
import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminUserView from "./pages/admin/AdminUserView"
import AdminPayments from "./pages/admin/AdminPayments"
import AdminTransaction from "./pages/admin/AdminTransaction"
import CoachDashboard from "./pages/coach/CoachDashboard"
import AdminSports from "./pages/admin/AdminSports"
import AdminCoaches from "./pages/admin/AdminCoaches"
import SettingsPage from "./pages/ProfileSettings"
import NotFound from "./pages/NotFound"
import Navbar from "./components/common/Navbar"
import { Route, Routes, useLocation } from "react-router-dom"

const NO_NAVBAR_PATHS = ["/StudentDashboard", "/CoachDashboard", "/AdminDashboard", "/admin/sports", "/admin/settings", "/coach/settings", "/student/settings", "/auth/login", "/auth/register", "/admin/coaches", "/student/payments"
  ,"/admin/dashboard","/admin/view/users","/admin/payments","/admin/transactions","/admin/reports","/admin/invoices","/admin/payment-configuration",
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
        <Route path="/StudentDashboard"element={<StudentDashboard /> }/>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/CoachDashboard" element={ <CoachDashboard />}/>
        <Route path="/admin/sports" element={<AdminSports />} />
        <Route path="/admin/view/users" element={<AdminUserView />} />
        <Route path="/admin/payments" element={<AdminPayments />} />
        <Route path="/admin/transactions" element={<AdminTransaction />} />
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
