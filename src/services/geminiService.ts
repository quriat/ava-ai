import { COMPANY_INFO } from '../data/avalimoData';

export const getConciergeResponse = async (
  _userMessage: string,
  _history: { role: string; text: string }[] = []
): Promise<string> => {
  // Gemini chat has been disabled because the API key must not be exposed in browser code.
  // The website now uses Vapi voice agents connected to assistant-specific backends.
  return `Welcome to AvaLimo Houston! You can reach our 24/7 dispatch at ${COMPANY_INFO.phone} or email ${COMPANY_INFO.email}.`;
};

export function getVehicleById(id: string) {
  // Replaced by direct FLEET_DATA lookups in components.
  return undefined;
}
