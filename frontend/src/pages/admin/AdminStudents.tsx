import { PageHeader } from "@/components/common/PageHeader";
import { mockStudents, mockSports } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Mail, GraduationCap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminStudents() {
  const [search, setSearch] = useState("");
  const filtered = mockStudents.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <PageHeader title="Students" description="View and manage enrolled students">
        <Button className="gap-2" onClick={() => toast.info("TODO: Add student form")}>
          <Plus className="h-4 w-4" /> Add Student
        </Button>
      </PageHeader>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students..." className="pl-9" />
      </div>

      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-display font-semibold">Student</th>
                <th className="text-left p-3 font-display font-semibold hidden sm:table-cell">Email</th>
                <th className="text-left p-3 font-display font-semibold">Year</th>
                <th className="text-left p-3 font-display font-semibold">Enrolled Sports</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(student => {
                const sports = mockSports.filter(s => student.enrolledSports.includes(s.id));
                return (
                  <tr key={student.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-display font-bold text-xs shrink-0">
                          {student.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <span className="font-medium">{student.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground hidden sm:table-cell">{student.email}</td>
                    <td className="p-3">
                      <Badge variant="outline" className="text-xs gap-1"><GraduationCap className="h-3 w-3" />Year {student.year}</Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {sports.map(s => <Badge key={s.id} variant="secondary" className="text-xs">{s.icon} {s.name}</Badge>)}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
