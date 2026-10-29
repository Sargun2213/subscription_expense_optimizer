# Contributing to SubOptima

Thank you for your interest in contributing to the **Subscription Expense Optimization Platform**!

## Development Setup

1. **Fork & Clone**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/subscription-expense-optimizer.git
   cd subscription-expense-optimizer
   ```

2. **Install Dependencies**:
   ```bash
   npm run install:all
   ```

3. **Initialize Database**:
   ```bash
   cd backend
   npx prisma db push
   npm run prisma:seed # optional seed demo data
   ```

4. **Launch Dev Servers**:
   ```bash
   # From root:
   npm run backend   # Starts API on http://localhost:5000
   npm run frontend  # Starts UI on http://localhost:5173
   ```

## Running Tests

Before submitting a Pull Request, verify all tests pass:

```bash
npm run test
```

## Pull Request Guidelines

- Branch naming: `feature/your-feature-name` or `fix/issue-description`
- Keep commits clear, concise, and focused.
- Ensure all Vitest tests and TypeScript builds pass without errors.
- Document any new environment variables in `.env.example`.
