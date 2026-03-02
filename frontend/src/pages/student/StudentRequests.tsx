import { PageHeader } from "@/components/common/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { mockJoinRequests, mockSports, mockSessions, mockLocations } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar } from "lucide-react";

export default function StudentRequests() {
  const { user } = useAuth();
  const myRequests = mockJoinRequests.filter(r => r.studentId === user.id);

  const statusColors = {
    pending: "bg-warning/10 text-warning border-warning/30",
    accepted: "bg-success/10 text-success border-success/30",
    rejected: "bg-destructive/10 text-destructive border-destructive/30",
  };

  return (
    <div className="space-y-6">
      <PageHeader title="My Requests" description="Track the status of your join requests" />

      <div className="space-y-3">
        {myRequests.length === 0 && <p className="text-sm text-muted-foreground">You haven't sent any join requests yet.</p>}
        {myRequests.map(req => {
          const sport = mockSports.find(s => s.id === req.sportId);
          const session = mockSessions.find(s => s.id === req.sessionId);
          const location = session ? mockLocations.find(l => l.id === session.locationId) : null;

          return (
            <div key={req.id} className="bg-card rounded-xl shadow-card p-4 flex flex-col sm:flex-row sm:items-center gap-3 animate-fade-up">
              <span className="text-3xl">{sport?.icon}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-bold">{sport?.name}</h3>
                {session && (
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{session.date}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{session.startTime}–{session.endTime}</span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">Requested: {req.requestDate}</p>
              </div>
              <Badge className={`capitalize border ${statusColors[req.status]}`}>{req.status}</Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
}
