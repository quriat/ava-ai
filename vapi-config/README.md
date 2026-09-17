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

Both assistants include a `transfer_call` tool that posts to an n8n webhook. The webhook should return the destination phone number so Vapi can complete the transfer.

If you do not want to run an n8n webhook for transfers, you can instead configure the transfer destination directly in Vapi:
- In each assistant, go to **Functions / Tools**
- Add a **Transfer** tool
- Set destination to `+18325678050`
- Remove the `server` block from the JSON

## Recommended destination

Use `+18325678050` (AvaLimo live dispatch) for both assistants unless you want Front Desk to transfer to a different number.

## Prompts

The system prompts explicitly instruct the assistants to:
- Keep responses short (1-3 sentences)
- Transfer when asked for a human, operator, dispatcher, or on urgent issues
- Transfer when the user asks twice for a human

If the assistant still fails to transfer, the website now shows a fallback "Call Dispatch Directly" button.
