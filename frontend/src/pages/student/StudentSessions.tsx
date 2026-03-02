import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { mockSessions, mockSports, mockLocations } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, MapPin, AlertTriangle, Search } from "lucide-react";
import { toast } from "sonner";

export default function StudentSessions() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);

  const allSessions = mockSessions.filter(s => s.status === "scheduled");
  const filtered = allSessions.filter(s => {
    const sport = mockSports.find(sp => sp.id === s.sportId);
    return sport?.name.toLowerCase().includes(search.toLowerCase()) || s.date.includes(search);
  });

  const checkTimeClash = (sessionId: string) => {
    const session = allSessions.find(s => s.id === sessionId);
    if (!session) return false;
    return selectedSessions.some(selId => {
      const sel = allSessions.find(s => s.id === selId);
      if (!sel || sel.id === sessionId) return false;
      return sel.date === session.date && sel.startTime < session.endTime && sel.endTime > session.startTime;
    });
  };

  const toggleSession = (sessionId: string) => {
    if (selectedSessions.includes(sessionId)) {
      setSelectedSessions(prev => prev.filter(id => id !== sessionId));
    } else {
      if (checkTimeClash(sessionId)) {
        toast.error("Time clash! This session overlaps with another selected session.");
        return;
      }
      setSelectedSessions(prev => [...prev, sessionId]);
      toast.success("Session selected");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Practice Sessions" description="Browse and select practice time slots">
        {selectedSessions.length > 0 && (
          <Badge variant="secondary" className="text-sm">{selectedSessions.length} selected</Badge>
        )}
      </PageHeader>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by sport or date..." className="pl-9" />
      </div>

      <div className="space-y-3">
        {filtered.map(session => {
          const sport = mockSports.find(s => s.id === session.sportId);
          const location = mockLocations.find(l => l.id === session.locationId);
          const isSelected = selectedSessions.includes(session.id);
          const hasClash = !isSelected && checkTimeClash(session.id);
          const isEnrolled = session.enrolledStudents.includes(user.id);

          return (
            <div key={session.id} className={`bg-card rounded-xl shadow-card p-4 flex flex-col sm:flex-row sm:items-center gap-3 transition-all animate-fade-up ${isSelected ? "ring-2 ring-secondary" : ""} ${hasClash ? "opacity-60" : ""}`}>
              <span className="text-3xl">{sport?.icon}</span>
              <div className="flex-1">
                <h3 className="font-display font-bold">{sport?.name}</h3>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{session.date}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{session.startTime}–{session.endTime}</span>
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{location?.name}</span>
                </div>
                {hasClash && (
                  <p className="text-xs text-destructive flex items-center gap-1 mt-1"><AlertTriangle className="h-3 w-3" /> Time clash with selected session</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{session.enrolledStudents.length}/{session.maxCapacity}</Badge>
                {isEnrolled ? (
                  <Badge variant="default" className="text-xs">Enrolled</Badge>
                ) : (
                  <Button size="sm" variant={isSelected ? "secondary" : "default"} onClick={() => toggleSession(session.id)} disabled={hasClash}>
                    {isSelected ? "Deselect" : "Select"}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
