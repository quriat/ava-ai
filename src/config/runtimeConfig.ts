// Runtime config injected by the deploy entrypoint into /__config.js.
// Only PUBLIC keys (Vapi public key) may appear here. No Gemini/AI API keys.

export interface PublicRuntimeConfig {
  VAPI_PUBLIC_KEY?: string;
  VAPI_FRONT_DESK_ASSISTANT_ID?: string;
  VAPI_DISPATCH_ASSISTANT_ID?: string;
  BOOKING_API_ENDPOINT?: string;
  VOICE_TRANSFER_PHONE?: string;
}

function getWindowConfig(): PublicRuntimeConfig {
  if (typeof window === 'undefined') return {};
  return (window as any).__AVALIMO_CONFIG || {};
}

declare const __VITE_VAPI_PUBLIC_KEY__: string | undefined;
declare const __VITE_VAPI_FRONT_DESK_ASSISTANT_ID__: string | undefined;
declare const __VITE_VAPI_DISPATCH_ASSISTANT_ID__: string | undefined;
declare const __VITE_BOOKING_API_ENDPOINT__: string | undefined;
declare const __VITE_VOICE_TRANSFER_PHONE__: string | undefined;

function getGlobal(key: string): string | undefined {
  if (typeof window === 'undefined') return undefined;
  return (window as any)[key];
}

export function getPublicConfig(): PublicRuntimeConfig {
  return {
    VAPI_PUBLIC_KEY:
      getWindowConfig().VAPI_PUBLIC_KEY ||
      (typeof __VITE_VAPI_PUBLIC_KEY__ !== 'undefined' ? __VITE_VAPI_PUBLIC_KEY__ : undefined) ||
      process.env?.VITE_VAPI_PUBLIC_KEY ||
      '',
    VAPI_FRONT_DESK_ASSISTANT_ID:
      getWindowConfig().VAPI_FRONT_DESK_ASSISTANT_ID ||
      (typeof __VITE_VAPI_FRONT_DESK_ASSISTANT_ID__ !== 'undefined' ? __VITE_VAPI_FRONT_DESK_ASSISTANT_ID__ : undefined) ||
      process.env?.VITE_VAPI_FRONT_DESK_ASSISTANT_ID ||
      // Fallback: public assistant ID (not a secret — it ships to every
      // browser). The live deploy shipped with BOTH the runtime and
      // build-time values empty, which silently killed the voice agents;
      // this default keeps them working even if the env plumbing drops it.
      '37eef87b-ffd8-40b6-88a7-f64047d01b23',
    VAPI_DISPATCH_ASSISTANT_ID:
      getWindowConfig().VAPI_DISPATCH_ASSISTANT_ID ||
      (typeof __VITE_VAPI_DISPATCH_ASSISTANT_ID__ !== 'undefined' ? __VITE_VAPI_DISPATCH_ASSISTANT_ID__ : undefined) ||
      process.env?.VITE_VAPI_DISPATCH_ASSISTANT_ID ||
      // Dedicated Dispatch assistant ("AvaLimo Houston — Dispatch",
      // published in Vapi Oct 15, 2026) — separate from the front desk.
      'a9df8ecc-29bb-4c19-8935-062f5c54b9a2',
    // '/api/book' was the old same-host proxy path; nothing serves it on the
    // current host, so form submissions to it silently died (found Oct 18,
    // 2026). The live intake is the n8n Booking Router webhook. The deploy
    // entrypoint still injects '/api/book' as its default, so treat any
    // non-absolute endpoint as unset and fall back to the router — the same
    // pattern as the Vapi assistant IDs above.
    BOOKING_API_ENDPOINT: ((): string => {
      const candidate =
        getWindowConfig().BOOKING_API_ENDPOINT ||
        (typeof __VITE_BOOKING_API_ENDPOINT__ !== 'undefined' ? __VITE_BOOKING_API_ENDPOINT__ : undefined) ||
        process.env?.VITE_BOOKING_API_ENDPOINT;
      return candidate && candidate.startsWith('http')
        ? candidate
        : 'https://n8napp.adamj.fit/webhook/avalimo-booking';
    })(),
    VOICE_TRANSFER_PHONE:
      getWindowConfig().VOICE_TRANSFER_PHONE ||
      (typeof __VITE_VOICE_TRANSFER_PHONE__ !== 'undefined' ? __VITE_VOICE_TRANSFER_PHONE__ : undefined) ||
      process.env?.VITE_VOICE_TRANSFER_PHONE ||
      '+18325678050',
  };
}

export function assertVapiConfigured(): {
  apiKey: string;
  frontDeskAssistantId: string;
  dispatchAssistantId: string;
  transferPhone: string;
} {
  const cfg = getPublicConfig();
  if (!cfg.VAPI_PUBLIC_KEY) {
    throw new Error('Vapi public key is not configured.');
  }
  if (!cfg.VAPI_FRONT_DESK_ASSISTANT_ID || !cfg.VAPI_DISPATCH_ASSISTANT_ID) {
    throw new Error('Vapi assistant IDs are not configured.');
  }
  return {
    apiKey: cfg.VAPI_PUBLIC_KEY,
    frontDeskAssistantId: cfg.VAPI_FRONT_DESK_ASSISTANT_ID,
    dispatchAssistantId: cfg.VAPI_DISPATCH_ASSISTANT_ID,
    transferPhone: cfg.VOICE_TRANSFER_PHONE || '+18325678050',
  };
}
