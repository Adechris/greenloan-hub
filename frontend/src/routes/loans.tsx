import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import type { Loan, Repayment, Payment } from "@/lib/mockData";
import { naira, formatDate } from "@/lib/format";
import { CheckCircle2, Circle } from "lucide-react";

export const Route = createFileRoute("/loans")({
  component: LoansPage,
  head: () => ({ meta: [{ title: "My Loans — NaijaLoan" }] }),
});

const stages = ["pending", "under_review", "approved", "disbursed", "active", "repaid"];
const stageLabels: Record<string, string> = {
  pending: "Pending", under_review: "Review", approved: "Approved",
  disbursed: "Disbursed", active: "Active", repaid: "Repaid",
};

function LoansPage() {
  const [loans, setLoans] = useState<Loan[] | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [details, setDetails] = useState<{ loan: Loan; schedule: Repayment[]; payments: Payment[] } | null>(null);

  useEffect(() => {
    api<{ loans: Loan[] }>("/loans/mine").then((r) => {
      setLoans(r.loans);
      if (r.loans[0]) setSelected(r.loans[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selected) return;
    setDetails(null);
    api<{ loan: Loan; schedule: Repayment[]; payments: Payment[] }>(`/loans/${selected}`).then(setDetails);
  }, [selected]);

  if (loans === null) {
    return <AppShell><Skeleton className="h-64" /></AppShell>;
  }

  if (loans.length === 0) {
    return (
      <AppShell>
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground">You have no loans yet.</p>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  const loan = details?.loan;
  const status = loan?.status ?? "pending";
  const currentIdx = stages.indexOf(status === "rejected" ? "under_review" : status);

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold">My Loans</h1>
        <p className="text-muted-foreground text-sm mt-1">Track status, schedule and payments.</p>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        <div className="space-y-2">
          {loans.map((l) => (
            <button key={l.id} onClick={() => setSelected(l.id)}
                    className={`w-full text-left rounded-xl border p-3 transition-colors ${
                      l.id === selected ? "border-primary bg-primary/5" : "hover:border-primary/40"
                    }`}>
              <div className="flex justify-between items-start gap-2">
                <p className="font-semibold text-sm">{l.product_name}</p>
                <StatusBadge status={l.status} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">L-{l.id}</p>
              <p className="text-sm font-bold mt-1.5">{naira(Number(l.amount))}</p>
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {!details && <Skeleton className="h-64" />}
          {details && loan && (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{loan.product_name} • L-{loan.id}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{loan.purpose}</p>
                    </div>
                    <StatusBadge status={loan.status} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2">
                    {stages.map((s, i) => {
                      const done = i <= currentIdx;
                      return (
                        <div key={s} className="flex items-center gap-1 shrink-0">
                          <div className="flex flex-col items-center">
                            {done ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <Circle className="h-5 w-5 text-muted-foreground/40" />}
                            <span className={`text-[10px] mt-1 ${done ? "text-primary font-semibold" : "text-muted-foreground"}`}>{stageLabels[s]}</span>
                          </div>
                          {i < stages.length - 1 && (
                            <div className={`h-0.5 w-6 sm:w-12 ${i < currentIdx ? "bg-primary" : "bg-border"}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t">
                    <Stat label="Amount" value={naira(Number(loan.amount))} />
                    <Stat label="Interest" value={`${loan.interest_rate}% p.a.`} />
                    <Stat label="Tenure" value={`${loan.tenure_months} months`} />
                    <Stat label="Outstanding" value={naira(Number(loan.outstanding ?? loan.amount))} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-0">
                  <Tabs defaultValue="schedule">
                    <TabsList className="m-4 mb-0">
                      <TabsTrigger value="schedule">Repayment schedule</TabsTrigger>
                      <TabsTrigger value="payments">Payment history</TabsTrigger>
                    </TabsList>

                    <TabsContent value="schedule" className="m-0">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>#</TableHead>
                              <TableHead>Due date</TableHead>
                              <TableHead className="text-right">Principal</TableHead>
                              <TableHead className="text-right">Interest</TableHead>
                              <TableHead className="text-right">Total</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {details.schedule.map((r) => (
                              <TableRow key={r.installment}>
                                <TableCell>{r.installment}</TableCell>
                                <TableCell>{formatDate(r.due_date)}</TableCell>
                                <TableCell className="text-right">{naira(Number(r.principal))}</TableCell>
                                <TableCell className="text-right">{naira(Number(r.interest))}</TableCell>
                                <TableCell className="text-right font-semibold">{naira(Number(r.amount_due))}</TableCell>
                                <TableCell><StatusBadge status={r.status ?? "pending"} /></TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </TabsContent>

                    <TabsContent value="payments" className="m-0">
                      {details.payments.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">No payments yet</div>
                      ) : (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Reference</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Method</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {details.payments.map((p) => (
                                <TableRow key={p.id}>
                                  <TableCell className="font-mono text-xs">{p.reference}</TableCell>
                                  <TableCell>{formatDate(p.paid_at)}</TableCell>
                                  <TableCell>{p.method}</TableCell>
                                  <TableCell className="text-right font-semibold">{naira(Number(p.amount))}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="font-semibold mt-0.5">{value}</p>
    </div>
  );
}
