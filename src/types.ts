export type TriageLevel = 'EMERGENCY' | 'URGENT_CARE' | 'ROUTINE_DOCTOR' | 'SELF_CARE';

export interface UserProfile {
  ageGroup: string; // e.g. "18-35", "36-50", "51-65", "65+", "Child (under 18)"
  biologicalSex: 'male' | 'female' | 'other' | 'unspecified';
  isPregnant?: boolean;
  preExistingConditions: string[];
  currentMedications: string[];
}

export interface SymptomInput {
  primarySymptoms: string;
  selectedBodyParts: string[];
  duration: string; // e.g. "Less than 24 hours", "1-3 days", "1-2 weeks", "More than 2 weeks"
  severity: number; // 1-10
  onset: 'sudden' | 'gradual';
  additionalNotes?: string;
  profile: UserProfile;
}

export interface FollowUpQuestion {
  id: string;
  question: string;
  options: string[];
  allowMultiple?: boolean;
  explanation?: string;
}

export interface FollowUpAnswer {
  questionId: string;
  question: string;
  selectedOptions: string[];
  customText?: string;
}

export interface PossibleCondition {
  conditionName: string;
  matchLikelihood: 'High' | 'Moderate' | 'Low';
  overview: string;
  whyItMatches: string;
  questionsForDoctor: string[];
  selfCareTips: string[];
  whenToSeekCare: string;
}

export interface FirstAidStep {
  title: string;
  steps: string[];
  importantPrecautions: string[];
  urgencyNote?: string;
}

export interface HealthAssessmentResult {
  id: string;
  timestamp: number;
  symptomSummary: string;
  triageLevel: TriageLevel;
  triageHeadline: string;
  triageRationale: string;
  emergencyAlert: string | null;
  possibleConditions: PossibleCondition[];
  firstAidAndImmediateCare: FirstAidStep[];
  redFlagWarnings: string[];
  generalCareRecommendations: string[];
  suggestedQuestionsForDoctor: string[];
  disclaimer: string;
  userInputs: {
    symptoms: SymptomInput;
    followUpAnswers: FollowUpAnswer[];
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
  suggestedActions?: string[];
}

export interface FirstAidTopic {
  id: string;
  title: string;
  category: 'Critical Emergencies' | 'Wounds & Trauma' | 'Environmental & Bites' | 'Common Illnesses';
  icon: string;
  shortDesc: string;
  isEmergency: boolean;
  quickActionSteps: string[];
  doNotDoList: string[];
  seekEmergencyIf: string[];
}

export interface HistoryRecord {
  id: string;
  date: string;
  timestamp: number;
  symptoms: string;
  triageLevel: TriageLevel;
  triageHeadline: string;
  conditionNames: string[];
  assessment: HealthAssessmentResult;
  notes?: string;
}
