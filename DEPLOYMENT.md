# Deployment Guide

## Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Redis 7+ (for queues/caching)
- Docker & Docker Compose (optional)
- Stripe account (for subscriptions)
- Resend account (for emails)
- OpenAI API key (for AI features)

## Environment Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/habitforge.git
   cd habitforge
   ```

2. Copy environment file:
   ```bash
   cp .env.example .env
   ```

3. Fill in all required environment variables (see reference below).

## Database Setup

### Prisma Migrate

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database
npx tsx scripts/seed.ts
```

### Production Migration

```bash
npx prisma migrate deploy
```

## Docker Deployment

### Build and Run

```bash
# Build images
docker compose build

# Start services
docker compose up -d

# View logs
docker compose logs -f
```

### Health Checks

- App: `http://localhost:3000/api/health`
- Database: `pg_isready -U habitforge`
- Redis: `redis-cli ping`

## Vercel Deployment

### Setup

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Link project:
   ```bash
   vercel link
   ```

3. Set environment variables:
   ```bash
   vercel env add DATABASE_URL
   ```

4. Deploy:
   ```bash
   vercel --prod
   ```

### Environment Variables on Vercel

All variables from `.env.example` need to be added to Vercel's dashboard or via CLI.

## AWS Deployment

### ECS with Fargate

1. Build and push Docker image to ECR
2. Create ECS task definition with environment variables
3. Configure service with load balancer
4. Set up auto-scaling based on CPU/memory

### RDS for PostgreSQL

- Use RDS PostgreSQL 16
- Enable automated backups (7-day retention)
- Enable encryption at rest
- Use Security Groups for network isolation

### ElastiCache for Redis

- Use ElastiCache Redis 7
- Enable encryption in transit and at rest
- Deploy in private subnets

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `AUTH_SECRET` | NextAuth.js encryption secret | Yes |
| `AUTH_URL` | Application base URL | Yes |
| `AUTH_GOOGLE_ID` | Google OAuth client ID | No |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret | No |
| `AUTH_GITHUB_ID` | GitHub OAuth client ID | No |
| `AUTH_GITHUB_SECRET` | GitHub OAuth client secret | No |
| `STRIPE_SECRET_KEY` | Stripe API secret key | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | Yes |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Yes |
| `STRIPE_PRO_PRICE_ID` | Stripe price ID for Pro plan | Yes |
| `STRIPE_TEAMS_PRICE_ID` | Stripe price ID for Teams plan | Yes |
| `OPENAI_API_KEY` | OpenAI API key for AI coach | No |
| `RESEND_API_KEY` | Resend API key for emails | Yes |
| `RESEND_FROM_EMAIL` | From address for emails | Yes |
| `REDIS_URL` | Redis connection string | No |
| `NEXT_PUBLIC_APP_URL` | Public application URL | Yes |
| `NEXT_PUBLIC_APP_NAME` | Application display name | Yes |
| `SENTRY_DSN` | Sentry DSN for error tracking | No |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog project API key | No |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog instance host | No |

## CI/CD Pipeline

### GitHub Actions

The CI pipeline (`ci.yml`) runs on push/PR to main:
1. **Lint**: TypeScript check + ESLint
2. **Test**: Vitest with PostgreSQL service container
3. **Build**: Next.js production build
4. **Docker**: Build and push to GitHub Container Registry

The deployment pipeline (`deploy.yml`) runs after CI passes:
1. **Vercel**: Deploy to Vercel production
2. **AWS ECS**: Deploy to ECS Fargate cluster

## Monitoring Setup

### Sentry (Error Tracking)
- Set `SENTRY_DSN` to enable error reporting
- Captures server-side and client-side errors
- Performance tracing enabled for API routes

### PostHog (Analytics)
- Set `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST`
- Tracks page views, feature usage, and user events
- Self-hosted option available

### Custom Monitoring
- Health check endpoint: `GET /api/health`
- Prometheus metrics (if configured)
- Uptime monitoring via third-party service

## Backup Strategy

### Automated Database Backups

Run the backup script via cron:
```bash
0 3 * * * /path/to/scripts/backup.sh --s3
```

Backup features:
- Daily pg_dump with timestamp
- gzip compression
- S3 upload (optional)
- 30-day retention

### Restore Procedure

```bash
# List available backups
ls -la backups/

# Restore from backup
gunzip -c backups/habitforge_20240101_030000.sql.gz | psql -h localhost -U postgres -d habitforge
```

## Scaling Considerations

### Database
- Use connection pooling (PgBouncer) for high concurrency
- Implement read replicas for analytics queries
- Regular VACUUM and ANALYZE maintenance

### Application
- Horizontal scaling via container orchestration
- Redis caching for session data and rate limiting
- CDN for static assets and public images
- Queue background jobs (email, analytics, AI processing)

### Cost Optimization
- Auto-scaling based on traffic patterns
- Reserved instances for baseline capacity
- Spot instances for batch processing
- Cache frequently accessed data
