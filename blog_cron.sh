#!/usr/bin/env bash
# AvaLimo Daily Blog Cron Script
# Place this in your Coolify scheduler or run via crontab on the host.
# It lives alongside auto_blog.py in the repo root.

set -euo pipefail

# Use the script's directory so paths resolve correctly inside Docker containers
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

LOG_FILE="${SCRIPT_DIR}/blog_cron.log"

# Load BAI_API_KEY from .env
if [ -f "${SCRIPT_DIR}/.env" ]; then
  set -a; . "${SCRIPT_DIR}/.env"; set +a
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting blog cron..." >> "$LOG_FILE"

# Check if b.ai is reachable
if ! curl -sf --max-time 10 -o /dev/null "https://api.b.ai/v1/models" -H "Authorization: Bearer ${BAI_API_KEY}"; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: b.ai API is not reachable or key invalid. Skipping." >> "$LOG_FILE"
  exit 1
fi

# Generate a new post
if python3 auto_blog.py >> "$LOG_FILE" 2>&1; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] SUCCESS: Blog post generated and pushed." >> "$LOG_FILE"
else
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] FAILED: auto_blog.py returned an error." >> "$LOG_FILE"
  exit 1
fi
