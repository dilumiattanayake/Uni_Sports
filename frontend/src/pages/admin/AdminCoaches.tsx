import { PageHeader } from "@/components/common/PageHeader";
import { mockCoaches, mockSports } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Mail, Phone } from "lucide-react";
import { toast } from "sonner";

export default function AdminCoaches() {
  return (
    <div className="space-y-6">
      <PageHeader title="Coaches" description="Manage coaching staff and sport assignments">
        <Button className="gap-2" onClick={() => toast.info("TODO: Add coach form")}>
          <Plus className="h-4 w-4" /> Add Coach
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockCoaches.map(coach => {
          const sports = mockSports.filter(s => coach.sportIds.includes(s.id));
          return (
            <div key={coach.id} className="bg-card rounded-xl shadow-card p-5 hover:shadow-elevated transition-shadow animate-fade-up">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-11 w-11 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-display font-bold text-sm">
                  {coach.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm">{coach.name}</h3>
                  <p className="text-xs text-muted-foreground">{coach.specialization}</p>
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
