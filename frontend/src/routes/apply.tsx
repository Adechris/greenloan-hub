import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";
import type { LoanProduct } from "@/lib/mockData";
import { naira } from "@/lib/format";
import { toast } from "sonner";
import { Upload, FileCheck2 } from "lucide-react";

export const Route = createFileRoute("/apply")({
  component: ApplyPage,
  head: () => ({ meta: [{ title: "Apply for a loan — NaijaLoan" }] }),
});

function ApplyPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<LoanProduct[]>([]);
  const [productId, setProductId] = useState<number | null>(null);
  const [amount, setAmount] = useState(200000);
  const [tenure, setTenure] = useState(6);
  const [purpose, setPurpose] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [guarantor, setGuarantor] = useState({ name: "", phone: "", relation: "" });

  useEffect(() => {
    api<{ products: LoanProduct[] }>("/products").then((r) => {
      setProducts(r.products);
      if (r.products[0]) {
        setProductId(r.products[0].id);
        setAmount(Number(r.products[0].min_amount));
        setTenure(r.products[0].min_tenure_months);
      }
    }).catch((e) => toast.error(e.message));
  }, []);

  const product = products.find((p) => p.id === productId);

  const monthly = (() => {
    if (!product) return 0;
    const r = Number(product.interest_rate) / 100 / 12;
    if (r === 0) return Math.round(amount / tenure);
    return Math.round((amount * r) / (1 - Math.pow(1 + r, -tenure)));
  })();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) return;
    setSubmitting(true);
    try {
      await api("/loans/apply", { method: "POST", body: { productId, amount, tenureMonths: tenure, purpose } });
      toast.success("Loan application submitted! Status: Pending Review.");
      navigate({ to: "/loans" });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!product) {
    return <AppShell><Card><CardContent className="py-16 text-center text-muted-foreground">Loading products…</CardContent></Card></AppShell>;
  }

  const tenures: number[] = [];
  for (let t = product.min_tenure_months; t <= product.max_tenure_months; t++) tenures.push(t);

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold">Apply for a loan</h1>
        <p className="text-muted-foreground text-sm mt-1">Fill the details below — we'll get back to you within 24 hours.</p>
      </div>

      <form onSubmit={submit} className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Loan details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Loan product</Label>
                <Select value={String(productId)} onValueChange={(v) => {
                  const p = products.find((x) => x.id === Number(v))!;
                  setProductId(p.id);
                  setAmount(Number(p.min_amount));
                  setTenure(p.min_tenure_months);
                }}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.name} — {p.interest_rate}% p.a.
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1.5">
                  Range: {naira(Number(product.min_amount))} – {naira(Number(product.max_amount))}
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Amount (₦)</Label>
                  <Input type="number" min={Number(product.min_amount)} max={Number(product.max_amount)} step={1000} required
                         value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="mt-1.5" />
                </div>
                <div>
                  <Label>Tenure (months)</Label>
                  <Select value={String(tenure)} onValueChange={(v) => setTenure(Number(v))}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {tenures.map((t) => <SelectItem key={t} value={String(t)}>{t} months</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Purpose of loan</Label>
                <Textarea required placeholder="What will the loan be used for?" className="mt-1.5"
                          value={purpose} onChange={(e) => setPurpose(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Documents</CardTitle></CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-3">
              {["Means of ID", "Bank statement (last 3 months)"].map((label) => (
                <label key={label} className="rounded-xl border-2 border-dashed border-border hover:border-primary/40 p-5 text-center cursor-pointer transition-colors">
                  <input type="file" className="sr-only" onChange={() => toast.success(`${label} uploaded`)} />
                  <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
                  <p className="mt-2 text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">PDF, JPG, PNG (max 5MB)</p>
                </label>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Guarantor details</CardTitle></CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label>Full name</Label>
                <Input required className="mt-1.5" value={guarantor.name}
                       onChange={(e) => setGuarantor({ ...guarantor, name: e.target.value })} />
              </div>
              <div>
                <Label>Phone number</Label>
                <Input required className="mt-1.5" value={guarantor.phone}
                       onChange={(e) => setGuarantor({ ...guarantor, phone: e.target.value })} />
              </div>
              <div>
                <Label>Relationship</Label>
                <Input required className="mt-1.5" placeholder="e.g. Sibling" value={guarantor.relation}
                       onChange={(e) => setGuarantor({ ...guarantor, relation: e.target.value })} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-20" style={{ boxShadow: "var(--shadow-elegant)" }}>
            <CardHeader><CardTitle>Loan summary</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl p-4 text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
                <p className="text-xs uppercase tracking-wider opacity-80">Monthly repayment</p>
                <p className="text-3xl font-bold mt-1">{naira(monthly)}</p>
                <p className="text-xs opacity-80 mt-1">for {tenure} months</p>
              </div>
              <div className="space-y-2 text-sm">
                <Row label="Product" value={product.name} />
                <Row label="Loan amount" value={naira(amount)} />
                <Row label="Interest rate" value={`${product.interest_rate}% p.a.`} />
                <Row label="Tenure" value={`${tenure} months`} />
                <Row label="Total repayable" value={naira(monthly * tenure)} bold />
              </div>
              <Button type="submit" disabled={submitting} className="w-full bg-primary hover:opacity-90" size="lg">
                <FileCheck2 className="h-4 w-4 mr-2" /> {submitting ? "Submitting..." : "Submit application"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </AppShell>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between border-b last:border-0 pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className={bold ? "font-bold" : "font-medium"}>{value}</span>
    </div>
  );
}
