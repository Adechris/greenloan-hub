import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
  head: () => ({ meta: [{ title: "Settings — NaijaLoan" }] }),
});

function SettingsPage() {
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold">System Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Company info, notifications and announcements.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Company information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Company name</Label><Input className="mt-1.5" defaultValue="NaijaLoan Ltd" /></div>
            <div><Label>Support email</Label><Input className="mt-1.5" defaultValue="support@naijaloan.ng" /></div>
            <div><Label>Support phone</Label><Input className="mt-1.5" defaultValue="+234 700 NAIJA LOAN" /></div>
            <div><Label>Office address</Label><Textarea className="mt-1.5" defaultValue="12B Adeola Odeku Street, Victoria Island, Lagos" /></div>
            <Button className="bg-primary hover:opacity-90" onClick={() => toast.success("Settings saved")}>Save</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Email notifications to borrowers", on: true },
              { label: "SMS reminders (3 days before due)", on: true },
              { label: "Push notifications for officers", on: true },
              { label: "Weekly portfolio digest", on: false },
            ].map((n) => (
              <div key={n.label} className="flex items-center justify-between border-b pb-3 last:border-0">
                <span className="text-sm">{n.label}</span>
                <Switch defaultChecked={n.on} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Send announcement</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Title</Label><Input className="mt-1.5" placeholder="Scheduled maintenance..." /></div>
            <div><Label>Message</Label><Textarea className="mt-1.5" rows={4} placeholder="Type your announcement..." /></div>
            <Button className="bg-primary hover:opacity-90" onClick={() => toast.success("Announcement sent to all users")}>
              Broadcast
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
