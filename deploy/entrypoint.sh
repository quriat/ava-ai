#!/bin/sh
set -e

# Generate runtime config.js with environment variables
CONFIG_VERSION=$(date +%s)
cat > /usr/share/nginx/html/__config.js <<EOF
window.VAPI_PUBLIC_KEY = "${VAPI_PUBLIC_KEY}";
window.VAPI_ASSISTANT_ID = "${VAPI_ASSISTANT_ID}";
window.GEMINI_API_KEY = "${GEMINI_API_KEY}";
window.OPENROUTER_API_KEY = "${OPENROUTER_API_KEY}";
window.TELEGRAM_BOT_TOKEN = "${TELEGRAM_BOT_TOKEN}";
window.__CONFIG_VERSION = "${CONFIG_VERSION}";
EOF

# Replace placeholder in ALL html pages (root + prerendered blog pages) with
# the cache-busted runtime config script tag.
find /usr/share/nginx/html -name '*.html' -exec \
  sed -i "s|<!-- RUNTIME_CONFIG -->|<script src=\"/__config.js?v=${CONFIG_VERSION}\"></script>|g" {} +

# Ensure all static assets are readable by nginx worker
chmod -R 644 /usr/share/nginx/html/* 2>/dev/null || true
find /usr/share/nginx/html -type d -exec chmod 755 {} \; 2>/dev/null || true

exec nginx -g "daemon off;"
