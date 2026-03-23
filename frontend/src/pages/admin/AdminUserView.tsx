import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Users, UserCheck } from "lucide-react";
import { UserRole } from "@/types";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

interface AppUser {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  createdAt?: string;
  isActive: boolean;
}

export default function AdminUserView() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "coach" | "student">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_BASE}/api/users?limit=500`, {
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
        });

        const json = await response.json();
        if (!response.ok) throw new Error(json.message);

        const data: AppUser[] = (json.data ?? []).map((u: any) => ({
          ...u,
          id: u.id ?? u._id,
          isActive: u.isActive ?? true,
        }));

        setUsers(data.filter((u) => u.role !== "admin"));
      } catch (err: any) {
        setError(err?.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`${API_BASE}/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!response.ok) throw new Error('Failed to update user status');

      // Update local state
      setUsers(users.map(u => u.id === userId ? { ...u, isActive: !currentStatus } : u));
    } catch (err: any) {
      setError(err?.message || 'Failed to update user status');
    }
  };

  const filteredUsers = useMemo(() => {
    const query = search.toLowerCase().trim();

    return users
      .filter((u) => (roleFilter === "all" ? true : u.role === roleFilter))
      .filter(
        (u) =>
          !query ||
          u.name.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query)
      );
  }, [users, search, roleFilter]);

  const roleBadge = (role: UserRole | string) => {
    if (role === "coach")
      return <Badge className="bg-orange-100 text-orange-600">Coach</Badge>;
    if (role === "student")
      return <Badge className="bg-indigo-100 text-indigo-900">Student</Badge>;
    return <Badge className="bg-gray-100 text-gray-700">{role}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">

        <PageHeader
          title="User Management"
          description="Manage and monitor all users in the system"
        />

        {/* STAT CARDS */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-800 text-white shadow-lg">
            <CardContent className="flex justify-between items-center p-6">
              <div>
                <p className="text-sm opacity-80 font-medium text-white">Total Users</p>
                <p className="text-3xl font-bold">{users.length}</p>
              </div>
             <div className="bg-indigo-500 bg-opacity-30 p-3 rounded-xl">
                <Users className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 via-green-400 to-emerald-400 text-white shadow-lg">
            <CardContent className="flex justify-between items-center p-6">
              <div>
                <p className="text-sm opacity-80 font-medium text-white">Students</p>
                <p className="text-3xl font-bold">
                  {users.filter((u) => u.role === "student").length}
                </p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-xl">
              <UserCheck className="h-6 w-6 " />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 via-orange-400 to-yellow-400 text-white shadow-lg">
            <CardContent className="flex justify-between items-center p-6">
              <div>
                <p className="text-sm opacity-80 font-medium text-white">Coaches</p>
                <p className="text-3xl font-bold">
                  {users.filter((u) => u.role === "coach").length}
                </p>
              </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-xl">
              <Users className="h-6 w-6 " />
            </div>
            </CardContent>
          </Card>
        </div>

        {/* SEARCH + FILTER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border">

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="pl-10 border-gray-300 focus:border-indigo-950 focus:ring-indigo-200"
            />
          </div>

          <div className="flex items-center gap-3">
            <Select
            
              value={roleFilter}
              onValueChange={(v) =>
                setRoleFilter(v as "all" | "coach" | "student")
              }
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Filter role" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="coach">Coach</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={() => {
                setSearch("");
                setRoleFilter("all");
              }}
              className="bg-orange-400 hover:bg-orange-500 text-white"
            >
              Reset
            </Button>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded">
            {error}
          </div>
        )}

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="p-4  text-left min-w-0">User</th>
                  <th className="p-4 hidden lg:table-cell min-w-0 justify-start">Email</th>
                  <th className="p-4 min-w-0">Role</th>
                  <th className="p-4 hidden lg:table-cell min-w-0">Joined</th>
                  <th className="p-4 hidden md:table-cell min-w-0">Status</th>
                  
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center">
                      Loading...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.id ?? user._id}
                      className="border-t hover:bg-gray-50 transition"
                    >
                      <td className="p-4 min-w-0">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 hidden sm:table-cell text-gray-500 min-w-0 truncate">
                        {user.email}
                      </td>

                      <td className="p-4 min-w-0">
                        {roleBadge(user.role)}
                      </td>

                      
                      <td className="p-4 hidden lg:table-cell text-gray-500 min-w-0">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "-"}
                      </td>

                      <td className="p-4 hidden md:table-cell min-w-0">
                        <Button
                          onClick={() => handleToggleActive(user.id!, user.isActive)}
                          className={`px-3 py-1 text-xs ${
                            user.isActive
                              ? 'bg-green-500 hover:bg-green-600 text-white'
                              : 'bg-red-500 hover:bg-red-600 text-white'
                          }`}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}