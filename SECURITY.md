# Security Policy

## Authentication Flow

HabitForge uses NextAuth.js v5 with JWT-based sessions. Authentication supports:
- Credential-based login (email/password) with bcrypt hashing
- OAuth via Google and GitHub providers
- Session tokens stored as HTTP-only cookies
- JWT signing using `AUTH_SECRET` environment variable
- Token refresh and rotation on session update

### Password Security
- Passwords are hashed with bcrypt (cost factor 12)
- Minimum password length: 8 characters
- Rate limiting on login endpoints (5 attempts per minute per IP)

## CSRF Protection

- Next.js Server Actions have built-in CSRF protection via origin checking
- NextAuth.js includes CSRF token validation on all auth endpoints
- Custom API routes use double-submit cookie pattern
- CORS is restricted to the app's own origin

## XSS Prevention

- React's built-in JSX escaping prevents script injection
- Content Security Policy (CSP) headers restrict script sources
- All user-generated content is sanitized before rendering
- HTTP-only cookies prevent JavaScript access to session tokens
- `X-Content-Type-Options: nosniff` header prevents MIME-type sniffing

## SQL Injection Prevention

- Prisma ORM parameterizes all database queries
- Raw queries are never used; all database access goes through Prisma
- Input validation via Zod schemas on all API endpoints

## Rate Limiting Strategy

- In-memory rate limiter for auth endpoints (5 req/min per IP)
- API rate limits: 60 req/min for authenticated, 20 req/min for unauthenticated
- Email rate limits: 3 req/min per user (password reset, welcome emails)
- Rate limit headers returned: `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- Production deployments should use Redis-based rate limiting

## Data Encryption

- All traffic encrypted via TLS/HTTPS (enforced by HSTS)
- Sensitive user data encrypted at rest using AES-256-GCM
- Environment variables for secrets; never logged or exposed
- Database credentials stored in environment variables, not in code

## Session Management

- JWT sessions with configurable expiry (default: 30 days)
- Sessions invalidated on password change
- Admin can revoke any user session
- Session cookie set with `HttpOnly`, `Secure`, `SameSite=Lax` flags

## API Security

- All API routes protected by authentication middleware
- Role-based access control (USER, ADMIN) on admin endpoints
- API usage tracking per user for billing and abuse prevention
- Webhook endpoints validate signatures (Stripe webhook secret)
- Request validation with Zod schemas

## Dependencies Scanning

- Automated Dependabot alerts enabled on GitHub
- `npm audit` runs in CI pipeline
- Regular dependency updates via automated PRs
- Known vulnerable dependencies blocked in CI

## Incident Response Plan

1. **Detection**: Monitoring via Sentry error tracking, PostHog analytics anomalies
2. **Containment**: Rate limiting, feature flag disablement, account suspension
3. **Analysis**: Review audit logs, identify affected users and data
4. **Recovery**: Patch vulnerability, restore from backup if needed
5. **Notification**: Inform affected users within 72 hours (GDPR compliance)
6. **Post-mortem**: Document incident, update security measures

## Reporting Vulnerabilities

Report security vulnerabilities to security@habitforge.com. You can expect:
- Acknowledgment within 24 hours
- Status update within 72 hours
- Fix timeline communicated within 1 week

## Compliance

- GDPR compliant (data deletion, portability, consent)
- CCPA compliant (opt-out, data access)
- SOC 2 compliance in progress
- Regular third-party security audits
