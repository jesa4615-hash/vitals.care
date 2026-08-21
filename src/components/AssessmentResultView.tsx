import React, { useState } from 'react';
import { HealthAssessmentResult, TriageLevel } from '../types';
import {
  AlertOctagon,
  AlertTriangle,
  Clock,
  Home,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  FileText,
  MessageSquare,
  RotateCcw,
  CheckCircle2,
  Stethoscope,
  HeartPulse,
  Bandage,
  Share2,
  Info,
  Check,
} from 'lucide-react';

interface AssessmentResultViewProps {
  assessment: HealthAssessmentResult;
  onStartNew: () => void;
  onOpenDoctorSummary: () => void;
  onAskFollowUp: (prompt?: string) => void;
}

export const AssessmentResultView: React.FC<AssessmentResultViewProps> = ({
  assessment,
  onStartNew,
  onOpenDoctorSummary,
  onAskFollowUp,
}) => {
  const [expandedCondition, setExpandedCondition] = useState<number | null>(0);
  const [checkedQuestions, setCheckedQuestions] = useState<{ [index: number]: boolean }>({});

  const toggleCheckQuestion = (idx: number) => {
    setCheckedQuestions((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const getTriageTheme = (level: TriageLevel) => {
    switch (level) {
      case 'EMERGENCY':
        return {
          bg: 'bg-gradient-to-br from-red-950/80 via-[#1A0808] to-[#0A0A0A] text-white border border-red-800/40 shadow-red-950/30',
          border: 'border-red-500/40',
          badgeBg: 'bg-red-500/20 text-red-300 border border-red-500/40',
          icon: <AlertOctagon className="w-6 h-6 text-red-400 animate-pulse" />,
          title: 'EMERGENCY CARE NEEDED',
        };
      case 'URGENT_CARE':
        return {
          bg: 'bg-gradient-to-br from-amber-950/80 via-[#1A1208] to-[#0A0A0A] text-white border border-amber-800/40 shadow-amber-950/30',
          border: 'border-amber-500/40',
          badgeBg: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40',
          icon: <AlertTriangle className="w-6 h-6 text-amber-400" />,
          title: 'PROMPT MEDICAL EVALUATION (Within 24h)',
        };
      case 'ROUTINE_DOCTOR':
        return {
          bg: 'bg-gradient-to-br from-teal-950/80 via-[#081815] to-[#0A0A0A] text-white border border-teal-800/40 shadow-teal-950/30',
          border: 'border-teal-500/40',
          badgeBg: 'bg-teal-500/20 text-teal-300 border border-teal-500/40',
          icon: <Clock className="w-6 h-6 text-teal-400" />,
          title: 'SCHEDULE DOCTOR CONSULTATION',
        };
      case 'SELF_CARE':
      default:
        return {
          bg: 'bg-gradient-to-br from-blue-950/80 via-[#08101C] to-[#0A0A0A] text-white border border-blue-800/40 shadow-blue-950/30',
          border: 'border-blue-500/40',
          badgeBg: 'bg-blue-500/20 text-blue-300 border border-blue-500/40',
          icon: <Home className="w-6 h-6 text-blue-400" />,
          title: 'HOME CARE & MONITORING',
        };
    }
  };

  const triageTheme = getTriageTheme(assessment.triageLevel);

  return (
    <div id="assessment-results-view" className="space-y-5 animate-fade-in">
      {/* Top Triage Urgency Hero Card */}
      <div className={`rounded-2xl p-5 sm:p-6 shadow-xl ${triageTheme.bg} space-y-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            {triageTheme.icon}
            <span className="text-xs font-semibold tracking-wider uppercase text-white">Triage Recommendation</span>
          </div>
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs ${triageTheme.badgeBg}`}>
            {assessment.triageLevel.replace('_', ' ')}
          </span>
        </div>

        <div>
          <h2 className="text-lg sm:text-xl font-light text-white tracking-tight">{assessment.triageHeadline}</h2>
          <p className="text-xs sm:text-sm text-[#BBB] mt-1 leading-relaxed">{assessment.triageRationale}</p>
        </div>

        {assessment.emergencyAlert && (
          <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/30 text-xs font-semibold text-red-300 flex items-start space-x-2">
            <AlertOctagon className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{assessment.emergencyAlert}</span>
          </div>
        )}
      </div>

      {/* Red Flag Warning Signs Card */}
      {assessment.redFlagWarnings && assessment.redFlagWarnings.length > 0 && (
        <div className="bg-[#0A0A0A] border border-red-900/40 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center space-x-2 text-red-400 font-bold text-xs uppercase tracking-wider mb-2.5">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>Seek Immediate Emergency Care If You Notice Any of These Red Flags:</span>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-red-300 font-medium">
            {assessment.redFlagWarnings.map((flag, idx) => (
              <li key={idx} className="flex items-start space-x-2 bg-red-500/5 p-2.5 rounded-xl border border-red-500/10">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                <span>{flag}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Potential Causes & Conditions Section */}
      <div className="bg-[#0A0A0A] rounded-2xl p-4 sm:p-5 border border-[#1A1A1A] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <HeartPulse className="w-4 h-4 text-teal-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Possible Causes to Explore with a Doctor ({assessment.possibleConditions.length})
            </h3>
          </div>
          <span className="text-[11px] text-[#666] font-medium">Click to expand</span>
        </div>

        <div className="space-y-2.5">
          {assessment.possibleConditions.map((cond, idx) => {
            const isExpanded = expandedCondition === idx;
            return (
              <div
                key={idx}
                id={`condition-card-${idx}`}
                className="border border-[#222] rounded-xl overflow-hidden transition-all bg-[#141414]"
              >
                <button
                  type="button"
                  onClick={() => setExpandedCondition(isExpanded ? null : idx)}
                  className="w-full p-3.5 sm:p-4 text-left flex items-center justify-between hover:bg-[#1A1A1A] transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-2.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        cond.matchLikelihood === 'High'
                          ? 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30'
                          : cond.matchLikelihood === 'Moderate'
                          ? 'bg-teal-500/10 text-teal-300 border-teal-500/30'
                          : 'bg-[#1F1F1F] text-[#AAA] border-[#333]'
                      }`}
                    >
                      {cond.matchLikelihood} Match
                    </span>
                    <h4 className="text-sm font-semibold text-white">{cond.conditionName}</h4>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-[#888]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#888]" />
                  )}
                </button>

                {isExpanded && (
                  <div className="p-4 pt-0 border-t border-[#1A1A1A] bg-[#0A0A0A] space-y-3 text-xs leading-relaxed">
                    <div className="pt-3">
                      <p className="text-[#E0E0E0] font-normal">{cond.overview}</p>
                    </div>

                    <div className="bg-[#141414] p-3 rounded-lg border border-[#222]">
                      <strong className="text-[11px] uppercase tracking-wider text-[#888] block mb-1">
                        Why this matches your symptoms:
                      </strong>
                      <p className="text-[#CCC]">{cond.whyItMatches}</p>
                    </div>

                    {cond.selfCareTips && cond.selfCareTips.length > 0 && (
                      <div>
                        <strong className="text-[11px] uppercase tracking-wider text-[#888] block mb-1">
                          Home Management & Comfort:
                        </strong>
                        <ul className="list-disc pl-4 space-y-1 text-[#BBB] marker:text-teal-400">
                          {cond.selfCareTips.map((tip, tIdx) => (
                            <li key={tIdx}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="text-yellow-300 bg-yellow-500/5 p-2.5 rounded-lg border border-yellow-500/20 text-[11px]">
                      <strong>When to see a doctor for this:</strong> {cond.whenToSeekCare}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        onAskFollowUp(
                          `Can you tell me more about ${cond.conditionName}, how it is typically diagnosed, and what questions I should ask my doctor?`
                        )
                      }
                      className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center space-x-1 pt-1 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Ask AI more about {cond.conditionName}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* First-Aid & Immediate Care Actions */}
      {assessment.firstAidAndImmediateCare && assessment.firstAidAndImmediateCare.length > 0 && (
        <div className="bg-[#0A0A0A] rounded-2xl p-4 sm:p-5 border border-[#1A1A1A] shadow-sm space-y-3">
          <div className="flex items-center space-x-2">
            <Bandage className="w-4 h-4 text-teal-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              First-Aid & Immediate Self-Care Steps
            </h3>
          </div>

          <div className="space-y-3">
            {assessment.firstAidAndImmediateCare.map((guide, gIdx) => (
              <div key={gIdx} className="bg-[#141414] rounded-xl p-3.5 border border-[#222] space-y-2.5 text-xs">
                <h4 className="font-bold text-white text-sm flex items-center space-x-1.5">
                  <span>{guide.title}</span>
                </h4>

                <ol className="space-y-1.5 pl-1">
                  {guide.steps.map((step, sIdx) => (
                    <li key={sIdx} className="flex items-start space-x-2 text-[#CCC]">
                      <span className="flex items-center justify-center w-4 h-4 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-[10px] font-bold shrink-0 mt-0.5">
                        {sIdx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>

                {guide.importantPrecautions && guide.importantPrecautions.length > 0 && (
                  <div className="p-2.5 bg-red-500/5 rounded-lg border border-red-500/20 text-red-300 text-[11px] space-y-1">
                    <strong className="block font-semibold text-red-400">Important Precautions:</strong>
                    {guide.importantPrecautions.map((p, pIdx) => (
                      <p key={pIdx}>• {p}</p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Questions for Healthcare Provider */}
      <div className="bg-[#0A0A0A] rounded-2xl p-4 sm:p-5 border border-[#1A1A1A] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Stethoscope className="w-4 h-4 text-teal-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Questions Prepared for Your Doctor
            </h3>
          </div>
          <button
            type="button"
            onClick={onOpenDoctorSummary}
            className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center space-x-1 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Open Visit Sheet</span>
          </button>
        </div>

        <p className="text-xs text-[#888]">
          Save or check off these high-yield questions to discuss during your appointment:
        </p>

        <div className="space-y-2">
          {assessment.suggestedQuestionsForDoctor.map((question, qIdx) => {
            const isChecked = checkedQuestions[qIdx];
            return (
              <div
                key={qIdx}
                onClick={() => toggleCheckQuestion(qIdx)}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-start space-x-2.5 ${
                  isChecked
                    ? 'bg-teal-500/10 border-teal-500/40 text-teal-300 line-through opacity-80'
                    : 'bg-[#141414] border-[#222] text-[#E0E0E0] hover:bg-[#1A1A1A] hover:border-[#333]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 mt-0.5 ${
                    isChecked
                      ? 'bg-teal-600 border-teal-500 text-white'
                      : 'border-[#333] bg-[#0A0A0A]'
                  }`}
                >
                  {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span className="font-medium leading-snug">{question}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* General Recommendations */}
      {assessment.generalCareRecommendations && assessment.generalCareRecommendations.length > 0 && (
        <div className="bg-[#0A0A0A] rounded-2xl p-4 sm:p-5 border border-[#1A1A1A] space-y-2 text-xs">
          <h4 className="font-bold text-teal-400 uppercase tracking-wider text-[11px]">
            General Rest & Monitoring Guidance:
          </h4>
          <ul className="space-y-1.5 pl-4 list-disc text-[#BBB] marker:text-teal-400">
            {assessment.generalCareRecommendations.map((rec, rIdx) => (
              <li key={rIdx}>{rec}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Strict Medical Disclaimer Box */}
      <div className="p-4 bg-[#141414] rounded-2xl border border-[#222] text-[#888] text-xs space-y-1.5">
        <div className="flex items-center space-x-1.5 font-bold text-white">
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          <span>Medical Notice</span>
        </div>
        <p className="leading-relaxed text-[#AAA]">{assessment.disclaimer}</p>
      </div>

      {/* Action Navigation Footer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
        <button
          type="button"
          id="ask-followup-chat-btn"
          onClick={() => onAskFollowUp()}
          className="py-3 px-4 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-teal-900/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Ask AI Follow-Up Questions</span>
        </button>

        <button
          type="button"
          id="open-doctor-summary-btn"
          onClick={onOpenDoctorSummary}
          className="py-3 px-4 bg-[#141414] hover:bg-[#1A1A1A] border border-[#222] text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer"
        >
          <FileText className="w-4 h-4 text-teal-400" />
          <span>Doctor Consultation Sheet</span>
        </button>

        <button
          type="button"
          id="new-assessment-btn"
          onClick={onStartNew}
          className="py-3 px-4 bg-[#141414] hover:bg-[#1A1A1A] border border-[#222] text-[#AAA] hover:text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Check Different Symptoms</span>
        </button>
      </div>
    </div>
  );
};
