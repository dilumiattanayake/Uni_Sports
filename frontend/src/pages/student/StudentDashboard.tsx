import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { DashboardLayout } from "@/components/DashboardLayout"
import { PageHeader } from "@/components/common/PageHeader"
import { Button } from "@/components/ui/button"
import sportsImage from "@/assets/sports.jpeg"
import sportsEvents from "@/assets/events.jpg"
import sportsItems from "@/assets/sports items.jpg"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import { ArrowRight, Boxes, CalendarDays, ChevronRight, Dumbbell, Medal, Users } from "lucide-react"

const StudentDashboard = () => {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>()
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    if (!carouselApi) return

    const timer = window.setInterval(() => {
      if (carouselApi.canScrollNext()) {
        carouselApi.scrollNext()
      } else {
        carouselApi.scrollTo(0)
      }
    }, 4000)

    return () => window.clearInterval(timer)
  }, [carouselApi])

  useEffect(() => {
    if (!carouselApi) return

    setCurrentSlide(carouselApi.selectedScrollSnap())

    const onSelect = () => setCurrentSlide(carouselApi.selectedScrollSnap())
    carouselApi.on("select", onSelect)
    carouselApi.on("reInit", onSelect)

    return () => {
      carouselApi.off("select", onSelect)
      carouselApi.off("reInit", onSelect)
    }
  }, [carouselApi])

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

  const dashboardSlides = [
    {
      title: "Sports",
      description: "Explore university sports and join teams.",
      actionLabel: "Explore Sports",
      href: "/student/sports",
      bgClass: "from-indigo-600 to-blue-500",
      image: sportsImage,
    },
    {
      title: "Events",
      description: "Find upcoming tournaments and campus events.",
      actionLabel: "View Events",
      href: "/student/sessions",
      bgClass: "from-emerald-600 to-green-500",
      image: sportsEvents,
    },
    {
      title: "Borrow Sports Items",
      description: "Request and borrow sports equipment quickly.",
      actionLabel: "Borrow Now",
      href: "/student/requests",
      bgClass: "from-amber-500 to-orange-500",
      image: sportsItems,
    },
    {
      title: "Merchandise",
      description: "Shop jerseys, kits, and official items.",
      actionLabel: "Shop Now",
      href: "/student/payments",
      bgClass: "from-pink-600 to-rose-500",
      image: "",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Student Dashboard"
          description="Manage your sports, inventory items, and upcoming events in one place"
        />

        <section className="rounded-2xl border border-border bg-card p-2 shadow-sm sm:p-3">
          <Carousel opts={{ loop: true }} setApi={setCarouselApi}>
            <CarouselContent>
              {dashboardSlides.map((slide) => (
                <CarouselItem key={slide.title}>
                  <div className="relative overflow-hidden rounded-2xl border border-cyan-500/40">
                    {slide.image ? (
                      <img src={slide.image} alt={slide.title} className="absolute inset-0 h-full w-full object-cover" />
                    ) : (
                      <div className={`absolute inset-0 bg-gradient-to-br ${slide.bgClass}`} />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/75 to-black/10" />
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/45 to-transparent" />

                    <div className="relative min-h-[260px] p-6 text-white sm:min-h-[300px] sm:max-w-[56%] sm:p-10">
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-500">UniSport</p>
                      <h3 className="mt-3 text-3xl font-extrabold uppercase leading-tight tracking-wide sm:text-5xl">
                        {slide.title}
                      </h3>
                      <p className="mt-3 max-w-md text-sm font-medium text-white/90 sm:text-lg">{slide.description}</p>

                      <div className="mt-6">
                        <Button asChild className="h-10 rounded-xl bg-orange-400 px-7 text-sm font-semibold uppercase tracking-wide text-white hover:bg-orange-500">
                          <Link to={slide.href}>{slide.actionLabel}</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselPrevious className="left-2 top-1/2 z-20 -translate-y-1/2 border-slate-300/30 bg-black/45 text-white hover:bg-black/65" />
            <CarouselNext className="right-2 top-1/2 z-20 -translate-y-1/2 border-slate-300/30 bg-black/45 text-white hover:bg-black/65" />

            <div className="absolute inset-x-0 bottom-4 z-20 flex items-center justify-center gap-2">
              {dashboardSlides.map((slide, index) => (
                <button
                  key={slide.title}
                  type="button"
                  onClick={() => carouselApi?.scrollTo(index)}
                  className={`h-2.5 rounded-full transition-all ${
                    currentSlide === index ? "w-8 bg-white" : "w-2.5 bg-white/55 hover:bg-white/80"
                  }`}
                  aria-label={`Go to ${slide.title} slide`}
                />
              ))}
            </div>
          </Carousel>
        </section>

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
