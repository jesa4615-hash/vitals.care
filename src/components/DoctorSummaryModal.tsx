import React from 'react';
import { HealthAssessmentResult } from '../types';
import { FileText, X, Printer, Copy, Check, Stethoscope } from 'lucide-react';

interface DoctorSummaryModalProps {
  assessment: HealthAssessmentResult | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DoctorSummaryModal: React.FC<DoctorSummaryModalProps> = ({
  assessment,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !assessment) return null;

  const formattedDate = new Date(assessment.timestamp).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const generatePlainText = () => {
    return `PATIENT HEALTH SYMPTOM SUMMARY FOR DOCTOR VISIT
Generated on: ${formattedDate}
--------------------------------------------------
1. CHIEF COMPLAINT & SYMPTOMS:
${assessment.symptomSummary}
Duration: ${assessment.userInputs.symptoms.duration}
Severity Scale: ${assessment.userInputs.symptoms.severity}/10
Onset: ${assessment.userInputs.symptoms.onset}
Affected Body Areas: ${assessment.userInputs.symptoms.selectedBodyParts.join(', ') || 'None specified'}
Additional Patient Notes: ${assessment.userInputs.symptoms.additionalNotes || 'None'}

2. PATIENT PROFILE:
Age Group: ${assessment.userInputs.symptoms.profile.ageGroup || 'Not specified'}
Biological Sex: ${assessment.userInputs.symptoms.profile.biologicalSex || 'Not specified'}
Pregnant: ${assessment.userInputs.symptoms.profile.isPregnant ? 'Yes' : 'No'}
Pre-existing Conditions: ${assessment.userInputs.symptoms.profile.preExistingConditions.join(', ') || 'None'}
Current Medications: ${assessment.userInputs.symptoms.profile.currentMedications.join(', ') || 'None'}

3. CLARIFYING INFORMATION REPORTED:
${assessment.userInputs.followUpAnswers
  .map((a) => `- ${a.question}\n  Answer: ${a.selectedOptions.join(', ')}${a.customText ? ` (${a.customText})` : ''}`)
  .join('\n')}

4. POTENTIAL CONDITIONS TO EXPLORE:
${assessment.possibleConditions.map((c) => `- ${c.conditionName} (${c.matchLikelihood} Likelihood match)\n  Overview: ${c.overview}`).join('\n')}

5. PREPARED QUESTIONS FOR HEALTHCARE PROVIDER:
${assessment.suggestedQuestionsForDoctor.map((q, i) => `${i + 1}. ${q}`).join('\n')}

--------------------------------------------------
NOTICE: Prepared via AuraCare AI Health Assistant for informational preparation. Not a medical diagnosis.`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatePlainText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="doctor-summary-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        id="doctor-summary-card"
        className="w-full max-w-2xl bg-[#0A0A0A] rounded-2xl shadow-2xl border border-[#1A1A1A] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#0A0A0A] text-white p-4 sm:p-5 flex items-center justify-between border-b border-[#1A1A1A]">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-teal-500/10 text-teal-400 border border-teal-500/30 rounded-xl">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Doctor Visit Consultation Sheet</h2>
              <p className="text-xs text-[#888]">Share or bring this summary to your doctor</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              id="copy-summary-btn"
              onClick={handleCopy}
              className="flex items-center space-x-1.5 bg-[#141414] hover:bg-[#1A1A1A] text-[#CCC] text-xs px-3 py-1.5 rounded-lg transition-colors border border-[#222] cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              id="print-summary-btn"
              onClick={handlePrint}
              className="flex items-center space-x-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs px-3 py-1.5 rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="text-[#888] hover:text-white p-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-[#E0E0E0] text-xs leading-relaxed font-sans print:p-0 print:text-black">
          {/* Header */}
          <div className="border-b border-[#1A1A1A] pb-4 flex justify-between items-start print:border-slate-300">
            <div>
              <h1 className="text-lg font-bold text-white print:text-black">Patient Symptom Report</h1>
              <p className="text-xs text-[#888] print:text-slate-600 mt-0.5">Assessment Date: {formattedDate}</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#141414] text-[#AAA] border border-[#222] print:bg-slate-100 print:text-slate-800 print:border-slate-300">
                Self-Reported Data
              </span>
            </div>
          </div>

          {/* Section 1: Chief Complaint */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#888] mb-2 print:text-slate-700">
              1. Chief Complaint & Timeline
            </h3>
            <div className="bg-[#141414] border border-[#222] rounded-xl p-3.5 space-y-2 print:bg-slate-50 print:border-slate-300">
              <p className="font-semibold text-white print:text-slate-900 text-sm">{assessment.symptomSummary}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#222] print:border-slate-300 text-[#AAA] print:text-slate-700">
                <div>
                  <span className="block text-[10px] text-[#666] print:text-slate-500 uppercase">Duration</span>
                  <span className="font-medium text-white print:text-slate-900">{assessment.userInputs.symptoms.duration}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-[#666] print:text-slate-500 uppercase">Severity</span>
                  <span className="font-medium text-white print:text-slate-900">{assessment.userInputs.symptoms.severity}/10</span>
                </div>
                <div>
                  <span className="block text-[10px] text-[#666] print:text-slate-500 uppercase">Onset</span>
                  <span className="font-medium text-white print:text-slate-900 capitalize">{assessment.userInputs.symptoms.onset}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-[#666] print:text-slate-500 uppercase">Body Areas</span>
                  <span className="font-medium text-white print:text-slate-900">
                    {assessment.userInputs.symptoms.selectedBodyParts.join(', ') || 'General'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Patient Context */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#888] mb-2 print:text-slate-700">
              2. Patient Profile & Context
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#141414] border border-[#222] rounded-xl p-3.5 print:bg-slate-50 print:border-slate-300 text-[#CCC] print:text-slate-800">
              <div>
                <span className="block text-[10px] text-[#666] print:text-slate-500 uppercase">Age Group</span>
                <span className="font-medium text-white print:text-slate-900">{assessment.userInputs.symptoms.profile.ageGroup || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-[10px] text-[#666] print:text-slate-500 uppercase">Biological Sex</span>
                <span className="font-medium text-white print:text-slate-900 capitalize">{assessment.userInputs.symptoms.profile.biologicalSex || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-[10px] text-[#666] print:text-slate-500 uppercase">Pregnancy Status</span>
                <span className="font-medium text-white print:text-slate-900">{assessment.userInputs.symptoms.profile.isPregnant ? 'Pregnant' : 'Not Pregnant'}</span>
              </div>
              <div className="col-span-full">
                <span className="block text-[10px] text-[#666] print:text-slate-500 uppercase">Known Conditions</span>
                <span className="font-medium text-white print:text-slate-900">
                  {assessment.userInputs.symptoms.profile.preExistingConditions.join(', ') || 'None reported'}
                </span>
              </div>
              <div className="col-span-full">
                <span className="block text-[10px] text-[#666] print:text-slate-500 uppercase">Current Medications</span>
                <span className="font-medium text-white print:text-slate-900">
                  {assessment.userInputs.symptoms.profile.currentMedications.join(', ') || 'None reported'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Possible Causes to Discuss */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#888] mb-2 print:text-slate-700">
              3. Potential Causes Explored with AI
            </h3>
            <div className="space-y-2">
              {assessment.possibleConditions.map((c, i) => (
                <div key={i} className="p-3 border border-[#222] rounded-xl bg-[#141414] print:bg-white print:border-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white print:text-slate-900">{c.conditionName}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1A1A1A] text-[#AAA] border border-[#2A2A2A] font-medium print:bg-slate-100 print:text-slate-700">
                      {c.matchLikelihood} Match
                    </span>
                  </div>
                  <p className="text-[#AAA] print:text-slate-600 text-xs mt-1">{c.overview}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Prepared Questions */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#888] mb-2 print:text-slate-700">
              4. Questions to Ask My Doctor
            </h3>
            <div className="bg-teal-500/5 border border-teal-500/20 rounded-xl p-3.5 space-y-1.5 print:bg-teal-50 print:border-teal-200">
              {assessment.suggestedQuestionsForDoctor.map((q, i) => (
                <div key={i} className="flex items-start space-x-2 text-teal-200 print:text-teal-950 font-medium">
                  <span className="text-teal-400 print:text-teal-600 font-bold">{i + 1}.</span>
                  <span>{q}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[11px] text-[#666] print:text-slate-500 border-t border-[#1A1A1A] print:border-slate-200 pt-3">
            Disclaimer: This document is for informational appointment preparation only and does not constitute a formal diagnosis or prescription.
          </div>
        </div>
      </div>
    </div>
  );
};
