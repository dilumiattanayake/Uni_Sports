import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard, Trophy, Users, MapPin, Calendar, UserCheck, BookOpen,
  ChevronLeft, Dumbbell, Boxes, CreditCard, CalendarDays, ChevronDown, ChevronRight, LogOut
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar, SidebarMenuSub,
  SidebarMenuSubButton, SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const sportsManagementLinks = [
  { title: "Add and View Sports", url: "/admin/sports", icon: Trophy },
  { title: "Add and View Coaches", url: "/admin/coaches", icon: Users },
  { title: "Add and View Students", url: "/admin/students", icon: UserCheck },
  { title: "Add and View Locations", url: "/admin/locations", icon: MapPin },
];

const coachLinks = [
  { title: "Dashboard", url: "/coach", icon: LayoutDashboard },
  { title: "Sessions", url: "/coach/sessions", icon: Calendar },
  { title: "Join Requests", url: "/coach/requests", icon: UserCheck },
];

const studentLinks = [
  { title: "Dashboard", url: "/student", icon: LayoutDashboard },
  { title: "Browse Sports", url: "/student/sports", icon: BookOpen },
  { title: "My Sessions", url: "/student/sessions", icon: Calendar },
  { title: "My Requests", url: "/student/requests", icon: UserCheck },
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
  const navigate = useNavigate();
  const config = role !== "admin" ? roleConfig[role] : undefined;

  const hasSportsPath = useMemo(
    () => sportsManagementLinks.some((item) => location.pathname.startsWith(item.url)),
    [location.pathname],
  );
  const [sportsMenuOpen, setSportsMenuOpen] = useState(hasSportsPath);

  useEffect(() => {
    if (hasSportsPath) setSportsMenuOpen(true);
  }, [hasSportsPath]);

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-display font-bold text-sm">
          <Dumbbell className="h-5 w-5" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-display font-bold text-sm text-sidebar-foreground">UniSport</span>
            <span className="text-xs text-sidebar-foreground/60">Sports Management</span>
          </div>
        )}
        {!collapsed && (
          <Button variant="ghost" size="icon" className="ml-auto h-7 w-7 text-sidebar-foreground/50 hover:text-sidebar-foreground" onClick={toggleSidebar}>
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
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors text-sm"
                    onClick={() => setSportsMenuOpen((prev) => !prev)}
                    isActive={hasSportsPath}
                  >
                    <Trophy className="h-4 w-4 shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left">Sports Management</span>
                        {sportsMenuOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </>
                    )}
                  </SidebarMenuButton>
                  {!collapsed && sportsMenuOpen && (
                    <SidebarMenuSub>
                      {sportsManagementLinks.map((item) => (
                        <SidebarMenuSubItem key={item.title}>
                          <SidebarMenuSubButton asChild>
                            <NavLink
                              to={item.url}
                              className="text-sidebar-foreground/70"
                              activeClassName="text-sidebar-primary font-medium"
                            >
                              {item.title}
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>

                {adminPrimaryButtons.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/60 text-sm cursor-default">
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
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
                {user.name.split(" ").map(n => n[0]).join("")}
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
