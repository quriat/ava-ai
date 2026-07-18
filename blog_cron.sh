#!/usr/bin/env bash
# AvaLimo Daily Blog Cron Script
# Place this in your Coolify scheduler or run via crontab on the host.
# It lives alongside auto_blog.py in the repo root.

set -euo pipefail

# Use the script's directory so paths resolve correctly inside Docker containers
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

LOG_FILE="${SCRIPT_DIR}/blog_cron.log"
OLLAMA_URL="http://168.231.74.172:32792/api/chat"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting blog cron..." >> "$LOG_FILE"

# Check if Ollama is reachable
if ! curl -sf --max-time 5 "$OLLAMA_URL" > /dev/null 2>&1; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: Ollama server at $OLLAMA_URL is not reachable. Skipping." >> "$LOG_FILE"
  exit 1
fi

# Generate a new post
if python3 auto_blog.py >> "$LOG_FILE" 2>&1; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] SUCCESS: Blog post generated and pushed." >> "$LOG_FILE"
else
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] FAILED: auto_blog.py returned an error." >> "$LOG_FILE"
  exit 1
fi
