import { StatCard } from "@/components/common/StatCard";
import { PageHeader } from "@/components/common/PageHeader";
import { Trophy, Users, UserCheck, MapPin, Calendar, TrendingUp } from "lucide-react";
import { mockSports, mockCoaches, mockStudents, mockSessions, mockLocations } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const upcomingSessions = mockSessions.filter(s => s.status === "scheduled");

  return (
    <div className="space-y-6">
      <PageHeader title="Admin Dashboard" description="Overview of all sports management activities" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Sports" value={mockSports.length} icon={<Trophy className="h-5 w-5" />} variant="primary" description="Active programs" />
        <StatCard title="Coaches" value={mockCoaches.length} icon={<Users className="h-5 w-5" />} variant="secondary" description="Registered coaches" />
        <StatCard title="Students" value={mockStudents.length} icon={<UserCheck className="h-5 w-5" />} variant="accent" description="Enrolled students" />
        <StatCard title="Locations" value={mockLocations.length} icon={<MapPin className="h-5 w-5" />} description="Practice venues" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Sessions */}
        <div className="bg-card rounded-xl shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg">Upcoming Sessions</h2>
            <Badge variant="secondary" className="text-xs">{upcomingSessions.length} scheduled</Badge>
          </div>
          <div className="space-y-3">
            {upcomingSessions.slice(0, 5).map((session) => {
              const sport = mockSports.find(s => s.id === session.sportId);
              const coach = mockCoaches.find(c => c.id === session.coachId);
              const location = mockLocations.find(l => l.id === session.locationId);
              return (
                <div key={session.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="text-2xl">{sport?.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{sport?.name}</p>
                    <p className="text-xs text-muted-foreground">{coach?.name} • {location?.name}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-medium">{session.date}</p>
                    <p className="text-xs text-muted-foreground">{session.startTime}–{session.endTime}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sports Overview */}
        <div className="bg-card rounded-xl shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg">Sports Programs</h2>
            <TrendingUp className="h-4 w-4 text-success" />
          </div>
          <div className="space-y-3">
            {mockSports.map((sport) => {
              const enrolledCount = mockStudents.filter(s => s.enrolledSports.includes(sport.id)).length;
              const coaches = mockCoaches.filter(c => sport.coachIds.includes(c.id));
              return (
                <div key={sport.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="text-2xl">{sport.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{sport.name}</p>
                    <p className="text-xs text-muted-foreground">{coaches.map(c => c.name).join(", ")}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-display font-bold">{enrolledCount}/{sport.maxStudents}</p>
                    <p className="text-[10px] text-muted-foreground">enrolled</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
