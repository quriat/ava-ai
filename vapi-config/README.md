# Vapi Assistant Configuration

These JSON files are the recommended assistant definitions for the two AvaLimo voice agents.

## How to use

1. Go to https://dashboard.vapi.ai/assistants
2. Create a new assistant (or duplicate an existing one)
3. Switch to the **JSON** editor / import view
4. Paste in `front-desk-assistant.json` for the Front Desk agent
5. Copy the assistant ID and set it as `VAPI_FRONT_DESK_ASSISTANT_ID`
6. Repeat with `dispatch-assistant.json` for the Dispatch agent
7. Copy that assistant ID and set it as `VAPI_DISPATCH_ASSISTANT_ID`

## Transfer behavior

Each assistant has a `transfer_call` tool. You must configure the destination in the Vapi dashboard:

1. Open the assistant → **Functions / Tools**
2. Find `transfer_call` (or add a **Transfer** tool)
3. Set destination to `+18325678050` (AvaLimo live dispatch)
4. Save

## Leave a message / callback

Both assistants have a `take_message` function tool. When a caller asks to leave a message or get a callback, the assistant collects name, phone, and message and POSTs to the n8n webhook.

### n8n webhook setup

1. Import `../n8n-workflows/vapi-voice-handler.json` into your n8n instance
2. Open the **Vapi Voice Webhook** node and copy the webhook URL (it will look like `https://n8napp.adamj.fit/webhook/vapi-voice`)
3. In the Vapi dashboard, open each assistant → **Functions**
4. Add a function called `take_message`
5. Set the function's webhook URL to the n8n URL from step 2
6. Configure the Telegram node:
   - Replace `YOUR_TELEGRAM_CHAT_ID` with your Telegram chat ID (ask @userinfobot)
   - Add your Telegram bot token in n8n credentials
7. Configure the Email node with SMTP credentials (Gmail, SendGrid, etc.)
8. Activate the workflow

The webhook expects this JSON body:

```json
{
  "name": "Caller Name",
  "phone": "+15551234567",
  "message": "Please call me back about a Galveston cruise transfer.",
  "urgent": false,
  "agent": "Front Desk"
}
```

It will instantly notify you by Telegram and email.

## Recommended destination

Use `+18325678050` (AvaLimo live dispatch) for both assistants unless you want Front Desk to transfer to a different number.

## Website fallback

If the Vapi transfer fails or the user is on a device that can't complete the handoff, the website shows a "Call Dispatch Directly" button that dials `VOICE_TRANSFER_PHONE` (default `+18325678050`).
