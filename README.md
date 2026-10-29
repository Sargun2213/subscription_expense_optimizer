# Subscription Expense Optimization Platform (SubOptima)

<div align="center">

[![CI Build & Test](https://github.com/USER/subscription-expense-optimizer/actions/workflows/ci.yml/badge.svg)](https://github.com/USER/subscription-expense-optimizer/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20.x%20%7C%2022.x%20LTS-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-cyan.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-darkblue.svg)](https://www.prisma.io/)

**"Know what you pay. Discover what you waste. Take control of your subscriptions."**

An enterprise-grade, full-stack SaaS platform to track recurring subscriptions, eliminate redundant tools, forecast renewal commitments, and simulate cost-saving scenarios.

</div>

---

## Quick Push to GitHub Guide

Push this repository to your GitHub account in 3 simple steps:

### 1. Create a new repository on GitHub
- Go to [github.com/new](https://github.com/new)
- Name your repository (e.g., `subscription-expense-optimizer`)
- Do **not** initialize with README or .gitignore (they are already created)
- Click **Create repository**

### 2. Connect & Push from Terminal
Open PowerShell or Terminal inside this project folder:

```bash
# 1. Initialize git (if not already initialized)
git init

# 2. Add all files
git add .

# 3. Create your first commit
git commit -m "feat: initial commit of subscription expense optimization platform"

# 4. Set default branch to main
git branch -M main

# 5. Link your GitHub remote repository (replace with your actual GitHub URL)
git remote add origin https://github.com/YOUR_USERNAME/subscription-expense-optimizer.git

# 6. Push to GitHub
git push -u origin main
```

---

## Architectural Highlights

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Recharts, React Router v6, React Hook Form, Zod.
- **Backend API**: Node.js (v20+ / v24+ LTS), Express, TypeScript, REST API architecture, JWT authentication with salted bcrypt password hashing, Zod validation, Helmet security headers, rate limiting.
- **Database & ORM**: Prisma ORM with relational schema, foreign key cascading, and indexes.
  - **Local Development**: Built-in SQLite (`dev.db`) with zero setup required.
  - **Production Ready**: PostgreSQL 16 schema (`schema.postgresql.prisma`) and `docker-compose.yml`.
- **Automated CI/CD**: GitHub Actions workflow (`.github/workflows/ci.yml`) testing builds and 33 unit/integration tests across Node 20.x & 22.x.

---

## Core Capabilities

1. **Centralized Hub (`/subscriptions`)**:
   - Manage subscriptions with categories, amounts, currencies, billing frequencies (Weekly, Monthly, Quarterly, Half-Yearly, Yearly), start dates, renewal dates, and usage assessments.
   - Switch between high-density Table View and Card Grid View.
   - Real-time search, multi-category filters, status filters, and sorting.

2. **Authoritative Financial Calculation Engine**:
   - Normalized monthly costs:
     - Weekly: `Cost × 52 ÷ 12`
     - Monthly: `Cost`
     - Quarterly: `Cost ÷ 3`
     - Half-Yearly: `Cost ÷ 6`
     - Yearly: `Cost ÷ 12`
   - Annualized commitment projection.
   - Real calendar renewal date calculations.
   - Cancelled subscriptions cleanly excluded from future recurring projections.

3. **Rule-Based Savings Optimizer (`/optimizer`)**:
   - Detects self-assessed `UNUSED` subscriptions.
   - Identifies overlapping subscriptions in identical categories (e.g., Streaming, Cloud Storage, Design tools).
   - Flags high-cost services with reported `LOW` usage for downgrade or plan rationalization (~50% savings benchmark).
   - Renewal lock-in alerts for quarterly and annual commitments due within 14 days.
   - Duplicate active records detection.
   - Transparent, explainable assumptions behind every single recommendation.

4. **Interactive Savings Scenario Simulator**:
   - Interactive checklist to simulate cancelling or downgrading subscriptions.
   - Real-time before-and-after comparison of current spend vs. hypothetical spend.
   - Save custom scenarios to database for team and personal budget planning.

5. **Expense Analytics (`/analytics`)**:
   - 12-month expense trend projection.
   - Category distribution (bar chart & percentage share).
   - Billing cadence breakdown (pie chart).
   - Most expensive subscriptions ranking.
   - Renewal velocity horizon (7, 14, 30, and 60 days).
   - Single-currency grouping to prevent inaccurate cross-currency summation.

6. **Account & Settings (`/settings`)**:
   - User profile management (name, preferred currency, timezone).
   - Advance renewal notification thresholds (1, 3, 7, 14 days).
   - **One-click CSV Data Export**: Full dataset export with normalized metrics.
   - **Cascade Account Deletion**: Password-confirmed workflow that permanently erases all associated data.

---

## Local Setup Instructions (For Cloned Repositories)

### 1. Prerequisites
- [Node.js](https://nodejs.org/) v18.0.0+ (v20+ or v24+ LTS recommended)
- npm v9.0.0+

### 2. Install Dependencies
```bash
# Install root, backend, and frontend dependencies
npm run install:all
```

### 3. Initialize Database
```bash
cd backend
npx prisma db push
```

### 4. Seed Development Data (Optional)
```bash
npm run prisma:seed
```
*Pre-configured demo credentials:*
- **Email**: `demo@suboptimizer.io`
- **Password**: `DemoPassword123!`

### 5. Launch Application
```bash
# From project root:
.\start.ps1   # Windows PowerShell
# or
start.bat     # Windows Command Prompt

# Or manually:
npm run backend   # Backend API on http://localhost:5000
npm run frontend  # Frontend UI on http://localhost:5173
```

---

## Automated Test Suite

Run unit and integration tests via Vitest:

```bash
npm test
```

```text
✓ src/tests/recommendations.test.ts (4 tests)
✓ src/tests/calculations.test.ts (18 tests)
✓ src/tests/api.test.ts (11 tests)

Test Files:  3 passed (3)
Tests:       33 passed (33)
Duration:    1.37s
```

---

## Production Build

```bash
npm run build
```
Builds both the backend TypeScript distribution into `backend/dist` and bundles the frontend into `frontend/dist` with 0 errors.

---

## Security Policy

- All passwords hashed using `bcrypt` (10 salt rounds).
- JWT tokens with configurable expiration and server-side verification.
- Ownership checks on all database queries (`where: { userId }`).
- Helmet HTTP headers and express rate limiting.
- Zero collection of banking credentials or payment card numbers.

---

## License

This project is licensed under the [MIT License](LICENSE).
