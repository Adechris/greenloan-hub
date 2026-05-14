import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockLoans, mockPayments, generateSchedule } from "@/lib/mockData";
import { naira, formatDate } from "@/lib/format";
import { CheckCircle2, Circle } from "lucide-react";

export const Route = createFileRoute("/loans")({
  component: LoansPage,
  head: () => ({ meta: [{ title: "My Loans — NaijaLoan" }] }),
});

const stages = ["Pending", "Under Review", "Approved", "Disbursed", "Active", "Repaid"];

function LoansPage() {
  const myLoans = mockLoans.filter((l) => l.borrowerId === "u-borrower");
  const [selected, setSelected] = useState(myLoans[0]?.id);
  const loan = myLoans.find((l) => l.id === selected) ?? myLoans[0];

  if (!loan) {
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

  const schedule = generateSchedule(loan.amount, loan.interestRate, loan.tenureMonths, new Date(loan.appliedAt));
  const payments = mockPayments.filter((p) => p.loanId === loan.id);
  const currentIdx = stages.indexOf(loan.status === "Rejected" ? "Under Review" : loan.status);

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold">My Loans</h1>
        <p className="text-muted-foreground text-sm mt-1">Track status, schedule and payments.</p>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        <div className="space-y-2">
          {myLoans.map((l) => (
            <button key={l.id} onClick={() => setSelected(l.id)}
                    className={`w-full text-left rounded-xl border p-3 transition-colors ${
                      l.id === loan.id ? "border-primary bg-primary/5" : "hover:border-primary/40"
                    }`}>
              <div className="flex justify-between items-start gap-2">
                <p className="font-semibold text-sm">{l.product}</p>
                <StatusBadge status={l.status} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{l.id}</p>
              <p className="text-sm font-bold mt-1.5">{naira(l.amount)}</p>
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{loan.product} • {loan.id}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{loan.purpose}</p>
                </div>
                <StatusBadge status={loan.status} />
              </div>
            </CardHeader>
            <CardContent>
              {/* Tracker */}
              <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2">
                {stages.map((s, i) => {
                  const done = i <= currentIdx;
                  return (
                    <div key={s} className="flex items-center gap-1 shrink-0">
                      <div className="flex flex-col items-center">
                        {done ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <Circle className="h-5 w-5 text-muted-foreground/40" />}
                        <span className={`text-[10px] mt-1 ${done ? "text-primary font-semibold" : "text-muted-foreground"}`}>{s}</span>
                      </div>
                      {i < stages.length - 1 && (
                        <div className={`h-0.5 w-6 sm:w-12 ${i < currentIdx ? "bg-primary" : "bg-border"}`} />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t">
                <Stat label="Amount" value={naira(loan.amount)} />
                <Stat label="Interest" value={`${loan.interestRate}% p.a.`} />
                <Stat label="Tenure" value={`${loan.tenureMonths} months`} />
                <Stat label="Outstanding" value={naira(loan.outstanding)} />
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
                        {schedule.map((r) => (
                          <TableRow key={r.installment}>
                            <TableCell>{r.installment}</TableCell>
                            <TableCell>{formatDate(r.dueDate)}</TableCell>
                            <TableCell className="text-right">{naira(r.principal)}</TableCell>
                            <TableCell className="text-right">{naira(r.interest)}</TableCell>
                            <TableCell className="text-right font-semibold">{naira(r.total)}</TableCell>
                            <TableCell><StatusBadge status={r.status} /></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="payments" className="m-0">
                  {payments.length === 0 ? (
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
                          {payments.map((p) => (
                            <TableRow key={p.id}>
                              <TableCell className="font-mono text-xs">{p.reference}</TableCell>
                              <TableCell>{formatDate(p.date)}</TableCell>
                              <TableCell>{p.method}</TableCell>
                              <TableCell className="text-right font-semibold">{naira(p.amount)}</TableCell>
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
