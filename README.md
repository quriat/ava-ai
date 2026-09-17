# Avalimo Voice — AI Concierge & Luxury Chauffeur Website

Voice-first booking site for AvaLimo Houston.

## Architecture

- **Voice:** [Vapi Web SDK](https://docs.vapi.ai/sdk/web) with two separate assistant IDs: `Front Desk` and `Dispatch`.
- **Booking:** Browser submits to `BOOKING_API_ENDPOINT` (default `/api/book`). This should be an n8n webhook or the Flask `/api/book` endpoint so dispatch can check availability, save to Supabase, request approval, etc.
- **Safety:** No Gemini / AI API keys are exposed to the browser. Only the public Vapi key is embedded at build or injected at runtime via `/__config.js`.

## Features

- Vapi voice concierge with separate Front Desk & Dispatch assistants.
- Reservation request form (submitted as request, not an instant confirmed booking).
- Transparent fleet pricing; route / timing is flagged as “to be confirmed by dispatch”.
- Flight number capture (no fake live flight tracker on the site).

## Run locally

```bash
cd avalimo-voice
npm install
cp .env.example .env.local
# Fill in VAPI_PUBLIC_KEY and assistant IDs
npm run dev
```

Open http://localhost:3000

## Build

```bash
npm run build
npm run preview
```

## Deploy to avalimo.net

### Option 1: Coolify with Docker Image

The GitHub Actions workflow builds and pushes a Docker image to:

```
ghcr.io/quriat/avalimo-voice:latest
```

In Coolify:

1. New Application → Source: Docker Image
2. Image: `ghcr.io/quriat/avalimo-voice:latest`
3. Port: `80`
4. Domain: `avalimo.net`
5. Add environment variables:
   - `VAPI_PUBLIC_KEY`
   - `VAPI_FRONT_DESK_ASSISTANT_ID`
   - `VAPI_DISPATCH_ASSISTANT_ID`
   - `BOOKING_API_ENDPOINT` (optional, default `/api/book`)
6. Deploy

### Option 2: Coolify from GitHub repo

1. Push this folder to a GitHub repo.
2. In Coolify, create a new Application from the repo.
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variables above.
6. Point `avalimo.net` to the deployed service.

### Option 3: Vercel / Netlify / Cloudflare Pages

1. Push repo to GitHub.
2. Connect repo to Vercel/Netlify/Cloudflare Pages.
3. Set framework: Vite.
4. Add environment variables above (prefix with `VITE_` if you want them embedded at build time, e.g. `VITE_VAPI_PUBLIC_KEY`).

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `VAPI_PUBLIC_KEY` | Yes | Public Vapi key for browser voice calls |
| `VAPI_FRONT_DESK_ASSISTANT_ID` | Yes | Vapi assistant for the Front Desk agent |
| `VAPI_DISPATCH_ASSISTANT_ID` | Yes | Vapi assistant for the Dispatch agent |
| `BOOKING_API_ENDPOINT` | No | Endpoint to receive booking JSON (default `/api/book`) |

For Docker/Coolify runtime injection, use the non-`VITE_` names.
For build-time embedding in static hosts, use `VITE_VAPI_PUBLIC_KEY`, etc.

## Important notes

- The voice agent uses `navigator.mediaDevices.getUserMedia` and only works over HTTPS (except localhost during development).
- The booking form sends a **reservation request**. A dispatcher must confirm availability and chauffeur assignment before it becomes a confirmed booking.
- The site does not show live flight status or simulated traffic data. Flight numbers are captured and passed to dispatch for manual monitoring.
