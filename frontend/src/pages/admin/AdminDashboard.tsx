import { useEffect, useMemo, useState } from "react";
import { StatCard } from "@/components/common/StatCard";
import { PageHeader } from "@/components/common/PageHeader";
import { Trophy, Users, UserCheck, MapPin, Calendar, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/DashboardLayout";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function AdminDashboard() {
  const [sports, setSports] = useState<any[]>([]);
  const [coachesCount, setCoachesCount] = useState(0);
  const [studentsCount, setStudentsCount] = useState(0);
  const [locationsCount, setLocationsCount] = useState(0);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const upcomingSessions = useMemo(
    () => sessions.filter((s) => s.status === "scheduled"),
    [sessions]
  );

  const stats = [
    { label: "Total Sports", value: sports.length, icon: <Trophy className="h-5 w-5" /> },
    { label: "Coaches", value: coachesCount, icon: <Users className="h-5 w-5" /> },
    { label: "Students", value: studentsCount, icon: <UserCheck className="h-5 w-5" /> },
    { label: "Locations", value: locationsCount, icon: <MapPin className="h-5 w-5" /> },
  ];

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");

      try {
        const [sportsRes, coachesRes, studentsRes, locationsRes, sessionsRes] = await Promise.all([
          fetch(`${API_BASE}/api/sports`, {
            headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
          }),
          fetch(`${API_BASE}/api/users?role=coach`, {
            headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
          }),
          fetch(`${API_BASE}/api/users?role=student`, {
            headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
          }),
          fetch(`${API_BASE}/api/locations`, {
            headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
          }),
          fetch(`${API_BASE}/api/sessions?status=scheduled&limit=20`, {
            headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
          }),
        ]);

        const [sportsJson, coachesJson, studentsJson, locationsJson, sessionsJson] =
          await Promise.all([
            sportsRes.json(),
            coachesRes.json(),
            studentsRes.json(),
            locationsRes.json(),
            sessionsRes.json(),
          ]);

        if (!sportsRes.ok) throw new Error(sportsJson.message || "Failed to load sports");
        if (!coachesRes.ok) throw new Error(coachesJson.message || "Failed to load coaches");
        if (!studentsRes.ok) throw new Error(studentsJson.message || "Failed to load students");
        if (!locationsRes.ok) throw new Error(locationsJson.message || "Failed to load locations");
        if (!sessionsRes.ok) throw new Error(sessionsJson.message || "Failed to load sessions");

        setSports(sportsJson.data ?? []);
        setCoachesCount(coachesJson.total ?? coachesJson.count ?? 0);
        setStudentsCount(studentsJson.total ?? studentsJson.count ?? 0);
        setLocationsCount(locationsJson.data?.length ?? 0);
        setSessions(sessionsJson.data ?? []);
      } catch (err: any) {
        setError(err?.message ?? "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const formatSessionTime = (isoDate: string) => {
    try {
      return new Date(isoDate).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoDate;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader title="Admin Dashboard" description="Overview of all sports management activities" />

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-border bg-card p-5 shadow-sm transition hover:shadow-md  bg-indigo-100 text-black"
            >
              <div className="flex items-center gap-2">
                {s.icon}
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {s.label}
                </p>
              </div>

              <p className="mt-2 text-3xl font-bold text-foreground">{s.value}</p>
            </div>
          ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Sessions */}
          <div className="rounded-xl border border-zinc-300 bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg">Upcoming Sessions</h2>
              <Badge variant="secondary" className="text-xs">
                {upcomingSessions.length} scheduled
              </Badge>
            </div>

            {loading ? (
              <p className="text-sm text-muted-foreground">Loading sessions…</p>
            ) : upcomingSessions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sessions scheduled.</p>
            ) : (
              <div className="space-y-3">
                {upcomingSessions.slice(0, 5).map((session) => (
                  <div
                    key={session._id || session.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{session.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {session.sport?.name} • {session.coach?.name} • {session.location?.name}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-medium">
                        {formatSessionTime(session.startTime)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatSessionTime(session.endTime)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sports Overview */}
          <div className="rounded-xl border border-zinc-300 bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg">Sports Programs</h2>
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading sports…</p>
            ) : (
              <div className="space-y-3">
                {sports.map((sport) => {
                  const sessionCount = sessions.filter((s) => s.sport?._id === sport._id).length;
                  const assignedCoaches = coachesCount ? coachesCount : 0;

                  return (
                    <div
                      key={sport._id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="text-2xl">🏆</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{sport.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {sessionCount} session{sessionCount === 1 ? "" : "s"} scheduled
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-display font-bold">{sessionCount}</p>
                        <p className="text-[10px] text-muted-foreground">sessions</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Upcoming Events (placeholder) */}
          <div className="rounded-xl border border-zinc-300 bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg">Upcoming Events</h2>
              <Calendar className="h-4 w-4 text-indigo-500" />
            </div>
            <p className="text-sm text-muted-foreground">Events are not yet available from the API.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
