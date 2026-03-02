import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { mockSports, mockCoaches, mockStudents, mockSessions, mockLocations } from "@/data/mockData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Users, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export default function StudentBrowseSports() {
  const [search, setSearch] = useState("");
  const filtered = mockSports.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  const handleJoinRequest = (sportId: string) => {
    // TODO: Send join request to backend
    toast.success("Join request sent! Waiting for coach approval.");
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Browse Sports" description="Explore available sports programs and request to join" />

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search sports..." className="pl-9" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(sport => {
          const coaches = mockCoaches.filter(c => sport.coachIds.includes(c.id));
          const studentCount = mockStudents.filter(s => s.enrolledSports.includes(sport.id)).length;
          const sessions = mockSessions.filter(s => s.sportId === sport.id);

          return (
            <div key={sport.id} className="bg-card rounded-xl shadow-card p-5 hover:shadow-elevated transition-shadow animate-fade-up flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">{sport.icon}</span>
                <div>
                  <h3 className="font-display font-bold text-lg">{sport.name}</h3>
                  <p className="text-xs text-muted-foreground">{sport.description}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="secondary" className="text-xs"><Users className="h-3 w-3 mr-1" />{studentCount}/{sport.maxStudents}</Badge>
                <Badge variant="outline" className="text-xs">{sessions.length} sessions</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Coach{coaches.length > 1 ? "es" : ""}: {coaches.map(c => c.name).join(", ")}
              </p>
              <div className="mt-auto">
                <Button className="w-full gap-2" variant="default" onClick={() => handleJoinRequest(sport.id)}>
                  Request to Join <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
