// Shared types + helpers (no mock data — everything is fetched from the API).

export type LoanStatusApi =
  | "pending" | "under_review" | "approved" | "rejected"
  | "disbursed" | "active" | "repaid" | "defaulted";

const LABELS: Record<string, string> = {
  pending: "Pending",
  under_review: "Under Review",
  approved: "Approved",
  rejected: "Rejected",
  disbursed: "Disbursed",
  active: "Active",
  repaid: "Repaid",
  defaulted: "Defaulted",
  paid: "Paid",
  overdue: "Overdue",
  partial: "Partial",
};

export const formatStatus = (s?: string | null) =>
  !s ? "—" : LABELS[s] ?? (s[0]?.toUpperCase() + s.slice(1));

export interface Loan {
  id: number;
  borrower_id: number;
  product_id: number;
  officer_id: number | null;
  amount: number;
  interest_rate: number;
  tenure_months: number;
  purpose: string | null;
  status: LoanStatusApi;
  rejection_reason?: string | null;
  applied_at: string;
  reviewed_at?: string | null;
  product_name?: string;
  borrower_name?: string;
  borrower_email?: string;
  officer_name?: string | null;
  outstanding?: number;
  next_due_date?: string | null;
}

export interface LoanProduct {
  id: number;
  name: string;
  description: string | null;
  min_amount: number;
  max_amount: number;
  interest_rate: number;
  min_tenure_months: number;
  max_tenure_months: number;
  is_active: boolean;
}

export interface Repayment {
  id?: number;
  installment: number;
  due_date: string;
  principal: number;
  interest: number;
  amount_due: number;
  amount_paid?: number;
  status?: string;
}

export interface Payment {
  id: number;
  loan_id: number;
  amount: number;
  method: string;
  reference: string;
  paid_at: string;
}

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  is_read: boolean;
  created_at: string;
}

export interface AdminUser {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  role: "admin" | "officer" | "borrower";
  is_active: boolean | number;
  created_at: string;
}
