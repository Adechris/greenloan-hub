import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { mockLoans, type Loan } from "@/lib/mockData";
import { naira, formatDate } from "@/lib/format";
import { toast } from "sonner";
import { Search, FileText, CheckCircle2, XCircle, Flag } from "lucide-react";

export const Route = createFileRoute("/officer/applications")({
  component: ApplicationsPage,
  head: () => ({ meta: [{ title: "Applications — NaijaLoan" }] }),
});

function ApplicationsPage() {
  const [q, setQ] = useState("");
  const [active, setActive] = useState<Loan | null>(null);
  const [comment, setComment] = useState("");

  const apps = mockLoans
    .filter((l) => l.officer === "Tunde Bello")
    .filter((l) => l.borrowerName.toLowerCase().includes(q.toLowerCase()) || l.id.toLowerCase().includes(q.toLowerCase()));

  const action = (label: string) => {
    toast.success(`${label} — ${active?.id}. Note saved.`);
    setActive(null);
    setComment("");
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
                    <TableCell className="font-mono text-xs">{l.id}</TableCell>
                    <TableCell className="font-medium">{l.borrowerName}</TableCell>
                    <TableCell>{l.product}</TableCell>
                    <TableCell className="text-right font-semibold">{naira(l.amount)}</TableCell>
                    <TableCell>{formatDate(l.appliedAt)}</TableCell>
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
                <DialogTitle>Review application — {active.id}</DialogTitle>
              </DialogHeader>
              <div className="grid sm:grid-cols-2 gap-4 mt-2">
                <Field label="Borrower" value={active.borrowerName} />
                <Field label="Product" value={active.product} />
                <Field label="Amount" value={naira(active.amount)} />
                <Field label="Tenure" value={`${active.tenureMonths} months`} />
                <Field label="Interest" value={`${active.interestRate}% p.a.`} />
                <Field label="Status" value={<StatusBadge status={active.status} />} />
                <div className="sm:col-span-2"><Field label="Purpose" value={active.purpose} /></div>
              </div>

              <Card className="mt-2">
                <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4" /> Documents</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-lg border p-3"><p className="font-medium">Means of ID</p><p className="text-xs text-muted-foreground">id_card.pdf • 1.2 MB</p></div>
                  <div className="rounded-lg border p-3"><p className="font-medium">Bank statement</p><p className="text-xs text-muted-foreground">statement.pdf • 0.8 MB</p></div>
                </CardContent>
              </Card>

              <div>
                <label className="text-sm font-medium">Comment / reason</label>
                <Textarea className="mt-1.5" rows={3} placeholder="Add a note for the borrower or admin..." value={comment} onChange={(e) => setComment(e.target.value)} />
              </div>

              <div className="flex flex-wrap gap-2 justify-end pt-2">
                <Button variant="outline" onClick={() => action("Flagged for review")}><Flag className="h-4 w-4 mr-1.5" /> Flag</Button>
                <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => action("Rejected")}>
                  <XCircle className="h-4 w-4 mr-1.5" /> Reject
                </Button>
                <Button className="bg-primary hover:opacity-90" onClick={() => action("Approved")}>
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
