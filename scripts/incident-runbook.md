# HabitForge Incident Runbook

## Severity Levels

| Level | Response Time | Example |
|-------|--------------|---------|
| **SEV1** | 15 min | Site down, data loss, auth broken |
| **SEV2** | 1 hour | Feature broken, slow responses |
| **SEV3** | 24 hours | UI bug, cosmetic issue |

## Quick Commands

```bash
# Rollback
./scripts/rollback.sh --vercel

# Check health
curl https://habitforge.com/api/health

# Check DB connection
npx prisma db push --dry-run

# Check Redis
redis-cli -u $REDIS_URL ping

# View logs (Vercel)
vercel logs --token=$VERCEL_TOKEN

# Run migrations
npx prisma migrate deploy
```

## Common Incidents

### Site Down (SEV1)
1. Check Vercel status: https://vercel-status.com
2. Check Neon DB status: https://neon.status.io
3. Rollback: `./scripts/rollback.sh --vercel`
4. If DB issue: `npx prisma migrate deploy`

### Auth Broken (SEV1)
1. Check `AUTH_SECRET` is set in Vercel env
2. Check OAuth provider credentials
3. Verify `AUTH_URL` matches production domain

### AI Not Responding (SEV2)
1. Check OpenAI API key in env
2. Check circuit breaker: restarts automatically after 60s
3. Check rate limits: `redis-cli keys "ratelimit:*"`

### Database Slow (SEV2)
1. Check Neon pool limits in dashboard
2. `prisma studio` to inspect query volume
3. Run security: `npm run security:sql-scan`

### Payment Failed (SEV2)
1. Check Stripe dashboard for webhook errors
2. Verify `STRIPE_WEBHOOK_SECRET` matches Stripe
3. Check webhook endpoint url matches production

## Monitoring

- **Uptime**: Better Uptime (configured per project)
- **Errors**: Sentry dashboard
- **Analytics**: PostHog
- **Logs**: Vercel logs / Axiom
- **DB**: Neon dashboard
- **Redis**: Upstash dashboard

## Escalation

1. Check runbook for standard fix
2. Rollback if fix takes > 30 min (SEV1)
3. Tag on-call in #incidents Discord channel
