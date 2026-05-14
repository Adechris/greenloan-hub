-- =====================================================
-- NaijaLoan Database Schema
-- MySQL 8.0+
-- Run: mysql -u root -p < main.sql
-- =====================================================

DROP DATABASE IF EXISTS naijaloan;
CREATE DATABASE naijaloan CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE naijaloan;

-- =====================================================
-- USER TABLES (separated by role)
-- =====================================================

CREATE TABLE admins (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  full_name     VARCHAR(150) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  phone         VARCHAR(30),
  password_hash VARCHAR(255) NOT NULL,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE loan_officers (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  full_name     VARCHAR(150) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  phone         VARCHAR(30),
  password_hash VARCHAR(255) NOT NULL,
  branch        VARCHAR(100),
  staff_id      VARCHAR(50) UNIQUE,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE borrowers (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  full_name       VARCHAR(150) NOT NULL,
  email           VARCHAR(150) NOT NULL UNIQUE,
  phone           VARCHAR(30),
  password_hash   VARCHAR(255) NOT NULL,
  bvn             VARCHAR(11) UNIQUE,
  nin             VARCHAR(11),
  state           VARCHAR(50),
  employment      VARCHAR(50),
  bank_name       VARCHAR(100),
  bank_account    VARCHAR(20),
  bank_holder     VARCHAR(150),
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================================
-- LOAN PRODUCTS
-- =====================================================

CREATE TABLE loan_products (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  name              VARCHAR(100) NOT NULL,
  description       TEXT,
  min_amount        DECIMAL(15,2) NOT NULL,
  max_amount        DECIMAL(15,2) NOT NULL,
  interest_rate     DECIMAL(5,2) NOT NULL, -- annual %
  min_tenure_months INT NOT NULL,
  max_tenure_months INT NOT NULL,
  is_active         BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================================
-- LOANS
-- =====================================================

CREATE TABLE loans (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  borrower_id       INT NOT NULL,
  product_id        INT NOT NULL,
  officer_id        INT NULL,
  amount            DECIMAL(15,2) NOT NULL,
  interest_rate     DECIMAL(5,2) NOT NULL,
  tenure_months     INT NOT NULL,
  purpose           VARCHAR(255),
  status            ENUM('pending','under_review','approved','rejected','disbursed','active','repaid','defaulted') DEFAULT 'pending',
  rejection_reason  TEXT,
  applied_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at       TIMESTAMP NULL,
  disbursed_at      TIMESTAMP NULL,
  FOREIGN KEY (borrower_id) REFERENCES borrowers(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id)  REFERENCES loan_products(id),
  FOREIGN KEY (officer_id)  REFERENCES loan_officers(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================
-- REPAYMENT SCHEDULE
-- =====================================================

CREATE TABLE repayments (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  loan_id       INT NOT NULL,
  installment   INT NOT NULL,
  due_date      DATE NOT NULL,
  principal     DECIMAL(15,2) NOT NULL DEFAULT 0,
  interest      DECIMAL(15,2) NOT NULL DEFAULT 0,
  amount_due    DECIMAL(15,2) NOT NULL,
  amount_paid   DECIMAL(15,2) DEFAULT 0,
  paid_at       TIMESTAMP NULL,
  status        ENUM('pending','paid','overdue','partial') DEFAULT 'pending',
  FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================
-- PAYMENTS (transaction log)
-- =====================================================

CREATE TABLE payments (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  loan_id       INT NOT NULL,
  amount        DECIMAL(15,2) NOT NULL,
  method        VARCHAR(50) NOT NULL,
  reference     VARCHAR(100) NOT NULL,
  paid_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================
-- NOTIFICATIONS
-- =====================================================

CREATE TABLE notifications (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  user_role   ENUM('admin','officer','borrower') NOT NULL,
  title       VARCHAR(200) NOT NULL,
  message     TEXT,
  type        ENUM('info','success','warning','error') DEFAULT 'info',
  is_read     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_id, user_role)
) ENGINE=InnoDB;

-- =====================================================
-- SEED DATA
-- =====================================================
-- Demo password for all seeded users: "password123"
-- bcrypt hash (10 rounds): $2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

INSERT INTO admins (full_name, email, phone, password_hash) VALUES
  ('Adaeze Okafor', 'admin@naijaloan.ng', '+234 803 000 0001', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy');

INSERT INTO loan_officers (full_name, email, phone, password_hash, branch, staff_id) VALUES
  ('Tunde Bello', 'officer@naijaloan.ng', '+234 803 000 0002', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Lagos HQ', 'LO-001'),
  ('Ngozi Okonkwo', 'ngozi@naijaloan.ng', '+234 803 000 0010', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Abuja', 'LO-002');

INSERT INTO borrowers (full_name, email, phone, password_hash, bvn, state, employment) VALUES
  ('Chiamaka Eze',    'borrower@naijaloan.ng', '+234 803 000 0003', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '12345678901', 'Lagos',  'employed'),
  ('Emeka Nwosu',     'emeka@example.com',     '+234 803 000 0004', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '12345678902', 'Anambra','self-employed'),
  ('Aisha Bello',     'aisha@example.com',     '+234 803 000 0005', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '12345678903', 'Kano',   'employed'),
  ('Olumide Adeyemi', 'olu@example.com',       '+234 803 000 0006', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '12345678904', 'Oyo',    'business'),
  ('Funke Akindele',  'funke@example.com',     '+234 803 000 0007', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '12345678905', 'Lagos',  'employed'),
  ('Bola Ahmed',      'bola@example.com',      '+234 803 000 0008', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '12345678906', 'FCT',    'self-employed');

INSERT INTO loan_products (name, description, min_amount, max_amount, interest_rate, min_tenure_months, max_tenure_months) VALUES
  ('Personal Loan',  'Flexible personal loan',                       50000,  2000000, 18.0, 3,  24),
  ('SME Loan',       'Working capital for small businesses',         200000,10000000, 22.0, 6,  36),
  ('Emergency Loan', 'Fast cash for urgent needs',                   20000,   500000, 15.0, 1,   6),
  ('Asset Finance',  'Finance vehicles, equipment, and appliances',  200000,10000000, 20.0, 6,  36);

INSERT INTO loans (borrower_id, product_id, officer_id, amount, interest_rate, tenure_months, purpose, status, applied_at) VALUES
  (1, 1, 1,  500000, 18.0, 12, 'Home renovation',    'active',       '2026-01-15 09:00:00'),
  (1, 3, 1,  100000, 15.0,  3, 'Medical bills',      'repaid',       '2025-09-02 10:00:00'),
  (2, 2, 1, 2500000, 22.0, 24, 'Inventory purchase', 'pending',      '2026-04-18 12:00:00'),
  (3, 1, 1,  750000, 18.0, 18, 'School fees',        'under_review', '2026-04-20 14:00:00'),
  (4, 2, 1, 4000000, 22.0, 36, 'Equipment purchase', 'approved',     '2026-04-10 11:00:00'),
  (5, 1, 1,  300000, 18.0,  6, 'Travel',             'disbursed',    '2026-03-28 08:30:00'),
  (6, 3, 1,   80000, 15.0,  3, 'Car repair',         'rejected',     '2026-04-05 15:00:00');

-- Repayment schedule for loan #1 (500k, 18%, 12m) — first 4 paid
INSERT INTO repayments (loan_id, installment, due_date, principal, interest, amount_due, amount_paid, paid_at, status) VALUES
  (1, 1, '2026-02-05', 38333, 7500, 45833, 45833, '2026-02-05 10:00:00', 'paid'),
  (1, 2, '2026-03-05', 38908, 6925, 45833, 45833, '2026-03-05 10:00:00', 'paid'),
  (1, 3, '2026-04-05', 39491, 6342, 45833, 45833, '2026-04-05 10:00:00', 'paid'),
  (1, 4, '2026-05-05', 40084, 5749, 45833, 0, NULL, 'pending'),
  (1, 5, '2026-06-05', 40685, 5148, 45833, 0, NULL, 'pending'),
  (1, 6, '2026-07-05', 41295, 4538, 45833, 0, NULL, 'pending'),
  (1, 7, '2026-08-05', 41915, 3918, 45833, 0, NULL, 'pending'),
  (1, 8, '2026-09-05', 42543, 3290, 45833, 0, NULL, 'pending'),
  (1, 9, '2026-10-05', 43181, 2652, 45833, 0, NULL, 'pending'),
  (1,10, '2026-11-05', 43829, 2004, 45833, 0, NULL, 'pending'),
  (1,11, '2026-12-05', 44486, 1347, 45833, 0, NULL, 'pending'),
  (1,12, '2027-01-05', 45154,  679, 45833, 0, NULL, 'pending');

INSERT INTO payments (loan_id, amount, method, reference, paid_at) VALUES
  (1, 45833, 'Bank Transfer', 'TRF/260205/9281', '2026-02-05 10:00:00'),
  (1, 45833, 'Bank Transfer', 'TRF/260305/4112', '2026-03-05 10:00:00'),
  (1, 45833, 'Card',          'PAY/260405/7733', '2026-04-05 10:00:00'),
  (2,  35000,'Bank Transfer', 'TRF/251202/2210', '2025-12-02 10:00:00');

INSERT INTO notifications (user_id, user_role, title, message, type, is_read, created_at) VALUES
  (1, 'borrower', 'Loan repayment due in 3 days', 'Your installment of ₦45,833 for loan #1 is due on May 5, 2026.', 'warning', FALSE, '2026-04-22 09:00:00'),
  (1, 'borrower', 'Payment received',              'We received your repayment of ₦45,833. Thank you!',             'success', TRUE,  '2026-04-05 10:00:00'),
  (1, 'borrower', 'Loan approved',                 'Your Personal Loan of ₦500,000 has been approved.',             'success', TRUE,  '2026-01-18 12:00:00'),
  (1, 'admin',    'New application',               'Emeka Nwosu applied for ₦2,500,000 SME Loan.',                  'info',    FALSE, '2026-04-18 12:05:00'),
  (1, 'officer',  'New application assigned',      'Aisha Bello — Personal Loan ₦750,000.',                          'info',    FALSE, '2026-04-20 14:01:00');
