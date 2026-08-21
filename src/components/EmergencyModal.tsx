import React, { useState, useEffect } from 'react';
import { PhoneCall, AlertOctagon, X, MapPin, ShieldAlert, HeartHandshake } from 'lucide-react';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFirstAid?: (topicId: string) => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({
  isOpen,
  onClose,
  onSelectFirstAid,
}) => {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setGeoError(null);
        },
        (err) => {
          setGeoError('Location access not enabled');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const emergencyContacts = [
    { name: 'USA & Canada Emergency', number: '911', desc: 'Police, Fire, Ambulance' },
    { name: 'European Union & Global', number: '112', desc: 'Universal Emergency Number' },
    { name: 'United Kingdom', number: '999', desc: 'Emergency Services (or 111 for non-emergency NHS)' },
    { name: 'Australia', number: '000', desc: 'Emergency Services' },
    { name: 'US Poison Control', number: '1-800-222-1222', desc: '24/7 Expert Poisoning Advice' },
    { name: 'Suicide & Crisis Lifeline', number: '988', desc: '24/7 Free & Confidential Support (US/CA)' },
  ];

  return (
    <div
      id="emergency-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        id="emergency-modal-card"
        className="w-full max-w-lg bg-[#0A0A0A] rounded-2xl shadow-2xl border border-red-900/40 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Urgent Header */}
        <div className="bg-gradient-to-r from-red-950/90 via-[#1A0808] to-[#0A0A0A] border-b border-red-900/40 text-white p-5 flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-500/20 border border-red-500/30 rounded-xl">
              <AlertOctagon className="w-7 h-7 text-red-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">Emergency Assistance</h2>
              <p className="text-xs text-red-300 mt-0.5">
                If you or someone is in immediate danger, call now
              </p>
            </div>
          </div>
          <button
            id="emergency-close-button"
            onClick={onClose}
            className="text-[#888] hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-[#E0E0E0]">
          {/* Location Helper for Dispatchers */}
          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-3.5 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2.5">
              <MapPin className="w-4 h-4 text-yellow-400 shrink-0" />
              <div>
                <p className="font-semibold text-yellow-300">Your Current Coordinates (For Dispatch):</p>
                {coords ? (
                  <p className="text-yellow-200/90 font-mono text-[11px] mt-0.5">
                    Lat: {coords.lat.toFixed(5)}, Lng: {coords.lng.toFixed(5)}
                  </p>
                ) : (
                  <p className="text-yellow-300/70 mt-0.5">{geoError || 'Acquiring GPS location...'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Direct Dial Numbers */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#888] mb-2">
              Instant Emergency Dialers
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {emergencyContacts.map((contact) => (
                <a
                  key={contact.name}
                  id={`dial-${contact.number.replace(/\D/g, '')}`}
                  href={`tel:${contact.number.replace(/[^0-9+]/g, '')}`}
                  className="flex items-center justify-between p-3 rounded-xl border border-[#222] bg-[#141414] hover:bg-red-500/10 hover:border-red-500/40 transition-all group"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-semibold text-white truncate">{contact.name}</p>
                    <p className="text-[11px] text-[#888] truncate">{contact.desc}</p>
                  </div>
                  <div className="flex items-center space-x-1.5 bg-red-600 hover:bg-red-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs shrink-0 shadow-sm">
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>{contact.number}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Critical Red Flag Situations */}
          <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2 text-red-400 font-semibold text-xs">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span>Call Emergency Services (911/112) immediately for:</span>
            </div>
            <ul className="text-xs text-red-300/90 space-y-1 pl-4 list-disc marker:text-red-400">
              <li>Crushing chest pain, pressure, or radiating pain to jaw/arm</li>
              <li>Sudden facial drooping, arm weakness, or slurred speech (Stroke)</li>
              <li>Severe breathing difficulty, wheezing, or choking</li>
              <li>Heavy uncontrolled bleeding or penetrating trauma</li>
              <li>Sudden severe confusion, lethargy, or loss of consciousness</li>
              <li>Severe allergic reactions with throat tightness or hives</li>
            </ul>
          </div>

          {/* Quick First-Aid Jump Links */}
          {onSelectFirstAid && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#888] mb-2">
                Immediate First Aid Guides
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <button
                  id="quick-cpr-btn"
                  onClick={() => {
                    onClose();
                    onSelectFirstAid('cpr-adult');
                  }}
                  className="p-2.5 text-center bg-[#141414] hover:bg-[#1A1A1A] rounded-xl border border-[#222] hover:border-[#333] text-xs font-medium text-[#E0E0E0] transition-colors cursor-pointer"
                >
                  ❤️ Adult CPR
                </button>
                <button
                  id="quick-choking-btn"
                  onClick={() => {
                    onClose();
                    onSelectFirstAid('choking-adult');
                  }}
                  className="p-2.5 text-center bg-[#141414] hover:bg-[#1A1A1A] rounded-xl border border-[#222] hover:border-[#333] text-xs font-medium text-[#E0E0E0] transition-colors cursor-pointer"
                >
                  🫁 Choking
                </button>
                <button
                  id="quick-bleeding-btn"
                  onClick={() => {
                    onClose();
                    onSelectFirstAid('severe-bleeding');
                  }}
                  className="p-2.5 text-center bg-[#141414] hover:bg-[#1A1A1A] rounded-xl border border-[#222] hover:border-[#333] text-xs font-medium text-[#E0E0E0] transition-colors cursor-pointer"
                >
                  🩹 Severe Bleeding
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="p-4 bg-[#0A0A0A] border-t border-[#1A1A1A] text-center text-xs text-[#888]">
          Stay on the line with the dispatcher until instructed otherwise. Keep the patient calm.
        </div>
      </div>
    </div>
  );
};
