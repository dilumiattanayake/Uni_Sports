import { PageHeader } from "@/components/common/PageHeader";
import { mockLocations } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, MapPin, Search, Pencil, Trash2 } from "lucide-react";
import { Location } from "@/types";
import { useState } from "react";
import { toast } from "sonner";

const typeColors: Record<string, string> = {
  ground: "bg-success/10 text-success",
  court: "bg-info/10 text-info",
  gym: "bg-accent/10 text-accent",
  pool: "bg-primary/10 text-primary",
};

export default function AdminLocations() {
  const [locations, setLocations] = useState<Location[]>(mockLocations);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [form, setForm] = useState<{ name: string; type: Location["type"]; capacity: number }>({
    name: "",
    type: "ground",
    capacity: 50,
  });

  const filtered = locations.filter((location) =>
    [location.name, location.type].join(" ").toLowerCase().includes(search.toLowerCase()),
  );

  const openAdd = () => {
    setEditingLocation(null);
    setForm({ name: "", type: "ground", capacity: 50 });
    setDialogOpen(true);
  };

  const openEdit = (location: Location) => {
    setEditingLocation(location);
    setForm({ name: location.name, type: location.type, capacity: location.capacity });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      return toast.error("Location name is required");
    }

    if (editingLocation) {
      setLocations((prev) =>
        prev.map((location) => (location.id === editingLocation.id ? { ...location, ...form } : location)),
      );
      toast.success("Location updated successfully");
    } else {
      const newLocation: Location = {
        id: `loc-${Date.now()}`,
        name: form.name,
        type: form.type,
        capacity: Number(form.capacity),
      };
      setLocations((prev) => [newLocation, ...prev]);
      toast.success("Location added successfully");
    }

    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setLocations((prev) => prev.filter((location) => location.id !== id));
    toast.success("Location deleted");
  };

  return (
    <div className="space-y-6 page-shell">
      <PageHeader title="Practice Locations" description="Manage grounds, courts, gyms and other venues">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={openAdd}>
              <Plus className="h-4 w-4" /> Add Location
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">{editingLocation ? "Edit Location" : "Add Location"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Location name" />
              </div>
              <div>
                <Label>Type</Label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={form.type}
                  onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as Location["type"] }))}
                >
                  <option value="ground">Ground</option>
                  <option value="court">Court</option>
                  <option value="gym">Gym</option>
                  <option value="pool">Pool</option>
                </select>
              </div>
              <div>
                <Label>Capacity</Label>
                <Input type="number" min={1} value={form.capacity} onChange={(e) => setForm((prev) => ({ ...prev, capacity: Number(e.target.value) }))} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>{editingLocation ? "Save Changes" : "Add Location"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search locations..." className="pl-9" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((loc) => (
          <div key={loc.id} className="surface-card p-5 animate-fade-in group">
            <div className="flex items-center gap-3 mb-3">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${typeColors[loc.type]}`}>
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm">{loc.name}</h3>
                <Badge variant="outline" className="text-xs capitalize mt-0.5">{loc.type}</Badge>
              </div>
              <div className="ml-auto flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(loc)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(loc.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Capacity: <span className="font-semibold text-foreground">{loc.capacity}</span> persons</p>
          </div>
        ))}
      </div>
    </div>
  );
}
