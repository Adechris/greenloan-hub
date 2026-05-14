import { Router } from "express";
import * as auth from "../controllers/authController.js";
import * as loans from "../controllers/loanController.js";
import { authRequired, requireRole } from "../middleware/auth.js";

const r = Router();

// Auth
r.post("/auth/login", auth.login);
r.post("/auth/register", auth.registerBorrower);
r.get("/auth/me", authRequired, auth.me);

// Loan products (public list)
r.get("/products", loans.listProducts);
r.post("/products", authRequired, requireRole("admin"), loans.createProduct);
r.patch("/products/:id", authRequired, requireRole("admin"), loans.updateProduct);

// Borrower
r.post("/loans/apply", authRequired, requireRole("borrower"), loans.applyForLoan);
r.get("/loans/mine", authRequired, requireRole("borrower"), loans.myLoans);
r.get("/loans/:id", authRequired, loans.getLoanDetails);
r.post("/loans/:id/payment", authRequired, loans.recordPayment);

// Officer
r.get("/officer/queue", authRequired, requireRole("officer", "admin"), loans.reviewQueue);
r.post("/officer/loans/:id/decide", authRequired, requireRole("officer", "admin"), loans.decideLoan);

// Admin
r.get("/admin/stats", authRequired, requireRole("admin"), loans.adminStats);
r.get("/admin/loans", authRequired, requireRole("admin"), loans.allLoans);
r.get("/admin/users", authRequired, requireRole("admin"), loans.listUsers);
r.patch("/admin/users/:role/:id/toggle", authRequired, requireRole("admin"), loans.toggleUser);

// Notifications
r.get("/notifications", authRequired, loans.myNotifications);
r.patch("/notifications/:id/read", authRequired, loans.markNotificationRead);

export default r;
