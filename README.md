# Avalimo Voice — AI Concierge & Luxury Chauffeur Website

Merged from two Google AI Studio apps:
- **AVA LIMO voice agent** (`ava-limo---houston's-premier-luxury-service`) — real-time Gemini voice AI (Front Desk + Dispatch)
- **Avalimo Houston** (`avalimo-houston`) — full booking engine, flight tracking, fleet pricing, services, testimonials

## Features

- AI voice concierge with Front Desk & Dispatch personas
- Full reservation engine with trip types, vehicle selection, pricing
- Real-time flight tracking with auto-adjusted pickup times
- Houston route / traffic estimates
- Detailed fleet, services, testimonials, contact
- Booking submissions emailed to dispatch via formsubmit.co
- Optional custom webhook for n8n/Zapier/Make integration

## Run locally

```bash
npm install
cp .env.example .env.local
# Add your GEMINI_API_KEY to .env.local
npm run dev
```

Open http://localhost:3000

## Build

```bash
npm run build
npm run preview
```

## Deploy to avalimo.net

### Option 1: Coolify (existing setup)

1. Push this folder to a GitHub repo.
2. In Coolify, create a new Application from the repo.
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variable: `GEMINI_API_KEY`
6. Optional: add `BOOKING_WEBHOOK_URL` or `BOOKING_EMAIL`
7. Point `avalimo.net` to the deployed service.

### Option 2: Vercel / Netlify / Cloudflare Pages

1. Push repo to GitHub.
2. Connect repo to Vercel/Netlify/Cloudflare Pages.
3. Set framework: Vite.
4. Add `GEMINI_API_KEY` in environment variables.
5. Deploy.

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `GEMINI_API_KEY` | Yes | Powers AI chat and voice agents |
| `BOOKING_EMAIL` | No | Email address for formsubmit.co (default: adam@avalimo.net) |
| `BOOKING_WEBHOOK_URL` | No | Custom endpoint to receive booking JSON (overrides email) |

## Important notes

- The voice agent uses `navigator.mediaDevices.getUserMedia` and only works over HTTPS (except localhost during development).
- The booking form emails a formatted request to dispatch. For instant paid bookings, integrate a payment processor and dispatch backend.
