import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/context/AuthContext";
import { NotificationsDropdown } from "@/components/notifications/NotificationsDropdown";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, role } = useAuth();

  const roleLabel = role === "admin" ? "Admin" : role === "coach" ? "Coach" : "Student";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b border-border bg-card lg:px-6 shrink-0 px-4 py-5">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <div className="h-5 w-px bg-border mx-1 hidden sm:block" />
              <span className="text-sm text-muted-foreground hidden sm:block">
                {roleLabel} Portal
              </span>
            </div>
            <div className="flex items-center gap-2">
              <NotificationsDropdown />
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-display font-bold text-xs">
                {user.name.split(" ").map(n => n[0]).join("")}
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
