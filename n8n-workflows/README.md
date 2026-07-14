# n8n Workflows for AvaLimo

Import these into your n8n instance at `n8napp.adamj.fit`.

---

## 1. Deploy Notifications
**File:** `deploy-notifications.json`

Receives webhooks from GitHub Actions whenever the site deploys.

### Setup:
1. Import the JSON into n8n
2. Configure the **Telegram** node:
   - Set `YOUR_TELEGRAM_CHAT_ID` to your chat ID (ask @userinfobot on Telegram)
   - Add your Telegram bot token in credentials
3. Configure the **Email** node:
   - Set up SMTP credentials (Gmail, SendGrid, etc.)
4. Copy the webhook URL from the Webhook node
5. Add it as `N8N_WEBHOOK_URL` secret in GitHub repo settings

**What it does:**
- Sends Telegram message on every deploy (staging + production)
- Sends email ONLY on production deploys

---

## 2. Lead Nurture
**File:** `lead-nurture.json`

Automatically handles new booking form submissions.

### Setup:
1. Import the JSON into n8n
2. Configure Telegram node with your chat ID
3. Configure Email nodes with SMTP
4. (Optional) Connect to a database node instead of Postgres
5. Copy the webhook URL
6. Update your booking form to POST to this webhook

**What it does:**
1. Notifies you instantly on Telegram
2. Sends auto-reply email to the customer
3. Saves lead to database
4. Waits 1 hour, then sends follow-up email if they haven't booked

---

## 3. Competitor Keyword Tracker
**File:** `competitor-tracker.json`

Monitors competitor rankings daily.

### Setup:
1. Import the JSON into n8n
2. Update the "Load Competitors" node with real competitor domains
3. Replace "Search Google" node with **SerpApi** or **DataForSEO** for accurate rankings
   - Sign up at https://serpapi.com
   - Use their n8n node for reliable Google scraping
4. Configure Email + Telegram nodes
5. The workflow runs daily at a scheduled time

**What it does:**
- Checks if competitors rank for your target keywords
- Saves data to database
- Alerts you when competitors gain/lose rankings
- Emails a daily summary report

---

## 4. Google Review Requests
**File:** `review-requests.json`

Automatically asks happy customers for Google reviews.

### Setup:
1. Import the JSON into n8n
2. Replace `YOUR_GOOGLE_PLACE_ID` in both nodes with your actual Google Business Place ID
   - Find it: https://developers.google.com/maps/documentation/places/web-service/place-id
3. Connect to your booking database in "Get Yesterday's Rides" node
   - Replace the sample data with a real database query
4. Configure Email + Telegram nodes
5. The workflow runs daily at 10 AM

**What it does:**
- Finds yesterday's completed rides
- Sends email review request to customers with email
- Falls back to SMS for phone-only customers
- Logs all requests to database
- Notifies you on Telegram

---

## Getting Your Credentials

### Telegram Chat ID
1. Message @userinfobot on Telegram
2. It replies with your user ID — that's your chat ID

### Google Place ID
1. Go to https://developers.google.com/maps/documentation/places/web-service/place-id
2. Enter your business name "AvaLimo Houston"
3. Copy the Place ID

### SerpApi (for competitor tracking)
1. Sign up at https://serpapi.com
2. Copy your API key
3. Add to n8n credentials

---

## Integration with Your Booking System

To connect n8n workflows to your actual booking data, replace the sample data nodes with:

**Option A: Direct Database Connection**
- Use n8n's Postgres/MySQL node
- Query your booking database directly

**Option B: Webhook from Your Booking Form**
- Update your booking form to POST to the n8n webhook URL
- Example: `https://n8napp.adamj.fit/webhook/avalimo-lead`
- The workflow triggers instantly on every form submission

**Option C: API Integration**
- If your booking system has an API, use n8n's HTTP Request node
- Pull completed rides data daily

---

## All Workflow Triggers

| Workflow | Trigger | Frequency |
|----------|---------|-----------|
| Deploy Notifications | GitHub webhook | On every deploy |
| Lead Nurture | Booking form POST | Instant |
| Competitor Tracker | Schedule | Daily |
| Review Requests | Schedule | Daily at 10 AM |
