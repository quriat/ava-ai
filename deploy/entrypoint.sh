#!/bin/sh
set -e

# Generate runtime config.js with environment variables
cat > /usr/share/nginx/html/__config.js <<EOF
window.GEMINI_API_KEY = "${GEMINI_API_KEY}";
EOF

# Replace placeholder in index.html with actual script tag
sed -i 's|<!-- RUNTIME_CONFIG -->|<script src="/__config.js"></script>|g' /usr/share/nginx/html/index.html

exec nginx -g "daemon off;"
