import React, { useState } from 'react';
import { Menu, X, Phone, Shield, Plane, Clock, Mail, Building2, MessageSquareText } from 'lucide-react';
import { COMPANY_INFO } from '../data/avalimoData';
import ServiceAlertsBanner from './ServiceAlertsBanner';

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', value: 'home' },
    { name: 'Fleet', value: 'fleet' },
    { name: 'Services', value: 'services' },
    { name: 'Airport & Galveston', value: 'airport-galveston' },
    { name: 'Rates', value: 'rates' },
    { name: 'Corporate Portal', value: 'corporate', isCorporate: true },
    { name: 'End of Trip Review', value: 'review-dispatcher', isHighlight: true },
    { name: 'Reviews', value: 'reviews' },
    { name: 'FAQ', value: 'faq' },
  ];

  const handleNav = (value: string) => {
    onNavigate(value);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="fixed w-full z-50 transition-all duration-300">
      {/* Real-time Houston Airport & Traffic Service Alerts Banner */}
      <ServiceAlertsBanner onOpenBooking={() => handleNav('book')} />

      {/* Top Banner Bar with direct 24/7 contact */}
      <div className="bg-neutral-950 border-b border-amber-500/20 text-xs text-gray-300 py-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center space-x-4 sm:space-x-6">
            <div className="flex items-center text-amber-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2"></span>
              24/7 Houston & Galveston Dispatch
            </div>
            <div className="hidden md:flex items-center text-gray-400">
              <Plane size={13} className="mr-1 text-amber-500" />
              Live Flight Tracking (IAH / HOU)
            </div>
            <div className="hidden lg:flex items-center text-gray-400">
              <Shield size={13} className="mr-1 text-amber-500" />
              Flat Rates • Zero Surge Fees
            </div>
          </div>
          
          <div className="flex items-center space-x-3 ml-auto">
            <button
              onClick={() => handleNav('review-dispatcher')}
              className="flex items-center text-amber-300 hover:text-amber-200 transition-colors bg-amber-950/60 hover:bg-amber-900 border border-amber-500/40 px-2.5 py-0.5 rounded text-[11px] font-bold tracking-wide"
            >
              <MessageSquareText size={12} className="mr-1 text-amber-400" />
              End-of-Trip Review App
            </button>
            <button
              onClick={() => handleNav('corporate')}
              className="hidden sm:flex items-center text-gray-300 hover:text-white transition-colors bg-neutral-900 px-2 py-0.5 rounded text-[11px] font-semibold border border-neutral-800"
            >
              <Building2 size={12} className="mr-1 text-amber-400" />
              Corporate
            </button>
            <a 
              href={`tel:${COMPANY_INFO.phoneRaw}`} 
              className="flex items-center text-amber-400 hover:text-amber-300 font-bold tracking-wide"
            >
              <Phone size={13} className="mr-1.5 text-amber-500 animate-bounce-slow" />
              <span>{COMPANY_INFO.phone}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="glass-nav text-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center h-20">
          {/* Brand Logo */}
          <div 
            className="flex items-center cursor-pointer group" 
            onClick={() => handleNav('home')}
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center p-2 mr-3 shadow-lg shadow-amber-900/30 group-hover:scale-105 transition-transform">
              <span className="font-serif font-black text-black text-xl tracking-tighter">A</span>
            </div>
            <div className="flex flex-col">
              <div className="font-serif text-2xl font-bold tracking-wider leading-none text-white">
                AVALIMO<span className="text-amber-500">.</span>
              </div>
              <span className="text-[10px] tracking-[0.25em] text-gray-400 uppercase font-medium mt-1">
                HOUSTON • SINCE 2013
              </span>
            </div>
          </div>

          {/* Desktop Links */}
          <div className="hidden xl:flex space-x-6 items-center">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNav(link.value)}
                className={`text-xs uppercase tracking-widest font-medium transition-all py-1 flex items-center ${
                  currentPage === link.value 
                    ? 'text-amber-400 border-b-2 border-amber-400 font-semibold' 
                    : link.isCorporate 
                      ? 'text-amber-300 hover:text-amber-200 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30'
                      : 'text-gray-300 hover:text-amber-400'
                }`}
              >
                {link.isCorporate && <Building2 size={12} className="mr-1 text-amber-400" />}
                {link.name}
              </button>
            ))}
          </div>

          {/* Right Action Button */}
          <div className="hidden md:flex items-center space-x-3">
            <button 
              onClick={() => handleNav('corporate')}
              className="bg-neutral-900 hover:bg-neutral-800 border border-amber-500/40 text-amber-400 hover:text-amber-300 px-4 py-2.5 rounded text-xs font-semibold tracking-wider uppercase transition-all flex items-center"
            >
              <Building2 size={13} className="mr-1.5" />
              Corporate
            </button>
            <button 
              onClick={() => handleNav('book')}
              className="relative group overflow-hidden bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white px-5 py-2.5 rounded text-xs font-bold tracking-widest uppercase transition-all duration-300 shadow-lg shadow-amber-900/30 hover:shadow-amber-600/40 hover:-translate-y-0.5"
            >
              <span className="relative z-10 flex items-center">
                <Clock size={14} className="mr-1.5" />
                RESERVE NOW
              </span>
            </button>
          </div>


          {/* Mobile Menu Button */}
          <div className="xl:hidden flex items-center space-x-3">
            <button 
              onClick={() => handleNav('book')}
              className="md:hidden bg-amber-600 text-white px-3 py-1.5 rounded text-xs font-bold tracking-wider"
            >
              BOOK
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="text-gray-300 hover:text-white p-2"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="xl:hidden bg-neutral-950/98 backdrop-blur-xl border-b border-neutral-800 shadow-2xl animate-fade-in-up">
          <div className="max-w-7xl mx-auto px-4 pt-3 pb-6 space-y-1">
            <div className="grid grid-cols-2 gap-2 pb-3 mb-2 border-b border-neutral-800">
              <a 
                href={`tel:${COMPANY_INFO.phoneRaw}`}
                className="flex items-center justify-center bg-neutral-900 border border-amber-500/30 text-amber-400 py-2.5 px-3 rounded text-xs font-bold"
              >
                <Phone size={14} className="mr-1.5" /> Call 24/7 Dispatch
              </a>
              <button 
                onClick={() => handleNav('book')}
                className="bg-amber-600 text-white py-2.5 px-3 rounded text-xs font-bold uppercase tracking-wider"
              >
                Instant Quote
              </button>
            </div>

            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNav(link.value)}
                className="block w-full text-left px-3 py-3 text-sm font-medium text-gray-200 hover:text-amber-400 hover:bg-neutral-900 rounded transition-colors"
              >
                {link.name}
              </button>
            ))}

            <div className="pt-3 border-t border-neutral-800 text-xs text-gray-400 space-y-1 text-center">
              <p>Direct Email: <span className="text-gray-200">{COMPANY_INFO.email}</span></p>
              <p>Official Domains: avalimo.net • www.avalimohouston.com</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
