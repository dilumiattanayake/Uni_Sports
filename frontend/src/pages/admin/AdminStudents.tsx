import { PageHeader } from "@/components/common/PageHeader";
import { mockStudents, mockSports } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, GraduationCap, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Student } from "@/types";
import { toast } from "sonner";

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [form, setForm] = useState({ name: "", email: "", year: 1 });

  const filtered = students.filter((student) =>
    [student.name, student.email].join(" ").toLowerCase().includes(search.toLowerCase()),
  );

  const openAdd = () => {
    setEditingStudent(null);
    setForm({ name: "", email: "", year: 1 });
    setDialogOpen(true);
  };

  const openEdit = (student: Student) => {
    setEditingStudent(student);
    setForm({ name: student.name, email: student.email, year: student.year });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) {
      return toast.error("Student name and email are required");
    }

    if (editingStudent) {
      setStudents((prev) =>
        prev.map((student) =>
          student.id === editingStudent.id
            ? { ...student, name: form.name, email: form.email, year: form.year }
            : student,
        ),
      );
      toast.success("Student updated successfully");
    } else {
      const newStudent: Student = {
        id: `stu-${Date.now()}`,
        name: form.name,
        email: form.email,
        year: Number(form.year),
        enrolledSports: [],
      };
      setStudents((prev) => [newStudent, ...prev]);
      toast.success("Student added successfully");
    }

    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setStudents((prev) => prev.filter((student) => student.id !== id));
    toast.success("Student deleted");
  };

  return (
    <div className="space-y-6 page-shell">
      <PageHeader title="Students" description="View and manage enrolled students">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={openAdd}>
              <Plus className="h-4 w-4" /> Add Student
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">{editingStudent ? "Edit Student" : "Add Student"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Student name" />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} placeholder="student@uni.edu" />
              </div>
              <div>
                <Label>Year</Label>
                <Input type="number" min={1} max={6} value={form.year} onChange={(e) => setForm((prev) => ({ ...prev, year: Number(e.target.value) }))} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>{editingStudent ? "Save Changes" : "Add Student"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students..." className="pl-9" />
      </div>

      <div className="surface-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-display font-semibold">Student</th>
                <th className="text-left p-3 font-display font-semibold hidden sm:table-cell">Email</th>
                <th className="text-left p-3 font-display font-semibold">Year</th>
                <th className="text-left p-3 font-display font-semibold">Enrolled Sports</th>
                <th className="text-right p-3 font-display font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((student) => {
                const sports = mockSports.filter(s => student.enrolledSports.includes(s.id));
                return (
                  <tr key={student.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors animate-fade-in">
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
                    <td className="p-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(student)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(student.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
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
