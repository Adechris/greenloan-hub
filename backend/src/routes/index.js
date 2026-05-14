import { Router } from "express";
import * as auth from "../controllers/authController.js";
import * as loans from "../controllers/loanController.js";
import { authRequired, requireRole } from "../middleware/auth.js";

const r = Router();

// Auth
r.post("/auth/login", auth.login);
r.post("/auth/register", auth.registerBorrower);
r.get("/auth/me", authRequired, auth.me);

// Loan products
r.get("/products", loans.listProducts);

// Borrower
r.post("/loans/apply", authRequired, requireRole("borrower"), loans.applyForLoan);
r.get("/loans/mine", authRequired, requireRole("borrower"), loans.myLoans);

// Officer
r.get("/officer/queue", authRequired, requireRole("officer", "admin"), loans.reviewQueue);
r.post("/officer/loans/:id/decide", authRequired, requireRole("officer", "admin"), loans.decideLoan);

// Admin
r.get("/admin/stats", authRequired, requireRole("admin"), loans.adminStats);

export default r;
