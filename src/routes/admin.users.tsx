import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockUsers } from "@/lib/mockData";
import { formatDate } from "@/lib/format";
import { Search, UserPlus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users")({
  component: UsersPage,
  head: () => ({ meta: [{ title: "User Management — NaijaLoan" }] }),
});

function UsersPage() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const filtered = mockUsers
    .filter((u) => filter === "all" || u.role === filter)
    .filter((u) => u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase()));

  return (
    <AppShell>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage borrowers, officers, and admins.</p>
        </div>
        <Button className="bg-primary hover:opacity-90" onClick={() => toast.success("Invite sent")}>
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
            <SelectItem value="Borrower">Borrowers</SelectItem>
            <SelectItem value="Loan Officer">Loan Officers</SelectItem>
            <SelectItem value="Admin">Admins</SelectItem>
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
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                    <TableCell>{u.role}</TableCell>
                    <TableCell>{formatDate(u.joined)}</TableCell>
                    <TableCell><StatusBadge status={u.status} /></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => toast.info(`Editing ${u.name}`)}>Edit</Button>
                      <Button variant="ghost" size="sm" className="text-destructive"
                              onClick={() => toast.warning(`${u.name} ${u.status === "Active" ? "deactivated" : "reactivated"}`)}>
                        {u.status === "Active" ? "Deactivate" : "Activate"}
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
