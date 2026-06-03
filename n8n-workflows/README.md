# n8n Workflows for AvaLimo

Import these into your n8n instance at `n8napp.adamj.fit`.

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

## 3. Manual Setup (No Import File)

### LinkedIn Auto-Post (You Already Have)
Your existing workflow at `n8napp.adamj.fit`.

### Review Request Workflow
Create this manually:
1. **Trigger:** Time-based (every day at 10 AM)
2. **Get yesterday's completed rides** from your database/CRM
3. **For each ride:**
   - Send SMS/email to customer with Google Review link
   - Link: `https://search.google.com/local/writereview?placeid=YOUR_GOOGLE_PLACE_ID`

---

## Getting Your Telegram Chat ID
1. Message @userinfobot on Telegram
2. It will reply with your user ID
3. That's your chat ID

## Getting Your Google Place ID
1. Search for your business on Google Maps
2. The URL will contain `place_id=...`
3. Use that for review links
