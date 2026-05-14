import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api } from "@/lib/api";
import type { Loan } from "@/lib/mockData";
import { naira, formatDate } from "@/lib/format";
import { toast } from "sonner";
import { Search, FileText, CheckCircle2, XCircle, Flag } from "lucide-react";

export const Route = createFileRoute("/officer/applications")({
  component: ApplicationsPage,
  head: () => ({ meta: [{ title: "Applications — NaijaLoan" }] }),
});

function ApplicationsPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [q, setQ] = useState("");
  const [active, setActive] = useState<Loan | null>(null);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = () => api<{ loans: Loan[] }>("/officer/queue").then((r) => setLoans(r.loans));
  useEffect(() => { refresh(); }, []);

  const apps = loans.filter(
    (l) => (l.borrower_name ?? "").toLowerCase().includes(q.toLowerCase()) || String(l.id).includes(q)
  );

  const decide = async (action: "approve" | "reject" | "flag") => {
    if (!active) return;
    setBusy(true);
    try {
      await api(`/officer/loans/${active.id}/decide`, { method: "POST", body: { action, reason: comment } });
      toast.success(`Application ${action}d`);
      setActive(null); setComment("");
      await refresh();
    } catch (e) {
      toast.error((e as Error).message);
    } finally { setBusy(false); }
  };

  return (
    <AppShell>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Applications</h1>
          <p className="text-muted-foreground text-sm mt-1">Review borrower details and decide.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search by name or ID..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loan ID</TableHead>
                  <TableHead>Borrower</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apps.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-mono text-xs">L-{l.id}</TableCell>
                    <TableCell className="font-medium">{l.borrower_name}</TableCell>
                    <TableCell>{l.product_name}</TableCell>
                    <TableCell className="text-right font-semibold">{naira(Number(l.amount))}</TableCell>
                    <TableCell>{formatDate(l.applied_at)}</TableCell>
                    <TableCell><StatusBadge status={l.status} /></TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => setActive(l)}>Review</Button>
                    </TableCell>
                  </TableRow>
                ))}
                {apps.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">No applications match your search</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-2xl">
          {active && (
            <>
              <DialogHeader>
                <DialogTitle>Review application — L-{active.id}</DialogTitle>
              </DialogHeader>
              <div className="grid sm:grid-cols-2 gap-4 mt-2">
                <Field label="Borrower" value={active.borrower_name ?? "—"} />
                <Field label="Product" value={active.product_name ?? "—"} />
                <Field label="Amount" value={naira(Number(active.amount))} />
                <Field label="Tenure" value={`${active.tenure_months} months`} />
                <Field label="Interest" value={`${active.interest_rate}% p.a.`} />
                <Field label="Status" value={<StatusBadge status={active.status} />} />
                <div className="sm:col-span-2"><Field label="Purpose" value={active.purpose ?? "—"} /></div>
              </div>

              <Card className="mt-2">
                <CardContent className="grid grid-cols-2 gap-2 text-sm pt-4">
                  <div className="rounded-lg border p-3 flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" /><div><p className="font-medium text-xs">Means of ID</p><p className="text-[11px] text-muted-foreground">id_card.pdf</p></div></div>
                  <div className="rounded-lg border p-3 flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" /><div><p className="font-medium text-xs">Bank statement</p><p className="text-[11px] text-muted-foreground">statement.pdf</p></div></div>
                </CardContent>
              </Card>

              <div>
                <label className="text-sm font-medium">Comment / reason</label>
                <Textarea className="mt-1.5" rows={3} placeholder="Add a note for the borrower..." value={comment} onChange={(e) => setComment(e.target.value)} />
              </div>

              <div className="flex flex-wrap gap-2 justify-end pt-2">
                <Button variant="outline" disabled={busy} onClick={() => decide("flag")}><Flag className="h-4 w-4 mr-1.5" /> Flag</Button>
                <Button variant="outline" disabled={busy} className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => decide("reject")}>
                  <XCircle className="h-4 w-4 mr-1.5" /> Reject
                </Button>
                <Button disabled={busy} className="bg-primary hover:opacity-90" onClick={() => decide("approve")}>
                  <CheckCircle2 className="h-4 w-4 mr-1.5" /> Approve
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
      <div className="mt-0.5 font-medium">{value}</div>
    </div>
  );
}
