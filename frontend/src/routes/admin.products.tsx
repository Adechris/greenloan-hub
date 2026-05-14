import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LOAN_PRODUCTS } from "@/lib/mockData";
import { naira } from "@/lib/format";
import { toast } from "sonner";
import { Package, Plus } from "lucide-react";

export const Route = createFileRoute("/admin/products")({
  component: ProductsPage,
  head: () => ({ meta: [{ title: "Loan Products — NaijaLoan" }] }),
});

function ProductsPage() {
  return (
    <AppShell>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Loan Products</h1>
          <p className="text-muted-foreground text-sm mt-1">Configure interest rates, limits, and tenures.</p>
        </div>
        <Button className="bg-primary hover:opacity-90" onClick={() => toast.success("New product created")}>
          <Plus className="h-4 w-4 mr-1.5" /> New product
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {LOAN_PRODUCTS.map((p) => (
          <Card key={p.id}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center">
                  <Package className="h-5 w-5" />
                </div>
                <CardTitle>{p.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Interest type</Label>
                <Select defaultValue="reducing">
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reducing">Reducing balance</SelectItem>
                    <SelectItem value="flat">Flat rate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Rate (% p.a.)</Label>
                  <Input className="mt-1.5" type="number" defaultValue={p.rate} />
                </div>
                <div>
                  <Label className="text-xs">Late fee (%)</Label>
                  <Input className="mt-1.5" type="number" defaultValue={2} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Min ({naira(p.min)})</Label>
                  <Input className="mt-1.5" type="number" defaultValue={p.min} />
                </div>
                <div>
                  <Label className="text-xs">Max ({naira(p.max)})</Label>
                  <Input className="mt-1.5" type="number" defaultValue={p.max} />
                </div>
              </div>
              <div>
                <Label className="text-xs">Allowed tenures (months)</Label>
                <Input className="mt-1.5" defaultValue={p.tenures.join(", ")} />
              </div>
              <Button className="w-full bg-primary hover:opacity-90" onClick={() => toast.success(`${p.name} updated`)}>
                Save changes
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
