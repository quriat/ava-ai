import React, { useState, useRef, useCallback, useEffect } from 'react';
import { AgentType } from '../types';

interface VoiceAgentProps {
  type: AgentType;
  icon: React.ReactNode;
}

declare global {
  interface Window {
    vapiSDK?: any;
    vapiInstance?: any;
    VAPI_PUBLIC_KEY?: string;
    VAPI_ASSISTANT_ID?: string;
    TELEGRAM_BOT_TOKEN?: string;
  }
}

const VoiceAgent: React.FC<VoiceAgentProps> = ({ type, icon }) => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('Ready');
  const [transcription, setTranscription] = useState('');
  const [error, setError] = useState('');
  const [sdkReady, setSdkReady] = useState(false);

  const vapiInstanceRef = useRef<any>(null);

  // Check if SDK is loaded
  useEffect(() => {
    const checkSDK = () => {
      if (window.vapiSDK) {
        setSdkReady(true);
        return true;
      }
      return false;
    };

    if (checkSDK()) return;

    // Poll for SDK load (script has defer)
    const interval = setInterval(() => {
      if (checkSDK()) {
        clearInterval(interval);
      }
    }, 100);

    // Cleanup after 10 seconds
    setTimeout(() => clearInterval(interval), 10000);

    return () => clearInterval(interval);
  }, []);

  const startSession = useCallback(async () => {
    try {
      setError('');
      setTranscription('');
      setIsActive(true);
      setStatus('Connecting...');

      if (!window.vapiSDK) {
        throw new Error('Vapi SDK not loaded. Please refresh and try again.');
      }

      const publicKey = window.VAPI_PUBLIC_KEY;
      const assistantId = window.VAPI_ASSISTANT_ID;

      if (!publicKey || !assistantId) {
        throw new Error('Vapi credentials not configured.');
      }

      // Request mic permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Initialize Vapi instance using the SDK
      vapiInstanceRef.current = window.vapiSDK.run({
        apiKey: publicKey,
        assistant: assistantId,
        config: {
          hideButton: true, // We use our own button
          position: 'bottom-right',
        }
      });

      // The SDK auto-starts the call when run() is called
      setStatus('Connected');

      // Listen for call end via the instance
      if (vapiInstanceRef.current && vapiInstanceRef.current.on) {
        vapiInstanceRef.current.on('call-end', () => {
          setIsActive(false);
          setStatus('Ready');
          setTranscription('');
        });

        vapiInstanceRef.current.on('error', (err: any) => {
          console.error('Vapi error:', err);
          setError(err.message || 'Call failed.');
          setIsActive(false);
          setStatus('Ready');
        });

        vapiInstanceRef.current.on('message', (msg: any) => {
          if (msg.type === 'transcript' && msg.role === 'user') {
            setTranscription(msg.transcript || '');
          }
        });
      }

    } catch (err: any) {
      console.error('Failed to start session:', err);
      setStatus('Failed');
      setError(err.message || 'Failed to start call.');
      setIsActive(false);
    }
  }, []);

  const stopSession = useCallback(() => {
    if (vapiInstanceRef.current) {
      try {
        if (vapiInstanceRef.current.stop) {
          vapiInstanceRef.current.stop();
        } else if (vapiInstanceRef.current.destroy) {
          vapiInstanceRef.current.destroy();
        }
      } catch (e) {
        console.warn('Error stopping call:', e);
      }
      vapiInstanceRef.current = null;
    }
    setIsActive(false);
    setStatus('Ready');
    setTranscription('');
  }, []);

  useEffect(() => {
    return () => {
      stopSession();
    };
  }, [stopSession]);

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
          onClick={startSession}
          disabled={!sdkReady}
          className={`border-2 border-gold/40 text-gold px-8 py-3 rounded-full text-[10px] font-extrabold tracking-[0.2em] uppercase transition-all w-full ${sdkReady ? 'hover:bg-gold hover:text-black' : 'opacity-50 cursor-not-allowed'}`}
        >
          {sdkReady ? `Call ${type === 'Front Desk' ? 'Desk' : 'Dispatch'}` : 'Loading...'}
        </button>
      ) : (
        <button
          onClick={stopSession}
          className="bg-red-600/20 border border-red-600/40 text-red-500 px-8 py-3 rounded-full text-[10px] font-extrabold tracking-[0.2em] uppercase hover:bg-red-600 hover:text-white transition-all w-full"
        >
          End Call
        </button>
      )}

      {isActive && transcription && (
        <div className="text-[11px] text-white/70 italic max-w-[180px] text-center min-h-[32px] leading-relaxed">
          You: "{transcription}"
        </div>
      )}

      {error && !isActive && (
        <div className="text-[10px] text-red-400 text-center max-w-[180px] leading-relaxed">
          {error}
        </div>
      )}
    </div>
  );
};

export default VoiceAgent;
