import React, { useState } from 'react';
import { FollowUpQuestion, FollowUpAnswer, SymptomInput } from '../types';
import { Sparkles, ArrowLeft, Check, HelpCircle, AlertCircle } from 'lucide-react';

interface ClarifyingQuestionsViewProps {
  questions: FollowUpQuestion[];
  symptoms: SymptomInput;
  onBack: () => void;
  onSubmitAnswers: (answers: FollowUpAnswer[]) => void;
  isLoading: boolean;
}

export const ClarifyingQuestionsView: React.FC<ClarifyingQuestionsViewProps> = ({
  questions,
  symptoms,
  onBack,
  onSubmitAnswers,
  isLoading,
}) => {
  const [selectedMap, setSelectedMap] = useState<{ [qId: string]: string[] }>(() => {
    const init: { [qId: string]: string[] } = {};
    questions.forEach((q) => {
      // default to first option if not multiple
      init[q.id] = [];
    });
    return init;
  });

  const [notesMap, setNotesMap] = useState<{ [qId: string]: string }>({});

  const handleToggleOption = (questionId: string, option: string, allowMultiple: boolean = false) => {
    setSelectedMap((prev) => {
      const current = prev[questionId] || [];
      if (allowMultiple) {
        return {
          ...prev,
          [questionId]: current.includes(option)
            ? current.filter((o) => o !== option)
            : [...current, option],
        };
      } else {
        return {
          ...prev,
          [questionId]: [option],
        };
      }
    });
  };

  const handleSelectAllAnswered = () => {
    const answers: FollowUpAnswer[] = questions.map((q) => ({
      questionId: q.id,
      question: q.question,
      selectedOptions: selectedMap[q.id]?.length > 0 ? selectedMap[q.id] : ['Not specified'],
      customText: notesMap[q.id]?.trim() || undefined,
    }));
    onSubmitAnswers(answers);
  };

  const answeredCount = questions.filter((q) => (selectedMap[q.id]?.length || 0) > 0).length;

  return (
    <div id="clarifying-questions-container" className="space-y-5 animate-fade-in">
      {/* Header Info */}
      <div className="bg-[#0A0A0A] rounded-2xl p-4 sm:p-5 border border-[#1A1A1A] shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#888] hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Edit Initial Symptoms</span>
          </button>
          <span className="text-xs font-bold text-teal-300 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/30">
            Step 2 of 3 · Clarifying Questions ({answeredCount}/{questions.length})
          </span>
        </div>

        <h2 className="text-base font-bold text-white pt-1">
          A few targeted questions to refine your assessment
        </h2>
        <p className="text-xs text-[#888]">
          Our clinical AI selected these questions based on your report of:{' '}
          <span className="font-semibold text-teal-400">"{symptoms.primarySymptoms}"</span>
        </p>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.map((q, index) => {
          const selected = selectedMap[q.id] || [];
          return (
            <div
              key={q.id}
              id={`question-card-${q.id}`}
              className="bg-[#0A0A0A] rounded-2xl p-4 sm:p-5 border border-[#1A1A1A] shadow-sm space-y-3"
            >
              <div className="flex items-start space-x-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-bold shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-white leading-snug">{q.question}</h3>
                  {q.explanation && (
                    <p className="text-[11px] text-[#888] mt-1 flex items-center space-x-1">
                      <HelpCircle className="w-3 h-3 text-[#666] shrink-0" />
                      <span>{q.explanation}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 pl-9">
                {q.options.map((option) => {
                  const isChecked = selected.includes(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      id={`option-${q.id}-${option.replace(/\s+/g, '-').toLowerCase()}`}
                      onClick={() => handleToggleOption(q.id, option, q.allowMultiple)}
                      className={`text-left p-3 rounded-xl border text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                        isChecked
                          ? 'bg-teal-500/10 border-teal-500/60 text-teal-300 font-semibold shadow-xs ring-1 ring-teal-500/20'
                          : 'bg-[#141414] border-[#222] text-[#AAA] hover:bg-[#1A1A1A] hover:border-[#333] hover:text-white'
                      }`}
                    >
                      <span className="pr-2">{option}</span>
                      <div
                        className={`w-4 h-4 rounded-${q.allowMultiple ? 'sm' : 'full'} border flex items-center justify-center shrink-0 ${
                          isChecked
                            ? 'bg-teal-600 border-teal-500 text-white'
                            : 'border-[#333] bg-[#0A0A0A]'
                        }`}
                      >
                        {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Optional Custom Note Input */}
              <div className="pl-9 pt-1">
                <input
                  type="text"
                  placeholder="Optional: Add specific note for this question..."
                  value={notesMap[q.id] || ''}
                  onChange={(e) => setNotesMap({ ...notesMap, [q.id]: e.target.value })}
                  className="w-full bg-[#141414] border border-[#222] rounded-lg p-2 text-xs text-[#E0E0E0] placeholder:text-[#555] outline-none focus:border-teal-500/50"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Safety Reminder Banner */}
      <div className="p-3.5 bg-yellow-500/5 border-l-4 border-yellow-500/60 border-y border-r border-yellow-500/20 rounded-xl text-xs text-yellow-300 flex items-start space-x-2.5">
        <AlertCircle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
        <div>
          If any symptom feels life-threatening or suddenly catastrophic, do not wait for AI evaluation—call 911 or emergency services immediately.
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="py-3 px-4 bg-[#141414] hover:bg-[#1A1A1A] border border-[#222] text-[#AAA] hover:text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
        >
          Back
        </button>

        <button
          type="button"
          id="generate-full-assessment-btn"
          onClick={handleSelectAllAnswered}
          disabled={isLoading}
          className={`flex-1 py-3.5 px-6 rounded-xl font-semibold text-sm text-white shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer ${
            isLoading
              ? 'bg-[#1A1A1A] border border-[#222] cursor-not-allowed text-[#555]'
              : 'bg-teal-600 hover:bg-teal-500 shadow-teal-900/30 active:scale-[0.99]'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Generating Clinical Assessment...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Health Assessment & Guidance</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
