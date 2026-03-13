
import { Link } from "react-router-dom"
import ba from "../assets/ba.jpg"
import cap from "../assets/cap.jpg"
import jacket from "../assets/jacket.jpg"
import pr from "../assets/pr.jpg"
import cric from "../assets/cric.jpg"
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Dumbbell,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  ShoppingCart,
  Bot,
} from "lucide-react"
import bgImage from "../assets/registerLogin.jpg"


type Feature = {
  title: string
  description: string
  icon: React.ReactNode
}

const features: Feature[] = [
  {
    title: "Student Portal",
    description:
      "Join sports, request sessions, and track your participation with a clean, simple workflow.",
    icon: <Users className="h-5 w-5" aria-hidden="true" />,
  },
  {
    title: "Sports Management",
    description:
      "Organize squads, manage session requests, and keep training schedules consistent across teams.",
    icon: <ShieldCheck className="h-5 w-5" aria-hidden="true" />,
  },
  {
    title: "Tournaments",
    description:
      "Register for events, view matches, and stay updated on tournament progress all in one place.",
    icon: <CalendarDays className="h-5 w-5" aria-hidden="true" />,
  },
  {
    title: "Merchandise Store",
    description:
      "Browse and purchase official sports gear and accessories to show your team spirit.",
    icon: <ShoppingCart className="h-5 w-5" aria-hidden="true" />,
  },
]

const sports = [
  { name: "Cricket", accent: "from-orange-400/20 to-transparent" },
  { name: "Football", accent: "from-indigo-400/20 to-transparent" },
  { name: "Basketball", accent: "from-amber-400/20 to-transparent" },
  { name: "Volleyball", accent: "from-sky-400/20 to-transparent" },
  { name: "Badminton", accent: "from-emerald-400/20 to-transparent" },
  { name: "Athletics", accent: "from-fuchsia-400/20 to-transparent" },
  { name: "Swimming", accent: "from-cyan-400/20 to-transparent" },
  { name: "Table Tennis", accent: "from-rose-400/20 to-transparent" },
]

const upcoming = [
  {
    title: "Inter-Faculty League — Week 1",
    date: "Mar 18, 2026",
    location: "SLIIT Main Ground",
    tag: "Tournament",
  },
  {
    title: "Open Trials (New Intake)",
    date: "Mar 22, 2026",
    location: "Indoor Complex",
    tag: "Tryouts",
  },
  {
    title: "Strength & Conditioning Session",
    date: "Mar 28, 2026",
    location: "Gymnasium",
    tag: "Training",
  },
]

const shopItems = [
  {
    name: "Sports Jersey",
    price: "LKR 3,500",
    category: "Apparel",
    image: cric
  },
  {
    name: "Training Bottoms",
    price: "LKR 2,800",
    category: "Apparel",
    image: pr
  },
  {
    name: "Practice Kit",
    price: "LKR 4,200",
    category: "Training",
    image: pr
  },
  {
    name: "Sports Cap",
    price: "LKR 1,200",
    category: "Accessories",
    image: cap

  },
  {
    name: "Sports Band",
    price: "LKR 800",
    category: "Accessories",
    image: ba
  },
  {
    name: "Team Jacket",
    price: "LKR 5,500",
    category: "Apparel",
    image: jacket
  }
]

 function HomePage() {
  return (
    <div className="bg-white text-slate-900">
      {/* Hero */}
      <header className="relative isolate overflow-hidden bg-slate-950">
        <div className="absolute inset-0">
          <img
            src={bgImage}
            alt="University sports background"
            className="h-full w-full object-cover opacity-35"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/90 via-indigo-950/65 to-slate-950/95" />
        </div>

        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-orange-400/25 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-sm text-white ring-1 ring-white/15">
                <Sparkles className="h-4 w-4 text-orange-300" aria-hidden="true" />
                SLIIT Sports Management Platform
              </div>

              <h1 className="mt-6 text-pretty text-4xl font-bold tracking-tight text-white sm:text-5xl">
                One place to run teams, sessions, and tournaments.
              </h1>

              <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-white/80">
                UniSports helps students and coaches manage sports activities smoothly. Join a
                sport, request sessions, organize events, and keep everyone on the same schedule.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  to="/auth/register"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-400 px-5 py-3 font-semibold text-indigo-950 shadow-lg shadow-orange-400/20 transition hover:bg-orange-500"
                >
                  Get started
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>

                <Link
                  to="/auth/login"
                  className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-5 py-3 font-semibold text-white backdrop-blur transition hover:bg-white/10"
                >
                  Sign in
                </Link>

                <a
                  href="#features"
                  className="inline-flex items-center justify-center rounded-xl px-5 py-3 font-semibold text-white/80 transition hover:text-white"
                >
                  Explore features
                </a>
              </div>

              <dl className="mt-10 grid max-w-2xl grid-cols-3 gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 text-white backdrop-blur">
                <div>
                  <dt className="text-xs font-medium text-white/70">Teams</dt>
                  <dd className="mt-1 text-2xl font-bold tracking-tight">20+</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-white/70">Sessions</dt>
                  <dd className="mt-1 text-2xl font-bold tracking-tight">Weekly</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-white/70">Events</dt>
                  <dd className="mt-1 text-2xl font-bold tracking-tight">Seasonal</dd>
                </div>
              </dl>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/40 backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-400/15 text-orange-300 ring-1 ring-orange-300/20">
                    <Trophy className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">What you can do here</p>
                    <p className="text-sm text-white/70">Fast actions for everyone</p>
                  </div>
                </div>

                <ul className="mt-6 space-y-4 text-sm text-white/80">
                  <li className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-orange-300" aria-hidden="true" />
                    Register with your SLIIT email and pick your role.
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-orange-300" aria-hidden="true" />
                    Discover sports, request sessions, and stay informed on schedules.
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-orange-300" aria-hidden="true" />
                    Organize events and keep teams aligned from training to match day.
                  </li>
                </ul>

                <div className="mt-7 grid grid-cols-2 gap-3">
                  <a
                    href="#sports"
                    className="group inline-flex items-center justify-center rounded-2xl bg-white/10 px-4 py-3 font-semibold text-white ring-1 ring-white/10 transition hover:bg-white/15"
                  >
                    Browse sports
                    <span className="ml-2 transition group-hover:translate-x-0.5" aria-hidden="true">
                      →
                    </span>
                  </a>
                  <a
                    href="#events"
                    className="group inline-flex items-center justify-center rounded-2xl bg-white/10 px-4 py-3 font-semibold text-white ring-1 ring-white/10 transition hover:bg-white/15"
                  >
                    Upcoming events
                    <span className="ml-2 transition group-hover:translate-x-0.5" aria-hidden="true">
                      →
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold tracking-wide text-orange-500">Built for campus sports</p>
          <h2 className="mt-3 text-pretty text-3xl font-bold tracking-tight text-indigo-950 sm:text-4xl">
            Everything you need to manage sports, minus the chaos.
          </h2>
          <p className="mt-4 text-pretty text-base leading-relaxed text-slate-600">
            A clean workflow for students, coaches, and admins, so you spend less time coordinating
            and more time training.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-950 text-white shadow-sm">
                {f.icon}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-indigo-950">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-5">
              <p className="text-sm font-semibold tracking-wide text-orange-500">How it works</p>
              <h2 className="mt-3 text-pretty text-3xl font-bold tracking-tight text-indigo-950 sm:text-4xl">
                From signup to match day in minutes.
              </h2>
              <p className="mt-4 text-pretty text-base leading-relaxed text-slate-600">
                UniSports keeps the flow simple: register, choose your path, and manage everything
                from sessions to events.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/auth/register"
                  className="inline-flex items-center justify-center rounded-xl bg-indigo-950 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-indigo-900"
                >
                  Create an account
                </Link>
                <Link
                  to="/auth/login"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  Sign in
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7">
              <ol className="grid gap-4 md:grid-cols-3">
                {[
                  {
                    title: "Register",
                    description: "Use your SLIIT email and choose your role.",
                    icon: <Sparkles className="h-5 w-5" aria-hidden="true" />,
                  },
                  {
                    title: "Join & request",
                    description: "Pick sports, join teams, and request sessions.",
                    icon: <Users className="h-5 w-5" aria-hidden="true" />,
                  },
                  {
                    title: "Train & compete",
                    description: "Follow schedules, attend sessions, and play events.",
                    icon: <Dumbbell className="h-5 w-5" aria-hidden="true" />,
                  },
                ].map((step, idx) => (
                  <li
                    key={step.title}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-400/15 text-orange-600 ring-1 ring-orange-600/10">
                        {step.icon}
                      </div>
                      <div className="text-sm font-semibold text-slate-500">Step {idx + 1}</div>
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-indigo-950">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.description}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Sports */}
      <section id="sports" className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-wide text-orange-500">Sports</p>
            <h2 className="mt-2 text-pretty text-3xl font-bold tracking-tight text-indigo-950 sm:text-4xl">
              Popular sports at SLIIT
            </h2>
            <p className="mt-3 max-w-2xl text-pretty text-base leading-relaxed text-slate-600">
              Find your sport, meet your teammates, and stay updated with training and events.
            </p>
          </div>

          <a
            href="/auth/login"
            className="inline-flex items-center gap-2 font-semibold text-indigo-950 transition hover:text-indigo-900"
          >
            See all sports <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {sports.map((s) => (
            <div
              key={s.name}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${s.accent}`} />
              <div className="relative flex items-center justify-between">
                <div className="text-lg font-semibold text-indigo-950">{s.name}</div>
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-950 text-white shadow-sm">
                  <Trophy className="h-4 w-4" aria-hidden="true" />
                </div>
              </div>
              <p className="relative mt-3 text-sm text-slate-600">
                Attend training sessions, join teams {s.name} at SLIIT, Enjoy the thrill of the game.
              </p>
              <div className="relative mt-5 inline-flex items-center gap-2 text-sm font-semibold text-indigo-950">
                
               <a
               href="/auth/login"
               className="inline-flex items-center gap-2 font-semibold text-indigo-950 transition hover:text-indigo-900"
          >
             Explore <ArrowRight className="h-4 w-4" aria-hidden="true" />
             </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Events */}
      <section id="events" className="bg-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-5">
              <p className="text-sm font-semibold tracking-wide text-orange-300">Upcoming</p>
              <h2 className="mt-3 text-pretty text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Stay ready for what’s next.
              </h2>
              <p className="mt-4 text-pretty text-base leading-relaxed text-white/75">
                From tournaments to open trials, UniSports keeps schedules visible so no one misses
                key dates.
              </p>
            </div>

            <div className="lg:col-span-7">
              <div className="grid gap-4 md:grid-cols-3">
                {upcoming.map((e) => (
                  <div
                    key={e.title}
                    className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="inline-flex items-center rounded-full bg-orange-400/15 px-3 py-1 text-xs font-semibold text-orange-200 ring-1 ring-orange-300/15">
                        {e.tag}
                      </span>
                      <CalendarDays className="h-4 w-4 text-white/70" aria-hidden="true" />
                    </div>
                    <h3 className="mt-4 text-pretty text-lg font-semibold text-white">{e.title}</h3>
                    <p className="mt-2 text-sm text-white/70">{e.date}</p>
                    <p className="mt-1 text-sm text-white/70">{e.location}</p>
                    <a
                      href="/auth/login"
                      className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white"
                    >
                      Apply now <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Shop */}
      <section id="merchandise" className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold tracking-wide text-orange-500">Merchandise</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-indigo-950 sm:text-4xl">
                Shop Sports Gear
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
                Get official UniSports gear including jerseys, training kits, and accessories.
              </p>
            </div>

            <a
              href="/auth/login"
              className="inline-flex items-center gap-2 font-semibold text-indigo-950 hover:text-indigo-900"
            >
              View all products <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            
            {shopItems.map((item) => (
              <div
                key={item.name}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-96 w-full object-cover"
                  />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-orange-500">
                    {item.category}
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-semibold text-indigo-950">
                  {item.name}
                </h3>

                <p className="mt-2 text-sm text-slate-600">
                  Official UniSports merchandise.
                </p>

                <div className="mt-5 flex items-center justify-between">
                  <span className="text-base font-bold text-indigo-950">
                    {item.price}
                  </span>
                  
                  <a
                    href="/auth/login"
                    className="inline-flex items-center rounded-full px-4 py-2 bg-indigo-950 gap-1 text-sm font-semibold text-white transition hover:bg-indigo-900"
                  >
                    Shop now <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
      </section>


      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-orange-50 via-white to-indigo-50 p-8 shadow-sm sm:p-12">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-orange-400/15 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-indigo-400/15 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-8">
              <h2 className="text-pretty text-3xl font-bold tracking-tight text-indigo-950 sm:text-4xl">
                Join UniSports today.
              </h2>
              <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-slate-700">
                Create your account and become part of the SLIIT sports community—sessions, teams,
                and events all in one place.
              </p>
            </div>
            <div className="lg:col-span-4 lg:justify-self-end">
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Link
                  to="/auth/register"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-950 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-indigo-900"
                >
                  Create account <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  to="/auth/login"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-lg font-bold text-indigo-950">
                Uni<span className="text-orange-500">Sports</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">SLIIT Sports Management System</p>
            </div>
          </div>

          <p className="mt-8 text-sm text-slate-500">© 2026 UniSports. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default HomePage;