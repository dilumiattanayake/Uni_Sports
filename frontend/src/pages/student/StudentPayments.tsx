import { PageHeader } from "@/components/common/PageHeader";

export default function StudentPayments() {
  return (
    <div className="space-y-6">
      <PageHeader title="My Payments" description="View your payment details" />
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">No payment records available yet.</p>
      </div>
    </div>
  );
}
