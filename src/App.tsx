import React, { useState, useEffect } from 'react';
import {
  SymptomInput,
  FollowUpQuestion,
  FollowUpAnswer,
  HealthAssessmentResult,
  HistoryRecord,
} from './types';
import { Header, ActiveTab } from './components/Header';
import { SymptomInputForm } from './components/SymptomInputForm';
import { ClarifyingQuestionsView } from './components/ClarifyingQuestionsView';
import { AssessmentResultView } from './components/AssessmentResultView';
import { FirstAidLibrary } from './components/FirstAidLibrary';
import { HealthChat } from './components/HealthChat';
import { HistoryLog } from './components/HistoryLog';
import { EmergencyModal } from './components/EmergencyModal';
import { DisclaimerModal } from './components/DisclaimerModal';
import { DoctorSummaryModal } from './components/DoctorSummaryModal';
import { ShieldCheck, HeartPulse, AlertCircle, PhoneCall } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('checker');
  const [checkerStep, setCheckerStep] = useState<'input' | 'questions' | 'result'>('input');

  // Checker Data States
  const [symptomInput, setSymptomInput] = useState<SymptomInput | null>(null);
  const [followUpQuestions, setFollowUpQuestions] = useState<FollowUpQuestion[]>([]);
  const [followUpAnswers, setFollowUpAnswers] = useState<FollowUpAnswer[]>([]);
  const [currentAssessment, setCurrentAssessment] = useState<HealthAssessmentResult | null>(null);

  // Modals & Frame
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
  const [isDoctorSummaryOpen, setIsDoctorSummaryOpen] = useState(false);
  const [isMobileFrame, setIsMobileFrame] = useState(false);
  const [selectedFirstAidTopicId, setSelectedFirstAidTopicId] = useState<string | null>(null);
  const [chatPrompt, setChatPrompt] = useState<string | null>(null);

  // Loading & Error states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Local Storage History
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>(() => {
    try {
      const saved = localStorage.getItem('auracare_history_records');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('auracare_history_records', JSON.stringify(historyRecords));
    } catch (err) {
      console.error('Failed to persist history records:', err);
    }
  }, [historyRecords]);

  // Step 1 -> Step 2: Submit Initial Symptoms & Fetch Clarifying Questions
  const handleSymptomSubmit = async (input: SymptomInput) => {
    setSymptomInput(input);
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/health/generate-followups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error('Failed to generate follow-up questions');
      }

      const data = await response.json();
      if (data.questions && data.questions.length > 0) {
        setFollowUpQuestions(data.questions);
        setCheckerStep('questions');
      } else {
        // Direct to analysis if no followups generated
        await handleFollowUpAnswersSubmit([]);
      }
    } catch (err: any) {
      console.error('Error during followups generation:', err);
      setErrorMessage(
        'Unable to reach AI service for follow-up questions. Proceeding with initial evaluation.'
      );
      // Fallback: Proceed to analysis
      setFollowUpQuestions([
        {
          id: 'q-basic',
          question: 'Are symptoms getting progressively worse or staying steady?',
          options: ['Getting progressively worse', 'Staying steady', 'Fluctuating / coming and going'],
          allowMultiple: false,
        },
      ]);
      setCheckerStep('questions');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2 -> Step 3: Submit Answers & Fetch Full Clinical Triage Assessment
  const handleFollowUpAnswersSubmit = async (answers: FollowUpAnswer[]) => {
    if (!symptomInput) return;
    setFollowUpAnswers(answers);
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/health/analyze-symptoms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptoms: symptomInput,
          followUpAnswers: answers,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze symptoms');
      }

      const assessmentData: HealthAssessmentResult = await response.json();
      assessmentData.id = `assessment-${Date.now()}`;
      assessmentData.timestamp = Date.now();
      assessmentData.userInputs = {
        symptoms: symptomInput,
        followUpAnswers: answers,
      };

      setCurrentAssessment(assessmentData);
      setCheckerStep('result');

      // Save to History Log
      const newRecord: HistoryRecord = {
        id: assessmentData.id,
        date: new Date().toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        timestamp: assessmentData.timestamp,
        symptoms: symptomInput.primarySymptoms,
        triageLevel: assessmentData.triageLevel,
        triageHeadline: assessmentData.triageHeadline,
        conditionNames: assessmentData.possibleConditions.map((c) => c.conditionName),
        assessment: assessmentData,
      };

      setHistoryRecords((prev) => [newRecord, ...prev]);
    } catch (err: any) {
      console.error('Error analyzing symptoms:', err);
      setErrorMessage(
        'There was an issue processing your assessment. Please check your network or try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartNewCheck = () => {
    setCheckerStep('input');
    setSymptomInput(null);
    setFollowUpQuestions([]);
    setFollowUpAnswers([]);
    setErrorMessage(null);
  };

  const handleSelectHistoryRecord = (assessment: HealthAssessmentResult) => {
    setCurrentAssessment(assessment);
    setSymptomInput(assessment.userInputs.symptoms);
    setFollowUpAnswers(assessment.userInputs.followUpAnswers);
    setCheckerStep('result');
    setActiveTab('checker');
  };

  const handleDeleteHistoryRecord = (id: string) => {
    setHistoryRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const handleClearAllHistory = () => {
    setHistoryRecords([]);
  };

  const handleSelectFirstAidTopic = (topicId: string) => {
    setSelectedFirstAidTopicId(topicId);
    setActiveTab('firstaid');
  };

  const handleAskFollowUpInChat = (prompt?: string) => {
    if (prompt) {
      setChatPrompt(prompt);
    }
    setActiveTab('chat');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#E0E0E0] font-sans antialiased flex flex-col justify-between selection:bg-teal-500/30 selection:text-teal-200">
      {/* Disclaimer Sticky Notice Banner */}
      <div className="bg-[#0A0A0A] text-[#888] px-3 py-1.5 text-center text-[11px] font-medium border-b border-[#1A1A1A] flex items-center justify-center space-x-2">
        <ShieldCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" />
        <span>
          AuraCare is an AI educational health guide · Not a clinical diagnosis · In emergencies, dial 911 / 112
        </span>
        <button
          onClick={() => setIsDisclaimerOpen(true)}
          className="text-teal-400 hover:text-teal-300 underline font-semibold ml-1 cursor-pointer"
        >
          Read Policy
        </button>
      </div>

      {/* Main Container / Mobile Frame Wrapper */}
      <div className="flex-1 flex justify-center py-0 sm:py-6 px-0 sm:px-4">
        <div
          className={`w-full transition-all duration-300 flex flex-col bg-[#0A0A0A] ${
            isMobileFrame
              ? 'max-w-[430px] min-h-[860px] rounded-[36px] border-[8px] border-[#1A1A1A] shadow-2xl overflow-hidden my-auto'
              : 'max-w-4xl sm:rounded-3xl border-0 sm:border border-[#1A1A1A] shadow-2xl'
          }`}
        >
          {/* Header */}
          <Header
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onOpenEmergency={() => setIsEmergencyOpen(true)}
            onOpenDisclaimer={() => setIsDisclaimerOpen(true)}
            isMobileFrame={isMobileFrame}
            onToggleMobileFrame={() => setIsMobileFrame(!isMobileFrame)}
            historyCount={historyRecords.length}
          />

          {/* Main App Content Viewport */}
          <main className="flex-1 p-3.5 sm:p-6 overflow-y-auto">
            {/* Global Error Banner */}
            {errorMessage && (
              <div className="mb-4 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setErrorMessage(null)}
                  className="text-red-400 hover:text-red-200 font-bold text-xs"
                >
                  ✕
                </button>
              </div>
            )}

            {/* TAB 1: SYMPTOM CHECKER FLOW */}
            {activeTab === 'checker' && (
              <div>
                {checkerStep === 'input' && (
                  <div className="space-y-4">
                    <div className="bg-[#141414] border border-[#222] p-4 sm:p-5 rounded-2xl shadow-sm space-y-1 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
                      <h1 className="text-xl sm:text-2xl font-light text-white tracking-tight">
                        How are you feeling today?
                      </h1>
                      <p className="text-xs sm:text-sm text-[#888] leading-relaxed">
                        Enter your symptoms or describe your discomfort in natural language to receive AI health insights, clinical triage urgency, and evidence-based first aid steps.
                      </p>
                    </div>

                    <SymptomInputForm onSubmit={handleSymptomSubmit} isLoading={isLoading} />
                  </div>
                )}

                {checkerStep === 'questions' && symptomInput && (
                  <ClarifyingQuestionsView
                    questions={followUpQuestions}
                    symptoms={symptomInput}
                    onBack={() => setCheckerStep('input')}
                    onSubmitAnswers={handleFollowUpAnswersSubmit}
                    isLoading={isLoading}
                  />
                )}

                {checkerStep === 'result' && currentAssessment && (
                  <AssessmentResultView
                    assessment={currentAssessment}
                    onStartNew={handleStartNewCheck}
                    onOpenDoctorSummary={() => setIsDoctorSummaryOpen(true)}
                    onAskFollowUp={handleAskFollowUpInChat}
                  />
                )}
              </div>
            )}

            {/* TAB 2: FIRST-AID PROTOCOLS */}
            {activeTab === 'firstaid' && (
              <FirstAidLibrary
                initialTopicId={selectedFirstAidTopicId}
                onOpenEmergencyModal={() => setIsEmergencyOpen(true)}
              />
            )}

            {/* TAB 3: HEALTH CHAT ASSISTANT */}
            {activeTab === 'chat' && (
              <HealthChat
                currentAssessment={currentAssessment}
                initialPrompt={chatPrompt}
                onClearInitialPrompt={() => setChatPrompt(null)}
              />
            )}

            {/* TAB 4: HISTORY & TRACKER */}
            {activeTab === 'history' && (
              <HistoryLog
                records={historyRecords}
                onSelectRecord={handleSelectHistoryRecord}
                onDeleteRecord={handleDeleteHistoryRecord}
                onClearAll={handleClearAllHistory}
                onOpenDoctorSummary={(assessment) => {
                  setCurrentAssessment(assessment);
                  setIsDoctorSummaryOpen(true);
                }}
              />
            )}
          </main>

          {/* Footer Bar */}
          <footer className="h-12 bg-[#0A0A0A] border-t border-[#1A1A1A] px-4 sm:px-6 flex items-center justify-between text-[10px] text-[#555] tracking-wide">
            <span className="uppercase">AuraCare AI · Educational Tool · Not a Diagnosis</span>
            <span className="hidden sm:inline">Local Storage Private State</span>
          </footer>
        </div>
      </div>

      {/* Emergency Modal */}
      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
        onSelectFirstAid={handleSelectFirstAidTopic}
      />

      {/* Medical Safety Disclaimer Modal */}
      <DisclaimerModal
        isOpen={isDisclaimerOpen}
        onClose={() => setIsDisclaimerOpen(false)}
      />

      {/* Printable / Copyable Doctor Consultation Sheet Modal */}
      <DoctorSummaryModal
        assessment={currentAssessment}
        isOpen={isDoctorSummaryOpen}
        onClose={() => setIsDoctorSummaryOpen(false)}
      />
    </div>
  );
}
