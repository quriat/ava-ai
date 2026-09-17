// Runtime config injected by the deploy entrypoint into /__config.js.
// Only PUBLIC keys (Vapi public key) may appear here. No Gemini/AI API keys.

export interface PublicRuntimeConfig {
  VAPI_PUBLIC_KEY?: string;
  VAPI_FRONT_DESK_ASSISTANT_ID?: string;
  VAPI_DISPATCH_ASSISTANT_ID?: string;
  BOOKING_API_ENDPOINT?: string;
}

function getWindowConfig(): PublicRuntimeConfig {
  if (typeof window === 'undefined') return {};
  return (window as any).__AVALIMO_CONFIG || {};
}

declare const __VITE_VAPI_PUBLIC_KEY__: string | undefined;
declare const __VITE_VAPI_FRONT_DESK_ASSISTANT_ID__: string | undefined;
declare const __VITE_VAPI_DISPATCH_ASSISTANT_ID__: string | undefined;
declare const __VITE_BOOKING_API_ENDPOINT__: string | undefined;

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
      '',
    VAPI_DISPATCH_ASSISTANT_ID:
      getWindowConfig().VAPI_DISPATCH_ASSISTANT_ID ||
      (typeof __VITE_VAPI_DISPATCH_ASSISTANT_ID__ !== 'undefined' ? __VITE_VAPI_DISPATCH_ASSISTANT_ID__ : undefined) ||
      process.env?.VITE_VAPI_DISPATCH_ASSISTANT_ID ||
      '',
    BOOKING_API_ENDPOINT:
      getWindowConfig().BOOKING_API_ENDPOINT ||
      (typeof __VITE_BOOKING_API_ENDPOINT__ !== 'undefined' ? __VITE_BOOKING_API_ENDPOINT__ : undefined) ||
      process.env?.VITE_BOOKING_API_ENDPOINT ||
      '/api/book',
  };
}

export function assertVapiConfigured(): { apiKey: string; frontDeskAssistantId: string; dispatchAssistantId: string } {
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
  };
}
