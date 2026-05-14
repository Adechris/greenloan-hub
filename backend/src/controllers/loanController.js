import { pool } from "../config/db.js";

// ---------- helpers ----------
function buildSchedule(amount, ratePct, months, startDate = new Date()) {
  const monthlyRate = ratePct / 100 / 12;
  const pmt = (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
  let balance = Number(amount);
  const rows = [];
  for (let i = 1; i <= months; i++) {
    const interest = balance * monthlyRate;
    const principal = pmt - interest;
    balance -= principal;
    const due = new Date(startDate);
    due.setMonth(due.getMonth() + i);
    rows.push({
      installment: i,
      due_date: due.toISOString().slice(0, 10),
      principal: Math.round(principal),
      interest: Math.round(interest),
      amount_due: Math.round(pmt),
    });
  }
  return rows;
}

// ---------- products ----------
export async function listProducts(_req, res) {
  const [rows] = await pool.query(`SELECT * FROM loan_products WHERE is_active = TRUE ORDER BY id`);
  res.json({ products: rows });
}

export async function createProduct(req, res) {
  const { name, description, min_amount, max_amount, interest_rate, min_tenure_months, max_tenure_months } = req.body || {};
  if (!name || min_amount == null || max_amount == null || interest_rate == null) {
    return res.status(400).json({ error: "name, min_amount, max_amount, interest_rate required" });
  }
  const [r] = await pool.query(
    `INSERT INTO loan_products (name, description, min_amount, max_amount, interest_rate, min_tenure_months, max_tenure_months)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, description || null, min_amount, max_amount, interest_rate, min_tenure_months || 1, max_tenure_months || 12]
  );
  res.status(201).json({ id: r.insertId });
}

export async function updateProduct(req, res) {
  const { id } = req.params;
  const { name, description, min_amount, max_amount, interest_rate, min_tenure_months, max_tenure_months, is_active } = req.body || {};
  await pool.query(
    `UPDATE loan_products SET
       name = COALESCE(?, name),
       description = COALESCE(?, description),
       min_amount = COALESCE(?, min_amount),
       max_amount = COALESCE(?, max_amount),
       interest_rate = COALESCE(?, interest_rate),
       min_tenure_months = COALESCE(?, min_tenure_months),
       max_tenure_months = COALESCE(?, max_tenure_months),
       is_active = COALESCE(?, is_active)
     WHERE id = ?`,
    [name, description, min_amount, max_amount, interest_rate, min_tenure_months, max_tenure_months, is_active, id]
  );
  res.json({ ok: true });
}

// ---------- borrower ----------
export async function applyForLoan(req, res) {
  if (req.user.role !== "borrower") return res.status(403).json({ error: "Only borrowers can apply" });
  const { productId, amount, tenureMonths, purpose } = req.body || {};
  if (!productId || !amount || !tenureMonths) {
    return res.status(400).json({ error: "productId, amount, tenureMonths required" });
  }
  const [products] = await pool.query(`SELECT * FROM loan_products WHERE id = ?`, [productId]);
  const product = products[0];
  if (!product) return res.status(404).json({ error: "Loan product not found" });

  const [result] = await pool.query(
    `INSERT INTO loans (borrower_id, product_id, amount, interest_rate, tenure_months, purpose, status)
     VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
    [req.user.id, productId, amount, product.interest_rate, tenureMonths, purpose || null]
  );

  await pool.query(
    `INSERT INTO notifications (user_id, user_role, title, message, type)
     VALUES (?, 'borrower', ?, ?, 'info')`,
    [req.user.id, "Application submitted", `Your application for ₦${Number(amount).toLocaleString()} is pending review.`]
  );

  res.status(201).json({ id: result.insertId });
}

export async function myLoans(req, res) {
  if (req.user.role !== "borrower") return res.status(403).json({ error: "Forbidden" });
  const [rows] = await pool.query(
    `SELECT l.*, p.name AS product_name,
       COALESCE(l.amount - (SELECT COALESCE(SUM(amount),0) FROM payments pay WHERE pay.loan_id = l.id), l.amount) AS outstanding,
       (SELECT MIN(due_date) FROM repayments r WHERE r.loan_id = l.id AND r.status IN ('pending','overdue','partial')) AS next_due_date
     FROM loans l
     JOIN loan_products p ON p.id = l.product_id
     WHERE l.borrower_id = ? ORDER BY l.applied_at DESC`,
    [req.user.id]
  );
  res.json({ loans: rows });
}

export async function getLoanDetails(req, res) {
  const { id } = req.params;
  const [loans] = await pool.query(
    `SELECT l.*, p.name AS product_name, b.full_name AS borrower_name, b.email AS borrower_email,
       o.full_name AS officer_name
     FROM loans l
     JOIN loan_products p ON p.id = l.product_id
     JOIN borrowers b ON b.id = l.borrower_id
     LEFT JOIN loan_officers o ON o.id = l.officer_id
     WHERE l.id = ?`,
    [id]
  );
  const loan = loans[0];
  if (!loan) return res.status(404).json({ error: "Loan not found" });
  // borrower can only see own
  if (req.user.role === "borrower" && loan.borrower_id !== req.user.id) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const [schedule] = await pool.query(`SELECT * FROM repayments WHERE loan_id = ? ORDER BY installment`, [id]);
  const [payments] = await pool.query(`SELECT * FROM payments WHERE loan_id = ? ORDER BY paid_at DESC`, [id]);
  const finalSchedule = schedule.length
    ? schedule
    : buildSchedule(loan.amount, loan.interest_rate, loan.tenure_months, loan.applied_at);

  res.json({ loan, schedule: finalSchedule, payments });
}

export async function recordPayment(req, res) {
  const { id } = req.params;
  const { amount, method, reference } = req.body || {};
  if (!amount) return res.status(400).json({ error: "amount required" });
  await pool.query(
    `INSERT INTO payments (loan_id, amount, method, reference) VALUES (?, ?, ?, ?)`,
    [id, amount, method || "Bank Transfer", reference || `MAN/${Date.now()}`]
  );
  res.status(201).json({ ok: true });
}

// ---------- officer ----------
export async function reviewQueue(_req, res) {
  const [rows] = await pool.query(
    `SELECT l.*, b.full_name AS borrower_name, b.email AS borrower_email, p.name AS product_name
     FROM loans l
     JOIN borrowers b ON b.id = l.borrower_id
     JOIN loan_products p ON p.id = l.product_id
     ORDER BY l.applied_at DESC`
  );
  res.json({ loans: rows });
}

export async function decideLoan(req, res) {
  const { id } = req.params;
  const { action, reason } = req.body || {};
  if (!["approve", "reject", "flag"].includes(action)) return res.status(400).json({ error: "Invalid action" });
  const status = action === "approve" ? "approved" : action === "reject" ? "rejected" : "under_review";
  await pool.query(
    `UPDATE loans SET status = ?, officer_id = ?, rejection_reason = ?, reviewed_at = NOW() WHERE id = ?`,
    [status, req.user.id, action === "reject" ? reason || null : null, id]
  );
  // Notify borrower
  const [[loan]] = await pool.query(`SELECT borrower_id, amount FROM loans WHERE id = ?`, [id]);
  if (loan) {
    const titleMap = { approve: "Loan approved", reject: "Loan rejected", flag: "Loan under review" };
    const typeMap = { approve: "success", reject: "error", flag: "warning" };
    await pool.query(
      `INSERT INTO notifications (user_id, user_role, title, message, type)
       VALUES (?, 'borrower', ?, ?, ?)`,
      [loan.borrower_id, titleMap[action], reason || `Your ₦${Number(loan.amount).toLocaleString()} loan was ${status}.`, typeMap[action]]
    );
  }
  res.json({ ok: true });
}

// ---------- admin ----------
export async function adminStats(_req, res) {
  const [[loans]] = await pool.query(`SELECT COUNT(*) AS total FROM loans`);
  const [[active]] = await pool.query(`SELECT COUNT(*) AS total FROM loans WHERE status IN ('approved','disbursed','active')`);
  const [[borrowers]] = await pool.query(`SELECT COUNT(*) AS total FROM borrowers`);
  const [[officers]] = await pool.query(`SELECT COUNT(*) AS total FROM loan_officers`);
  const [[disbursed]] = await pool.query(`SELECT COALESCE(SUM(amount),0) AS total FROM loans WHERE status IN ('disbursed','active','repaid')`);
  const [[paid]] = await pool.query(`SELECT COALESCE(SUM(amount),0) AS total FROM payments`);
  const [[def]] = await pool.query(`SELECT COUNT(*) AS total FROM loans WHERE status = 'defaulted'`);
  const defaultRate = loans.total > 0 ? Number(((def.total / loans.total) * 100).toFixed(1)) : 0;

  // Portfolio mix by product
  const [mix] = await pool.query(
    `SELECT p.name, COUNT(l.id) AS value
     FROM loan_products p LEFT JOIN loans l ON l.product_id = p.id
     GROUP BY p.id, p.name HAVING value > 0`
  );
  // Monthly trend (last 6 months)
  const [trend] = await pool.query(
    `SELECT DATE_FORMAT(applied_at, '%b') AS month,
            ROUND(SUM(amount)/1000000, 2) AS disbursed,
            (SELECT ROUND(COALESCE(SUM(p2.amount),0)/1000000, 2)
               FROM payments p2
              WHERE DATE_FORMAT(p2.paid_at, '%Y-%m') = DATE_FORMAT(loans.applied_at, '%Y-%m')) AS repaid
     FROM loans
     WHERE applied_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
     GROUP BY DATE_FORMAT(applied_at, '%Y-%m'), DATE_FORMAT(applied_at, '%b')
     ORDER BY DATE_FORMAT(applied_at, '%Y-%m')`
  );

  res.json({
    totalLoans: loans.total,
    activeLoans: active.total,
    totalBorrowers: borrowers.total,
    totalOfficers: officers.total,
    totalDisbursed: Number(disbursed.total),
    totalRepaid: Number(paid.total),
    defaultRate,
    portfolioMix: mix,
    monthlyTrend: trend,
  });
}

export async function allLoans(_req, res) {
  const [rows] = await pool.query(
    `SELECT l.*, b.full_name AS borrower_name, p.name AS product_name, o.full_name AS officer_name
     FROM loans l
     JOIN borrowers b ON b.id = l.borrower_id
     JOIN loan_products p ON p.id = l.product_id
     LEFT JOIN loan_officers o ON o.id = l.officer_id
     ORDER BY l.applied_at DESC`
  );
  res.json({ loans: rows });
}

// ---------- admin: users ----------
export async function listUsers(_req, res) {
  const [admins] = await pool.query(`SELECT id, full_name, email, phone, is_active, created_at, 'admin' AS role FROM admins`);
  const [officers] = await pool.query(`SELECT id, full_name, email, phone, is_active, created_at, 'officer' AS role FROM loan_officers`);
  const [borrowers] = await pool.query(`SELECT id, full_name, email, phone, is_active, created_at, 'borrower' AS role FROM borrowers`);
  res.json({ users: [...admins, ...officers, ...borrowers] });
}

export async function toggleUser(req, res) {
  const { role, id } = req.params;
  const map = { admin: "admins", officer: "loan_officers", borrower: "borrowers" };
  const table = map[role];
  if (!table) return res.status(400).json({ error: "Invalid role" });
  await pool.query(`UPDATE ${table} SET is_active = NOT is_active WHERE id = ?`, [id]);
  res.json({ ok: true });
}

// ---------- notifications ----------
export async function myNotifications(req, res) {
  const [rows] = await pool.query(
    `SELECT * FROM notifications WHERE user_id = ? AND user_role = ? ORDER BY created_at DESC`,
    [req.user.id, req.user.role]
  );
  res.json({ notifications: rows });
}

export async function markNotificationRead(req, res) {
  const { id } = req.params;
  await pool.query(
    `UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ? AND user_role = ?`,
    [id, req.user.id, req.user.role]
  );
  res.json({ ok: true });
}
