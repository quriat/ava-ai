#!/bin/sh
set -e

# Generate runtime config.js with only PUBLIC values.
# No Gemini / AI API keys may be exposed to the browser.
cat > /usr/share/nginx/html/__config.js <<EOF
window.__AVALIMO_CONFIG = {
  VAPI_PUBLIC_KEY: "${VAPI_PUBLIC_KEY:-}",
  VAPI_FRONT_DESK_ASSISTANT_ID: "${VAPI_FRONT_DESK_ASSISTANT_ID:-}",
  VAPI_DISPATCH_ASSISTANT_ID: "${VAPI_DISPATCH_ASSISTANT_ID:-}",
  BOOKING_API_ENDPOINT: "${BOOKING_API_ENDPOINT:-/api/book}"
};
EOF

# Replace placeholder in index.html with actual script tag
sed -i 's|<!-- RUNTIME_CONFIG -->|<script src="/__config.js"></script>|g' /usr/share/nginx/html/index.html

exec nginx -g "daemon off;"
