#!/usr/bin/env bash
set -euo pipefail

# Database backup script for HabitForge
# Usage: ./scripts/backup.sh [--s3]

DB_NAME="${DB_NAME:-habitforge}"
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
S3_BUCKET="${S3_BUCKET:-}"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="${DB_NAME}_${TIMESTAMP}.sql.gz"
FILEPATH="${BACKUP_DIR}/${FILENAME}"

mkdir -p "${BACKUP_DIR}"

echo "Starting backup of database: ${DB_NAME}"
echo "Output: ${FILEPATH}"

PGPASSWORD="${PGPASSWORD:-}" pg_dump \
  --host="${DB_HOST}" \
  --port="${DB_PORT}" \
  --username="${DB_USER}" \
  --dbname="${DB_NAME}" \
  --no-owner \
  --no-acl \
  --format=custom \
  | gzip > "${FILEPATH}"

echo "Backup completed: $(du -h "${FILEPATH}" | cut -f1)"

if [[ "${1:-}" == "--s3" && -n "${S3_BUCKET}" ]]; then
  echo "Uploading to S3: s3://${S3_BUCKET}/database/"
  aws s3 cp "${FILEPATH}" "s3://${S3_BUCKET}/database/${FILENAME}" --no-progress
  echo "Upload complete"
fi

echo "Cleaning up backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -name "${DB_NAME}_*.sql.gz" -mtime "+${RETENTION_DAYS}" -delete
echo "Cleanup complete"

echo "Backup process finished successfully"
