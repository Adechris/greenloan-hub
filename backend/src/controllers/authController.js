import bcrypt from "bcryptjs";
import { pool } from "../config/db.js";
import { ROLE_TABLE, VALID_ROLES } from "../utils/roles.js";
import { signToken } from "../middleware/auth.js";

function publicUser(row, role) {
  if (!row) return null;
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    role,
    state: row.state ?? null,
  };
}

export async function login(req, res) {
  const { email, password, role } = req.body || {};
  if (!email || !password || !VALID_ROLES.includes(role)) {
    return res.status(400).json({ error: "email, password and valid role are required" });
  }
  const table = ROLE_TABLE[role];
  const [rows] = await pool.query(`SELECT * FROM ${table} WHERE email = ? LIMIT 1`, [email]);
  const user = rows[0];
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = signToken({ id: user.id, role, email: user.email });
  res.json({ token, user: publicUser(user, role) });
}

export async function registerBorrower(req, res) {
  const { fullName, email, phone, password, bvn, nin, state, employment } = req.body || {};
  if (!fullName || !email || !password || !bvn) {
    return res.status(400).json({ error: "fullName, email, password and bvn are required" });
  }
  if (String(bvn).length !== 11) {
    return res.status(400).json({ error: "BVN must be 11 digits" });
  }
  const hash = await bcrypt.hash(password, 10);
  try {
    const [result] = await pool.query(
      `INSERT INTO borrowers (full_name, email, phone, password_hash, bvn, nin, state, employment)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [fullName, email, phone || null, hash, bvn, nin || null, state || null, employment || null]
    );
    const [rows] = await pool.query(`SELECT * FROM borrowers WHERE id = ?`, [result.insertId]);
    const token = signToken({ id: result.insertId, role: "borrower", email });
    res.status(201).json({ token, user: publicUser(rows[0], "borrower") });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "Email or BVN already registered" });
    throw e;
  }
}

export async function me(req, res) {
  const { id, role } = req.user;
  const table = ROLE_TABLE[role];
  const [rows] = await pool.query(`SELECT * FROM ${table} WHERE id = ?`, [id]);
  res.json({ user: publicUser(rows[0], role) });
}
