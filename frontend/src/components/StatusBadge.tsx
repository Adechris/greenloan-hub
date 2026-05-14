import { cn } from "@/lib/utils";
import { formatStatus } from "@/lib/mockData";

const map: Record<string, string> = {
  pending: "bg-warning/15 text-warning border-warning/30",
  under_review: "bg-info/15 text-info border-info/30",
  approved: "bg-success/15 text-success border-success/30",
  rejected: "bg-destructive/15 text-destructive border-destructive/30",
  disbursed: "bg-primary/15 text-primary border-primary/30",
  active: "bg-primary/15 text-primary border-primary/30",
  repaid: "bg-muted text-muted-foreground border-border",
  defaulted: "bg-destructive/15 text-destructive border-destructive/30",
  paid: "bg-success/15 text-success border-success/30",
  overdue: "bg-destructive/15 text-destructive border-destructive/30",
  partial: "bg-warning/15 text-warning border-warning/30",
};

export function StatusBadge({ status }: { status: string }) {
  const key = (status || "").toLowerCase().replace(/\s+/g, "_");
  return (
    <span className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
      map[key] ?? "bg-muted text-muted-foreground border-border"
    )}>
      {formatStatus(key)}
    </span>
  );
}
