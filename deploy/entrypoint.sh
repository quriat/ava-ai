#!/bin/sh
set -e

# Generate runtime config.js with only PUBLIC values.
# No Gemini / AI API keys may be exposed to the browser.
: "${VAPI_PUBLIC_KEY:=}"
: "${VAPI_FRONT_DESK_ASSISTANT_ID:=}"
: "${VAPI_DISPATCH_ASSISTANT_ID:=}"
: "${BOOKING_API_ENDPOINT:=/api/book}"
: "${VOICE_TRANSFER_PHONE:=+18325678050}"
: "${GA_MEASUREMENT_ID:=}"
: "${CLARITY_PROJECT_ID:=}"

cat > /usr/share/nginx/html/__config.js <<EOF
window.__AVALIMO_CONFIG = {
  VAPI_PUBLIC_KEY: "${VAPI_PUBLIC_KEY}",
  VAPI_FRONT_DESK_ASSISTANT_ID: "${VAPI_FRONT_DESK_ASSISTANT_ID}",
  VAPI_DISPATCH_ASSISTANT_ID: "${VAPI_DISPATCH_ASSISTANT_ID}",
  BOOKING_API_ENDPOINT: "${BOOKING_API_ENDPOINT}",
  VOICE_TRANSFER_PHONE: "${VOICE_TRANSFER_PHONE}",
  GA_MEASUREMENT_ID: "${GA_MEASUREMENT_ID}",
  CLARITY_PROJECT_ID: "${CLARITY_PROJECT_ID}"
};
EOF

# Replace the placeholder in every prerendered document, not just the root.
# scripts/prerender.mjs emits /faq/index.html, /blog/<slug>/index.html and the
# landing pages from the same template, so they all carry the placeholder too.
# Patching only the root left 77 of 78 pages with no runtime config, which
# silently disabled the voice concierge buttons everywhere except the homepage.
find /usr/share/nginx/html -name 'index.html' -type f -exec \
  sed -i 's|<!-- RUNTIME_CONFIG -->|<script src="/__config.js"></script>|g' {} +

patched=$(grep -rl '__config.js' /usr/share/nginx/html --include='index.html' | wc -l)
total=$(find /usr/share/nginx/html -name 'index.html' -type f | wc -l)
echo "[avalimo-voice] runtime config injected into $patched of $total documents" >&2

# Debug: log which public keys were injected (values hidden)
echo "[avalimo-voice] runtime config injected: VAPI_PUBLIC_KEY set=${VAPI_PUBLIC_KEY:+yes}, FRONT_DESK set=${VAPI_FRONT_DESK_ASSISTANT_ID:+yes}, DISPATCH set=${VAPI_DISPATCH_ASSISTANT_ID:+yes}, BOOKING_API_ENDPOINT=${BOOKING_API_ENDPOINT}, VOICE_TRANSFER_PHONE=${VOICE_TRANSFER_PHONE}, GA_MEASUREMENT_ID set=${GA_MEASUREMENT_ID:+yes}, CLARITY_PROJECT_ID set=${CLARITY_PROJECT_ID:+yes}" >&2

exec nginx -g "daemon off;"
