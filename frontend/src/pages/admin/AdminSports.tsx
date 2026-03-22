import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { mockSports, mockCoaches, mockStudents } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { Sport } from "@/types";
import { toast } from "sonner";

export default function AdminSports() {
  const [sports, setSports] = useState<Sport[]>(mockSports);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSport, setEditingSport] = useState<Sport | null>(null);
  const [form, setForm] = useState({ name: "", description: "", maxStudents: 20, icon: "🏅" });

  const filtered = sports.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => {
    setEditingSport(null);
    setForm({ name: "", description: "", maxStudents: 20, icon: "🏅" });
    setDialogOpen(true);
  };

  const openEdit = (sport: Sport) => {
    setEditingSport(sport);
    setForm({ name: sport.name, description: sport.description, maxStudents: sport.maxStudents, icon: sport.icon });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return toast.error("Sport name is required");
    if (editingSport) {
      setSports(prev => prev.map(s => s.id === editingSport.id ? { ...s, ...form } : s));
      toast.success("Sport updated successfully");
    } else {
      const newSport: Sport = { id: `sp-${Date.now()}`, coachIds: [], ...form };
      setSports(prev => [...prev, newSport]);
      toast.success("Sport added successfully");
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setSports(prev => prev.filter(s => s.id !== id));
    toast.success("Sport deleted");
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">{editingSport ? "Edit Sport" : "Add New Sport"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label>Icon (emoji)</Label>
                <Input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} placeholder="🏅" className="w-20 text-center text-xl" />
              </div>
              <div>
                <Label>Sport Name</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Football" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description..." rows={3} />
              </div>
              <div>
                <Label>Max Students</Label>
                <Input type="number" value={form.maxStudents} onChange={e => setForm(f => ({ ...f, maxStudents: Number(e.target.value) }))} />
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
        {filtered.map(sport => {
          const coaches = mockCoaches.filter(c => sport.coachIds.includes(c.id));
          const studentCount = mockStudents.filter(s => s.enrolledSports.includes(sport.id)).length;
          return (
            <div key={sport.id} className="surface-card p-5 animate-fade-in group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{sport.icon}</span>
                  <div>
                    <h3 className="font-display font-bold">{sport.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{sport.description}</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(sport)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(sport.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Badge variant="secondary" className="text-xs">{studentCount}/{sport.maxStudents} students</Badge>
                <Badge variant="outline" className="text-xs">{coaches.length} coach{coaches.length !== 1 ? "es" : ""}</Badge>
              </div>
              {coaches.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2">Coaches: {coaches.map(c => c.name).join(", ")}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
