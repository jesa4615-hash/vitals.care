import React from 'react';
import {
  Stethoscope,
  HeartPulse,
  Bandage,
  MessageSquare,
  Clock,
  PhoneCall,
  ShieldCheck,
  Smartphone,
  Maximize2,
} from 'lucide-react';

export type ActiveTab = 'checker' | 'firstaid' | 'chat' | 'history';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenEmergency: () => void;
  onOpenDisclaimer: () => void;
  isMobileFrame: boolean;
  onToggleMobileFrame: () => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenEmergency,
  onOpenDisclaimer,
  isMobileFrame,
  onToggleMobileFrame,
  historyCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#1A1A1A] shadow-xs">
      <div className="max-w-4xl mx-auto px-3 sm:px-4">
        {/* Top Branding & Quick Actions Bar */}
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo & Subtitle */}
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-500 to-blue-600 text-white flex items-center justify-center shadow-md shadow-teal-900/30">
              <HeartPulse className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-lg font-medium tracking-tight text-white">
                  Aura<span className="text-teal-400 font-bold ml-0.5">Care</span>
                </span>
                <span className="text-[9px] uppercase font-bold tracking-wider bg-teal-500/10 text-teal-400 border border-teal-500/20 px-1.5 py-0.5 rounded">
                  AI HEALTH
                </span>
              </div>
              <p className="text-[10px] text-[#888] font-normal hidden sm:block">
                Clinical Symptom Intelligence & Triage Assistant
              </p>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            {/* View Mode Toggle (Mobile simulator vs Full view) */}
            <button
              type="button"
              id="toggle-view-mode-btn"
              onClick={onToggleMobileFrame}
              title={isMobileFrame ? 'Switch to Full-Width View' : 'Switch to Mobile Simulator View'}
              className="p-2 text-[#888] hover:text-white rounded-xl hover:bg-[#141414] transition-colors hidden md:flex items-center space-x-1 text-xs font-semibold cursor-pointer border border-transparent hover:border-[#222]"
            >
              {isMobileFrame ? (
                <>
                  <Maximize2 className="w-4 h-4" />
                  <span className="text-[11px]">Full View</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-4 h-4" />
                  <span className="text-[11px]">Mobile View</span>
                </>
              )}
            </button>

            {/* Medical Disclaimer Trigger */}
            <button
              type="button"
              id="disclaimer-header-btn"
              onClick={onOpenDisclaimer}
              className="flex items-center space-x-1 p-2 text-[#888] hover:text-teal-400 rounded-xl hover:bg-teal-500/10 transition-colors text-xs font-semibold cursor-pointer border border-transparent hover:border-teal-500/20"
              title="Medical Safety Disclaimer"
            >
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span className="hidden sm:inline text-[11px]">Disclaimer</span>
            </button>

            {/* Emergency SOS Button */}
            <button
              type="button"
              id="emergency-sos-header-btn"
              onClick={onOpenEmergency}
              className="flex items-center space-x-1.5 border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold px-3 py-1.5 sm:py-2 rounded-xl text-xs transition-all shadow-sm shadow-red-950/40 cursor-pointer animate-pulse"
              title="Emergency Numbers & Rapid SOS"
            >
              <PhoneCall className="w-3.5 h-3.5 text-red-400" />
              <span className="tracking-wide text-red-300">SOS 911</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 border-t border-[#1A1A1A] pt-1 pb-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            id="tab-checker"
            onClick={() => onTabChange('checker')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              activeTab === 'checker'
                ? 'bg-teal-600 text-white shadow-sm shadow-teal-900/40'
                : 'text-[#888] hover:text-white hover:bg-[#141414]'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Symptom Checker</span>
          </button>

          <button
            type="button"
            id="tab-firstaid"
            onClick={() => onTabChange('firstaid')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              activeTab === 'firstaid'
                ? 'bg-teal-600 text-white shadow-sm shadow-teal-900/40'
                : 'text-[#888] hover:text-white hover:bg-[#141414]'
            }`}
          >
            <Bandage className="w-3.5 h-3.5" />
            <span>First-Aid Guide</span>
          </button>

          <button
            type="button"
            id="tab-chat"
            onClick={() => onTabChange('chat')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-teal-600 text-white shadow-sm shadow-teal-900/40'
                : 'text-[#888] hover:text-white hover:bg-[#141414]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Health Q&A Assistant</span>
          </button>

          <button
            type="button"
            id="tab-history"
            onClick={() => onTabChange('history')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-teal-600 text-white shadow-sm shadow-teal-900/40'
                : 'text-[#888] hover:text-white hover:bg-[#141414]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>History</span>
            {historyCount > 0 && (
              <span
                className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'history'
                    ? 'bg-teal-950 text-teal-200'
                    : 'bg-[#222] text-[#AAA]'
                }`}
              >
                {historyCount}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
};
