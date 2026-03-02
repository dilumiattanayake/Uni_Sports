import { StatCard } from "@/components/common/StatCard";
import { PageHeader } from "@/components/common/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { mockSports, mockSessions, mockJoinRequests, mockLocations, mockCoaches } from "@/data/mockData";
import { Trophy, Calendar, UserCheck, Clock, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function StudentDashboard() {
  const { user } = useAuth();
  const myRequests = mockJoinRequests.filter(r => r.studentId === user.id);
  const mySessions = mockSessions.filter(s => s.enrolledStudents.includes(user.id));
  const pendingRequests = myRequests.filter(r => r.status === "pending");

  return (
    <div className="space-y-6">
      <PageHeader title="Student Dashboard" description={`Welcome, ${user.name}`} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Available Sports" value={mockSports.length} icon={<Trophy className="h-5 w-5" />} variant="primary" />
        <StatCard title="My Sessions" value={mySessions.length} icon={<Calendar className="h-5 w-5" />} variant="secondary" />
        <StatCard title="Pending Requests" value={pendingRequests.length} icon={<UserCheck className="h-5 w-5" />} variant="accent" />
        <StatCard title="Sports Enrolled" value={new Set(mySessions.map(s => s.sportId)).size} icon={<BookOpen className="h-5 w-5" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Upcoming Sessions */}
        <div className="bg-card rounded-xl shadow-card p-5">
          <h2 className="font-display font-bold text-lg mb-4">Upcoming Sessions</h2>
          <div className="space-y-3">
            {mySessions.length === 0 && <p className="text-sm text-muted-foreground">No sessions yet. Browse sports to join!</p>}
            {mySessions.map(session => {
              const sport = mockSports.find(s => s.id === session.sportId);
              const location = mockLocations.find(l => l.id === session.locationId);
              return (
                <div key={session.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <span className="text-2xl">{sport?.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{sport?.name}</p>
                    <p className="text-xs text-muted-foreground">{location?.name}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-medium">{session.date}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end"><Clock className="h-3 w-3" />{session.startTime}–{session.endTime}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* My Requests */}
        <div className="bg-card rounded-xl shadow-card p-5">
          <h2 className="font-display font-bold text-lg mb-4">My Requests</h2>
          <div className="space-y-3">
            {myRequests.length === 0 && <p className="text-sm text-muted-foreground">No requests yet.</p>}
            {myRequests.map(req => {
              const sport = mockSports.find(s => s.id === req.sportId);
              const statusVariant = req.status === "accepted" ? "default" : req.status === "rejected" ? "destructive" : "secondary";
              return (
                <div key={req.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{sport?.icon}</span>
                    <div>
                      <p className="text-sm font-medium">{sport?.name}</p>
                      <p className="text-xs text-muted-foreground">Requested: {req.requestDate}</p>
                    </div>
                  </div>
                  <Badge variant={statusVariant} className="capitalize">{req.status}</Badge>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
