import { PageHeader } from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Mail, Phone, Pencil, Trash2, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface CoachData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  role: "coach";
}

export default function AdminCoaches() {
  const [coaches, setCoaches] = useState<CoachData[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoach, setEditingCoach] = useState<CoachData | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", specialization: "", password: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCoaches();
  }, []);

  const getToken = () => localStorage.getItem("token") || "";

  const loadCoaches = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5001/api/users?role=coach", {
        headers: { "Authorization": `Bearer ${getToken()}` }
      });
      if (!res.ok) throw new Error("Failed to load coaches");
      const data = await res.json();
      setCoaches(data.data || []);
    } catch (error) {
      toast.error("Failed to load coaches");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = coaches.filter((coach) =>
    [coach.name, coach.email, coach.specialization].join(" ").toLowerCase().includes(search.toLowerCase()),
  );

  const openAdd = () => {
    setEditingCoach(null);
    setForm({ name: "", email: "", phone: "", specialization: "", password: "" });
    setDialogOpen(true);
  };

  const openEdit = (coach: CoachData) => {
    setEditingCoach(coach);
    setForm({
      name: coach.name,
      email: coach.email,
      phone: coach.phone,
      specialization: coach.specialization,
      password: "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      return toast.error("Name and email are required");
    }
    if (!editingCoach && !form.password.trim()) {
      return toast.error("Password is required for new coaches");
    }

    try {
      const method = editingCoach ? "PUT" : "POST";
      const url = editingCoach
        ? `http://localhost:5001/api/users/${editingCoach._id}`
        : "http://localhost:5001/api/users";

      const body = editingCoach 
        ? { name: form.name, email: form.email, phone: form.phone, specialization: form.specialization, password: form.password || undefined }
        : { ...form, role: "coach" };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getToken()}`
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Operation failed");
      }

      const data = await res.json();
      if (editingCoach) {
        setCoaches(prev => prev.map(c => c._id === editingCoach._id ? data.data : c));
        toast.success("Coach updated successfully");
      } else {
        setCoaches(prev => [data.data, ...prev]);
        toast.success("Coach added successfully");
      }
      setDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Operation failed");
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5001/api/users/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${getToken()}` }
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Delete failed");
      }

      setCoaches(prev => prev.filter(c => c._id !== id));
      toast.success("Coach deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6 page-shell">
      <PageHeader title="Coaches" description="Manage coaching staff and sport assignments">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={openAdd}>
              <Plus className="h-4 w-4" /> Add Coach
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 bg-opacity-95 border-slate-700">
            <DialogHeader>
              <DialogTitle className="font-display">{editingCoach ? "Edit Coach" : "Add Coach"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label>Name</Label>
                <Input 
                  value={form.name} 
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} 
                  placeholder="Coach name"
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input 
                  type="email" 
                  value={form.email} 
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} 
                  placeholder="coach@uni.edu"
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input 
                  value={form.phone} 
                  onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} 
                  placeholder="+94 77 123 4567"
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>
              <div>
                <Label>Specialization</Label>
                <Input 
                  value={form.specialization} 
                  onChange={(e) => setForm((prev) => ({ ...prev, specialization: e.target.value }))} 
                  placeholder="Team Sports"
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>
              {!editingCoach && (
                <div>
                  <Label>Password</Label>
                  <Input 
                    type="password" 
                    value={form.password} 
                    onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} 
                    placeholder="Minimum 6 characters"
                    className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>{editingCoach ? "Save Changes" : "Add Coach"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search coaches..." className="pl-9" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center text-muted-foreground py-8">Loading coaches...</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full text-center text-muted-foreground py-8">No coaches found</div>
        ) : (
          filtered.map((coach) => (
            <div key={coach._id} className="surface-card p-5 animate-fade-in group">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-11 w-11 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-display font-bold text-sm">
                  {coach.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm">{coach.name}</h3>
                  <p className="text-xs text-muted-foreground">{coach.specialization}</p>
                </div>
                <div className="ml-auto flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(coach)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(coach._id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <p className="flex items-center gap-2"><Mail className="h-3 w-3" />{coach.email}</p>
                <p className="flex items-center gap-2"><Phone className="h-3 w-3" />{coach.phone}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
