import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label, value, icon, trend, accent,
}: {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  trend?: string;
  accent?: "primary" | "gold" | "info" | "destructive";
}) {
  const accentClass = {
    primary: "bg-primary/10 text-primary",
    gold: "bg-gold/15 text-gold",
    info: "bg-info/10 text-info",
    destructive: "bg-destructive/10 text-destructive",
  }[accent ?? "primary"];

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
            <p className="text-2xl font-bold mt-1.5 truncate">{value}</p>
            {trend && <p className="text-xs text-muted-foreground mt-1">{trend}</p>}
          </div>
          <div className={cn("h-11 w-11 shrink-0 rounded-xl grid place-items-center", accentClass)}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
