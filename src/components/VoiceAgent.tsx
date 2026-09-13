import React, { useState, useRef, useCallback, useEffect } from 'react';
import { AgentType } from '../types';

interface VoiceAgentProps {
  type: AgentType;
  icon: React.ReactNode;
}

declare global {
  interface Window {
    VapiClass?: any;
    VAPI_PUBLIC_KEY?: string;
    VAPI_ASSISTANT_ID?: string;
  }
}

const VoiceAgent: React.FC<VoiceAgentProps> = ({ type, icon }) => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('Ready');
  const [transcription, setTranscription] = useState('');
  const [error, setError] = useState('');
  const [sdkReady, setSdkReady] = useState(false);

  const vapiRef = useRef<any>(null);

  // Check if SDK is loaded
  useEffect(() => {
    const checkSDK = () => {
      if (window.VapiClass) {
        setSdkReady(true);
        return true;
      }
      return false;
    };

    if (checkSDK()) return;

    // Poll for SDK load (module loads async)
    const interval = setInterval(() => {
      if (checkSDK()) {
        clearInterval(interval);
      }
    }, 100);

    // Cleanup after 10 seconds
    const timeout = setTimeout(() => clearInterval(interval), 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  const startSession = useCallback(async () => {
    try {
      setError('');
      setTranscription('');
      setIsActive(true);
      setStatus('Connecting...');

      const VapiClass = window.VapiClass;
      if (!VapiClass) {
        throw new Error('Vapi SDK not loaded. Please refresh and try again.');
      }

      const publicKey = window.VAPI_PUBLIC_KEY;
      const assistantId = window.VAPI_ASSISTANT_ID;

      if (!publicKey || !assistantId) {
        throw new Error('Vapi credentials not configured.');
      }

      // Request mic permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Create Vapi instance
      const vapi = new VapiClass(publicKey);
      vapiRef.current = vapi;

      // Attach event listeners
      vapi.on('call-start', () => {
        console.log('Call started');
        setStatus('Connected');
      });

      vapi.on('call-end', () => {
        console.log('Call ended');
        setIsActive(false);
        setStatus('Ready');
        setTranscription('');
        vapiRef.current = null;
      });

      vapi.on('speech-start', () => {
        setStatus('Listening...');
      });

      vapi.on('speech-end', () => {
        setStatus('Processing...');
      });

      vapi.on('message', (message: any) => {
        console.log('Vapi message:', message);
        if (message.type === 'transcript' && message.role === 'user') {
          setTranscription(message.transcript || '');
        }
      });

      vapi.on('error', (err: any) => {
        console.error('Vapi error:', err);
        setError(err.message || 'Call failed.');
        setIsActive(false);
        setStatus('Ready');
      });

      // Start the call with assistant ID
      console.log('Starting call with assistant:', assistantId);
      await vapi.start(assistantId);

    } catch (err: any) {
      console.error('Failed to start session:', err);
      setStatus('Failed');
      setError(err.message || 'Failed to start call.');
      setIsActive(false);
    }
  }, []);

  const stopSession = useCallback(() => {
    if (vapiRef.current) {
      try {
        vapiRef.current.stop();
      } catch (e) {
        console.warn('Error stopping call:', e);
      }
      vapiRef.current = null;
    }
    setIsActive(false);
    setStatus('Ready');
    setTranscription('');
  }, []);

  useEffect(() => {
    return () => {
      if (vapiRef.current) {
        try {
          vapiRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

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
