export type LoanStatus = "Pending" | "Under Review" | "Approved" | "Rejected" | "Disbursed" | "Active" | "Repaid";

export interface Loan {
  id: string;
  borrowerName: string;
  borrowerId: string;
  product: string;
  amount: number;
  interestRate: number;
  tenureMonths: number;
  purpose: string;
  status: LoanStatus;
  appliedAt: string;
  outstanding: number;
  nextDueDate?: string;
  officer?: string;
}

export const LOAN_PRODUCTS = [
  { id: "p1", name: "Personal Loan", min: 50000, max: 2000000, rate: 18, tenures: [3, 6, 12, 24] },
  { id: "p2", name: "SME Loan", min: 200000, max: 10000000, rate: 22, tenures: [6, 12, 24, 36] },
  { id: "p3", name: "Emergency Loan", min: 20000, max: 500000, rate: 15, tenures: [1, 3, 6] },
];

export const mockLoans: Loan[] = [
  { id: "L-1042", borrowerName: "Chiamaka Eze", borrowerId: "u-borrower", product: "Personal Loan", amount: 500000, interestRate: 18, tenureMonths: 12, purpose: "Home renovation", status: "Active", appliedAt: "2025-01-15", outstanding: 320000, nextDueDate: "2026-05-05", officer: "Tunde Bello" },
  { id: "L-1043", borrowerName: "Chiamaka Eze", borrowerId: "u-borrower", product: "Emergency Loan", amount: 100000, interestRate: 15, tenureMonths: 3, purpose: "Medical bills", status: "Repaid", appliedAt: "2024-09-02", outstanding: 0 },
  { id: "L-1051", borrowerName: "Emeka Nwosu", borrowerId: "b-2", product: "SME Loan", amount: 2500000, interestRate: 22, tenureMonths: 24, purpose: "Inventory purchase", status: "Pending", appliedAt: "2026-04-18", outstanding: 0, officer: "Tunde Bello" },
  { id: "L-1052", borrowerName: "Aisha Bello", borrowerId: "b-3", product: "Personal Loan", amount: 750000, interestRate: 18, tenureMonths: 18, purpose: "School fees", status: "Under Review", appliedAt: "2026-04-20", outstanding: 0, officer: "Tunde Bello" },
  { id: "L-1053", borrowerName: "Olumide Adeyemi", borrowerId: "b-4", product: "SME Loan", amount: 4000000, interestRate: 22, tenureMonths: 36, purpose: "Equipment purchase", status: "Approved", appliedAt: "2026-04-10", outstanding: 4000000, officer: "Tunde Bello" },
  { id: "L-1054", borrowerName: "Funke Akindele", borrowerId: "b-5", product: "Personal Loan", amount: 300000, interestRate: 18, tenureMonths: 6, purpose: "Travel", status: "Disbursed", appliedAt: "2026-03-28", outstanding: 300000, nextDueDate: "2026-05-01", officer: "Tunde Bello" },
  { id: "L-1055", borrowerName: "Bola Ahmed", borrowerId: "b-6", product: "Emergency Loan", amount: 80000, interestRate: 15, tenureMonths: 3, purpose: "Car repair", status: "Rejected", appliedAt: "2026-04-05", outstanding: 0, officer: "Tunde Bello" },
];

export interface Repayment {
  installment: number;
  dueDate: string;
  principal: number;
  interest: number;
  total: number;
  status: "Paid" | "Due" | "Overdue";
}

export function generateSchedule(amount: number, ratePct: number, months: number, start = new Date()): Repayment[] {
  const monthlyRate = ratePct / 100 / 12;
  const pmt = (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
  let balance = amount;
  const out: Repayment[] = [];
  for (let i = 1; i <= months; i++) {
    const interest = balance * monthlyRate;
    const principal = pmt - interest;
    balance -= principal;
    const due = new Date(start);
    due.setMonth(due.getMonth() + i);
    out.push({
      installment: i,
      dueDate: due.toISOString().slice(0, 10),
      principal: Math.round(principal),
      interest: Math.round(interest),
      total: Math.round(pmt),
      status: i <= 4 ? "Paid" : i === 5 ? "Due" : "Due",
    });
  }
  return out;
}

export const mockPayments = [
  { id: "P-9001", loanId: "L-1042", date: "2026-04-05", amount: 45000, method: "Bank Transfer", reference: "TRF/240405/9281" },
  { id: "P-9002", loanId: "L-1042", date: "2026-03-05", amount: 45000, method: "Bank Transfer", reference: "TRF/240305/4112" },
  { id: "P-9003", loanId: "L-1042", date: "2026-02-05", amount: 45000, method: "Card", reference: "PAY/240205/7733" },
  { id: "P-9004", loanId: "L-1043", date: "2024-12-02", amount: 35000, method: "Bank Transfer", reference: "TRF/241202/2210" },
];

export const mockNotifications = [
  { id: "n1", title: "Loan repayment due in 3 days", body: "Your installment of ₦45,000 for L-1042 is due on May 5, 2026.", date: "2026-04-22", type: "warning" as const, read: false },
  { id: "n2", title: "Payment received", body: "We received your repayment of ₦45,000. Thank you!", date: "2026-04-05", type: "success" as const, read: true },
  { id: "n3", title: "Loan approved", body: "Your Personal Loan of ₦500,000 has been approved.", date: "2025-01-18", type: "success" as const, read: true },
];

export const mockUsers = [
  { id: "u-borrower", name: "Chiamaka Eze", email: "borrower@naijaloan.ng", role: "Borrower", status: "Active", joined: "2024-08-10" },
  { id: "b-2", name: "Emeka Nwosu", email: "emeka@example.com", role: "Borrower", status: "Active", joined: "2025-11-02" },
  { id: "b-3", name: "Aisha Bello", email: "aisha@example.com", role: "Borrower", status: "Active", joined: "2026-01-20" },
  { id: "b-4", name: "Olumide Adeyemi", email: "olu@example.com", role: "Borrower", status: "Active", joined: "2026-02-14" },
  { id: "b-5", name: "Funke Akindele", email: "funke@example.com", role: "Borrower", status: "Active", joined: "2026-03-01" },
  { id: "b-6", name: "Bola Ahmed", email: "bola@example.com", role: "Borrower", status: "Suspended", joined: "2026-03-15" },
  { id: "u-officer", name: "Tunde Bello", email: "officer@naijaloan.ng", role: "Loan Officer", status: "Active", joined: "2024-05-01" },
  { id: "of-2", name: "Ngozi Okonkwo", email: "ngozi@naijaloan.ng", role: "Loan Officer", status: "Active", joined: "2025-02-10" },
  { id: "u-admin", name: "Adaeze Okafor", email: "admin@naijaloan.ng", role: "Admin", status: "Active", joined: "2024-01-01" },
];

export const monthlyDisbursement = [
  { month: "Nov", disbursed: 18, repaid: 12 },
  { month: "Dec", disbursed: 22, repaid: 15 },
  { month: "Jan", disbursed: 28, repaid: 20 },
  { month: "Feb", disbursed: 35, repaid: 24 },
  { month: "Mar", disbursed: 42, repaid: 30 },
  { month: "Apr", disbursed: 48, repaid: 36 },
];

export const portfolioBreakdown = [
  { name: "Personal", value: 45 },
  { name: "SME", value: 35 },
  { name: "Emergency", value: 20 },
];
