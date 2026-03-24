import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard, Trophy, Users, MapPin, Calendar, UserCheck, BookOpen, Settings,
  ChevronLeft, Medal, DollarSign, Package, Home, CalendarDays, CreditCard, Boxes,
  Dumbbell, ChevronDown, ChevronRight, LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import logo from "@/assets/Logo.jpg";
import logoos from "@/assets/Logoos.jpg";


const adminLinks = [
  { title: "Home", url: "/admin/home", icon: Home },
  { title: "Dashboard", url: "/AdminDashboard", icon: LayoutDashboard },
  { title: "Sports", url: "/admin/sports", icon: Trophy },
  { title: "Coaches", url: "/admin/coaches", icon: Users },
  { title: "Students", url: "/admin/students", icon: UserCheck },
  { title: "Locations", url: "/admin/locations", icon: MapPin },
  { title: "Events", url: "/admin/events", icon:  Medal },
  { title: "Inventory", url: "/admin/inventory", icon:  Package },
  { title: "Payments", url: "/admin/payments", icon:  DollarSign },
  
];

const sportsManagementLinks = [
  { title: "Sports", url: "/admin/sports", icon: Trophy },
  { title: "Coaches", url: "/admin/coaches", icon: Users },
  { title: "Locations", url: "/admin/locations", icon: MapPin },
];

const userManagementLinks = [
  { title: "Students", url: "/admin/students", icon: UserCheck },
  { title: "Coaches", url: "/admin/coaches", icon: Users },
];

const paymentManagementLinks = [
  { title: "Payments", url: "/admin/payments", icon: DollarSign },
  { title: "Payment Details", url: "/admin/payments/verify", icon: DollarSign },
  { title: "Payment Reports", url: "/admin/payment/reports", icon: DollarSign },
];

const inventoryManagementLinks = [
  { title: "Inventory", url: "/admin/inventory", icon: Package },
];

const eventManagementLinks = [
  { title: "Events", url: "/admin/events", icon: Medal },
];

const coachLinks = [
  { title: "Dashboard", url: "/coach", icon: LayoutDashboard },
  { title: "Sessions", url: "/coach/sessions", icon: Calendar },
  { title: "Join Requests", url: "/coach/requests", icon: UserCheck },
  { title: "Payments", url: "/coach/payments", icon: CreditCard },
];

const studentLinks = [
  { title: "Dashboard", url: "/student", icon: LayoutDashboard },
  { title: "Browse Sports", url: "/student/sports", icon: BookOpen },
  { title: "My Sessions", url: "/student/sessions", icon: Calendar },
  { title: "My Requests", url: "/student/requests", icon: UserCheck },
  { title: "Payments", url: "/student/payments", icon: CreditCard },
];

const roleConfig: Partial<Record<UserRole, { links: typeof coachLinks; label: string }>> = {
  coach: { links: coachLinks, label: "Coach" },
  student: { links: studentLinks, label: "Student" },
};

const adminPrimaryButtons = [
  { title: "Event Management", icon: CalendarDays },
  { title: "Inventory Management", icon: Boxes },
  { title: "Payment Management", icon: CreditCard },
  { title: "User Management", icon: Users },
];

export function AppSidebar() {
  const { role, user } = useAuth();
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const config = role !== "admin" ? roleConfig[role] : undefined;
  const [sportsMenuOpen, setSportsMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [paymentMenuOpen, setPaymentMenuOpen] = useState(false);
  const [inventoryMenuOpen, setInventoryMenuOpen] = useState(false);
  const [eventMenuOpen, setEventMenuOpen] = useState(false);

  const toggleSportsMenu = () => {
    setSportsMenuOpen((prev) => {
      const next = !prev;
      if (next) {
        setUserMenuOpen(false);
        setEventMenuOpen(false);
        setPaymentMenuOpen(false);
        setInventoryMenuOpen(false);
      }
      return next;
    });
  };

  const toggleUserMenu = () => {
    setUserMenuOpen((prev) => {
      const next = !prev;
      if (next) {
        setSportsMenuOpen(false);
        setEventMenuOpen(false);
        setPaymentMenuOpen(false);
        setInventoryMenuOpen(false);
      }
      return next;
    });
  };

  const toggleEventMenu = () => {
    setEventMenuOpen((prev) => {
      const next = !prev;
      if (next) {
        setSportsMenuOpen(false);
        setUserMenuOpen(false);
        setPaymentMenuOpen(false);
        setInventoryMenuOpen(false);
      }
      return next;
    });
  };

  const togglePaymentMenu = () => {
    setPaymentMenuOpen((prev) => {
      const next = !prev;
      if (next) {
        setSportsMenuOpen(false);
        setUserMenuOpen(false);
        setEventMenuOpen(false);
        setInventoryMenuOpen(false);
      }
      return next;
    });
  };

  const toggleInventoryMenu = () => {
    setInventoryMenuOpen((prev) => {
      const next = !prev;
      if (next) {
        setSportsMenuOpen(false);
        setUserMenuOpen(false);
        setEventMenuOpen(false);
        setPaymentMenuOpen(false);
      }
      return next;
    });
  };

  const hasSportsPath = location.pathname.includes("/admin/sports") || 
                       location.pathname.includes("/admin/coaches") ||
                       location.pathname.includes("/admin/locations");

  const hasUserPath = location.pathname.includes("/admin/students") || 
                     location.pathname.includes("/admin/coaches");

  const hasPaymentPath = paymentManagementLinks.some((item) =>
    location.pathname.startsWith(item.url)
  );
  
  const hasInventoryPath = location.pathname.includes("/admin/inventory");
  
  const hasEventPath = location.pathname.includes("/admin/events");

  const handleLogoClick = () => {
    if (role === "admin") navigate("/AdminDashboard");
    else if (role === "coach") navigate("/CoachDashboard");
    else if (role === "student") navigate("/StudentDashboard");
  };

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-display font-bold text-sm">
          <Dumbbell className="h-5 w-5" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-display font-bold text-sm text-sidebar-foreground">UniSport</span>
          </div>
        )}
        {!collapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto h-7 w-7 text-sidebar-foreground/50 hover:text-sidebar-foreground"
            onClick={toggleSidebar}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      <SidebarContent className="pt-2">
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-sidebar-foreground/40 uppercase text-[10px] tracking-widest font-body">
              {role === "admin" ? "Admin Menu" : `${config?.label} Menu`}
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            {role === "admin" ? (
              <div className="space-y-1">
                <div>
                  <button
                    onClick={toggleSportsMenu}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  >
                    <Trophy className="h-4 w-4 shrink-0" />
                    <span className="flex-1 text-left">Sports Management</span>
                    {sportsMenuOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                  {sportsMenuOpen && !collapsed && (
                    <div className="mt-1 space-y-1 pl-8">
                      {sportsManagementLinks.map((item) => (
                        <NavLink
                          key={item.title}
                          to={item.url}
                          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                          activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          <span>{item.title}</span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <button
                    onClick={toggleUserMenu}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  >
                    <Users className="h-4 w-4 shrink-0" />
                    <span className="flex-1 text-left">User Management</span>
                    {userMenuOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                  {userMenuOpen && !collapsed && (
                    <div className="mt-1 space-y-1 pl-8">
                      {userManagementLinks.map((item) => (
                        <NavLink
                          key={item.title}
                          to={item.url}
                          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                          activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          <span>{item.title}</span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <button
                    onClick={toggleEventMenu}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  >
                    <Medal className="h-4 w-4 shrink-0" />
                    <span className="flex-1 text-left">Event Management</span>
                    {eventMenuOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                  {eventMenuOpen && !collapsed && (
                    <div className="mt-1 space-y-1 pl-8">
                      {eventManagementLinks.map((item) => (
                        <NavLink
                          key={item.title}
                          to={item.url}
                          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                          activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          <span>{item.title}</span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <button
                    onClick={togglePaymentMenu}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  >
                    <DollarSign className="h-4 w-4 shrink-0" />
                    <span className="flex-1 text-left">Payment Management</span>
                    {paymentMenuOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                  {paymentMenuOpen && !collapsed && (
                    <div className="mt-1 space-y-1 pl-8">
                      {paymentManagementLinks.map((item) => (
                        <NavLink
                          key={item.title}
                          to={item.url}
                          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                          activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          <span>{item.title}</span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <button
                    onClick={toggleInventoryMenu}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  >
                    <Package className="h-4 w-4 shrink-0" />
                    <span className="flex-1 text-left">Inventory Management</span>
                    {inventoryMenuOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                  {inventoryMenuOpen && !collapsed && (
                    <div className="mt-1 space-y-1 pl-8">
                      {inventoryManagementLinks.map((item) => (
                        <NavLink
                          key={item.title}
                          to={item.url}
                          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                          activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          <span>{item.title}</span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <SidebarMenu>
                {config?.links.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.url === `/${role}`}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors text-sm"
                        activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        {!collapsed && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center text-sidebar-primary font-display font-bold text-xs">
                {user.name
                  .split(" ")
                  .map((namePart) => namePart[0])
                  .join("")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-sidebar-foreground truncate">{user.name}</p>
                <p className="text-[10px] text-sidebar-foreground/50 truncate">{user.email}</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start bg-transparent border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => navigate("/")}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
