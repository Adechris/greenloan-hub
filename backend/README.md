# NaijaLoan Backend

Express + MySQL backend for the NaijaLoan app. Each user role has its own table:
`admins`, `loan_officers`, `borrowers`.

## Setup

```bash
cd backend
cp .env.example .env       # then edit DB_PASSWORD, JWT_SECRET
npm install

# Create database & seed (requires MySQL running)
mysql -u root -p < db/main.sql

# Start
npm run dev                # http://localhost:4000
```

## Demo accounts (password for all: `password123`)

| Role     | Email                     |
|----------|---------------------------|
| Admin    | admin@naijaloan.ng        |
| Officer  | officer@naijaloan.ng      |
| Borrower | borrower@naijaloan.ng     |

## Endpoints

- `POST /api/auth/login`              `{ email, password, role }`
- `POST /api/auth/register`           borrower self-signup
- `GET  /api/auth/me`                 (auth)
- `GET  /api/products`                loan products
- `POST /api/loans/apply`             (borrower)
- `GET  /api/loans/mine`              (borrower)
- `GET  /api/officer/queue`           (officer/admin)
- `POST /api/officer/loans/:id/decide` (officer/admin) `{ action: "approve"|"reject", reason? }`
- `GET  /api/loans/:id`               loan details + schedule + payments
- `POST /api/loans/:id/payment`       record a payment
- `POST /api/products`  `PATCH /api/products/:id`   (admin) manage products
- `GET  /api/admin/stats`             (admin) portfolio stats + trend + mix
- `GET  /api/admin/loans`             (admin) all loans
- `GET  /api/admin/users`             (admin) all users across role tables
- `PATCH /api/admin/users/:role/:id/toggle`  (admin) activate/deactivate
- `GET  /api/notifications`  `PATCH /api/notifications/:id/read`

## Frontend

The React app reads the API base URL from `VITE_API_URL` (defaults to `http://localhost:4000/api`).
Add to the project root `.env`:

```
VITE_API_URL=http://localhost:4000/api
```
