import { useState, useEffect } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface SportData {
  _id: string;
  name: string;
  description: string;
  category: "indoor" | "outdoor" | "water" | "combat" | "team" | "individual";
  maxParticipants?: number;
  coaches?: Array<{ id: string; name: string }>;
  createdAt?: string;
}

export default function AdminSports() {
  const [sports, setSports] = useState<SportData[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSport, setEditingSport] = useState<SportData | null>(null);
  const [form, setForm] = useState({ name: "", description: "", category: "team", maxParticipants: 20 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSports();
  }, []);

  const getToken = () => localStorage.getItem("token") || "";

  const loadSports = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5001/api/sports", {
        headers: { "Authorization": `Bearer ${getToken()}` }
      });
      if (!res.ok) throw new Error("Failed to load sports");
      const data = await res.json();
      setSports(data.data || []);
    } catch (error) {
      toast.error("Failed to load sports");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = sports.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => {
    setEditingSport(null);
    setForm({ name: "", description: "", category: "team", maxParticipants: 20 });
    setDialogOpen(true);
  };

  const openEdit = (sport: SportData) => {
    setEditingSport(sport);
    setForm({ name: sport.name, description: sport.description, category: sport.category, maxParticipants: sport.maxParticipants || 20 });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const name = form.name.trim();
    const description = form.description.trim();
    const maxParticipants = Number(form.maxParticipants);

    if (!name) {
      return toast.error("Please fill valid fields: sport name is required.");
    }
    if (name.length < 2) {
      return toast.error("Please fill valid fields: sport name must be at least 2 characters.");
    }
    if (!description) {
      return toast.error("Please fill valid fields: description is required.");
    }
    if (description.length < 10) {
      return toast.error("Please fill valid fields: description must be at least 10 characters.");
    }
    if (!Number.isFinite(maxParticipants) || maxParticipants < 1) {
      return toast.error("Please fill valid fields: max participants must be a positive number.");
    }
    
    try {
      const method = editingSport ? "PUT" : "POST";
      const url = editingSport 
        ? `http://localhost:5001/api/sports/${editingSport._id}`
        : "http://localhost:5001/api/sports";
      
      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getToken()}`
        },
        body: JSON.stringify(form)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const validationMessage = Array.isArray(errorData?.errors)
          ? errorData.errors
              .map((item: { msg?: string; message?: string }) => item.msg || item.message)
              .filter(Boolean)
              .join(" ")
          : "";
        throw new Error(validationMessage || errorData?.message || "Operation failed");
      }

      const data = await res.json();
      if (editingSport) {
        setSports(prev => prev.map(s => s._id === editingSport._id ? data.data : s));
        toast.success("Sport updated successfully");
      } else {
        setSports(prev => [...prev, data.data]);
        toast.success("Sport added successfully");
      }
      setDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Operation failed");
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5001/api/sports/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${getToken()}` }
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Delete failed");
      }

      setSports(prev => prev.filter(s => s._id !== id));
      toast.success("Sport deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6 page-shell">
      <PageHeader title="Sports Management" description="Add, edit, and manage university sports programs">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAdd} className="gap-2">
              <Plus className="h-4 w-4" /> Add Sport
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 bg-opacity-95 border-slate-700">
            <DialogHeader>
              <DialogTitle className="font-display">{editingSport ? "Edit Sport" : "Add New Sport"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label>Sport Name</Label>
                <Input 
                  value={form.name} 
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
                  placeholder="e.g. Football"
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea 
                  value={form.description} 
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))} 
                  placeholder="Brief description..." 
                  rows={3}
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>
              <div>
                <Label>Category</Label>
                <select 
                  value={form.category} 
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full px-3 py-2 rounded-md border border-slate-600 bg-slate-800 text-white text-sm"
                >
                  <option value="team">Team</option>
                  <option value="individual">Individual</option>
                  <option value="indoor">Indoor</option>
                  <option value="outdoor">Outdoor</option>
                  <option value="water">Water</option>
                  <option value="combat">Combat</option>
                </select>
              </div>
              <div>
                <Label>Max Participants</Label>
                <Input 
                  type="number" 
                  value={form.maxParticipants} 
                  onChange={e => setForm(f => ({ ...f, maxParticipants: Number(e.target.value) }))}
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>{editingSport ? "Save Changes" : "Add Sport"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search sports..." className="pl-9" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center text-muted-foreground py-8">Loading sports...</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full text-center text-muted-foreground py-8">No sports found</div>
        ) : (
          filtered.map(sport => (
            <div key={sport._id} className="surface-card p-5 animate-fade-in group">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display font-bold">{sport.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{sport.description}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(sport)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(sport._id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Badge variant="secondary" className="text-xs capitalize">{sport.category}</Badge>
                <Badge variant="outline" className="text-xs">{sport.maxParticipants || 0} max</Badge>
              </div>
              {sport.coaches && sport.coaches.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2">Coaches: {sport.coaches.map(c => c.name).join(", ")}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
