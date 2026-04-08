import { PageHeader } from "@/components/common/PageHeader";

export default function AdminHome() {
  return (
    <div className="space-y-6">
      <PageHeader title="Admin Home" description="Welcome to the admin panel" />
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">Use the sidebar to manage sports, coaches, students, and locations.</p>
      </div>
    </div>
  );
}
