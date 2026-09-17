import Vapi from '@vapi-ai/web';
import { getPublicConfig, assertVapiConfigured } from '../config/runtimeConfig';
import { AgentType } from '../types';

let vapiInstance: Vapi | null = null;

export function getVapi(): Vapi {
  if (!vapiInstance) {
    const { apiKey } = assertVapiConfigured();
    vapiInstance = new Vapi(apiKey);
  }
  return vapiInstance;
}

export function getAssistantId(type: AgentType): string {
  const cfg = assertVapiConfigured();
  return type === AgentType.FRONT_DESK ? cfg.frontDeskAssistantId : cfg.dispatchAssistantId;
}

export function startVapiCall(type: AgentType): void {
  const vapi = getVapi();
  const assistantId = getAssistantId(type);
  vapi.start(assistantId);
}

export function stopVapiCall(): void {
  vapiInstance?.stop();
}

export function isVapiConfigured(): boolean {
  const cfg = getPublicConfig();
  return Boolean(cfg.VAPI_PUBLIC_KEY && cfg.VAPI_FRONT_DESK_ASSISTANT_ID && cfg.VAPI_DISPATCH_ASSISTANT_ID);
}

export function getTransferPhone(): string {
  return getPublicConfig().VOICE_TRANSFER_PHONE || '+18325678050';
}
