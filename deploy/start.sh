#!/bin/sh
# Fallback start script for non-Docker hosts
set -e

npm install
npm run build
npx serve -s dist -l 3000
