import { PageHeader } from "@/components/common/PageHeader";
import { mockSports, mockSessions, mockLocations, mockStudents } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, CreditCard, Boxes, Users } from "lucide-react";

export default function AdminDashboard() {
  const upcomingSessions = mockSessions.filter(s => s.status === "scheduled");
  const totalInventoryItems = mockLocations.length * 8;
  const totalRevenue = mockStudents.length * 120;

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="University Sports Management Overview" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Total Sports</p>
          <p className="text-2xl font-display font-bold mt-2">{mockSports.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Upcoming Total Events</p>
          <p className="text-2xl font-display font-bold mt-2">{upcomingSessions.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Total Items</p>
          <p className="text-2xl font-display font-bold mt-2">{totalInventoryItems}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Total Revenue</p>
          <p className="text-2xl font-display font-bold mt-2">${totalRevenue}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-5 min-h-64">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg">Sports</h2>
            <Badge variant="secondary" className="text-xs">{mockSports.length} total</Badge>
          </div>
          <div className="space-y-3">
            {mockSports.slice(0, 6).map((sport) => {
              const enrolledCount = mockStudents.filter(student => student.enrolledSports.includes(sport.id)).length;
              return (
                <div key={sport.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="text-2xl">{sport.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{sport.name}</p>
                    <p className="text-xs text-muted-foreground">{sport.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-display font-bold">{enrolledCount}</p>
                    <p className="text-[10px] text-muted-foreground">students</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 min-h-64">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg">Sessions</h2>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {upcomingSessions.slice(0, 6).map((session) => {
              const sport = mockSports.find(s => s.id === session.sportId);
              const location = mockLocations.find(l => l.id === session.locationId);
              return (
                <div key={session.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="text-2xl">{sport?.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{sport?.name}</p>
                    <p className="text-xs text-muted-foreground">{session.date} • {location?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium">{session.startTime}</p>
                    <p className="text-[10px] text-muted-foreground">to {session.endTime}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-5 min-h-64">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg">Upcoming Events</h2>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {upcomingSessions.slice(0, 4).map((session) => {
              const sport = mockSports.find(s => s.id === session.sportId);
              return (
                <div key={`event-${session.id}`} className="p-3 rounded-lg bg-muted/50">
                  <p className="font-medium text-sm">{sport?.name} Event</p>
                  <p className="text-xs text-muted-foreground">{session.date} • {session.startTime}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 min-h-64">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg">Inventory</h2>
            <Boxes className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {mockLocations.slice(0, 4).map((location, index) => (
              <div key={location.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-sm">{location.name}</p>
                  <p className="text-xs text-muted-foreground">Equipment in stock</p>
                </div>
                <Badge variant="outline">{(index + 1) * 12} items</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-5 min-h-52">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-lg">Payment</h2>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-xs text-muted-foreground">Total Collected</p>
            <p className="text-xl font-display font-bold mt-1">${totalRevenue}</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-xs text-muted-foreground">Pending Payments</p>
            <p className="text-xl font-display font-bold mt-1">$480</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-xs text-muted-foreground">Paid Users</p>
            <p className="text-xl font-display font-bold mt-1 flex items-center gap-2">
              {mockStudents.length}
              <Users className="h-4 w-4 text-muted-foreground" />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
