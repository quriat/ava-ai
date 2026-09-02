import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';
import { getConciergeResponse } from '../services/geminiService';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

const AIConcierge: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: "Hello! I'm Avali, your luxury concierge. How can I assist you with your travel plans today?\n\nPrefer to talk? Call my AI line 24/7: (832) 917-6331" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMsg = inputValue;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInputValue('');
    setIsLoading(true);

    try {
      const responseText = await getConciergeResponse(userMsg);
      setMessages(prev => [...prev, { role: 'assistant', text: responseText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', text: "I'm sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[calc(100vw-2rem)] sm:w-80 md:w-96 max-w-sm h-[min(500px,65vh)] bg-neutral-900 rounded-xl shadow-2xl border border-amber-500/30 flex flex-col overflow-hidden animate-fade-in-up">
          {/* Header */}
          <div className="bg-neutral-800 p-4 flex justify-between items-center border-b border-neutral-700">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              <div>
                <h3 className="text-white font-semibold flex items-center">
                  <Sparkles size={16} className="mr-2 text-amber-500" />
                  Avali Concierge
                </h3>
                <a
                  href="tel:+18329176331"
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold"
                >
                  AI Line 24/7: (832) 917-6331
                </a>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-900/95">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-lg text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-amber-600 text-white rounded-br-none' 
                    : 'bg-neutral-800 text-gray-200 rounded-bl-none border border-neutral-700'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-neutral-800 p-3 rounded-lg rounded-bl-none border border-neutral-700 flex space-x-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-neutral-800 border-t border-neutral-700">
            <div className="flex items-center bg-neutral-900 rounded-full border border-neutral-700 px-4 py-2 focus-within:border-amber-500 transition-colors">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask about rates, cars..."
                className="flex-1 bg-transparent text-white text-sm focus:outline-none"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading || !inputValue.trim()}
                className="ml-2 text-amber-500 hover:text-amber-400 disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
          isOpen ? 'bg-neutral-700 text-gray-300' : 'bg-amber-600 text-white animate-bounce-slow'
        }`}
      >
        {isOpen ? <X size={28} /> : <MessageSquare size={28} fill="currentColor" />}
      </button>
    </div>
  );
};

export default AIConcierge;
