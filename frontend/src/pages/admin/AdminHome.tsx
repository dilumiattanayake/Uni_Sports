import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Trophy, Users, UserCheck, MapPin, Calendar, CalendarDays, TrendingUp, Activity, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function AdminHome() {
  const [sports, setSports] = useState<any[]>([]);
  const [coachesCount, setCoachesCount] = useState(0);
  const [studentsCount, setStudentsCount] = useState(0);
  const [locationsCount, setLocationsCount] = useState(0);
  const [sessions, setSessions] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [itemsCount, setItemsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const upcomingSessions = useMemo(
    () => sessions.filter((s) => s.status === "scheduled"),
    [sessions]
  );

  const upcomingEventsCount = useMemo(() => {
    const now = new Date();
    return events.filter((event) => {
      if (event?.status?.toLowerCase() === "upcoming") return true;
      if (!event?.date) return false;
      const eventDate = new Date(event.date);
      return !Number.isNaN(eventDate.getTime()) && eventDate >= now;
    }).length;
  }, [events]);

  const stats = [
    { label: "Total Sports", value: sports.length, icon: <Trophy className="h-5 w-5" /> },
    { label: "Total Users", value: coachesCount + studentsCount, icon: <Users className="h-5 w-5" /> },
    { label: "Current Events", value: upcomingEventsCount, icon: <CalendarDays className="h-5 w-5" /> },
    { label: "Total Items", value: itemsCount, icon: <Activity className="h-5 w-5" /> },
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

        // Load inventory count from API if available
        try {
          const itemsRes = await fetch(`${API_BASE}/api/items`, {
            headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
          });

          if (itemsRes.ok) {
            const itemsJson = await itemsRes.json();
            setItemsCount(
              itemsJson.total ?? itemsJson.count ?? (Array.isArray(itemsJson.data) ? itemsJson.data.length : 0)
            );
          } else {
            setItemsCount(0);
          }
        } catch {
          setItemsCount(0);
        }

        // Mock events data - replace with API call when available
        const mockEvents = [
          { id: "E001", title: "Inter-Faculty Football Tournament", date: "2026-04-05", location: "SLIIT Ground", status: "upcoming" },
          { id: "E002", title: "Basketball Championship ", date: "2026-04-15", location: "Indoor Court", status: "upcoming" },
          { id: "E003", title: "Showdown Cricket Tournament", date: "2026-05-01", location: "SLIIT Ground", status: "upcoming" },
          
        ];
        setEvents(mockEvents);
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

  const getSportEmoji = (sportName: string) => {
    const name = sportName.toLowerCase();
    if (name.includes('football') || name.includes('soccer')) return '⚽';
    if (name.includes('basketball')) return '🏀';
    if (name.includes('cricket')) return '🏏';
    if (name.includes('tennis')) return '🎾';
    if (name.includes('volleyball')) return '🏐';
    if (name.includes('baseball')) return '⚾';
    if (name.includes('hockey')) return '🏒';
    if (name.includes('rugby')) return '🏉';
    if (name.includes('swimming')) return '🏊';
    if (name.includes('athletics') || name.includes('track')) return '🏃';
    if (name.includes('badminton')) return '🏸';
    if (name.includes('table tennis') || name.includes('ping pong')) return '🏓';
    if (name.includes('golf')) return '⛳';
    if (name.includes('boxing')) return '🥊';
    if (name.includes('wrestling')) return '🤼';
    if (name.includes('karate') || name.includes('martial')) return '🥋';
    if (name.includes('cycling')) return '🚴';
    if (name.includes('rowing')) return '🚣';
    if (name.includes('sailing')) return '⛵';
    if (name.includes('skiing')) return '🎿';
    if (name.includes('skating')) return '⛸️';
    if (name.includes('chess')) return '♟️';
    if (name.includes('esports')) return '🎮';
    // Default fallback
    return '🏆';
  };

  const getEventEmoji = (eventTitle: string) => {
    const title = eventTitle.toLowerCase();
    if (title.includes('football') || title.includes('soccer')) return '⚽';
    if (title.includes('basketball')) return '🏀';
    if (title.includes('cricket')) return '🏏';
    if (title.includes('tennis')) return '🎾';
    if (title.includes('volleyball')) return '🏐';
    if (title.includes('baseball')) return '⚾';
    if (title.includes('hockey')) return '🏒';
    if (title.includes('rugby')) return '🏉';
    if (title.includes('swimming')) return '🏊';
    if (title.includes('athletics') || title.includes('meet')) return '🏃';
    if (title.includes('badminton')) return '🏸';
    if (title.includes('table tennis') || title.includes('ping pong')) return '🏓';
    if (title.includes('golf')) return '⛳';
    if (title.includes('boxing')) return '🥊';
    if (title.includes('wrestling')) return '🤼';
    if (title.includes('karate') || title.includes('martial')) return '🥋';
    if (title.includes('cycling')) return '🚴';
    if (title.includes('rowing')) return '🚣';
    if (title.includes('sailing')) return '⛵';
    if (title.includes('skiing')) return '🎿';
    if (title.includes('skating')) return '⛸️';
    if (title.includes('chess')) return '♟️';
    if (title.includes('esports')) return '🎮';
    if (title.includes('tournament') || title.includes('championship')) return '🏆';
    if (title.includes('league') || title.includes('playoffs')) return '🏅';
    // Default fallback
    return '📅';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
          <PageHeader title={
            <>
            <span className="text-4xl text-indigo-950">WELCOME TO</span>
            <span className="text-6xl text-orange-500 font-bold"> UNISPORT...</span>
            </>
            
        } 
            description="Overview of all sports management activities" />
          
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, idx) => {
            const bgColors = [
              "bg-indigo-950 border-indigo-950",
              "bg-green-500 border-green-500",
              "bg-orange-400 border-orange-400",
              "bg-gray-400 border-gray-400"
            ];
            const iconColors = [
              "text-white",
              "text-white",
              "text-white",
              "text-white"
            ];
            const accentBg = [
              "border border-white ",
              "border border-white ",
              "border border-white ",
              "border border-white "
            ];

            return (
              <Card key={s.label} className={`${bgColors[idx]} border-2 overflow-hidden`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-medium text-white">{s.label}</CardTitle>
                    <div className={`${accentBg[idx]} p-2 rounded-lg`}>
                      <div className={`${iconColors[idx]} h-5 w-5`}>
                        {s.icon}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-white">{s.value}</p>
                  <p className="text-xs text-white mt-1">Total count</p>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Sessions */}
          <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-indigo-300 text-white pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white text-lg">Upcoming Sessions</CardTitle>
                  <p className="text-indigo-100 text-sm mt-1">Scheduled activities</p>
                </div>
                <Activity className="h-6 w-6 opacity-80" />
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading sessions…</p>
              ) : upcomingSessions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No sessions scheduled.</p>
              ) : (
                <div className="space-y-3">
                  {upcomingSessions.slice(0, 5).map((session) => (
                    <div
                      key={session._id || session.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-white border border-indigo-200 hover:shadow-md hover:border-indigo-400 transition-all"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900">{session.title}</p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {session.sport?.name} • {session.coach?.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{session.location?.name}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-semibold text-indigo-600">
                          {formatSessionTime(session.startTime)}
                        </p>
                        <Badge variant="secondary" className="mt-1 text-xs">Active</Badge>
                      </div>
                    </div>
                  ))}
                  <Link to="/admin/sessions" className="block mt-4">
                    <Button variant="ghost" className="w-full text-indigo-600 hover:text-indigo-700">
                      View all sessions <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sports Overview */}
          <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-indigo-300 text-white pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white text-lg">Sports Programs</CardTitle>
                  <p className="text-indigo-100 text-sm mt-1">{sports.length} active programs</p>
                </div>
                <Trophy className="h-6 w-6 opacity-80" />
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading sports…</p>
              ) : sports.length === 0 ? (
                <p className="text-sm text-muted-foreground">No sports programs available.</p>
              ) : (
                <div className="space-y-3">
                  {sports.slice(0, 5).map((sport) => {
                    const sessionCount = sessions.filter((s) => s.sport?._id === sport._id).length;

                    return (
                      <div
                        key={sport._id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-white border border-indigo-200 hover:shadow-md hover:border-indigo-400 transition-all"
                      >
                        <div className="text-2xl">{getSportEmoji(sport.name)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900">{sport.name}</p>
                          <p className="text-xs text-gray-600 mt-0.5">
                            {sessionCount} session{sessionCount === 1 ? "" : "s"}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <Badge className="bg-indigo-100 text-indigo-700">{sessionCount}</Badge>
                        </div>
                      </div>
                    );
                  })}
                  <Link to="/admin/sports" className="block mt-4">
                    <Button variant="ghost" className="w-full text-indigo-600 hover:text-indigo-700">
                      Manage sports <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-indigo-300 text-white pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white text-lg">Upcoming Events</CardTitle>
                  <p className="text-indigo-100 text-sm mt-1">{events.length} events scheduled</p>
                </div>
                <Calendar className="h-6 w-6 opacity-80" />
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading events…</p>
              ) : events.length === 0 ? (
                <p className="text-sm text-muted-foreground">No events scheduled.</p>
              ) : (
                <div className="space-y-3">
                  {events.slice(0, 5).map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-white border border-indigo-200 hover:shadow-md hover:border-indigo-400 transition-all"
                    >
                      <div className="flex-shrink-0">
                        <div className="text-2xl">{getEventEmoji(event.title)}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900">{event.title}</p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {event.location}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-semibold text-indigo-600">{event.date}</p>
                        <Badge className="mt-1 text-xs bg-indigo-100 text-indigo-700 hover:bg-indigo-200">Upcoming</Badge>
                      </div>
                    </div>
                  ))}
                  <Link to="/admin/events" className="block mt-4">
                    <Button variant="ghost" className="w-full text-indigo-600 hover:text-indigo-700">
                      View all events <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

