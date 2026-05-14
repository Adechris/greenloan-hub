import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes/index.js";
import { pingDb } from "./config/db.js";

dotenv.config();
const app = express();

const origins = (process.env.CORS_ORIGIN || "*")
  .split(",")
  .map((s) => s.trim());

app.use(cors({ origin: origins.includes("*") ? true : origins, credentials: true }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "naijaloan-api" }));
app.use("/api", routes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Server error" });
});

const PORT = Number(process.env.PORT) || 4000;

pingDb()
  .then(() => {
    app.listen(PORT, () => console.log(`✅ NaijaLoan API on http://localhost:${PORT}`));
  })
  .catch((e) => {
    console.error("❌ Database connection failed:", e.message);
    console.error("   Make sure MySQL is running and .env is configured. Run: npm run db:init");
    process.exit(1);
  });
