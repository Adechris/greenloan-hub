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
  id               INT AUTO_INCREMENT PRIMARY KEY,
  name             VARCHAR(100) NOT NULL,
  description      TEXT,
  min_amount       DECIMAL(15,2) NOT NULL,
  max_amount       DECIMAL(15,2) NOT NULL,
  interest_rate    DECIMAL(5,2) NOT NULL, -- monthly %
  min_tenure_months INT NOT NULL,
  max_tenure_months INT NOT NULL,
  is_active        BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
  due_date      DATE NOT NULL,
  amount_due    DECIMAL(15,2) NOT NULL,
  amount_paid   DECIMAL(15,2) DEFAULT 0,
  paid_at       TIMESTAMP NULL,
  status        ENUM('pending','paid','overdue','partial') DEFAULT 'pending',
  FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================
-- NOTIFICATIONS (polymorphic by role)
-- =====================================================

CREATE TABLE notifications (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  user_role   ENUM('admin','officer','borrower') NOT NULL,
  title       VARCHAR(200) NOT NULL,
  message     TEXT,
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
  ('Tunde Bello', 'officer@naijaloan.ng', '+234 803 000 0002', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Lagos HQ', 'LO-001');

INSERT INTO borrowers (full_name, email, phone, password_hash, bvn, state, employment) VALUES
  ('Chiamaka Eze', 'borrower@naijaloan.ng', '+234 803 000 0003', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '12345678901', 'Lagos', 'employed');

INSERT INTO loan_products (name, description, min_amount, max_amount, interest_rate, min_tenure_months, max_tenure_months) VALUES
  ('Quick Cash',     'Fast personal loan for emergencies',           10000,   200000, 5.0, 1, 6),
  ('Salary Advance', 'Up to 50% of monthly salary',                  20000,   500000, 4.0, 1, 3),
  ('SME Boost',      'Working capital for small businesses',         100000, 5000000, 3.5, 3, 24),
  ('Asset Finance',  'Finance vehicles, equipment, and appliances',  200000,10000000, 3.0, 6, 36);

INSERT INTO loans (borrower_id, product_id, amount, interest_rate, tenure_months, purpose, status) VALUES
  (1, 1, 50000, 5.0, 3, 'Medical emergency', 'active');
