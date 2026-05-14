import { pool } from "../config/db.js";

export async function listProducts(_req, res) {
  const [rows] = await pool.query(`SELECT * FROM loan_products WHERE is_active = TRUE`);
  res.json({ products: rows });
}

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
  res.status(201).json({ id: result.insertId });
}

export async function myLoans(req, res) {
  if (req.user.role !== "borrower") return res.status(403).json({ error: "Forbidden" });
  const [rows] = await pool.query(
    `SELECT l.*, p.name AS product_name FROM loans l
     JOIN loan_products p ON p.id = l.product_id
     WHERE l.borrower_id = ? ORDER BY l.applied_at DESC`,
    [req.user.id]
  );
  res.json({ loans: rows });
}

export async function reviewQueue(_req, res) {
  const [rows] = await pool.query(
    `SELECT l.*, b.full_name AS borrower_name, b.email AS borrower_email, p.name AS product_name
     FROM loans l
     JOIN borrowers b ON b.id = l.borrower_id
     JOIN loan_products p ON p.id = l.product_id
     WHERE l.status IN ('pending','under_review')
     ORDER BY l.applied_at ASC`
  );
  res.json({ loans: rows });
}

export async function decideLoan(req, res) {
  const { id } = req.params;
  const { action, reason } = req.body || {}; // approve | reject
  if (!["approve", "reject"].includes(action)) return res.status(400).json({ error: "Invalid action" });
  const status = action === "approve" ? "approved" : "rejected";
  await pool.query(
    `UPDATE loans SET status = ?, officer_id = ?, rejection_reason = ?, reviewed_at = NOW() WHERE id = ?`,
    [status, req.user.id, action === "reject" ? reason || null : null, id]
  );
  res.json({ ok: true });
}

export async function adminStats(_req, res) {
  const [[loans]] = await pool.query(`SELECT COUNT(*) AS total FROM loans`);
  const [[active]] = await pool.query(`SELECT COUNT(*) AS total FROM loans WHERE status IN ('approved','disbursed','active')`);
  const [[borrowers]] = await pool.query(`SELECT COUNT(*) AS total FROM borrowers`);
  const [[officers]] = await pool.query(`SELECT COUNT(*) AS total FROM loan_officers`);
  const [[disbursed]] = await pool.query(`SELECT COALESCE(SUM(amount),0) AS total FROM loans WHERE status IN ('disbursed','active','repaid')`);
  res.json({
    totalLoans: loans.total,
    activeLoans: active.total,
    totalBorrowers: borrowers.total,
    totalOfficers: officers.total,
    totalDisbursed: Number(disbursed.total),
  });
}
