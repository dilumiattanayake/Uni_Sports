import { PageHeader } from "@/components/common/PageHeader";
import { mockCoaches, mockSports } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Mail, Phone, Pencil, Trash2, Search } from "lucide-react";
import { Coach } from "@/types";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminCoaches() {
  const [coaches, setCoaches] = useState<Coach[]>(mockCoaches);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", specialization: "" });

  const filtered = coaches.filter((coach) =>
    [coach.name, coach.email, coach.specialization].join(" ").toLowerCase().includes(search.toLowerCase()),
  );

  const openAdd = () => {
    setEditingCoach(null);
    setForm({ name: "", email: "", phone: "", specialization: "" });
    setDialogOpen(true);
  };

  const openEdit = (coach: Coach) => {
    setEditingCoach(coach);
    setForm({
      name: coach.name,
      email: coach.email,
      phone: coach.phone,
      specialization: coach.specialization,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) {
      return toast.error("Coach name and email are required");
    }

    if (editingCoach) {
      setCoaches((prev) =>
        prev.map((coach) => (coach.id === editingCoach.id ? { ...coach, ...form } : coach)),
      );
      toast.success("Coach updated successfully");
    } else {
      const newCoach: Coach = {
        id: `coach-${Date.now()}`,
        sportIds: [],
        ...form,
      };
      setCoaches((prev) => [newCoach, ...prev]);
      toast.success("Coach added successfully");
    }

    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setCoaches((prev) => prev.filter((coach) => coach.id !== id));
    toast.success("Coach deleted");
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">{editingCoach ? "Edit Coach" : "Add Coach"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Coach name" />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} placeholder="coach@uni.edu" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} placeholder="+94 77 123 4567" />
              </div>
              <div>
                <Label>Specialization</Label>
                <Input value={form.specialization} onChange={(e) => setForm((prev) => ({ ...prev, specialization: e.target.value }))} placeholder="Team Sports" />
              </div>
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
        {filtered.map((coach) => {
          const sports = mockSports.filter(s => coach.sportIds.includes(s.id));
          return (
            <div key={coach.id} className="surface-card p-5 animate-fade-in group">
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
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(coach.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <p className="flex items-center gap-2"><Mail className="h-3 w-3" />{coach.email}</p>
                <p className="flex items-center gap-2"><Phone className="h-3 w-3" />{coach.phone}</p>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {sports.map(s => (
                  <Badge key={s.id} variant="secondary" className="text-xs">{s.icon} {s.name}</Badge>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
