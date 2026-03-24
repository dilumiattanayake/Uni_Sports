import { PageHeader } from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, MapPin, Search, Pencil, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface LocationData {
  _id: string;
  name: string;
  type: "field" | "court" | "gym" | "pool" | "track" | "hall" | "other";
  capacity: number;
  address?: string;
}

const typeColors: Record<string, string> = {
  field: "bg-success/10 text-success",
  court: "bg-info/10 text-info",
  gym: "bg-accent/10 text-accent",
  pool: "bg-primary/10 text-primary",
  track: "bg-success/10 text-success",
  hall: "bg-accent/10 text-accent",
  other: "bg-secondary/10 text-secondary",
};

export default function AdminLocations() {
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<LocationData | null>(null);
  const [form, setForm] = useState<{ name: string; type: LocationData["type"]; capacity: number; address: string }>({
    name: "",
    type: "field",
    capacity: 50,
    address: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLocations();
  }, []);

  const getToken = () => localStorage.getItem("token") || "";

  const loadLocations = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5001/api/locations", {
        headers: { "Authorization": `Bearer ${getToken()}` }
      });
      if (!res.ok) throw new Error("Failed to load locations");
      const data = await res.json();
      setLocations(data.data || []);
    } catch (error) {
      toast.error("Failed to load locations");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = locations.filter((location) =>
    [location.name, location.type].join(" ").toLowerCase().includes(search.toLowerCase()),
  );

  const openAdd = () => {
    setEditingLocation(null);
    setForm({ name: "", type: "field", capacity: 50, address: "" });
    setDialogOpen(true);
  };

  const openEdit = (location: LocationData) => {
    setEditingLocation(location);
    setForm({ name: location.name, type: location.type, capacity: location.capacity, address: location.address || "" });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const name = form.name.trim();
    const address = form.address.trim();
    const capacity = Number(form.capacity);

    if (!name || name.length < 2) {
      return toast.error("Please fill valid fields: location name must be at least 2 characters.");
    }
    if (!address || address.length < 5) {
      return toast.error("Please fill valid fields: address must be at least 5 characters.");
    }
    if (!Number.isFinite(capacity) || capacity < 1) {
      return toast.error("Please fill valid fields: capacity must be a positive number.");
    }

    try {
      const method = editingLocation ? "PUT" : "POST";
      const url = editingLocation
        ? `http://localhost:5001/api/locations/${editingLocation._id}`
        : "http://localhost:5001/api/locations";

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
      if (editingLocation) {
        setLocations(prev => prev.map(l => l._id === editingLocation._id ? data.data : l));
        toast.success("Location updated successfully");
      } else {
        setLocations(prev => [data.data, ...prev]);
        toast.success("Location added successfully");
      }
      setDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Operation failed");
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5001/api/locations/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${getToken()}` }
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Delete failed");
      }

      setLocations(prev => prev.filter(l => l._id !== id));
      toast.success("Location deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
      console.error(error);
    }
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
          <DialogContent className="bg-slate-900 bg-opacity-95 border-slate-700">
            <DialogHeader>
              <DialogTitle className="font-display">{editingLocation ? "Edit Location" : "Add Location"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label>Name</Label>
                <Input 
                  value={form.name} 
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} 
                  placeholder="Location name"
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>
              <div>
                <Label>Address</Label>
                <Input 
                  value={form.address} 
                  onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))} 
                  placeholder="Full address"
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>
              <div>
                <Label>Type</Label>
                <select
                  className="w-full h-10 rounded-md border border-slate-600 bg-slate-800 px-3 text-sm text-white"
                  value={form.type}
                  onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as LocationData["type"] }))}
                >
                  <option value="field">Field</option>
                  <option value="court">Court</option>
                  <option value="gym">Gym</option>
                  <option value="pool">Pool</option>
                  <option value="track">Track</option>
                  <option value="hall">Hall</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <Label>Capacity</Label>
                <Input 
                  type="number" 
                  min={1} 
                  value={form.capacity} 
                  onChange={(e) => setForm((prev) => ({ ...prev, capacity: Number(e.target.value) }))}
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                />
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
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search locations..."
          className="pl-9 bg-white text-black placeholder:text-gray-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center text-muted-foreground py-8">Loading locations...</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full text-center text-muted-foreground py-8">No locations found</div>
        ) : (
          filtered.map((loc) => (
            <div key={loc._id} className="surface-card p-5 animate-fade-in group">
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
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(loc._id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Capacity: <span className="font-semibold text-foreground">{loc.capacity}</span> persons</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
