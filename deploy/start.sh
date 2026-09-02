#!/bin/bash
# AvaLimo v2 startup: gunicorn (Flask API) + nginx (React SPA) with a
# guaranteed-listener fallback so the site can never go fully dark.

echo "=== AvaLimo v2 starting: $(date -u) ==="

# 1) Flask backend on 127.0.0.1:5003
gunicorn --bind 127.0.0.1:5003 --workers 2 --timeout 120 site_app:app &
GPID=$!
sleep 2
if ! kill -0 $GPID 2>/dev/null; then
  echo "!!! GUNICORN FAILED TO START — see traceback below !!!"
fi

# 2) nginx frontend on 5002; if its config is broken, fall back to
#    Flask-only on 0.0.0.0:5002 (the old proven deployment mode).
if nginx -t > /tmp/nginx-test.log 2>&1; then
  echo "nginx config OK — starting nginx on :5002 (SPA + API proxy)"
  ln -sf /dev/stdout /var/log/nginx/access.log
  ln -sf /dev/stderr /var/log/nginx/error.log
  exec nginx -g 'daemon off;'
else
  echo "=== NGINX CONFIG FAILED — falling back to Flask-only on :5002 ==="
  cat /tmp/nginx-test.log
  exec gunicorn --bind 0.0.0.0:5002 --workers 2 --timeout 120 site_app:app
fi
