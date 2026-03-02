import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { mockSessions, mockSports, mockLocations } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Clock, MapPin, AlertTriangle, Search } from "lucide-react";
import { PracticeSession } from "@/types";
import { toast } from "sonner";

export default function CoachSessions() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState(mockSessions.filter(s => s.coachId === user.id));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ sportId: "", locationId: "", date: "", startTime: "", endTime: "" });

  const mySports = mockSports.filter(s => s.coachIds.includes(user.id));
  const filtered = sessions.filter(s => {
    const sport = mockSports.find(sp => sp.id === s.sportId);
    return sport?.name.toLowerCase().includes(search.toLowerCase()) || s.date.includes(search);
  });

  const checkClash = () => {
    if (!form.locationId || !form.date || !form.startTime || !form.endTime) return null;
    return mockSessions.find(s =>
      s.locationId === form.locationId && s.date === form.date &&
      s.startTime < form.endTime && s.endTime > form.startTime
    );
  };

  const handleCreate = () => {
    if (!form.sportId || !form.locationId || !form.date || !form.startTime || !form.endTime) {
      return toast.error("Please fill all fields");
    }
    const clash = checkClash();
    if (clash) return toast.error("Location is already booked at this time!");

    const newSession: PracticeSession = {
      id: `ses-${Date.now()}`, coachId: user.id, enrolledStudents: [], maxCapacity: 25, status: "scheduled", ...form,
    };
    setSessions(prev => [...prev, newSession]);
    setDialogOpen(false);
    setForm({ sportId: "", locationId: "", date: "", startTime: "", endTime: "" });
    toast.success("Session created");
  };

  const clash = checkClash();

  return (
    <div className="space-y-6">
      <PageHeader title="Practice Sessions" description="Create and manage your practice sessions">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> New Session</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-display">Create Practice Session</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label>Sport</Label>
                <Select value={form.sportId} onValueChange={v => setForm(f => ({ ...f, sportId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select sport" /></SelectTrigger>
                  <SelectContent>
                    {mySports.map(s => <SelectItem key={s.id} value={s.id}>{s.icon} {s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Location</Label>
                <Select value={form.locationId} onValueChange={v => setForm(f => ({ ...f, locationId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                  <SelectContent>
                    {mockLocations.map(l => <SelectItem key={l.id} value={l.id}>{l.name} ({l.type})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Start Time</Label><Input type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} /></div>
                <div><Label>End Time</Label><Input type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} /></div>
              </div>
              {clash && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>Booking clash! This location is already booked by another session at this time.</span>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={!!clash}>Create Session</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by sport or date..." className="pl-9" />
      </div>

      <div className="space-y-3">
        {filtered.map(session => {
          const sport = mockSports.find(s => s.id === session.sportId);
          const location = mockLocations.find(l => l.id === session.locationId);
          return (
            <div key={session.id} className="bg-card rounded-xl shadow-card p-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:shadow-elevated transition-shadow animate-fade-up">
              <span className="text-3xl">{sport?.icon}</span>
              <div className="flex-1">
                <h3 className="font-display font-bold">{sport?.name}</h3>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{session.date}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{session.startTime}–{session.endTime}</span>
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{location?.name}</span>
                </div>
              </div>
              <Badge variant="secondary">{session.enrolledStudents.length}/{session.maxCapacity}</Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
}
