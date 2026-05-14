import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import type { LoanProduct } from "@/lib/mockData";
import { naira } from "@/lib/format";
import { toast } from "sonner";
import { Package, Plus } from "lucide-react";

export const Route = createFileRoute("/admin/products")({
  component: ProductsPage,
  head: () => ({ meta: [{ title: "Loan Products — NaijaLoan" }] }),
});

function ProductsPage() {
  const [products, setProducts] = useState<LoanProduct[] | null>(null);
  const refresh = () => api<{ products: LoanProduct[] }>("/products").then((r) => setProducts(r.products));
  useEffect(() => { refresh(); }, []);

  const create = async () => {
    try {
      await api("/products", { method: "POST", body: {
        name: "New Product", description: "Edit me", min_amount: 50000, max_amount: 1000000,
        interest_rate: 18, min_tenure_months: 3, max_tenure_months: 12,
      }});
      toast.success("Product created");
      refresh();
    } catch (e) { toast.error((e as Error).message); }
  };

  const save = async (p: LoanProduct) => {
    try {
      await api(`/products/${p.id}`, { method: "PATCH", body: p });
      toast.success(`${p.name} updated`);
    } catch (e) { toast.error((e as Error).message); }
  };

  return (
    <AppShell>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Loan Products</h1>
          <p className="text-muted-foreground text-sm mt-1">Configure interest rates, limits, and tenures.</p>
        </div>
        <Button className="bg-primary hover:opacity-90" onClick={create}>
          <Plus className="h-4 w-4 mr-1.5" /> New product
        </Button>
      </div>

      {products === null ? <Skeleton className="h-64" /> : (
        <div className="grid lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} onSave={save} />
          ))}
        </div>
      )}
    </AppShell>
  );
}

function ProductCard({ product, onSave }: { product: LoanProduct; onSave: (p: LoanProduct) => void }) {
  const [draft, setDraft] = useState<LoanProduct>(product);
  useEffect(() => setDraft(product), [product]);
  const upd = <K extends keyof LoanProduct>(k: K, v: LoanProduct[K]) => setDraft({ ...draft, [k]: v });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center">
            <Package className="h-5 w-5" />
          </div>
          <CardTitle>
            <Input value={draft.name} onChange={(e) => upd("name", e.target.value)} className="border-0 px-0 text-lg font-bold focus-visible:ring-0" />
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">Rate (% p.a.)</Label>
            <Input className="mt-1.5" type="number" step={0.1} value={draft.interest_rate} onChange={(e) => upd("interest_rate", Number(e.target.value))} />
          </div>
          <div>
            <Label className="text-xs">Active</Label>
            <select className="mt-1.5 w-full h-9 rounded-md border border-input bg-background px-2 text-sm"
                    value={draft.is_active ? "1" : "0"} onChange={(e) => upd("is_active", e.target.value === "1")}>
              <option value="1">Yes</option>
              <option value="0">No</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">Min ({naira(Number(draft.min_amount))})</Label>
            <Input className="mt-1.5" type="number" value={draft.min_amount} onChange={(e) => upd("min_amount", Number(e.target.value))} />
          </div>
          <div>
            <Label className="text-xs">Max ({naira(Number(draft.max_amount))})</Label>
            <Input className="mt-1.5" type="number" value={draft.max_amount} onChange={(e) => upd("max_amount", Number(e.target.value))} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">Min tenure (months)</Label>
            <Input className="mt-1.5" type="number" value={draft.min_tenure_months} onChange={(e) => upd("min_tenure_months", Number(e.target.value))} />
          </div>
          <div>
            <Label className="text-xs">Max tenure (months)</Label>
            <Input className="mt-1.5" type="number" value={draft.max_tenure_months} onChange={(e) => upd("max_tenure_months", Number(e.target.value))} />
          </div>
        </div>
        <Button className="w-full bg-primary hover:opacity-90" onClick={() => onSave(draft)}>
          Save changes
        </Button>
      </CardContent>
    </Card>
  );
}
