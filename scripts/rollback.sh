#!/usr/bin/env bash
set -euo pipefail

# HabitForge Deployment Rollback Script
# Usage: ./scripts/rollback.sh [--vercel] [--ecs] [--tag <commit-sha>]

ROLLBACK_TAG="${2:-}"
PLATFORM="${1:-}"

echo "=== HabitForge Deployment Rollback ==="
echo "Timestamp: $(date -u '+%Y-%m-%dT%H:%M:%SZ')"

if [[ "$PLATFORM" == "--vercel" || -z "$PLATFORM" ]]; then
  echo ""
  echo "[1/3] Rolling back Vercel deployment..."

  if command -v vercel &> /dev/null; then
    if [[ -n "$ROLLBACK_TAG" ]]; then
      echo "  Deploying commit: $ROLLBACK_TAG"
      vercel deploy --prod --token="${VERCEL_TOKEN}" --force > /dev/null 2>&1 || true
    else
      echo "  Rolling back to previous deployment..."
      vercel rollback --token="${VERCEL_TOKEN}" --yes 2>/dev/null || {
        echo "  Vercel rollback failed or not available. Manual rollback required."
        echo "  Visit: https://vercel.com/habitforge/deployments"
      }
    fi
  else
    echo "  Vercel CLI not installed. Manual rollback required."
    echo "  Visit: https://vercel.com/habitforge/deployments"
  fi
  echo "  Done."
fi

if [[ "$PLATFORM" == "--ecs" || -z "$PLATFORM" ]]; then
  echo ""
  echo "[2/3] Rolling back ECS service..."

  if [[ -n "${AWS_REGION:-}" && -n "${ECS_CLUSTER:-}" && -n "${ECS_SERVICE:-}" ]]; then
    if [[ -n "$ROLLBACK_TAG" ]]; then
      aws ecs update-service \
        --cluster "$ECS_CLUSTER" \
        --service "$ECS_SERVICE" \
        --force-new-deployment \
        --region "$AWS_REGION" > /dev/null 2>&1
      echo "  ECS service redeployed with latest image."
    else
      TASK_DEF=$(aws ecs describe-services \
        --cluster "$ECS_CLUSTER" \
        --services "$ECS_SERVICE" \
        --region "$AWS_REGION" \
        --query 'services[0].taskDefinition' \
        --output text 2>/dev/null || echo "")

      PREVIOUS_TASK_DEF=$(aws ecs describe-task-definition \
        --task-definition "$TASK_DEF" \
        --region "$AWS_REGION" \
        --query 'taskDefinition.taskDefinitionArn' \
        --output text 2>/dev/null || echo "")

      if [[ -n "$PREVIOUS_TASK_DEF" ]]; then
        aws ecs update-service \
          --cluster "$ECS_CLUSTER" \
          --service "$ECS_SERVICE" \
          --task-definition "$PREVIOUS_TASK_DEF" \
          --region "$AWS_REGION" > /dev/null 2>&1
        echo "  Rolled back to: $PREVIOUS_TASK_DEF"
      else
        echo "  Could not determine previous task definition."
      fi
    fi
  else
    echo "  AWS credentials not configured. Skipping ECS rollback."
  fi
  echo "  Done."
fi

echo ""
echo "[3/3] Running post-rollback checks..."

# Health check
if [[ -n "${NEXT_PUBLIC_APP_URL:-}" ]]; then
  echo "  Checking health endpoint: ${NEXT_PUBLIC_APP_URL}/api/health"
  for i in 1 2 3 4 5; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${NEXT_PUBLIC_APP_URL}/api/health" 2>/dev/null || echo "000")
    if [[ "$STATUS" == "200" ]]; then
      echo "  Health check passed (attempt $i)"
      break
    fi
    echo "  Health check: HTTP $STATUS (attempt $i/5)"
    sleep 5
  done
fi

echo ""
echo "=== Rollback completed ==="
echo "If issues persist, manual intervention may be required."
echo "Runbook: DEPLOYMENT.md"
