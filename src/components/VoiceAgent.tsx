import React, { useState, useRef, useCallback, useEffect } from 'react';
import { AgentType } from '../types';

interface VoiceAgentProps {
  type: AgentType;
  icon: React.ReactNode;
}

declare global {
  interface Window {
    Vapi?: any;
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

  const vapiRef = useRef<any>(null);
  const callRef = useRef<any>(null);

  const sendMessageToAdam = useCallback(async (message: string) => {
    const botToken = window.TELEGRAM_BOT_TOKEN;
    if (!botToken || botToken === 'not_configured') {
      console.warn('Telegram bot token not configured; cannot forward message to Adam.');
      return;
    }
    try {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: 5820707923,
          text: `🎤 **AvaLimo AI Voice Message**\n\n${message}\n\n_${new Date().toLocaleString()}_`,
          parse_mode: 'Markdown',
        }),
      });
    } catch (err) {
      console.error('Failed to send Telegram message:', err);
    }
  }, []);

  // Load Vapi SDK on mount
  useEffect(() => {
    if (window.Vapi) return; // Already loaded
    const script = document.createElement('script');
    script.src = 'https://cdn.vapi.ai/web.js';
    script.async = true;
    script.onload = () => {
      console.log('Vapi SDK loaded');
    };
    document.head.appendChild(script);
  }, []);

  const startSession = useCallback(async () => {
    try {
      setError('');
      setTranscription('');
      setIsActive(true);
      setStatus('Connecting...');

      if (!window.Vapi) {
        throw new Error('Vapi SDK not loaded. Please refresh and try again.');
      }

      const publicKey = window.VAPI_PUBLIC_KEY;
      const assistantId = window.VAPI_ASSISTANT_ID;

      if (!publicKey || !assistantId) {
        throw new Error('Vapi credentials not configured.');
      }

      // Initialize Vapi
      vapiRef.current = new window.Vapi({
        apiKey: publicKey,
      });

      // Attach event listeners
      vapiRef.current.on('speech-start', () => {
        setStatus('Listening...');
      });

      vapiRef.current.on('speech-end', () => {
        setStatus('Processing...');
      });

      vapiRef.current.on('message', (message: any) => {
        if (message.type === 'user-transcription') {
          setTranscription(message.transcription || '');
        } else if (message.type === 'assistant-message') {
          console.log('Assistant message:', message);
        }
      });

      vapiRef.current.on('call-start', () => {
        setStatus('Connected');
      });

      vapiRef.current.on('call-end', () => {
        setIsActive(false);
        setStatus('Ready');
        setTranscription('');
      });

      vapiRef.current.on('error', (error: any) => {
        console.error('Vapi error:', error);
        setStatus('Error');
        setError(error.message || 'Call failed.');
        setIsActive(false);
      });

      // Request mic permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Start call with assistant
      await vapiRef.current.start(assistantId);
      callRef.current = vapiRef.current;
    } catch (err: any) {
      console.error('Failed to start session:', err);
      setStatus('Failed');
      setError(err.message || 'Failed to start call.');
      setIsActive(false);
    }
  }, []);

  const stopSession = useCallback(() => {
    if (callRef.current) {
      try {
        callRef.current.stop();
      } catch (e) {
        console.warn('Error stopping call:', e);
      }
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
          className="border-2 border-gold/40 text-gold px-8 py-3 rounded-full text-[10px] font-extrabold tracking-[0.2em] uppercase hover:bg-gold hover:text-black transition-all w-full"
        >
          Call {type === 'Front Desk' ? 'Desk' : 'Dispatch'}
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
