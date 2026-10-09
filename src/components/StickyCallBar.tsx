import { Phone, MessageCircle } from 'lucide-react';
import { COMPANY_INFO } from '../data/avalimoData';
import { trackEvent } from '../lib/analytics';

const WHATSAPP_URL =
  'https://wa.me/18325678050?text=Hi%20AvaLimo!%20I%27d%20like%20a%20quote%20for%20a%20ride.';

/**
 * Always-visible call bar for mobile visitors. One thumb-tap to call or
 * WhatsApp — the two highest-converting actions on a phone.
 */
export default function StickyCallBar() {
  return (
    <>
      {/* Spacer so the fixed bar never covers footer content (mobile only) */}
      <div className="h-24 sm:hidden" aria-hidden="true" />
      <div
        className="sm:hidden fixed bottom-0 inset-x-0 z-[9990] bg-ink/95 backdrop-blur-md border-t border-gold/25 px-4 pt-3"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
          <a
            href={`tel:${COMPANY_INFO.phoneRaw}`}
            onClick={() => trackEvent('call_click', { placement: 'sticky_bar' })}
            className="flex items-center justify-center gap-2 py-3.5 rounded-full btn-gold font-bold text-xs uppercase tracking-[0.15em] shadow-lg"
          >
            <Phone size={17} />
            <span>Call Now</span>
          </a>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener"
            onClick={() => trackEvent('whatsapp_click', { placement: 'sticky_bar' })}
            className="flex items-center justify-center gap-2 py-3.5 rounded-full border border-[#25d366]/50 bg-[#25d366]/10 text-white font-bold text-xs uppercase tracking-[0.15em]"
          >
            <MessageCircle size={17} className="text-[#25d366]" />
            <span>WhatsApp</span>
          </a>
        </div>
        <p className="text-center text-[10px] text-white/40 mt-2 tracking-[0.25em] uppercase">
          {COMPANY_INFO.phone} &bull; 24/7
        </p>
      </div>
    </>
  );
}
