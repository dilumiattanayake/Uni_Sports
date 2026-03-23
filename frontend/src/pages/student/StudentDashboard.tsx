import { Link } from "react-router-dom"
import { useEffect, useMemo, useState } from "react"
import { DashboardLayout } from "@/components/DashboardLayout"
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Dumbbell,
  Trophy,
} from "lucide-react"

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5001"

const StudentDashboard = () => {
  const [events, setEvents] = useState<any[]>([])
  const [eventsLoading, setEventsLoading] = useState(false)
  const [eventsError, setEventsError] = useState("")

  const stats = [
    { label: "Active sports", value: 2 },
    { label: "Upcoming sessions", value: 3 },
    { label: "Pending requests", value: 1 },
  ]

  const upcomingSessions = [
    { sport: "Football", date: "Mar 10, 2026", time: "5:30 PM", location: "Main Ground" },
    { sport: "Basketball", date: "Mar 12, 2026", time: "6:00 PM", location: "Indoor Court" },
    { sport: "Cricket", date: "Mar 15, 2026", time: "4:30 PM", location: "Practice Nets" },
  ]

  const recentRequests = [
    { sport: "Football", status: "Approved" },
    { sport: "Basketball", status: "Pending" },
    { sport: "Volleyball", status: "Rejected" },
  ]

  const getEventStartDate = (event) => {
    const date = new Date(event.startDate)
    const [hour, minute] = (event.startTime || "").split(":").map(Number)
    if (!isNaN(hour) && !isNaN(minute)) {
      date.setHours(hour, minute)
    }
    return date
  }

  const upcomingEvents = useMemo(() => {
    const now = new Date()
    return (
      events
        .map((e) => ({
          ...e,
          startAt: getEventStartDate(e),
        }))
        .filter((e) => e.startAt >= now)
        .sort((a, b) => a.startAt - b.startAt)
    )
  }, [events])

  useEffect(() => {
    const loadEvents = async () => {
      setEventsLoading(true)
      setEventsError("")

      try {
        const res = await fetch(`${API_BASE}/api/events`, {
          headers: { "Content-Type": "application/json" },
        })
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.message || "Failed to load events")
        }

        setEvents(data.data ?? [])
      } catch (err: any) {
        setEventsError(err?.message ?? "Unable to load events")
      } finally {
        setEventsLoading(false)
      }
    }

    loadEvents()
  }, [])

  const quickActions = [
    {
      title: "Browse Sports",
      description: "Explore sports and join teams",
      icon: <Dumbbell className="h-5 w-5" aria-hidden="true" />,
      href: "/student/sports",
      bg: "bg-indigo-500/10",
    },
    {
      title: "My Sessions",
      description: "View your practice schedule",
      icon: <CalendarDays className="h-5 w-5" aria-hidden="true" />,
      href: "/student/sessions",
      bg: "bg-orange-500/10",
    },
    {
      title: "My Requests",
      description: "Track join request status",
      icon: <ClipboardList className="h-5 w-5" aria-hidden="true" />,
      href: "/student/requests",
      bg: "bg-emerald-500/10",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Stats */}
        <section className="grid gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-slate-700/80 bg-slate-900/70 p-5 shadow-sm transition hover:shadow-md"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {s.label}
              </p>
              <p className="mt-2 text-3xl font-bold text-foreground">{s.value}</p>
            </div>
          ))}
        </section>

        {/* Quick actions */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Quick actions</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                to={action.href}
                className="group rounded-xl border border-slate-700/80 bg-slate-900/70 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div
                  className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${action.bg} text-primary`}
                >
                  {action.icon}
                </div>
                <h3 className="font-semibold text-foreground">{action.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{action.description}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  Open <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Upcoming sessions */}
          <section className="rounded-xl border border-slate-700/80 bg-slate-900/70 p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <CalendarDays className="h-4 w-4" aria-hidden="true" />
                </div>
                <h2 className="font-semibold text-foreground">Upcoming sessions</h2>
              </div>
              <Link
                to="/student/sessions"
                className="text-sm font-semibold text-primary hover:underline"
              >
                View all
              </Link>
            </div>

            <div className="space-y-3">
              {upcomingSessions.map((session) => (
                <div
                  key={`${session.sport}-${session.date}-${session.time}`}
                  className="flex items-center justify-between rounded-lg border border-slate-700/70 bg-slate-800/40 px-4 py-4 text-sm transition hover:bg-slate-800/55"
                >
                  <div>
                    <p className="font-semibold text-foreground">{session.sport}</p>
                    <p className="text-xs text-muted-foreground">
                      {session.date} · {session.time}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">{session.location}</p>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Recent requests */}
          <section className="rounded-xl border border-slate-700/80 bg-slate-900/70 p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
                  <Trophy className="h-4 w-4" aria-hidden="true" />
                </div>
                <h2 className="font-semibold text-foreground">Recent requests</h2>
              </div>
              <Link
                to="/student/requests"
                className="text-sm font-semibold text-primary hover:underline"
              >
                Manage
              </Link>
            </div>

            <div className="space-y-3">
              {recentRequests.map((req) => (
                <div
                  key={`${req.sport}-${req.status}`}
                  className="flex items-center justify-between rounded-lg border border-slate-700/70 bg-slate-800/40 px-4 py-3"
                >
                  <p className="font-semibold text-foreground">{req.sport}</p>
                  <span
                    className={
                      "rounded-full px-2.5 py-0.5 text-xs font-semibold " +
                      (req.status === "Approved"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : req.status === "Pending"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400")
                    }
                  >
                    {req.status}
                  </span>
                </div>
              ))}
            </div>
          </section>

           <section className="rounded-xl border border-slate-700/80 bg-slate-900/70 p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
                  <Trophy className="h-4 w-4" aria-hidden="true" />
                </div>
                <h2 className="font-semibold text-foreground ">Upcomming Events</h2>
              </div>
              <Link
                to="/student/events"
                className="text-sm font-semibold text-primary hover:underline"
              >
                View all
              </Link>
            </div>

            <div className="space-y-3">
              {eventsLoading ? (
                <p className="text-sm text-muted-foreground">Loading events…</p>
              ) : eventsError ? (
                <p className="text-sm text-muted-foreground">{eventsError}</p>
              ) : upcomingEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center text-slate-500">No upcoming events yet.</p>
              ) : (
                upcomingEvents.slice(0, 5).map((event) => (
                  <div
                    key={event._id || event.id}
                    className="flex items-center justify-between rounded-lg border border-slate-700/70 bg-slate-800/40 px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{event.eventName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.startAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}{" "}
                        {new Date(event.startAt).toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">{event.location}</p>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

        </div>
      </div>
    </DashboardLayout>
  )
}

export default StudentDashboard
