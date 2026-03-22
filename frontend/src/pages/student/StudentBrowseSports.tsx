import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Users, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5001";

export default function StudentBrowseSports() {
  const token = localStorage.getItem("token");
  const [sports, setSports] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () => sports.filter((sport) => sport.name.toLowerCase().includes(search.toLowerCase())),
    [sports, search],
  );

  const loadData = async () => {
    try {
      const [sportsRes, sessionsRes] = await Promise.all([
        fetch(`${API_BASE}/api/sports?isActive=true&limit=200`, {
          headers: token
            ? {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              }
            : { "Content-Type": "application/json" },
        }),
        fetch(`${API_BASE}/api/sessions?status=scheduled&limit=300`, {
          headers: token
            ? {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              }
            : { "Content-Type": "application/json" },
        }),
      ]);

      const sportsJson = await sportsRes.json();
      const sessionsJson = await sessionsRes.json();

      if (sportsRes.ok) setSports(sportsJson.data ?? []);
      if (sessionsRes.ok) setSessions(sessionsJson.data ?? []);
    } catch (error) {
      toast.error("Unable to load sports");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleJoinRequest = async (sportId: string) => {
    if (!token) return toast.error("Please login as a student");

    const upcomingSession = sessions
      .filter((session) => session?.sport?._id === sportId)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0];

    if (!upcomingSession) {
      return toast.error("No upcoming session for this sport right now");
    }

    try {
      const response = await fetch(`${API_BASE}/api/join-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sessionId: upcomingSession._id,
          message: "I would like to join this team.",
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        return toast.error(data.message || "Failed to send join request");
      }

      toast.success("Join request sent! Waiting for coach approval.");
    } catch (error) {
      toast.error("Unable to send join request");
    }
  };

  return (
    <div className="space-y-6 page-shell">
      <PageHeader title="Browse Sports" description="Explore available sports programs and request to join" />

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search sports..." className="pl-9" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((sport) => {
          const sportSessions = sessions.filter((session) => session?.sport?._id === sport._id);
          const enrolledCount = sportSessions.reduce(
            (total, session) => total + (session.enrolledStudents?.length ?? 0),
            0,
          );
          const coachNames = (sport.coaches ?? []).map((coach) => coach.name).join(", ");

          return (
            <div key={sport._id} className="surface-card p-5 animate-fade-in flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">🏅</span>
                <div>
                  <h3 className="font-display font-bold text-lg">{sport.name}</h3>
                  <p className="text-xs text-muted-foreground">{sport.description}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="secondary" className="text-xs"><Users className="h-3 w-3 mr-1" />{enrolledCount}/{sport.maxParticipants}</Badge>
                <Badge variant="outline" className="text-xs">{sportSessions.length} sessions</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Coach{(sport.coaches?.length ?? 0) > 1 ? "es" : ""}: {coachNames || "Not assigned"}
              </p>
              <div className="mt-auto">
                <Button className="w-full gap-2" variant="default" onClick={() => handleJoinRequest(sport._id)}>
                  Request to Join <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
