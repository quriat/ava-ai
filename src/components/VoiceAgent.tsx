import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AgentType } from '../types';
import { startVapiCall, stopVapiCall, getVapi, isVapiConfigured, getTransferPhone } from '../services/vapiVoiceService';
import { Phone } from 'lucide-react';

interface VoiceAgentProps {
  type: AgentType;
  icon: React.ReactNode;
}

const VoiceAgent: React.FC<VoiceAgentProps> = ({ type, icon }) => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('Ready');
  const [transcription, setTranscription] = useState('');
  const [error, setError] = useState('');
  const [transferRequested, setTransferRequested] = useState(false);
  const [callMeName, setCallMeName] = useState('');
  const [callMePhone, setCallMePhone] = useState('');
  const [callMeState, setCallMeState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [callMeMsg, setCallMeMsg] = useState('');
  const transferRequestedRef = useRef(false);
  const configured = isVapiConfigured();
  const transferPhone = getTransferPhone();

  const handleStart = useCallback(() => {
    try {
      setError('');
      setTransferRequested(false);
      transferRequestedRef.current = false;
      setStatus('Initializing...');
      startVapiCall(type);
      setIsActive(true);
      setStatus('Active');
    } catch (err: any) {
      console.error('Voice start error:', err);
      setStatus('Failed');
      setError(err?.message || 'Could not start voice session.');
      setIsActive(false);
    }
  }, [type]);

  const handleStop = useCallback(() => {
    stopVapiCall();
    setIsActive(false);
    setStatus('Ready');
    setTranscription('');
    setTransferRequested(false);
    transferRequestedRef.current = false;
  }, []);

  const handleCallMe = useCallback(async () => {
    const digits = callMePhone.replace(/\D/g, '');
    let e164 = '';
    if (digits.length === 10) e164 = '+1' + digits;
    else if (digits.length === 11 && digits.startsWith('1')) e164 = '+' + digits;
    else {
      setCallMeState('error');
      setCallMeMsg('Enter a valid 10-digit US phone number.');
      return;
    }
    setCallMeState('sending');
    setCallMeMsg('');
    try {
      const res = await fetch('https://n8napp.adamj.fit/webhook/call_me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: callMeName.trim(),
          phone: e164,
          agent: type === AgentType.FRONT_DESK ? 'Front Desk' : 'Dispatch',
        }),
      });
      if (!res.ok) throw new Error('call_me failed');
      setCallMeState('sent');
      setCallMeMsg('Calling you now \u2014 answer and talk. On a real call she can transfer you to a live dispatcher.');
    } catch {
      setCallMeState('error');
      setCallMeMsg('Could not place the call. Please try again.');
    }
  }, [callMeName, callMePhone, type]);

  useEffect(() => {
    if (!configured) return;

    let vapi: ReturnType<typeof getVapi>;
    try {
      vapi = getVapi();
    } catch {
      return;
    }

    const onCallStart = () => {
      setIsActive(true);
      setStatus('Active');
      setError('');
      setTransferRequested(false);
      transferRequestedRef.current = false;
    };

    const onCallEnd = () => {
      setIsActive(false);
      setStatus('Ready');
      setTranscription('');
      // Keep transferRequested as-is: if the call just died on a failed
      // transfer, the direct-call fallback button must stay visible.
    };

    const onSpeechStart = () => {
      setStatus('Speaking');
    };

    const onSpeechEnd = () => {
      setStatus('Listening');
    };

    const onMessage = (message: any) => {
      if (message?.type === 'transcript' && message.transcript) {
        setTranscription(message.transcript);
      }

      // Detect transfer-related failures or explicit transfer requests from assistant
      const msgStr = typeof message === 'string' ? message : JSON.stringify(message);
      const transferKeywords = /transfer|transferring|connect you|human|agent|dispatch|representative|operator/i;
      if (transferKeywords.test(msgStr)) {
        setTransferRequested(true);
        transferRequestedRef.current = true;
      }
    };

    const onError = (err: any) => {
      console.error('Vapi error:', err);
      const errMsg = err?.message || err?.errorMsg || JSON.stringify(err) || 'Call disconnected.';
      setStatus('Error');

      // If the error mentions transfer, or a transfer was requested during
      // this call, show the direct-call fallback.
      if (transferRequestedRef.current || /transfer|dial|destination|phone number|invalid number|unreachable/i.test(errMsg)) {
        setTransferRequested(true);
        transferRequestedRef.current = true;
        setError('Transfer to live agent failed. Tap below to call dispatch directly.');
      } else {
        setError('Call disconnected. Please try again.');
      }

      setIsActive(false);
    };

    vapi.on('call-start', onCallStart);
    vapi.on('call-end', onCallEnd);
    vapi.on('speech-start', onSpeechStart);
    vapi.on('speech-end', onSpeechEnd);
    vapi.on('message', onMessage);
    vapi.on('error', onError);

    return () => {
      vapi.off('call-start', onCallStart);
      vapi.off('call-end', onCallEnd);
      vapi.off('speech-start', onSpeechStart);
      vapi.off('speech-end', onSpeechEnd);
      vapi.off('message', onMessage);
      vapi.off('error', onError);
    };
  }, [configured]);

  return (
    <div className={`flex flex-col items-center gap-3 sm:gap-5 p-4 sm:p-8 rounded-3xl transition-all border ${isActive ? 'bg-gold/10 border-gold/40 shadow-xl shadow-gold/10' : 'bg-white/5 border-white/5 hover:border-gold/20'}`}>
      <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all ${isActive ? 'bg-gold text-black shadow-lg shadow-gold/50 animate-pulse' : 'bg-luxury text-gold border border-gold/20'}`}>
        {icon}
      </div>
      <div className="text-center">
        <h3 className="text-sm font-bold tracking-[0.2em] uppercase text-white">{type}</h3>
        <p className={`text-[9px] uppercase tracking-[0.3em] mt-1 font-bold ${isActive ? 'text-gold' : 'text-white/30'}`}>{status}</p>
      </div>

      {!isActive ? (
        <button
          onClick={handleStart}
          disabled={!configured}
          className="border-2 border-gold/40 text-gold px-3 sm:px-8 py-3 rounded-full text-[10px] font-extrabold tracking-[0.2em] uppercase hover:bg-gold hover:text-black transition-all w-full disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {configured ? `Call ${type === AgentType.FRONT_DESK ? 'Desk' : 'Dispatch'}` : 'Configure Voice'}
        </button>
      ) : (
        <button
          onClick={handleStop}
          className="bg-red-600/20 border border-red-600/40 text-red-500 px-3 sm:px-8 py-3 rounded-full text-[10px] font-extrabold tracking-[0.2em] uppercase hover:bg-red-600 hover:text-white transition-all w-full"
        >
          End Call
        </button>
      )}

      {transferRequested && (isActive || !!error) && (
        <a
          href={`tel:${transferPhone}`}
          onClick={handleStop}
          className="w-full bg-[var(--gold)] hover:bg-[var(--gold-light)] text-black px-4 py-3 rounded-full text-[10px] font-extrabold tracking-[0.15em] uppercase transition-all flex items-center justify-center gap-2"
        >
          <Phone size={14} />
          Transfer to Live Agent
        </a>
      )}

      {isActive && transcription && (
        <div className="text-[11px] text-white/70 italic max-w-[180px] text-center min-h-[32px] leading-relaxed">
          "{transcription}"
        </div>
      )}

      {error && !isActive && (
        <div className="text-[10px] text-red-400 text-center max-w-[180px] leading-relaxed">
          {error}
        </div>
      )}

      {transferRequested && !isActive && (
        <a
          href={`tel:${transferPhone}`}
          className="w-full bg-white/10 hover:bg-white/20 text-white border border-gold/40 px-4 py-3 rounded-full text-[10px] font-extrabold tracking-[0.15em] uppercase transition-all flex items-center justify-center gap-2"
        >
          <Phone size={14} />
          Call Dispatch Directly
        </a>
      )}

      {!configured && !error && !isActive && (
        <div className="text-[10px] text-amber-400 text-center max-w-[180px] leading-relaxed">
          Voice agents require Vapi public key and assistant IDs.
        </div>
      )}

      {configured && !isActive && (
        <div className="w-full border-t border-white/10 pt-4 flex flex-col items-center gap-2.5">
          <p className="text-[9px] uppercase tracking-[0.3em] text-white/40 font-bold">Or get a real phone call</p>
          <input
            value={callMeName}
            onChange={(e) => setCallMeName(e.target.value)}
            placeholder="Your name (optional)"
            className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-xs text-white placeholder-white/30 outline-none focus:border-gold/50"
          />
          <input
            value={callMePhone}
            onChange={(e) => setCallMePhone(e.target.value)}
            placeholder="Your phone number"
            inputMode="tel"
            className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-xs text-white placeholder-white/30 outline-none focus:border-gold/50"
          />
          <button
            onClick={handleCallMe}
            disabled={callMeState === 'sending'}
            className="w-full bg-gold text-black px-4 py-2.5 rounded-full text-[10px] font-extrabold tracking-[0.2em] uppercase hover:bg-[var(--gold-light)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {callMeState === 'sending' ? 'Calling\u2026' : 'Call Me Now'}
          </button>
          {callMeMsg && (
            <div className={`text-[10px] text-center max-w-[200px] leading-relaxed ${callMeState === 'error' ? 'text-red-400' : 'text-emerald-400'}`}>
              {callMeMsg}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VoiceAgent;
