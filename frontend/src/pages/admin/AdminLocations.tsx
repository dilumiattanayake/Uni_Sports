import { PageHeader } from "@/components/common/PageHeader";
import { mockLocations } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, MapPin } from "lucide-react";
import { toast } from "sonner";

const typeColors: Record<string, string> = {
  ground: "bg-success/10 text-success",
  court: "bg-info/10 text-info",
  gym: "bg-accent/10 text-accent",
  pool: "bg-primary/10 text-primary",
};

export default function AdminLocations() {
  return (
    <div className="space-y-6">
      <PageHeader title="Practice Locations" description="Manage grounds, courts, gyms and other venues">
        <Button className="gap-2" onClick={() => toast.info("TODO: Add location form")}>
          <Plus className="h-4 w-4" /> Add Location
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockLocations.map(loc => (
          <div key={loc.id} className="bg-card rounded-xl shadow-card p-5 hover:shadow-elevated transition-shadow animate-fade-up">
            <div className="flex items-center gap-3 mb-3">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${typeColors[loc.type]}`}>
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm">{loc.name}</h3>
                <Badge variant="outline" className="text-xs capitalize mt-0.5">{loc.type}</Badge>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Capacity: <span className="font-semibold text-foreground">{loc.capacity}</span> persons</p>
          </div>
        ))}
      </div>
    </div>
  );
}
