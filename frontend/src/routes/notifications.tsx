import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import type { AppNotification } from "@/lib/mockData";
import { formatDate } from "@/lib/format";
import { Bell, CheckCircle2, AlertCircle, Info, XCircle } from "lucide-react";

export const Route = createFileRoute("/notifications")({
  component: NotificationsPage,
  head: () => ({ meta: [{ title: "Notifications — NaijaLoan" }] }),
});

const iconFor = { warning: AlertCircle, success: CheckCircle2, info: Info, error: XCircle };
const colorFor = {
  warning: "text-warning bg-warning/15",
  success: "text-success bg-success/15",
  info: "text-info bg-info/15",
  error: "text-destructive bg-destructive/15",
};

function NotificationsPage() {
  const [notes, setNotes] = useState<AppNotification[] | null>(null);

  useEffect(() => { api<{ notifications: AppNotification[] }>("/notifications").then((r) => setNotes(r.notifications)).catch(() => setNotes([])); }, []);

  const markRead = async (id: number) => {
    await api(`/notifications/${id}/read`, { method: "PATCH" });
    setNotes((n) => n?.map((x) => x.id === id ? { ...x, is_read: true } : x) ?? null);
  };

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
          <Bell className="h-6 w-6 text-primary" /> Notifications
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Stay up to date on your account activity.</p>
      </div>

      {notes === null ? <Skeleton className="h-64" /> : (
        <Card>
          <CardContent className="p-0 divide-y">
            {notes.length === 0 && (
              <div className="py-16 text-center text-muted-foreground">No notifications</div>
            )}
            {notes.map((n) => {
              const Icon = iconFor[n.type] ?? Info;
              return (
                <button key={n.id} onClick={() => !n.is_read && markRead(n.id)}
                        className={`w-full text-left flex gap-4 p-5 transition-colors ${!n.is_read ? "bg-primary/[0.02] hover:bg-primary/[0.05]" : ""}`}>
                  <div className={`h-10 w-10 rounded-full grid place-items-center shrink-0 ${colorFor[n.type] ?? colorFor.info}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-semibold">{n.title}</p>
                      {!n.is_read && <span className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">{formatDate(n.created_at)}</p>
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>
      )}
    </AppShell>
  );
}
