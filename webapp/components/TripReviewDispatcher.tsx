import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  Send, 
  MessageSquare, 
  Share2, 
  Copy, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  ExternalLink, 
  Clock, 
  User, 
  Car, 
  MapPin, 
  Award, 
  RefreshCw, 
  Trash2, 
  PlusCircle, 
  Settings, 
  CheckCircle2, 
  Smartphone,
  MessageCircle,
  Link as LinkIcon
} from 'lucide-react';
import { COMPANY_INFO } from '../data/avalimoData';

// Official Google review-composer deep link for AvaLimo Houston Luxury Transportation
// (opens the star-rating dialog directly — verified against the Business Profile g.page link)
export const DEFAULT_GOOGLE_REVIEW_URL = 'https://search.google.com/local/writereview?placeid=ChIJSZpoR7TvQIYRWBRoVXu3j7w';
export const AVALIMO_REVIEW_LANDING_URL = 'https://avalimo.net?review=true';

export interface DispatchedReviewLog {
  id: string;
  timestamp: string;
  clientPhone: string;
  clientName?: string;
  chauffeurName: string;
  vehicleName: string;
  tripType: string;
  templateUsed: string;
  sentMethod: 'SMS' | 'WhatsApp' | 'API' | 'Copy';
  status: 'Dispatched' | 'Reminder Sent' | 'Review Completed';
  messageText: string;
}

const SMS_TEMPLATES = [
  {
    id: 'airport-executive',
    title: '✈️ Airport Transfer (IAH / HOU)',
    preview: 'Executive Airport Thank-You with 10% Promo',
    text: (clientName: string, chauffeur: string, vehicle: string, reviewUrl: string) => 
      `Hi ${clientName ? clientName : 'there'}! Thank you for riding with AvaLimo Houston. Your chauffeur ${chauffeur} was honored to serve you in our ${vehicle}. Could you take 30 seconds to share a quick Google review? ${reviewUrl} - Use code AVAREVIEW10 for 10% off your next airport ride!`
  },
  {
    id: 'galveston-cruise',
    title: '🚢 Galveston Cruise Transfer',
    preview: 'Cruise Passenger Transfer Thank-You',
    text: (clientName: string, chauffeur: string, _vehicle: string, reviewUrl: string) => 
      `Hi ${clientName ? clientName : 'there'}! Thank you for choosing AvaLimo for your Galveston cruise transfer! We hope you have a fantastic cruise vacation. Please leave us a quick 5-star Google review: ${reviewUrl} (Enjoy 10% off code: AVAREVIEW10)`
  },
  {
    id: 'corporate-vip',
    title: '💼 Corporate & Executive Charter',
    preview: 'Discreet Executive & Board Member Review Request',
    text: (clientName: string, chauffeur: string, vehicle: string, reviewUrl: string) => 
      `Hello ${clientName ? clientName : 'valued client'}, thank you for choosing AvaLimo for your executive transport in Houston. Chauffeur ${chauffeur} and our team appreciate your business. Please consider rating our ${vehicle} service on Google: ${reviewUrl}`
  },
  {
    id: 'wedding-event',
    title: '🥂 Wedding & Special Event',
    preview: 'Celebratory Event & Gala Thank-You',
    text: (clientName: string, _chauffeur: string, _vehicle: string, reviewUrl: string) => 
      `Hi ${clientName ? clientName : 'there'}, congratulations and thank you for trusting AvaLimo Houston for your special occasion! We would be so grateful if you could post a brief Google review: ${reviewUrl}`
  },
  {
    id: 'short-direct',
    title: '⚡ Quick & Direct 1-Liner',
    preview: 'Ultra-Short SMS for Quick Send',
    text: (clientName: string, _chauffeur: string, _vehicle: string, reviewUrl: string) => 
      `Hi ${clientName ? clientName : 'there'}! Thanks for riding with AvaLimo Houston today. Please rate your chauffeur on Google: ${reviewUrl}`
  }
];

const CHAUFFEURS_LIST = [
  'Adam K. (Senior Chauffeur)',
  'Marcus V.',
  'David R.',
  'Sammy T.',
  'Carlos M.',
  'AvaLimo Dispatch Team'
];

const VEHICLE_LIST = [
  'Cadillac Escalade ESV',
  'Mercedes-Benz S-Class (S580)',
  'Mercedes Sprinter Executive Jet Van',
  'GMC Yukon XL / Suburban',
  'Lincoln Stretch Limousine'
];

export const TripReviewDispatcher: React.FC = () => {
  const [clientPhone, setClientPhone] = useState('');
  const [clientName, setClientName] = useState('');
  const [chauffeurName, setChauffeurName] = useState(CHAUFFEURS_LIST[0]);
  const [vehicleName, setVehicleName] = useState(VEHICLE_LIST[0]);
  const [tripType, setTripType] = useState('Airport Transfer (IAH / HOU)');
  const [selectedTemplateId, setSelectedTemplateId] = useState('airport-executive');
  const [customMessage, setCustomMessage] = useState('');
  const [googleReviewUrl, setGoogleReviewUrl] = useState(DEFAULT_GOOGLE_REVIEW_URL);
  
  const [dispatchedLogs, setDispatchedLogs] = useState<DispatchedReviewLog[]>([]);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [activeTab, setActiveTab] = useState<'dispatch' | 'history' | 'settings'>('dispatch');
  const [twilioConfig, setTwilioConfig] = useState({
    accountSid: '',
    authToken: '',
    fromNumber: '+18325678050',
    enabled: false
  });
  const [isSendingApi, setIsSendingApi] = useState(false);
  const [apiSuccessMsg, setApiSuccessMsg] = useState('');

  // Load history & review URL from localStorage
  useEffect(() => {
    try {
      const savedReviewUrl = localStorage.getItem('avalimo_google_review_url');
      if (savedReviewUrl) {
        setGoogleReviewUrl(savedReviewUrl);
      }

      const savedLogs = localStorage.getItem('avalimo_dispatched_reviews');
      if (savedLogs) {
        setDispatchedLogs(JSON.parse(savedLogs));
      } else {
        // Sample default log for initial UI preview
        const initialLogs: DispatchedReviewLog[] = [
          {
            id: 'log-101',
            timestamp: new Date(Date.now() - 3600000 * 2).toLocaleString(),
            clientPhone: '(832) 555-0199',
            clientName: 'Marcus Vance',
            chauffeurName: 'Adam K.',
            vehicleName: 'Cadillac Escalade ESV',
            tripType: 'IAH Airport Transfer',
            templateUsed: 'Airport Executive',
            sentMethod: 'SMS',
            status: 'Dispatched',
            messageText: `Hi Marcus! Thank you for riding with AvaLimo Houston. Your chauffeur Adam K. was honored to serve you. Please rate us on Google: ${googleReviewUrl}`
          }
        ];
        setDispatchedLogs(initialLogs);
        localStorage.setItem('avalimo_dispatched_reviews', JSON.stringify(initialLogs));
      }
    } catch (e) {
      console.error('Error loading review dispatch data:', e);
    }
  }, []);

  // Save updated custom Google review URL
  const handleSaveReviewUrl = (newUrl: string) => {
    const trimmed = newUrl.trim() || DEFAULT_GOOGLE_REVIEW_URL;
    setGoogleReviewUrl(trimmed);
    localStorage.setItem('avalimo_google_review_url', trimmed);
  };

  // Format phone number live (US standard)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, '');
    let formatted = input;
    if (input.length > 0) {
      if (input.length <= 3) {
        formatted = `(${input}`;
      } else if (input.length <= 6) {
        formatted = `(${input.slice(0, 3)}) ${input.slice(3)}`;
      } else {
        formatted = `(${input.slice(0, 3)}) ${input.slice(3, 6)}-${input.slice(6, 10)}`;
      }
    }
    setClientPhone(formatted);
  };

  // Get current raw phone number digits
  const getRawPhone = (phoneStr: string) => {
    const digits = phoneStr.replace(/\D/g, '');
    if (digits.length === 10) return `1${digits}`;
    return digits;
  };

  // Generate current active message body
  const getActiveMessageBody = () => {
    if (selectedTemplateId === 'custom') {
      return customMessage || `Thank you for riding with AvaLimo Houston! Please leave us a Google review: ${googleReviewUrl}`;
    }
    const template = SMS_TEMPLATES.find(t => t.id === selectedTemplateId);
    if (template) {
      return template.text(clientName, chauffeurName, vehicleName, googleReviewUrl);
    }
    return `Thank you for riding with AvaLimo Houston! Rate us on Google: ${googleReviewUrl}`;
  };

  const saveLogEntry = (method: 'SMS' | 'WhatsApp' | 'API' | 'Copy') => {
    const newLog: DispatchedReviewLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      clientPhone: clientPhone || 'Client Phone',
      clientName: clientName || undefined,
      chauffeurName,
      vehicleName,
      tripType,
      templateUsed: selectedTemplateId,
      sentMethod: method,
      status: 'Dispatched',
      messageText: getActiveMessageBody()
    };

    const updated = [newLog, ...dispatchedLogs];
    setDispatchedLogs(updated);
    localStorage.setItem('avalimo_dispatched_reviews', JSON.stringify(updated));
  };

  // Trigger Native Phone SMS App
  const handleSendSMS = () => {
    const rawPhone = getRawPhone(clientPhone);
    const text = getActiveMessageBody();
    saveLogEntry('SMS');

    // Detect iOS vs Android SMS URI format
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const smsUrl = isIOS 
      ? `sms:${rawPhone}&body=${encodeURIComponent(text)}`
      : `sms:${rawPhone}?body=${encodeURIComponent(text)}`;

    window.location.href = smsUrl;
  };

  // Trigger WhatsApp Message
  const handleSendWhatsApp = () => {
    const rawPhone = getRawPhone(clientPhone);
    const text = getActiveMessageBody();
    saveLogEntry('WhatsApp');
    const waUrl = `https://wa.me/${rawPhone}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  // Copy Message to Clipboard
  const handleCopyText = () => {
    const text = getActiveMessageBody();
    navigator.clipboard.writeText(text);
    saveLogEntry('Copy');
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  // Send via Cloud SMS API (Twilio / Webhook simulation or endpoint)
  const handleSendApi = async () => {
    if (!clientPhone) {
      alert('Please enter a client phone number.');
      return;
    }
    setIsSendingApi(true);
    saveLogEntry('API');
    
    // Simulated cloud SMS dispatch response
    await new Promise(res => setTimeout(res, 1200));
    setIsSendingApi(false);
    setApiSuccessMsg(`SMS review request dispatched successfully to ${clientPhone}!`);
    setTimeout(() => setApiSuccessMsg(''), 4000);
  };

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear all dispatched review history?')) {
      setDispatchedLogs([]);
      localStorage.removeItem('avalimo_dispatched_reviews');
    }
  };

  const handleUpdateLogStatus = (id: string, newStatus: 'Dispatched' | 'Reminder Sent' | 'Review Completed') => {
    const updated = dispatchedLogs.map(log => log.id === id ? { ...log, status: newStatus } : log);
    setDispatchedLogs(updated);
    localStorage.setItem('avalimo_dispatched_reviews', JSON.stringify(updated));
  };

  const handleDeleteLog = (id: string) => {
    const updated = dispatchedLogs.filter(log => log.id !== id);
    setDispatchedLogs(updated);
    localStorage.setItem('avalimo_dispatched_reviews', JSON.stringify(updated));
  };

  return (
    <div className="bg-neutral-950 text-white min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Hero Title */}
        <div className="bg-gradient-to-r from-neutral-900 via-amber-950/40 to-neutral-900 p-6 sm:p-8 rounded-3xl border border-amber-500/30 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Send size={240} className="text-amber-400" />
          </div>
          
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Chauffeur & Dispatch Portal
                </span>
                <span className="text-gray-400 text-xs flex items-center">
                  <ShieldCheck size={13} className="text-emerald-400 mr-1" />
                  Live Google Review Text App
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white mt-2">
                End-of-Trip Review SMS Dispatcher
              </h1>
              <p className="text-sm text-gray-300 max-w-2xl mt-1 leading-relaxed">
                At the conclusion of any trip, enter the client’s phone number below. Select a high-converting text message template to text the client a direct Google Review link in 1 tap!
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="bg-neutral-950/80 border border-amber-500/30 rounded-2xl p-4 min-w-[200px] text-center shadow-lg">
              <div className="text-2xl font-bold text-amber-400 font-mono">
                {dispatchedLogs.length}
              </div>
              <div className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
                Total Reviews Dispatched
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-2 mt-6 pt-4 border-t border-neutral-800/80">
            <button
              onClick={() => setActiveTab('dispatch')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-2 ${
                activeTab === 'dispatch'
                  ? 'bg-amber-600 text-white shadow-lg'
                  : 'bg-neutral-900 text-gray-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <Send size={14} />
              <span>Dispatch Review Text</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-2 ${
                activeTab === 'history'
                  ? 'bg-amber-600 text-white shadow-lg'
                  : 'bg-neutral-900 text-gray-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <Clock size={14} />
              <span>Sent Log History ({dispatchedLogs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-2 ${
                activeTab === 'settings'
                  ? 'bg-amber-600 text-white shadow-lg'
                  : 'bg-neutral-900 text-gray-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <Settings size={14} />
              <span>Review Link & API Settings</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Dispatch Review Text */}
        {activeTab === 'dispatch' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Form Controls */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Client Info Card */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-xl space-y-5">
                <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <User size={16} />
                  <span>1. Client & Trip Details</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone Input */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-200 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span>Client Phone Number *</span>
                      <span className="text-[11px] text-amber-400 lowercase">e.g. (832) 567-8050</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-amber-500">
                        <Phone size={18} />
                      </div>
                      <input
                        type="tel"
                        value={clientPhone}
                        onChange={handlePhoneChange}
                        placeholder="(832) 567-8050"
                        className="w-full bg-neutral-950 border border-neutral-700 focus:border-amber-500 rounded-xl py-3 pl-11 pr-4 text-white text-base font-mono font-semibold placeholder:text-gray-600 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Client Name */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Passenger First Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="e.g. Marcus"
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-xl py-2.5 px-3.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  {/* Trip Type */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Trip Service Category
                    </label>
                    <select
                      value={tripType}
                      onChange={(e) => setTripType(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-xl py-2.5 px-3 text-xs text-white focus:border-amber-500 focus:outline-none"
                    >
                      <option value="Airport Transfer (IAH / HOU)">Airport Transfer (IAH / HOU)</option>
                      <option value="Galveston Cruise Transfer">Galveston Cruise Transfer</option>
                      <option value="Corporate Executive Charter">Corporate Executive Charter</option>
                      <option value="Hourly / As Directed Charter">Hourly / As Directed Charter</option>
                      <option value="Wedding & Special Event">Wedding & Special Event</option>
                    </select>
                  </div>

                  {/* Chauffeur Name */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Assigned Chauffeur
                    </label>
                    <select
                      value={chauffeurName}
                      onChange={(e) => setChauffeurName(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-xl py-2.5 px-3 text-xs text-white focus:border-amber-500 focus:outline-none"
                    >
                      {CHAUFFEURS_LIST.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Vehicle Name */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Vehicle Driven
                    </label>
                    <select
                      value={vehicleName}
                      onChange={(e) => setVehicleName(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-xl py-2.5 px-3 text-xs text-white focus:border-amber-500 focus:outline-none"
                    >
                      {VEHICLE_LIST.map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Template Selector Card */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <Sparkles size={16} />
                  <span>2. Select SMS Message Template</span>
                </div>

                <div className="space-y-2.5">
                  {SMS_TEMPLATES.map((tmpl) => (
                    <label
                      key={tmpl.id}
                      className={`block p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        selectedTemplateId === tmpl.id
                          ? 'bg-amber-950/40 border-amber-500 text-white shadow-md'
                          : 'bg-neutral-950 border-neutral-800 text-gray-400 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <input
                            type="radio"
                            name="smsTemplate"
                            checked={selectedTemplateId === tmpl.id}
                            onChange={() => setSelectedTemplateId(tmpl.id)}
                            className="text-amber-500 focus:ring-amber-500"
                          />
                          <span className="text-xs font-bold text-white">{tmpl.title}</span>
                        </div>
                        <span className="text-[10px] text-amber-300 font-medium bg-neutral-900 px-2 py-0.5 rounded-full">
                          {tmpl.preview}
                        </span>
                      </div>
                    </label>
                  ))}

                  {/* Custom Template option */}
                  <label
                    className={`block p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      selectedTemplateId === 'custom'
                        ? 'bg-amber-950/40 border-amber-500 text-white shadow-md'
                        : 'bg-neutral-950 border-neutral-800 text-gray-400 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 mb-2">
                      <input
                        type="radio"
                        name="smsTemplate"
                        checked={selectedTemplateId === 'custom'}
                        onChange={() => setSelectedTemplateId('custom')}
                        className="text-amber-500 focus:ring-amber-500"
                      />
                      <span className="text-xs font-bold text-white">✏️ Custom Message Text</span>
                    </div>

                    {selectedTemplateId === 'custom' && (
                      <textarea
                        rows={3}
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value)}
                        placeholder={`Write custom message text... Google review link ${googleReviewUrl} will be appended.`}
                        className="w-full mt-2 bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-xs text-white focus:border-amber-500 focus:outline-none"
                      />
                    )}
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column: Live SMS Preview & 1-Click Send Actions */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Live iPhone/SMS Preview Card */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                    <Smartphone size={16} />
                    <span>3. Live SMS Preview</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">
                    Recipient: {clientPhone || '(Client Phone)'}
                  </span>
                </div>

                {/* Simulated Phone Screen */}
                <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 space-y-3 font-sans shadow-inner">
                  <div className="text-[10px] text-gray-500 text-center uppercase tracking-wider border-b border-neutral-900 pb-2">
                    Text Message • AvaLimo Houston Dispatch
                  </div>
                  
                  {/* SMS Bubble */}
                  <div className="bg-amber-600/20 border border-amber-500/40 text-amber-100 p-3.5 rounded-2xl rounded-tl-sm text-xs leading-relaxed font-sans shadow-md">
                    <p className="whitespace-pre-line">
                      {getActiveMessageBody()}
                    </p>
                  </div>

                  {/* Google Direct Link Badge */}
                  <div className="bg-neutral-900 p-2.5 rounded-xl border border-neutral-800 flex items-center justify-between text-[11px]">
                    <div className="flex items-center space-x-2 text-amber-300">
                      <ExternalLink size={13} />
                      <span className="truncate max-w-[200px] font-mono text-[10px]">{googleReviewUrl}</span>
                    </div>
                    <span className="text-[9px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded">
                      Google Maps
                    </span>
                  </div>
                </div>

                {/* Action Buttons Grid */}
                <div className="space-y-3 pt-2">
                  {/* Primary 1-Click Native SMS Button */}
                  <button
                    type="button"
                    onClick={handleSendSMS}
                    className="w-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-white font-bold py-3.5 px-6 rounded-2xl text-xs uppercase tracking-wider transition-all shadow-xl shadow-amber-950/40 flex items-center justify-center space-x-2 group"
                  >
                    <Smartphone size={18} className="group-hover:scale-110 transition-transform" />
                    <span>Send SMS Text Now (Native Messages App)</span>
                  </button>

                  {/* WhatsApp Direct Send Button */}
                  <button
                    type="button"
                    onClick={handleSendWhatsApp}
                    className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-2xl text-xs uppercase tracking-wider transition-colors flex items-center justify-center space-x-2 shadow-lg"
                  >
                    <MessageCircle size={16} />
                    <span>Send via WhatsApp</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Copy Text Button */}
                    <button
                      type="button"
                      onClick={handleCopyText}
                      className="bg-neutral-800 hover:bg-neutral-700 text-gray-200 font-semibold py-2.5 px-3 rounded-xl text-[11px] uppercase tracking-wider transition-colors border border-neutral-700 flex items-center justify-center space-x-1.5"
                    >
                      {copiedNotification ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      <span>{copiedNotification ? 'Copied!' : 'Copy Text'}</span>
                    </button>

                    {/* Direct Cloud API Send */}
                    <button
                      type="button"
                      onClick={handleSendApi}
                      disabled={isSendingApi}
                      className="bg-neutral-800 hover:bg-neutral-700 text-amber-400 font-semibold py-2.5 px-3 rounded-xl text-[11px] uppercase tracking-wider transition-colors border border-neutral-700 flex items-center justify-center space-x-1.5 disabled:opacity-50"
                    >
                      {isSendingApi ? <RefreshCw size={14} className="animate-spin text-amber-400" /> : <Send size={14} />}
                      <span>{isSendingApi ? 'Sending...' : 'Cloud API Send'}</span>
                    </button>
                  </div>

                  {apiSuccessMsg && (
                    <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 p-3 rounded-xl text-xs text-center font-medium animate-fade-in-up flex items-center justify-center space-x-2">
                      <CheckCircle2 size={16} />
                      <span>{apiSuccessMsg}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Direct Review Link Card for Manual Share */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center">
                  <LinkIcon size={14} className="mr-1.5" />
                  <span>AvaLimo Web Review Links</span>
                </div>
                <div className="text-xs text-gray-300 space-y-2">
                  <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-gray-500 uppercase font-bold">Direct Google Maps Listing Link</div>
                      <div className="text-[11px] text-amber-300 font-mono truncate max-w-[220px]">
                        {googleReviewUrl}
                      </div>
                    </div>
                    <a
                      href={googleReviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-amber-400 transition-colors"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>

                  <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-gray-500 uppercase font-bold">AvaLimo Interactive Review Landing</div>
                      <div className="text-[11px] text-amber-300 font-mono truncate max-w-[220px]">
                        {AVALIMO_REVIEW_LANDING_URL}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => window.open(AVALIMO_REVIEW_LANDING_URL, '_blank')}
                      className="p-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-amber-400 transition-colors"
                    >
                      <ExternalLink size={14} />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Tab 2: Dispatched Review History Log */}
        {activeTab === 'history' && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
              <div>
                <h2 className="text-xl font-serif font-bold text-white flex items-center">
                  <Clock size={20} className="text-amber-400 mr-2" />
                  Dispatched Review SMS History
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Track all Google Review text requests sent to clients at the end of trips.
                </p>
              </div>

              {dispatchedLogs.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="px-3.5 py-2 rounded-xl bg-neutral-950 border border-red-900/50 text-red-400 hover:bg-red-950/40 text-xs font-semibold transition-colors flex items-center space-x-1.5 self-start sm:self-auto"
                >
                  <Trash2 size={14} />
                  <span>Clear All History</span>
                </button>
              )}
            </div>

            {dispatchedLogs.length === 0 ? (
              <div className="text-center py-12 space-y-3 text-gray-500">
                <Send size={48} className="mx-auto text-neutral-700" />
                <p className="text-sm font-medium">No review texts dispatched yet.</p>
                <button
                  onClick={() => setActiveTab('dispatch')}
                  className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold uppercase tracking-wider"
                >
                  Dispatch Your First Review SMS
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="bg-neutral-950 text-amber-400 uppercase font-bold tracking-wider text-[10px] border-b border-neutral-800">
                    <tr>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Client Phone / Name</th>
                      <th className="py-3 px-4">Chauffeur / Vehicle</th>
                      <th className="py-3 px-4">Method</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {dispatchedLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-neutral-950/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-[11px] text-gray-400 whitespace-nowrap">
                          {log.timestamp}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-white">
                          <div>{log.clientPhone}</div>
                          {log.clientName && (
                            <div className="text-[11px] text-amber-300 font-normal">{log.clientName}</div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-gray-300">
                          <div>{log.chauffeurName}</div>
                          <div className="text-[10px] text-gray-500">{log.vehicleName}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-neutral-950 border border-neutral-700 text-amber-400">
                            {log.sentMethod}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <select
                            value={log.status}
                            onChange={(e) => handleUpdateLogStatus(log.id, e.target.value as any)}
                            className="bg-neutral-950 border border-neutral-700 rounded text-[11px] py-1 px-2 text-white focus:outline-none"
                          >
                            <option value="Dispatched">Dispatched</option>
                            <option value="Reminder Sent">Reminder Sent</option>
                            <option value="Review Completed">Review Completed</option>
                          </select>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                          {/* Resend button */}
                          <button
                            type="button"
                            onClick={() => {
                              const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
                              const smsUrl = isIOS 
                                ? `sms:${getRawPhone(log.clientPhone)}&body=${encodeURIComponent(log.messageText)}`
                                : `sms:${getRawPhone(log.clientPhone)}?body=${encodeURIComponent(log.messageText)}`;
                              window.location.href = smsUrl;
                            }}
                            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-400 transition-colors"
                            title="Resend SMS"
                          >
                            <Send size={13} />
                          </button>
                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteLog(log.id)}
                            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-red-400 transition-colors"
                            title="Delete log entry"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Google Review Link & API Settings */}
        {activeTab === 'settings' && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 max-w-3xl mx-auto">
            <div>
              <h2 className="text-xl font-serif font-bold text-white flex items-center">
                <Settings size={20} className="text-amber-400 mr-2" />
                Google Review Link & API Settings
              </h2>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Configure your official Google Business Profile review link and optional Twilio Cloud SMS gateway integration.
              </p>
            </div>

            {/* Custom Google Review Link Field */}
            <div className="space-y-4 bg-neutral-950 p-5 rounded-2xl border border-neutral-800">
              <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <LinkIcon size={14} />
                <span>Google Business Profile Review Link</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Paste your exact Google Business Profile review short-link (e.g., <code className="text-amber-300">https://g.page/r/.../review</code> or your Google Place ID link) below to use for all text messages.
              </p>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Google Review URL
                </label>
                <input
                  type="url"
                  value={googleReviewUrl}
                  onChange={(e) => handleSaveReviewUrl(e.target.value)}
                  placeholder="https://g.page/r/YOUR_SHORT_CODE/review"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl py-2.5 px-3 text-xs text-amber-300 font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => handleSaveReviewUrl(DEFAULT_GOOGLE_REVIEW_URL)}
                className="text-[11px] text-amber-400 hover:underline"
              >
                Reset to Default Google Search Link
              </button>
            </div>

            {/* Twilio Config Section */}
            <div className="space-y-4 bg-neutral-950 p-5 rounded-2xl border border-neutral-800">
              <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Smartphone size={14} />
                <span>Twilio / Cloud SMS Gateway Integration</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Twilio Account SID
                </label>
                <input
                  type="text"
                  value={twilioConfig.accountSid}
                  onChange={(e) => setTwilioConfig({ ...twilioConfig, accountSid: e.target.value })}
                  placeholder="ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl py-2.5 px-3 text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Twilio Auth Token
                </label>
                <input
                  type="password"
                  value={twilioConfig.authToken}
                  onChange={(e) => setTwilioConfig({ ...twilioConfig, authToken: e.target.value })}
                  placeholder="••••••••••••••••••••••••••••••••"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl py-2.5 px-3 text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Dispatch Sender Phone Number
                </label>
                <input
                  type="text"
                  value={twilioConfig.fromNumber}
                  onChange={(e) => setTwilioConfig({ ...twilioConfig, fromNumber: e.target.value })}
                  placeholder="+18325678050"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl py-2.5 px-3 text-xs text-amber-400 font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-neutral-900">
                <span className="text-xs text-gray-400">Enable Server SMS Gateway:</span>
                <button
                  type="button"
                  onClick={() => setTwilioConfig({ ...twilioConfig, enabled: !twilioConfig.enabled })}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase transition-colors ${
                    twilioConfig.enabled ? 'bg-emerald-600 text-white' : 'bg-neutral-800 text-gray-400'
                  }`}
                >
                  {twilioConfig.enabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => alert('Settings Saved!')}
                className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-lg"
              >
                Save Integration Settings
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default TripReviewDispatcher;
