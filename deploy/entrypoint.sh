#!/bin/sh
set -e

# Generate runtime config.js with environment variables
cat > /usr/share/nginx/html/__config.js <<EOF
window.GEMINI_API_KEY = "${GEMINI_API_KEY}";
EOF

# Replace placeholder in index.html with actual script tag
sed -i 's|<!-- RUNTIME_CONFIG -->|<script src="/__config.js"></script>|g' /usr/share/nginx/html/index.html

# Ensure all static assets are readable by nginx worker
chmod -R 644 /usr/share/nginx/html/* 2>/dev/null || true
find /usr/share/nginx/html -type d -exec chmod 755 {} \; 2>/dev/null || true

exec nginx -g "daemon off;"
