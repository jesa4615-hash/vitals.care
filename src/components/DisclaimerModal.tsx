import React from 'react';
import { ShieldCheck, AlertCircle, X, Check } from 'lucide-react';

interface DisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      id="disclaimer-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        id="disclaimer-modal-card"
        className="w-full max-w-md bg-[#0A0A0A] rounded-2xl shadow-2xl border border-[#1A1A1A] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#0A0A0A] text-white p-5 flex items-start justify-between border-b border-[#1A1A1A]">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-teal-500/10 text-teal-400 border border-teal-500/30 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Medical Safety & Disclaimer</h2>
              <p className="text-xs text-[#888]">Important terms of use and patient safety</p>
            </div>
          </div>
          <button
            id="disclaimer-close-btn"
            onClick={onClose}
            className="text-[#888] hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto text-sm text-[#CCC] leading-relaxed">
          <div className="p-3.5 bg-yellow-500/5 border border-yellow-500/20 rounded-xl text-xs text-yellow-300 flex items-start space-x-2.5">
            <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block mb-0.5 text-yellow-300">Not a Doctor / Not a Clinical Diagnosis</strong>
              AuraCare Health Assistant is an AI-powered educational and symptom information tool. It does NOT provide formal medical diagnoses, clinical prognoses, or prescription treatments.
            </div>
          </div>

          <div className="space-y-2.5 text-xs text-[#BBB]">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              Key Safety Principles:
            </h4>
            <div className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
              <p>
                <strong className="text-white">When to Seek Emergency Care:</strong> If you experience severe chest pain, stroke symptoms, uncontrolled bleeding, severe breathing difficulty, or loss of consciousness, call your local emergency services (911/112) immediately.
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
              <p>
                <strong className="text-white">Consult Qualified Clinicians:</strong> Always discuss your symptoms and health concerns with a licensed physician, nurse practitioner, or local healthcare provider before changing medications or health routines.
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
              <p>
                <strong className="text-white">Privacy First:</strong> Your symptom inputs are processed securely to generate your insights and are stored locally in your browser.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-[#0A0A0A] border-t border-[#1A1A1A] flex justify-end">
          <button
            id="disclaimer-acknowledge-btn"
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs rounded-xl transition-colors flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>I Understand & Agree</span>
          </button>
        </div>
      </div>
    </div>
  );
};
