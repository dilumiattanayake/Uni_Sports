import { Link } from "react-router-dom"
import { useEffect, useMemo, useState } from "react"
import { DashboardLayout } from "@/components/DashboardLayout"
import { PageHeader } from "@/components/common/PageHeader"
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Dumbbell,
  Medal,
  Trophy,
  Users,
} from "lucide-react"
import { Value } from "@radix-ui/react-select"

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5001"

const StudentDashboard = () => {
  const [events, setEvents] = useState<any[]>([])
  const [eventsLoading, setEventsLoading] = useState(false)
  const [eventsError, setEventsError] = useState("")

  const stats = [
    { label: "Active Sports", value: 2 },
    { label: "Upcoming Sessions", value: 3 },
    { label: "Registered Events", value: 1 },
  ]

  const upcomingSessions = [
    { sport: "Football", date: "Mar 10, 2026", time: "5:30 PM", location: "Main Ground" },
    { sport: "Basketball", date: "Mar 12, 2026", time: "6:00 PM", location: "Indoor Court" },
    { sport: "Cricket", date: "Mar 15, 2026", time: "4:30 PM", location: "Practice Nets" },
  ]
  const upcomingEvents = [
    { sport: "Showdown Cricket", date: "Mar 10, 2026", time: "5:30 PM", location: "Main Ground" },
    { sport: "Freshers Badminton", date: "Mar 12, 2026", time: "6:00 PM", location: "Indoor Court" },
    { sport: "Carrom Championship", date: "Mar 15, 2026", time: "4:30 PM", location: "F1301" },
  ]

  const itemCategory = [
    { label: "Cricket", Value:"Official Jersey" },
    { label: "Football", Value:"Practice Kit" },
    { label: "Basketball", Value:"Wrist Band" },
    { label: "Volleyball", Value:"Official Kit" },
  ]

  const getEventStartDate = (event) => {
    const date = new Date(event.startDate)
    const [hour, minute] = (event.startTime || "").split(":").map(Number)
    if (!isNaN(hour) && !isNaN(minute)) {
      date.setHours(hour, minute)
    }
    return date
  }

  {/*const upcomingEvents = useMemo(() => {
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
  }, [events])*/}

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
      title: "Browse Merchandise",
      description: "View available merchandise",
      icon: <Trophy className="h-5 w-5" aria-hidden="true" />,
      href: "",
      bg: "bg-orange-500/10",
    },
    {
      title: "View Tournaments",
      description: "See upcoming sports events",
      icon: <Medal className="h-5 w-5" aria-hidden="true" />,
      href: "",
      bg: "bg-emerald-500/10",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="My Dashboard"
          description="Manage your sports, sessions, and join requests in one place"
        />

        {/* Stats */}
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-800 text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition duration-300 transform hover:scale-105">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm opacity-80 font-medium">{stats[0].label}</p>
                <p className="text-3xl font-bold mt-2">{stats[0].value}</p>
              </div>
              <div className="bg-indigo-500 bg-opacity-30 p-3 rounded-xl">
                <Users className="h-6 w-6" />
              </div>
            </div>
            <p className="text-xs opacity-70 mt-3">Active sports programs</p>
          </div>

           <div className="bg-gradient-to-br from-green-500 via-green-400 to-emerald-400 text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition duration-300 transform hover:scale-105">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm opacity-80 font-medium">{stats[1].label}</p>
                <p className="text-3xl font-bold mt-2">{stats[1].value}</p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                <CalendarDays className="h-6 w-6" />
              </div>
            </div>
            <p className="text-xs opacity-70 mt-3">Scheduled this week</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 via-orange-400 to-yellow-400 text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition duration-300 transform hover:scale-105">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm opacity-80 font-medium">{stats[2].label}</p>
                <p className="text-3xl font-bold mt-2">{stats[2].value}</p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                <Medal className="h-6 w-6" />
              </div>
            </div>
            <p className="text-xs opacity-70 mt-3">In inventory</p>
          </div>
        </section>

        {/* Quick actions */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Quick actions</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                to={action.href}
                className="group rounded-xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
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
          {/* Sports */}
          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <CalendarDays className="h-4 w-4" aria-hidden="true" />
                </div>
                <h2 className="font-semibold text-foreground">Sports</h2>
              </div>
              <Link
                to="/student/sports"
                className="text-sm font-semibold text-primary hover:underline"
              >
                View all
              </Link>
            </div>

            <div className="space-y-3">
              {upcomingSessions.map((session) => (
                <div
                  key={`${session.sport}-${session.date}-${session.time}`}
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/50 px-4 py-4 text-sm transition hover:bg-muted/80"
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

          {/* Inventory */}
          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
                  <Trophy className="h-4 w-4" aria-hidden="true" />
                </div>
                <h2 className="font-semibold text-foreground">Inventory</h2>
              </div>
              <Link
                to="/student/requests"
                className="text-sm font-semibold text-primary hover:underline"
              >
                Shop Now
              </Link>
            </div>

            <div className="space-y-3">
              {itemCategory.map((req) => (
                <div
                  key={`${req.label}-${req.Value}`}
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/50 px-4 py-3"
                >
                  <p className="font-semibold text-foreground">{req.label}</p>
                  <span
                    className={
                      "rounded-full px-2.5 py-0.5 text-xs font-semibold " +
                      (req.Value)
                    }
                  >
                    {req.Value}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Events */} 
           <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
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
              {upcomingEvents.map((event) => (
                <div
                  key={`${event.sport}-${event.date}-${event.time}`}
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/50 px-4 py-4 text-sm transition hover:bg-muted/80"
                >
                  <div>
                    <p className="font-semibold text-foreground">{event.sport}</p>
                    <p className="text-xs text-muted-foreground">
                      {event.date} · {event.time}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">{event.location}</p>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </DashboardLayout>
  )
}

export default StudentDashboard
