import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types";
import { useLocation } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard, Trophy, Users, MapPin, Calendar, UserCheck, BookOpen, Bell, Settings,
  ChevronLeft, Dumbbell
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar, SidebarMenuSub,
  SidebarMenuSubButton, SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import logo from "@/assets/Logo.jpg";
import logoos from "@/assets/Logoos.jpg";


const adminLinks = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Sports", url: "/admin/sports", icon: Trophy },
  { title: "Coaches", url: "/admin/coaches", icon: Users },
  { title: "Students", url: "/admin/students", icon: UserCheck },
  { title: "Locations", url: "/admin/locations", icon: MapPin },
];

const coachLinks = [
  { title: "Dashboard", url: "/CoachDashboard", icon: LayoutDashboard },
  { title: "Sessions", url: "/coach/sessions", icon: Calendar },
  { title: "Join Requests", url: "/coach/requests", icon: UserCheck },
  { title: "My Team", url: "/coach/teams", icon: Users },
];

const studentLinks = [
  { title: "Dashboard", url: "/StudentDashboard", icon: LayoutDashboard },
  { title: "Browse Sports", url: "/StudentBrowseSports", icon: BookOpen },
  { title: "My Sessions", url: "/StudentSessions", icon: Calendar },
  { title: "My Requests", url: "/StudentRequests", icon: UserCheck },
  { title: "Browse Events", url: "/StudentBrowseEvents", icon: Medal},
  { title: "My Events", url: "/StudentEvents", icon:  Trophy },
  { title: "Inventory", url: "/student/inventory", icon:  Package },
  { title: "My Payements", url: "/student/payments", icon:  DollarSign },
];

const roleConfig: Partial<Record<UserRole, { links: typeof coachLinks; label: string; color: string }>> = {
  coach: { links: coachLinks, label: "Coach", color: "bg-secondary text-secondary-foreground" },
  student: { links: studentLinks, label: "Student", color: "bg-info text-info-foreground" },
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
  const config = roleConfig[role];

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <div className="flex items-center justify-between px-4 py-5 border-b border-sidebar-border">

  
        <img
          src={collapsed ? logoos : logo}
          alt="UniSport Logo"
          onClick={handleLogoClick}
          className={`cursor-pointer object-contain transition-all ${collapsed ? "h-4 mx-auto" : "h-10 w-auto"}`}
        />

        {!collapsed && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-sidebar-foreground/50 hover:text-sidebar-foreground"
          onClick={toggleSidebar}>
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
            <SidebarMenu>
              {config.links.map((item) => (
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
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Placeholder for future modules */}
        {!collapsed && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/40 uppercase text-[10px] tracking-widest font-body">Other Modules</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {["User Mgmt", "Events", "Payments"].map((label) => (
                  <SidebarMenuItem key={label}>
                    <SidebarMenuButton disabled className="opacity-40 cursor-not-allowed">
                      <Settings className="h-4 w-4 mr-3" />
                      <span className="text-sm">{label}</span>
                      <Badge variant="outline" className="ml-auto text-[9px] border-sidebar-foreground/20 text-sidebar-foreground/40">Soon</Badge>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        {!collapsed && user && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center text-sidebar-primary font-display font-bold text-xs">
                {user.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-sidebar-foreground truncate">{user.name}</p>
                <p className="text-[10px] text-sidebar-foreground/50 truncate">{user.email}</p>
              </div>
            </div>
            <Select value={role} onValueChange={(v) => switchRole(v as UserRole)}>
              <SelectTrigger className="h-8 text-xs bg-sidebar-accent border-sidebar-border text-sidebar-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">🛡️ Admin</SelectItem>
                <SelectItem value="coach">🏋️ Coach</SelectItem>
                <SelectItem value="student">🎓 Student</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
