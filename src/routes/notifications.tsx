import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { mockNotifications } from "@/lib/mockData";
import { formatDate } from "@/lib/format";
import { Bell, CheckCircle2, AlertCircle, Info } from "lucide-react";

export const Route = createFileRoute("/notifications")({
  component: NotificationsPage,
  head: () => ({ meta: [{ title: "Notifications — NaijaLoan" }] }),
});

const iconFor = { warning: AlertCircle, success: CheckCircle2, info: Info };
const colorFor = { warning: "text-warning bg-warning/15", success: "text-success bg-success/15", info: "text-info bg-info/15" };

function NotificationsPage() {
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
          <Bell className="h-6 w-6 text-primary" /> Notifications
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Stay up to date on your account activity.</p>
      </div>

      <Card>
        <CardContent className="p-0 divide-y">
          {mockNotifications.length === 0 && (
            <div className="py-16 text-center text-muted-foreground">No notifications</div>
          )}
          {mockNotifications.map((n) => {
            const Icon = iconFor[n.type];
            return (
              <div key={n.id} className={`flex gap-4 p-5 ${!n.read ? "bg-primary/[0.02]" : ""}`}>
                <div className={`h-10 w-10 rounded-full grid place-items-center shrink-0 ${colorFor[n.type]}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold">{n.title}</p>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{n.body}</p>
                  <p className="text-xs text-muted-foreground mt-2">{formatDate(n.date)}</p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </AppShell>
  );
}
