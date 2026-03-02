import { PageHeader } from "@/components/common/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { mockJoinRequests, mockSessions, mockStudents, mockSports } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function CoachRequests() {
  const { user } = useAuth();
  const mySessionIds = mockSessions.filter(s => s.coachId === user.id).map(s => s.id);
  const requests = mockJoinRequests.filter(r => mySessionIds.includes(r.sessionId));

  return (
    <div className="space-y-6">
      <PageHeader title="Join Requests" description="Review and manage student requests to join your sessions" />

      <div className="space-y-3">
        {requests.length === 0 && <p className="text-muted-foreground text-sm">No requests at this time.</p>}
        {requests.map(req => {
          const student = mockStudents.find(s => s.id === req.studentId);
          const sport = mockSports.find(s => s.id === req.sportId);
          return (
            <div key={req.id} className="bg-card rounded-xl shadow-card p-4 flex items-center gap-4 animate-fade-up">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-display font-bold text-sm shrink-0">
                {student?.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{student?.name}</p>
                <p className="text-xs text-muted-foreground">{sport?.icon} {sport?.name} • Requested {req.requestDate}</p>
              </div>
              {req.status === "pending" ? (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => toast.success(`Accepted ${student?.name}`)}>Accept</Button>
                  <Button size="sm" variant="outline" onClick={() => toast.info(`Declined ${student?.name}`)}>Decline</Button>
                </div>
              ) : (
                <Badge variant={req.status === "accepted" ? "default" : "destructive"} className="capitalize">{req.status}</Badge>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
