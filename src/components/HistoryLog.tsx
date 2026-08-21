import React from 'react';
import { HistoryRecord, HealthAssessmentResult, TriageLevel } from '../types';
import {
  Clock,
  Trash2,
  FileText,
  ChevronRight,
  AlertOctagon,
  AlertTriangle,
  Home,
  CheckCircle2,
  Calendar,
  Stethoscope,
} from 'lucide-react';

interface HistoryLogProps {
  records: HistoryRecord[];
  onSelectRecord: (assessment: HealthAssessmentResult) => void;
  onDeleteRecord: (id: string) => void;
  onClearAll: () => void;
  onOpenDoctorSummary: (assessment: HealthAssessmentResult) => void;
}

export const HistoryLog: React.FC<HistoryLogProps> = ({
  records,
  onSelectRecord,
  onDeleteRecord,
  onClearAll,
  onOpenDoctorSummary,
}) => {
  const getTriageBadge = (level: TriageLevel) => {
    switch (level) {
      case 'EMERGENCY':
        return (
          <span className="inline-flex items-center space-x-1 text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full">
            <AlertOctagon className="w-3 h-3" />
            <span>Emergency</span>
          </span>
        );
      case 'URGENT_CARE':
        return (
          <span className="inline-flex items-center space-x-1 text-[10px] font-semibold bg-yellow-500/10 text-yellow-300 border border-yellow-500/30 px-2 py-0.5 rounded-full">
            <AlertTriangle className="w-3 h-3" />
            <span>Urgent Care</span>
          </span>
        );
      case 'ROUTINE_DOCTOR':
        return (
          <span className="inline-flex items-center space-x-1 text-[10px] font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3" />
            <span>Doctor Visit</span>
          </span>
        );
      case 'SELF_CARE':
      default:
        return (
          <span className="inline-flex items-center space-x-1 text-[10px] font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full">
            <Home className="w-3 h-3" />
            <span>Home Self-Care</span>
          </span>
        );
    }
  };

  return (
    <div id="history-log-container" className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="bg-[#0A0A0A] rounded-2xl p-4 sm:p-5 border border-[#1A1A1A] shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white">Symptom History & Timeline</h2>
          <p className="text-xs text-[#888] mt-0.5">
            Track your past health assessments to monitor symptom progression over time
          </p>
        </div>
        {records.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs font-semibold text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-colors flex items-center space-x-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* History Records List */}
      {records.length === 0 ? (
        <div className="bg-[#0A0A0A] rounded-2xl border border-[#1A1A1A] p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#141414] border border-[#222] text-[#666] flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white">No Previous Assessments</h3>
          <p className="text-xs text-[#888] max-w-sm mx-auto">
            When you complete a symptom check, your assessments will be saved privately in your browser for easy reference and tracking.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((rec) => (
            <div
              key={rec.id}
              id={`history-card-${rec.id}`}
              className="bg-[#0A0A0A] rounded-2xl border border-[#1A1A1A] shadow-xs p-4 sm:p-5 space-y-3 hover:border-[#333] transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-[#888] flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{rec.date}</span>
                    </span>
                    {getTriageBadge(rec.triageLevel)}
                  </div>
                  <h3 className="text-sm font-semibold text-white leading-snug">
                    {rec.symptoms}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => onDeleteRecord(rec.id)}
                  className="text-[#666] hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                  title="Delete Record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Conditions Summary */}
              {rec.conditionNames && rec.conditionNames.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {rec.conditionNames.map((name, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] bg-[#141414] text-[#BBB] px-2 py-0.5 rounded-md border border-[#222] font-medium"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-[#1A1A1A]">
                <button
                  type="button"
                  onClick={() => onOpenDoctorSummary(rec.assessment)}
                  className="text-xs font-semibold text-[#AAA] hover:text-white flex items-center space-x-1 py-1 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-teal-400" />
                  <span>View Doctor Sheet</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectRecord(rec.assessment)}
                  className="text-xs font-bold text-teal-400 hover:text-teal-300 flex items-center space-x-1 py-1 cursor-pointer"
                >
                  <span>Re-open Assessment</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
