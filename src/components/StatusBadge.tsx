import { cn } from "@/lib/utils";
import type { LoanStatus } from "@/lib/mockData";

const map: Record<LoanStatus | string, string> = {
  Pending: "bg-warning/15 text-warning border-warning/30",
  "Under Review": "bg-info/15 text-info border-info/30",
  Approved: "bg-success/15 text-success border-success/30",
  Rejected: "bg-destructive/15 text-destructive border-destructive/30",
  Disbursed: "bg-primary/15 text-primary border-primary/30",
  Active: "bg-primary/15 text-primary border-primary/30",
  Repaid: "bg-muted text-muted-foreground border-border",
  Paid: "bg-success/15 text-success border-success/30",
  Due: "bg-warning/15 text-warning border-warning/30",
  Overdue: "bg-destructive/15 text-destructive border-destructive/30",
  Suspended: "bg-destructive/15 text-destructive border-destructive/30",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
      map[status] ?? "bg-muted text-muted-foreground border-border"
    )}>
      {status}
    </span>
  );
}
