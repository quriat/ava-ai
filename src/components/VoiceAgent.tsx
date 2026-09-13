import React, { useState, useRef } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { AgentType } from '../types';
import { decode, decodeAudioData, createPcmBlob } from '../services/audioUtils';
import { COMPANY_INFO, FLEET_DATA } from '../data/avalimoData';

interface VoiceAgentProps {
  type: AgentType;
  icon: React.ReactNode;
}

function buildSystemInstruction(type: AgentType): string {
  const fleetRates = FLEET_DATA.map(v =>
    `${v.name}: ${v.passengers} pax, ${v.luggage} bags, $${v.pricePerHour}/hr (${v.minHours}hr min), IAH-Downtown ~$${v.flatRateIAH}, Hobby-Downtown ~$$${v.flatRateHobby}, IAH-Galveston ~$${v.flatRateGalveston}`
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

  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startSession = async () => {
    try {
      setStatus('Initializing...');
      setIsActive(true);

      const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('No Gemini API key configured. Please set GEMINI_API_KEY in environment variables.');
      }

      const ai = new GoogleGenAI({ apiKey });

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone access is not supported in this browser or context. Please use HTTPS and a modern browser.');
      }

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      inputAudioContextRef.current = new AudioCtx({ sampleRate: 16000 });
      audioContextRef.current = new AudioCtx({ sampleRate: 24000 });

      await inputAudioContextRef.current.resume();
      await audioContextRef.current.resume();

      setStatus('Requesting Mic...');
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (micErr: any) {
        if (micErr.name === 'NotAllowedError') {
          throw new Error('Microphone permission denied. Please allow microphone access and try again.');
        }
        if (micErr.name === 'NotFoundError') {
          throw new Error('No microphone found. Please connect a microphone and try again.');
        }
        throw new Error(`Microphone error: ${micErr.message || micErr.name}`);
      }
      streamRef.current = stream;

      const systemInstruction = buildSystemInstruction(type);

      setStatus('Connecting...');
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: type === AgentType.FRONT_DESK ? 'Kore' : 'Puck'
              }
            }
          },
          systemInstruction,
          outputAudioTranscription: {},
          inputAudioTranscription: {}
        },
        callbacks: {
          onopen: () => {
            setStatus('Active');
            if (inputAudioContextRef.current && stream) {
              const source = inputAudioContextRef.current.createMediaStreamSource(stream);
              const scriptProcessor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);

              scriptProcessor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const pcmBlob = createPcmBlob(inputData);
                sessionPromise.then(session => {
                  if (session) session.sendRealtimeInput({ media: pcmBlob });
                }).catch(err => console.error('Error sending audio:', err));
              };

              source.connect(scriptProcessor);
              scriptProcessor.connect(inputAudioContextRef.current.destination);
            }
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              setTranscription(prev => prev + message.serverContent!.outputTranscription!.text);
            }

            const base64Audio = message.serverContent?.modelTurn?.parts?.find(p => p.inlineData)?.inlineData?.data;
            if (base64Audio && audioContextRef.current) {
              const ctx = audioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);

              try {
                const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
                const source = ctx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(ctx.destination);
                source.addEventListener('ended', () => sourcesRef.current.delete(source));
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                sourcesRef.current.add(source);
              } catch (decodeErr) {
                console.error('Audio decoding failed:', decodeErr);
              }
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => {
                try { s.stop(); } catch (e) {}
              });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }

            if (message.serverContent?.turnComplete) {
              setTimeout(() => setTranscription(''), 3000);
            }
          },
          onerror: (err) => {
            console.error('Live AI Error:', err);
            setStatus('Error');
            stopSession();
          },
          onclose: () => {
            setStatus('Ready');
            setIsActive(false);
          }
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      console.error('Failed to start session:', err);
      setStatus('Failed');
      setError(err.message || 'Failed to start voice session. Please try again.');
      setIsActive(false);
      stopSession();
    }
  };

  const stopSession = () => {
    if (sessionRef.current) {
      try { sessionRef.current.close(); } catch (e) {}
      sessionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (inputAudioContextRef.current) {
      try { inputAudioContextRef.current.close(); } catch (e) {}
      inputAudioContextRef.current = null;
    }
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch (e) {}
      audioContextRef.current = null;
    }
    sourcesRef.current.forEach(s => {
      try { s.stop(); } catch (e) {}
    });
    sourcesRef.current.clear();
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
