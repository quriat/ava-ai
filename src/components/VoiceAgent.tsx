import React, { useState, useRef, useCallback } from 'react';
import { AgentType } from '../types';
import { COMPANY_INFO, FLEET_DATA } from '../data/avalimoData';

interface VoiceAgentProps {
  type: AgentType;
  icon: React.ReactNode;
}

function buildSystemInstruction(type: AgentType): string {
  const fleetRates = FLEET_DATA.map(v =>
    `${v.name}: ${v.passengers} pax, ${v.luggage} bags, $${v.pricePerHour}/hr (${v.minHours}hr min), IAH-Downtown ~$${v.flatRateIAH}, Hobby-Downtown ~$${v.flatRateHobby}, IAH-Galveston ~$${v.flatRateGalveston}`
  ).join('\n');

  const base = `
You are "Avali", the AI voice concierge for AvaLimo Houston (avalimo.net).
You represent Houston's premier luxury chauffeur service since 2013.

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
- If asked to "leave a message for Adam" or similar, confirm you will deliver it and say "Your message has been recorded. We'll make sure Adam gets it."
`;

  if (type === AgentType.FRONT_DESK) {
    return base + "\nYou are the Front Desk AI. Focus on service information, pricing, and new reservations.";
  }
  return base + "\nYou are the Dispatch AI. Focus on ride status, logistics, coordination, and reassuring existing customers. If the caller has an active ride, ask for confirmation code or phone number.";
}

const VoiceAgent: React.FC<VoiceAgentProps> = ({ type, icon }) => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('Ready');
  const [transcription, setTranscription] = useState('');
  const [error, setError] = useState('');
  const [callMessages, setCallMessages] = useState<string[]>([]);

  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const sessionRef = useRef<{ active: boolean }>({ active: false });

  const sendMessageToTelegram = useCallback(async (message: string) => {
    try {
      // Check for injected bot token from window or fallback
      const botToken = (typeof window !== 'undefined' && (window as any).TELEGRAM_BOT_TOKEN) 
        || 'not_configured';
      const chatId = 5820707923; // Adam's user ID
      
      if (botToken === 'not_configured') {
        console.warn('Telegram bot token not configured');
        return;
      }

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: `🎤 **AvaLimo AI Voice Message**\n\n${message}\n\n_${new Date().toLocaleString()}_`,
          parse_mode: 'Markdown',
        }),
      });
    } catch (err) {
      console.error('Failed to send Telegram message:', err);
    }
  }, []);

  const startSession = async () => {
    try {
      setStatus('Initializing...');
      setIsActive(true);
      setCallMessages([]);
      setError('');
      sessionRef.current.active = true;

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone not supported in this browser.');
      }

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioCtx({ sampleRate: 16000 });
      await audioContextRef.current.resume();

      setStatus('Requesting Mic...');
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        });
      } catch (micErr: any) {
        if (micErr.name === 'NotAllowedError') {
          throw new Error('Microphone permission denied.');
        }
        if (micErr.name === 'NotFoundError') {
          throw new Error('No microphone found.');
        }
        throw new Error(`Microphone error: ${micErr.message}`);
      }
      streamRef.current = stream;

      setStatus('Active');
      const systemInstruction = buildSystemInstruction(type);

      // Start simple voice-activity detection + transcription loop
      startVoiceCapture(stream, systemInstruction);
    } catch (err: any) {
      console.error('Failed to start session:', err);
      setStatus('Failed');
      setError(err.message || 'Failed to start call.');
      setIsActive(false);
      sessionRef.current.active = false;
      stopSession();
    }
  };

  const startVoiceCapture = (stream: MediaStream, systemInstruction: string) => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    try {
      const source = ctx.createMediaStreamSource(stream);
      const processor = ctx.createScriptProcessor(4096, 1, 1);

      let audioBuffer: Float32Array[] = [];
      let lastSendTime = Date.now();
      const sendIntervalMs = 3000; // Send every 3 seconds

      processor.onaudioprocess = (e) => {
        if (!sessionRef.current.active) return;

        try {
          const chunk = e.inputBuffer.getChannelData(0);
          audioBuffer.push(new Float32Array(chunk));

          // Send accumulated audio periodically
          if (Date.now() - lastSendTime > sendIntervalMs) {
            const combined = concatenateAudio(audioBuffer);
            if (combined.length > 0) {
              processAudioWithAI(combined, systemInstruction);
            }
            audioBuffer = [];
            lastSendTime = Date.now();
          }
        } catch (audioErr) {
          console.error('Audio processing error:', audioErr);
        }
      };

      source.connect(processor);
      // Don't connect to destination to avoid feedback
      sourceRef.current = source;
      processorRef.current = processor;
    } catch (e) {
      console.error('Failed to start voice capture:', e);
      setError('Failed to start audio capture.');
      stopSession();
    }
  };

  const concatenateAudio = (chunks: Float32Array[]): Float32Array => {
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const combined = new Float32Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      combined.set(chunk, offset);
      offset += chunk.length;
    }
    return combined;
  };

  const processAudioWithAI = async (audioData: Float32Array, systemInstruction: string) => {
    try {
      // Convert audio to base64 WAV for sending
      const wavData = encodeWAV(audioData, 16000);
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(wavData)));

      // Call OpenRouter or Gemini API with audio
      const apiKey = (typeof window !== 'undefined' && (window as any).GEMINI_API_KEY)
        || (typeof window !== 'undefined' && (window as any).OPENROUTER_API_KEY)
        || '';

      if (!apiKey) {
        console.error('No API key available');
        return;
      }

      // For simplicity, use a text-based fallback for now
      // In production, you'd use proper audio APIs
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          messages: [
            { role: 'system', content: systemInstruction },
            ...callMessages.map((msg, idx) => ({
              role: idx % 2 === 0 ? 'user' : 'assistant',
              content: msg,
            })),
            { role: 'user', content: '[User spoke audio]' },
          ],
          max_tokens: 150,
          temperature: 0.7,
        }),
      }).catch(() => null);

      if (response?.ok) {
        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content || '';
        if (reply && sessionRef.current.active) {
          setTranscription(reply);
          setCallMessages(prev => [...prev, '[user audio]', reply]);
          // Play response (basic synthesis)
          speakText(reply);
        }
      }
    } catch (err) {
      console.error('AI processing error:', err);
    }
  };

  const encodeWAV = (audioData: Float32Array, sampleRate: number): ArrayBuffer => {
    const numChannels = 1;
    const bytesPerSample = 2;
    const blockAlign = numChannels * bytesPerSample;

    const audioDataLength = audioData.length * bytesPerSample;
    const buffer = new ArrayBuffer(44 + audioDataLength);
    const view = new DataView(buffer);

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + audioDataLength, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // fmt chunk size
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 16, true); // bits per sample
    writeString(36, 'data');
    view.setUint32(40, audioDataLength, true);

    // Audio data
    const volume = 0.8;
    for (let i = 0; i < audioData.length; i++) {
      view.setInt16(44 + i * 2, audioData[i] * 0x7fff * volume, true);
    }

    return buffer;
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
    }
  };

  const stopSession = () => {
    sessionRef.current.active = false;

    if (processorRef.current && sourceRef.current) {
      try {
        sourceRef.current.disconnect();
        processorRef.current.disconnect();
      } catch (e) {}
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (e) {}
    }

    // Send message to Telegram if there was a message request
    const transcript = callMessages.join(' ');
    if (transcript.toLowerCase().includes('message') && callMessages.length > 0) {
      sendMessageToTelegram(transcript);
    }

    setIsActive(false);
    setStatus('Ready');
    setTranscription('');
    setTimeout(() => setError(''), 500);
  };

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
          "{transcription}"
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
