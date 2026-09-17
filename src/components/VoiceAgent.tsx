import React, { useState, useEffect, useCallback } from 'react';
import { AgentType } from '../types';
import { startVapiCall, stopVapiCall, getVapi, isVapiConfigured } from '../services/vapiVoiceService';

interface VoiceAgentProps {
  type: AgentType;
  icon: React.ReactNode;
}

const VoiceAgent: React.FC<VoiceAgentProps> = ({ type, icon }) => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('Ready');
  const [transcription, setTranscription] = useState('');
  const [error, setError] = useState('');
  const configured = isVapiConfigured();

  const handleStart = useCallback(() => {
    try {
      setError('');
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
  }, []);

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
    };

    const onCallEnd = () => {
      setIsActive(false);
      setStatus('Ready');
      setTranscription('');
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
    };

    const onError = (err: any) => {
      console.error('Vapi error:', err);
      setStatus('Error');
      setError('Call disconnected. Please try again.');
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
    <div className={`flex flex-col items-center gap-5 p-8 rounded-3xl transition-all border ${isActive ? 'bg-gold/10 border-gold/40 shadow-xl shadow-gold/10' : 'bg-white/5 border-white/5 hover:border-gold/20'}`}>
      <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isActive ? 'bg-gold text-black shadow-lg shadow-gold/50 animate-pulse' : 'bg-luxury text-gold border border-gold/20'}`}>
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
          className="border-2 border-gold/40 text-gold px-8 py-3 rounded-full text-[10px] font-extrabold tracking-[0.2em] uppercase hover:bg-gold hover:text-black transition-all w-full disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {configured ? `Call ${type === AgentType.FRONT_DESK ? 'Desk' : 'Dispatch'}` : 'Configure Voice'}
        </button>
      ) : (
        <button
          onClick={handleStop}
          className="bg-red-600/20 border border-red-600/40 text-red-500 px-8 py-3 rounded-full text-[10px] font-extrabold tracking-[0.2em] uppercase hover:bg-red-600 hover:text-white transition-all w-full"
        >
          End Call
        </button>
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

      {!configured && !error && !isActive && (
        <div className="text-[10px] text-amber-400 text-center max-w-[180px] leading-relaxed">
          Voice agents require Vapi public key and assistant IDs.
        </div>
      )}
    </div>
  );
};

export default VoiceAgent;
