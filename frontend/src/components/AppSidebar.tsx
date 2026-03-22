import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types";
import { useNavigate } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard, Trophy, Users, MapPin, Calendar, UserCheck, BookOpen, Settings,
  ChevronLeft, Medal, DollarSign,  Package, Home,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import logo from "@/assets/Logo.jpg";
import logoos from "@/assets/Logoos.jpg";


const adminLinks = [
  { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Sports", url: "/admin/sports", icon: Trophy },
  { title: "Coaches", url: "/admin/coaches", icon: Users },
  { title: "Students", url: "/admin/students", icon: UserCheck },
  { title: "Locations", url: "/admin/locations", icon: MapPin },
  { title: "Events", url: "/admin/events", icon:  Medal },
  { title: "Inventory", url: "/admin/inventory", icon:  Package },
  { title: "Payments", url: "/admin/payments", icon:  DollarSign },
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

const roleConfig: Record<UserRole, { links: typeof adminLinks; label: string; color: string }> = {
  admin: { links: adminLinks, label: "Admin", color: "bg-accent text-accent-foreground" },
  coach: { links: coachLinks, label: "Coach", color: "bg-secondary text-secondary-foreground" },
  student: { links: studentLinks, label: "Student", color: "bg-info text-info-foreground" },
};

export function AppSidebar() {
  const { role, user } = useAuth();
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const config = roleConfig[role];

  const handleLogoClick = () => {
  if (role === "admin") navigate("/AdminDashboard");
  else if (role === "coach") navigate("/CoachDashboard");
  else if (role === "student") navigate("/StudentDashboard");
};

const handleSettingsClick = () => {
  if (role === "admin") navigate("/admin/settings");
  else if (role === "coach") navigate("/coach/settings");
  else if (role === "student") navigate("/student/settings");
};



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
          {!collapsed && <SidebarGroupLabel className="text-sidebar-foreground/40 uppercase text-[10px] tracking-widest font-body">{config.label} Menu</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {config.links.map((item) => (
                <SidebarMenuItem key={item.title} className={item.title === "Dashboard" ? "mb-1" : ""}>
                  <SidebarMenuButton asChild onClick={(e) => e.stopPropagation()}>
                    <NavLink
                      to={item.url}
                      end={item.title === "Dashboard"}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors
                                  text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground
                                  ${collapsed ? "justify-center" : ""} `}
                      activeClassName={`bg-sidebar-accent text-sidebar-primary font-medium
                                      ${collapsed ? "border-2 border-orange-400 bg-orange-400 text-white rounded-xl p-2 flex justify-center items-center" : ""}`}
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
            
            <Button 
              variant="default" 
              className="w-full justify-centre mt-2 bg-orange-400 hover:bg-orange-500 text-white border-0"  
              size="sm"
              onClick={handleSettingsClick}
            >
              <Settings className="mr-2 h-4 w-4" />
              Profile Settings
            </Button>

          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
