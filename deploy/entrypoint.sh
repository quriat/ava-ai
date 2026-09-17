#!/bin/sh
set -e

# Generate runtime config.js with only PUBLIC values.
# No Gemini / AI API keys may be exposed to the browser.
: "${VAPI_PUBLIC_KEY:=}"
: "${VAPI_FRONT_DESK_ASSISTANT_ID:=}"
: "${VAPI_DISPATCH_ASSISTANT_ID:=}"
: "${BOOKING_API_ENDPOINT:=/api/book}"
: "${VOICE_TRANSFER_PHONE:=+18325678050}"

cat > /usr/share/nginx/html/__config.js <<EOF
window.__AVALIMO_CONFIG = {
  VAPI_PUBLIC_KEY: "${VAPI_PUBLIC_KEY}",
  VAPI_FRONT_DESK_ASSISTANT_ID: "${VAPI_FRONT_DESK_ASSISTANT_ID}",
  VAPI_DISPATCH_ASSISTANT_ID: "${VAPI_DISPATCH_ASSISTANT_ID}",
  BOOKING_API_ENDPOINT: "${BOOKING_API_ENDPOINT}",
  VOICE_TRANSFER_PHONE: "${VOICE_TRANSFER_PHONE}"
};
EOF

# Replace placeholder in index.html with actual script tag
sed -i 's|<!-- RUNTIME_CONFIG -->|<script src="/__config.js"></script>|g' /usr/share/nginx/html/index.html

# Debug: log which public keys were injected (values hidden)
echo "[avalimo-voice] runtime config injected: VAPI_PUBLIC_KEY set=${VAPI_PUBLIC_KEY:+yes}, FRONT_DESK set=${VAPI_FRONT_DESK_ASSISTANT_ID:+yes}, DISPATCH set=${VAPI_DISPATCH_ASSISTANT_ID:+yes}, BOOKING_API_ENDPOINT=${BOOKING_API_ENDPOINT}, VOICE_TRANSFER_PHONE=${VOICE_TRANSFER_PHONE}" >&2

exec nginx -g "daemon off;"
