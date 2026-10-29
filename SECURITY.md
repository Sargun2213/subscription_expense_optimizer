# Security Policy

## Reporting Security Issues

We take the security of SubOptima and our users' financial privacy seriously.

If you believe you have discovered a vulnerability, please do NOT file a public issue on GitHub.
Instead, please contact our team directly via email or private vulnerability disclosure.

## Security Guarantees & Practices

- **Zero Plaintext Passwords**: All user passwords are salted and hashed using `bcrypt` (10 rounds).
- **Tenant Isolation**: Every database query for subscriptions, recommendations, and analytics strictly enforces ownership checks (`where: { userId }`).
- **Data Privacy**: No banking credentials, debit/credit card numbers, or sensitive financial tokens are ever collected or stored.
- **CSRF & XSS Protections**: Standard helmet headers and input sanitization via strict Zod schemas.
