#!/bin/sh
set -e

# Generate runtime config.js with environment variables
CONFIG_VERSION=$(date +%s)
cat > /usr/share/nginx/html/__config.js <<EOF
window.GEMINI_API_KEY = "${GEMINI_API_KEY}";
window.__CONFIG_VERSION = "${CONFIG_VERSION}";
EOF

# Replace placeholder in index.html with actual script tag (cache-busted)
sed -i "s|<!-- RUNTIME_CONFIG -->|<script src=\"/__config.js?v=${CONFIG_VERSION}\"></script>|g" /usr/share/nginx/html/index.html

# Ensure all static assets are readable by nginx worker
chmod -R 644 /usr/share/nginx/html/* 2>/dev/null || true
find /usr/share/nginx/html -type d -exec chmod 755 {} \; 2>/dev/null || true

exec nginx -g "daemon off;"
