import { PageHeader } from "@/components/common/PageHeader";

export default function ProfileSettings() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your account preferences" />
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">Profile settings form will be added here.</p>
      </div>
    </div>
  );
}
