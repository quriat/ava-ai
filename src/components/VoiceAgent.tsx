import React, { useState, useRef, useCallback, useEffect } from 'react';
import { AgentType } from '../types';
import { COMPANY_INFO, FLEET_DATA } from '../data/avalimoData';

interface VoiceAgentProps {
  type: AgentType;
  icon: React.ReactNode;
}

// Browser speech types
interface SpeechRecognitionCtor {
  new (): SpeechRecognitionInstance;
}
interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
    GEMINI_API_KEY?: string;
    OPENROUTER_API_KEY?: string;
    TELEGRAM_BOT_TOKEN?: string;
    __AI_ENDPOINT__?: string;
  }
}

function buildSystemInstruction(type: AgentType): string {
  const fleetRates = FLEET_DATA.map(v =>
    `${v.name}: ${v.passengers} pax, ${v.luggage} bags, $${v.pricePerHour}/hr (${v.minHours}hr min), IAH-Downtown ~$${v.flatRateIAH}, Hobby-Downtown ~$${v.flatRateHobby}, IAH-Galveston ~$${v.flatRateGalveston}`
  ).join('\n');

  const base = `You are "Avali", the AI voice concierge for AvaLimo Houston (avalimo.net). You represent Houston's premier luxury chauffeur service since 2013.

Company Info:
- 24/7 Dispatch: ${COMPANY_INFO.phone}
- Email: ${COMPANY_INFO.email}
- Service area: Greater Houston, IAH, Hobby, Galveston, The Woodlands, Katy, Sugar Land
- Guarantees: flat-rate pricing (zero surge), real-time flight tracking, 45/60 min free airport wait, complimentary meet & greet, Wi-Fi, bottled water

Fleet & Rates:
${fleetRates}

Voice Guidelines:
- Keep responses SHORT (1-3 sentences). This is a voice call.
- Be warm, professional, and concise.
- If asked for a quote, give the relevant rate above and invite the caller to book on the website or call dispatch.
- If the user wants to book, collect: name, phone, pickup date/time, pickup location, dropoff, vehicle preference, flight number if airport.
- If asked to "leave a message for Adam" or similar, say you will deliver it and end the reply with: [MESSAGE_FOR_ADAM: <their message>].`;

  if (type === AgentType.FRONT_DESK) {
    return base + "\nYou are the Front Desk AI. Focus on service information, pricing, and new reservations.";
  }
  return base + "\nYou are the Dispatch AI. Focus on ride status, logistics, coordination, and reassuring existing customers. If the caller has an active ride, ask for confirmation code or phone number.";
}

const VoiceAgent: React.FC<VoiceAgentProps> = ({ type, icon }) => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('Ready');
  const [transcription, setTranscription] = useState('');
  const [lastReply, setLastReply] = useState('');
  const [error, setError] = useState('');

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const sessionActiveRef = useRef(false);
  const pendingTranscriptRef = useRef('');

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

  const speakText = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1;
    speechSynthesis.speak(utterance);
  }, []);

  const callGemini = useCallback(async (userText: string): Promise<string> => {
    const apiKey = window.GEMINI_API_KEY || '';
    const endpoint = window.__AI_ENDPOINT__ || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
    const url = `${endpoint}?key=${apiKey}`;

    const body = {
      system_instruction: { parts: [{ text: buildSystemInstruction(type) }] },
      contents: [
        {
          role: 'user',
          parts: [{ text: userText }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 200,
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Gemini ${response.status}: ${text}`);
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    return reply;
  }, [type]);

  const processUserText = useCallback(async (text: string) => {
    if (!sessionActiveRef.current) return;
    if (!text.trim()) return;

    setTranscription(text);
    setStatus('Thinking...');

    try {
      const reply = await callGemini(text);
      if (!reply || !sessionActiveRef.current) return;

      setLastReply(reply);

      // Extract and forward message for Adam
      const match = reply.match(/\[MESSAGE_FOR_ADAM:\s*(.+?)\]/is);
      if (match) {
        await sendMessageToAdam(match[1].trim());
        const cleaned = reply.replace(/\[MESSAGE_FOR_ADAM:\s*.+?\]/is, '').trim();
        speakText(cleaned || 'Your message has been recorded. We will make sure Adam gets it.');
        setLastReply(cleaned || 'Your message has been recorded. We will make sure Adam gets it.');
      } else {
        speakText(reply);
      }
    } catch (err: any) {
      console.error('AI processing error:', err);
      setStatus('Error');
      setError(err.message || 'Failed to get response.');
    }
  }, [callGemini, sendMessageToAdam, speakText]);

  const startRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      throw new Error('Speech recognition is not supported in this browser.');
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setStatus('Listening...');
    };

    recognition.onresult = (event: any) => {
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        }
      }
      if (final.trim()) {
        pendingTranscriptRef.current = final.trim();
        processUserText(final.trim());
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'aborted' || event.error === 'no-speech') return;
      console.error('Speech recognition error:', event.error);
      setStatus('Mic Error');
      setError(`Mic error: ${event.error}`);
    };

    recognition.onend = () => {
      // Restart if session still active
      if (sessionActiveRef.current && recognitionRef.current === recognition) {
        try {
          recognition.start();
        } catch (e) {
          console.warn('Could not restart recognition:', e);
        }
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [processUserText]);

  const startSession = useCallback(async () => {
    try {
      setError('');
      setTranscription('');
      setLastReply('');
      setIsActive(true);
      setStatus('Initializing...');
      sessionActiveRef.current = true;

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        throw new Error('Speech recognition not supported in this browser. Try Chrome or Edge.');
      }

      if (!window.GEMINI_API_KEY) {
        throw new Error('AI key not configured. The voice concierge is unavailable.');
      }

      // Request mic permission early
      await navigator.mediaDevices.getUserMedia({ audio: true });

      startRecognition();
    } catch (err: any) {
      console.error('Failed to start session:', err);
      setStatus('Failed');
      setError(err.message || 'Failed to start call.');
      setIsActive(false);
      sessionActiveRef.current = false;
    }
  }, [startRecognition]);

  const stopSession = useCallback(() => {
    sessionActiveRef.current = false;
    speechSynthesis.cancel();

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        // ignore
      }
      recognitionRef.current = null;
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
          Call {type === AgentType.FRONT_DESK ? 'Desk' : 'Dispatch'}
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

      {isActive && lastReply && (
        <div className="text-[11px] text-gold/90 max-w-[180px] text-center leading-relaxed">
          Ava: {lastReply}
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
