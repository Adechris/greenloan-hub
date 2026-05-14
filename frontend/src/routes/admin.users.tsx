import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import type { AdminUser } from "@/lib/mockData";
import { formatDate } from "@/lib/format";
import { Search, UserPlus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users")({
  component: UsersPage,
  head: () => ({ meta: [{ title: "User Management — NaijaLoan" }] }),
});

const roleLabel = { admin: "Admin", officer: "Loan Officer", borrower: "Borrower" } as const;

function UsersPage() {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");

  const refresh = () => api<{ users: AdminUser[] }>("/admin/users").then((r) => setUsers(r.users));
  useEffect(() => { refresh(); }, []);

  const toggle = async (u: AdminUser) => {
    try {
      await api(`/admin/users/${u.role}/${u.id}/toggle`, { method: "PATCH" });
      toast.success(`${u.full_name} ${u.is_active ? "deactivated" : "reactivated"}`);
      refresh();
    } catch (e) { toast.error((e as Error).message); }
  };

  if (users === null) return <AppShell><Skeleton className="h-64" /></AppShell>;

  const filtered = users
    .filter((u) => filter === "all" || u.role === filter)
    .filter((u) => u.full_name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase()));

  return (
    <AppShell>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage borrowers, officers, and admins.</p>
        </div>
        <Button className="bg-primary hover:opacity-90" onClick={() => toast.info("Use registration page to add borrowers")}>
          <UserPlus className="h-4 w-4 mr-1.5" /> Add user
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search users..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="borrower">Borrowers</SelectItem>
            <SelectItem value="officer">Loan Officers</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u) => (
                  <TableRow key={`${u.role}-${u.id}`}>
                    <TableCell className="font-medium">{u.full_name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                    <TableCell>{roleLabel[u.role]}</TableCell>
                    <TableCell>{formatDate(u.created_at)}</TableCell>
                    <TableCell><StatusBadge status={u.is_active ? "active" : "rejected"} /></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => toggle(u)}>
                        {u.is_active ? "Deactivate" : "Activate"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
