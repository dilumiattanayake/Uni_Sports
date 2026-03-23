import { PageHeader } from "@/components/common/PageHeader";
import { Link } from "react-router-dom";
import {
  mockSports,
  mockSessions,
  mockLocations,
  mockStudents,
} from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, CreditCard, Boxes, Users, Plus, ArrowRight,Wallet } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";

export default function AdminDashboard() {
  const upcomingSessions = mockSessions.filter(
    (s) => s.status === "scheduled"
  );
  const totalInventoryItems = mockLocations.length * 8;
  const totalRevenue = mockStudents.length * 1800;

  return (
    <DashboardLayout>
      <div className="space-y-6">

        <PageHeader
          title="Admin Dashboard"
          description="Overview of sports management system"
        />

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          <div className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-800 text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition duration-300 transform hover:scale-105">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm opacity-80 font-medium">Total Sports</p>
                <p className="text-3xl font-bold mt-2">{mockSports.length}</p>
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
                <p className="text-sm opacity-80 font-medium">Upcoming Events</p>
                <p className="text-3xl font-bold mt-2">{upcomingSessions.length}</p>
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
                <p className="text-sm opacity-80 font-medium">Total Items</p>
                <p className="text-3xl font-bold mt-2">{totalInventoryItems}</p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                <Boxes className="h-6 w-6" />
              </div>
            </div>
            <p className="text-xs opacity-70 mt-3">In inventory</p>
          </div>

          <div className="bg-gradient-to-br from-purple-600 via-purple-500 to-pink-400 text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition duration-300 transform hover:scale-105">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm opacity-80 font-medium">Revenue</p>
                <p className="text-3xl font-bold mt-2">{totalRevenue}</p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                <CreditCard className="h-6 w-6" />
              </div>
            </div>
            <p className="text-xs opacity-70 mt-3">LKR collected</p>
          </div>

        </div>

        {/* SPORTS + SESSIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* SPORTS */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="font-bold text-xl text-gray-800">Sports</h2>
                <p className="text-sm text-gray-500 mt-1">Manage sports programs</p>
              </div>
              <Button className="text-indigo-500 hover:text-indigo-950 transition duration-300 transform hover:scale-105">
                <Plus className="h-4 w-4" />
                Add Sport
              </Button>
            </div>

            <div className="space-y-3">
              {mockSports.slice(0, 6).map((sport) => {
                const count = mockStudents.filter((s) =>
                  s.enrolledSports.includes(sport.id)
                ).length;
                const newCount=count*7; //For assign students into sports(Testing purpose only)

                return (
                  <div
                    key={sport.id}
                    className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-indigo-50 hover:from-indigo-50 hover:to-indigo-100 transition border border-gray-200"
                  >
                    <div className="text-3xl">{sport.icon}</div>

                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{sport.name}</p>
                      <p className="text-xs text-gray-600">
                        {sport.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-indigo-100 text-indigo-700 font-semibold">
                        {newCount}
                      </Badge>
                      <p className="text-xs text-gray-400 mt-1">students</p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <Button variant="outline" className="w-full mt-4 text-indigo-600 border-indigo-200 hover:bg-indigo-50 gap-2">
              View All Sports
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {/* SESSIONS */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="font-bold text-xl text-gray-800">Sessions</h2>
                <p className="text-sm text-gray-500 mt-1">Upcoming practice sessions</p>
              </div>
              <Button className="text-indigo-500 hover:text-indigo-950 transition duration-300 transform hover:scale-105">
                New Session
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              {upcomingSessions.slice(0, 6).map((session) => {
                const sport = mockSports.find(
                  (s) => s.id === session.sportId
                );
                const location = mockLocations.find(
                  (l) => l.id === session.locationId
                );

                return (
                  <div
                    key={session.id}
                    className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-indigo-50 hover:from-indigo-50 hover:to-indigo-100 transition border border-gray-200"
                  >
                    <div className="text-3xl">{sport?.icon}</div>

                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{sport?.name}</p>
                      <p className="text-xs text-gray-600">
                        {session.date} • {location?.name}
                      </p>
                    </div>

                    <div className="text-right">
                      <Badge className="bg-indigo-100 text-indigo-700 font-semibold">
                        {session.startTime}
                      </Badge>
                      <p className="text-xs text-gray-400 mt-1">
                        to {session.endTime}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <Button variant="outline" className="w-full mt-4 text-indigo-600 border-indigo-200 hover:bg-indigo-50 gap-2">
              View All Sessions
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* EVENTS + INVENTORY */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* EVENTS */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="font-bold text-xl text-gray-800">Upcoming Events</h2>
                <p className="text-sm text-gray-500 mt-1">Scheduled competitions</p>
              </div>
              <Button className="text-indigo-500 hover:text-indigo-950 transition duration-300 transform hover:scale-105">
                <Plus className="h-4 w-4" />
                New Event
              </Button>
            </div>

            <div className="space-y-3">
              {upcomingSessions.slice(0, 4).map((session) => {
                const sport = mockSports.find(
                  (s) => s.id === session.sportId
                );

                return (
                  <div
                    key={session.id}
                    className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-indigo-50 hover:from-indigo-50 hover:to-indigo-100 transition border border-gray-200"
                  >
                    <p className="font-semibold text-gray-800">
                      {sport?.name} Event
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {session.date} • {session.startTime}
                    </p>
                  </div>
                );
              })}
            </div>
            
            <Button variant="outline" className="w-full mt-4 text-indigo-600 border-indigo-200 hover:bg-indigo-50 gap-2">
                    View All Events
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {/* INVENTORY */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="font-bold text-xl text-gray-800">Inventory</h2>
                <p className="text-sm text-gray-500 mt-1">Equipment & resources</p>
              </div>
              <Button className="text-indigo-800 hover:text-indigo-950 transition duration-300 transform hover:scale-105">
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {mockLocations.slice(0, 4).map((location, index) => (
                <div
                  key={location.id}
                  className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-indigo-50 hover:from-indigo-50 hover:to-indigo-100 transition border border-gray-200"
                >
                  <div>
                    <p className="font-semibold text-gray-800">{location.name}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Equipment in stock
                    </p>
                  </div>

                  <Badge className="bg-indigo-100 text-indigo-700 font-semibold">
                    {(index + 1) * 12} items
                  </Badge>
                </div>
              ))}
            </div>
            
            <Button variant="outline" className="w-full mt-4 text-indigo-600 border-indigo-200 hover:bg-indigo-50 gap-2">
              View All Items
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* PAYMENTS */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="font-bold text-xl text-gray-800">Payments</h2>
              <p className="text-sm text-gray-500 mt-1">Payment & revenue overview</p>
            </div>
            <Link to="/admin/payments">
            <Button className="text-indigo-500 hover:text-indigo-950 transition duration-300 transform hover:scale-105">
              Payments
              <ArrowRight className="h-4 w-4" />
            </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 font-medium">Total Collected</p>
                  <p className="text-2xl font-bold text-green-600 mt-2">
                    {totalRevenue}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">LKR</p>
                </div>
                <div className="bg-green-100 p-3 rounded-xl">
                  <CreditCard className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 font-medium">Pending</p>
                  <p className="text-2xl font-bold text-orange-600 mt-2">
                    480
                  </p>
                  <p className="text-xs text-gray-500 mt-1">LKR</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-xl">
                  <Wallet className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-xl border border-indigo-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 font-medium">Paid Users</p>
                  <p className="text-2xl font-bold text-indigo-600 mt-2">
                    {mockStudents.length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Users</p>
                </div>
                <div className="bg-indigo-100 p-3 rounded-xl">
                  <Users className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}