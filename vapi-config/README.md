# Vapi Assistant Configuration

These JSON files are the assistant definitions for the two AvaLimo voice agents.  
After importing, set the assistant IDs in Coolify: `VAPI_FRONT_DESK_ASSISTANT_ID` and `VAPI_DISPATCH_ASSISTANT_ID`.

## How to import

1. Go to https://dashboard.vapi.ai/assistants
2. Create a new assistant (or duplicate an existing one)
3. In the assistant editor, go to **JSON / Import** tab
4. Paste the contents of `front-desk-assistant.json` or `dispatch-assistant.json`
5. Save and copy the new assistant ID
6. Set the ID in Coolify environment variables

**Both assistants are now defined with three tools:**
- `take_message` – callback request (needs webhook)
- `book_ride` – create a booking (needs webhook)  
- `transferCall` – transfer to live dispatcher (destination is set in JSON)

## Booking webhook setup

The `book_ride` function requires a server endpoint that:
1. Receives the booking parameters via POST
2. Creates the booking in your database
3. Sends a confirmation email/SMS
4. Returns: `{"status": "success", "reference": "BA-12345", "message": "Confirmed"}` or `{"status": "error", "message": "Failed"}`

### n8n setup (recommended)

1. Import `n8n-workflows/vapi-voice-handler.json` into your n8n instance
2. The workflow has a `book_ride` webhook node that:
   - Generates a booking reference
   - Emails you a confirmation with all booking details
   - Returns `{status, reference, message}` to the assistant
3. Copy the webhook URL: `https://n8napp.adamj.fit/webhook/book_ride`
4. In Vapi dashboard, open each assistant → **Tools** → `book_ride`
5. Set the **Server URL** to `https://n8napp.adamj.fit/webhook/book_ride`
6. Set **Async** to `false` so the assistant waits for confirmation

### Direct endpoint setup

If you have an existing `/api/book` endpoint, point `book_ride.server.url` to it.  
The endpoint must accept the full booking payload and return `{status, reference, message}`.

## Transfer tool (already configured in JSON)

Each assistant JSON includes a `transferCall` tool with:
```json
{
  "type": "transferCall",
  "destinations": [{
    "type": "number",
    "number": "+18325678050",
    "message": "Transferring you to our live dispatcher."
  }]
}
```

The assistant can now call this directly. No additional dashboard setup needed unless you want a different number.

## Callback / leave a message

Both assistants have a `take_message` function. Configure its webhook similarly to `book_ride`:

1. Import `n8n-workflows/vapi-voice-handler.json` (if it exists)
2. Or create a webhook that POSTs to your n8n workflow
3. Configure Telegram/Email notifications as described above

The webhook receives:
```json
{
  "name": "Caller Name",
  "phone": "+15551234567",
  "message": "Please call me back",
  "urgent": false,
  "agent": "Front Desk"
}
```

## Website fallback

If Vapi transfer fails or the user can't use the voice channel, the website shows a "Call Dispatch Directly" button that dials `VOICE_TRANSFER_PHONE` (default `+18325678050`).