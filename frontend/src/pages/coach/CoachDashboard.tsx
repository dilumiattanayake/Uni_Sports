import { StatCard } from "@/components/common/StatCard";
import { PageHeader } from "@/components/common/PageHeader";
import { mockSports, mockSessions, mockJoinRequests, mockStudents, mockLocations, mockCoaches } from "@/data/mockData";
import { useAuth } from "@/context/AuthContext";
import { Calendar, Users, UserCheck, Trophy, Clock, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/DashboardLayout"
import { toast } from "sonner";

export default function CoachDashboard() {
  const { user } = useAuth();
  // Coach-specific data
  const mySports = mockSports.filter(s => s.coachIds.includes(user.id));
  const mySessions = mockSessions.filter(s => s.coachId === user.id);
  const myRequests = mockJoinRequests.filter(r => {
    const session = mockSessions.find(s => s.id === r.sessionId);
    return session?.coachId === user.id;
  });
  const pendingRequests = myRequests.filter(r => r.status === "pending");

  const stats = [
  {
    label: "My Sports",
    value: mySports.length,
    icon: <Trophy className="h-5 w-5" />
  },
  {
    label: "Sessions",
    value: mySessions.length,
    icon: <Calendar className="h-5 w-5" />
  },
  {
    label: "Pending Requests",
    value: pendingRequests.length,
    icon: <UserCheck className="h-5 w-5" />
  },
  {
    label: "Total Enrolled",
    value: new Set(mySessions.flatMap(s => s.enrolledStudents)).size,
    icon: <Users className="h-5 w-5" />
  }
];

  return (
    <DashboardLayout>
    <div className="space-y-6">
      <PageHeader title="Coach Dashboard" description={`Welcome back, ${user.name}`} />

      {/* Stats */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-border bg-card p-5 shadow-sm transition bg-indigo-100 hover:shadow-md"
            >
              <div className="flex items-center gap-2">
                {s.icon}
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {s.label}
                </p>
              </div>

              <p className="mt-2 text-3xl font-bold text-foreground">
                {s.value}
              </p>
            </div>
          ))}
        </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Sessions */}
        <div className="rounded-xl border border-zinc-400 bg-card p-5 shadow-sm">
          <h2 className="font-display font-bold text-lg mb-4">My Sessions</h2>
          <div className="space-y-3">
            {mySessions.map(session => {
              const sport = mockSports.find(s => s.id === session.sportId);
              const location = mockLocations.find(l => l.id === session.locationId);
              // Check for booking clashes
              const clash = mockSessions.find(s =>
                s.id !== session.id && s.locationId === session.locationId && s.date === session.date &&
                s.startTime < session.endTime && s.endTime > session.startTime
              );
              return (
                <div key={session.id} className={`p-3 rounded-lg border transition-colors ${clash ? "border-destructive/50 bg-destructive/5" : "border-border bg-muted/30 hover:bg-muted/50"}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{sport?.icon}</span>
                      <div>
                        <p className="font-medium text-sm">{sport?.name}</p>
                        <p className="text-xs text-muted-foreground">{location?.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium">{session.date}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end"><Clock className="h-3 w-3" />{session.startTime}–{session.endTime}</p>
                    </div>
                  </div>
                  {clash && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-destructive font-medium">
                      <AlertTriangle className="h-3.5 w-3.5" /> Booking clash with another session at this location
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">{session.enrolledStudents.length}/{session.maxCapacity} enrolled</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pending Join Requests */}
        <div className="rounded-xl border border-zinc-400 bg-card p-5 shadow-sm">
          <h2 className="font-display font-bold text-lg mb-4">Join Requests</h2>
          <div className="space-y-3">
            {myRequests.map(req => {
              const student = mockStudents.find(s => s.id === req.studentId);
              const sport = mockSports.find(s => s.id === req.sportId);
              return (
                <div key={req.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-display font-bold text-xs">
                      {student?.name?.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{student?.name}</p>
                      <p className="text-xs text-muted-foreground">{sport?.icon} {sport?.name} • {req.requestDate}</p>
                    </div>
                  </div>
                  {req.status === "pending" ? (
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => toast.success("Request accepted")}>Accept</Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => toast.info("Request declined")}>Decline</Button>
                    </div>
                  ) : (
                    <Badge variant={req.status === "accepted" ? "default" : "destructive"} className="text-xs capitalize">{req.status}</Badge>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
    </DashboardLayout>
  );
}
