import { Link } from "react-router-dom"
import { DashboardLayout } from "@/components/DashboardLayout"
import { PageHeader } from "@/components/common/PageHeader"
import { ArrowRight, Boxes, CalendarDays, ChevronRight, Dumbbell, Medal, Users } from "lucide-react"

const StudentDashboard = () => {
  const stats = [
    {
      label: "Active Sports",
      value: 3,
      subtitle: "Currently enrolled",
      icon: <Users className="h-6 w-6" />,
      cardClass: "bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-800 text-white",
      iconWrapClass: "bg-indigo-500/30",
    },
    {
      label: "Upcoming Sessions",
      value: 3,
      subtitle: "Scheduled this week",
      icon: <CalendarDays className="h-6 w-6" />,
      cardClass: "bg-gradient-to-br from-green-500 via-green-400 to-emerald-400 text-white",
      iconWrapClass: "bg-white/25",
    },
    {
      label: "Upcoming Events",
      value: 3,
      subtitle: "Tournaments you can join",
      icon: <Medal className="h-6 w-6" />,
      cardClass: "bg-gradient-to-br from-orange-500 via-orange-400 to-yellow-400 text-white",
      iconWrapClass: "bg-white/25",
    },
  ]

  const sports = [
    { name: "Football", date: "Mar 10, 2026", time: "5:30 PM", location: "Main Ground" },
    { name: "Basketball", date: "Mar 12, 2026", time: "6:00 PM", location: "Indoor Court" },
    { name: "Cricket", date: "Mar 15, 2026", time: "4:30 PM", location: "Practice Nets" },
  ]

  const inventoryItems = [
    { category: "Cricket", item: "Official Jersey" },
    { category: "Football", item: "Practice Kit" },
    { category: "Basketball", item: "Wrist Band" },
    { category: "Volleyball", item: "Official Kit" },
  ]

  const upcomingEvents = [
    { eventName: "Inter-Faculty Cricket", date: "Apr 10, 2026", time: "8:30 AM", location: "Main Ground" },
    { eventName: "Freshers Badminton Cup", date: "Apr 14, 2026", time: "10:00 AM", location: "Indoor Arena" },
    { eventName: "Carrom Championship", date: "Apr 18, 2026", time: "1:00 PM", location: "F1301" },
  ]

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
      description: "View available sports items",
      icon: <Boxes className="h-5 w-5" aria-hidden="true" />,
      href: "/student/payments",
      bg: "bg-orange-500/10",
    },
    {
      title: "Tournaments",
      description: "See upcoming sports events",
      icon: <Medal className="h-5 w-5" aria-hidden="true" />,
      href: "/student/sessions",
      bg: "bg-emerald-500/10",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Student Dashboard"
          description="Manage your sports, inventory items, and upcoming events in one place"
        />

        <section className="grid gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className={`${s.cardClass} rounded-2xl p-6 shadow-xl transition duration-300 hover:scale-105 hover:shadow-2xl`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium opacity-85">{s.label}</p>
                  <p className="mt-2 text-3xl font-bold">{s.value}</p>
                </div>
                <div className={`${s.iconWrapClass} rounded-xl p-3`}>{s.icon}</div>
              </div>
              <p className="mt-3 text-xs opacity-80">{s.subtitle}</p>
            </div>
          ))}
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Quick Actions</h2>
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
          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Sports</h2>
              <Link to="/student/sports" className="text-sm font-semibold text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {sports.map((sport) => (
                <div
                  key={`${sport.name}-${sport.date}-${sport.time}`}
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/50 px-4 py-4 text-sm transition hover:bg-muted/80"
                >
                  <div>
                    <p className="font-semibold text-foreground">{sport.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {sport.date} · {sport.time}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">{sport.location}</p>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Inventory Items</h2>
              <Link to="/student/payments" className="text-sm font-semibold text-primary hover:underline">
                Shop now
              </Link>
            </div>
            <div className="space-y-3">
              {inventoryItems.map((entry) => (
                <div
                  key={`${entry.category}-${entry.item}`}
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/50 px-4 py-3"
                >
                  <p className="font-semibold text-foreground">{entry.category}</p>
                  <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                    {entry.item}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Upcoming Events</h2>
              <Link to="/student/sessions" className="text-sm font-semibold text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div
                  key={`${event.eventName}-${event.date}-${event.time}`}
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/50 px-4 py-4 text-sm transition hover:bg-muted/80"
                >
                  <div>
                    <p className="font-semibold text-foreground">{event.eventName}</p>
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
