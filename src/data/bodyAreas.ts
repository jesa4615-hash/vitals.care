export interface BodyRegion {
  id: string;
  name: string;
  iconName: string;
  commonSymptoms: string[];
}

export const BODY_REGIONS: BodyRegion[] = [
  {
    id: 'head-neck',
    name: 'Head & Neck',
    iconName: 'Brain',
    commonSymptoms: [
      'Headache / Migraine',
      'Dizziness or Vertigo',
      'Sore throat / Difficulty swallowing',
      'Sinus pressure / Congestion',
      'Neck stiffness or pain',
      'Vision blurriness / Eye redness',
      'Earache / Ringing in ears',
    ],
  },
  {
    id: 'chest',
    name: 'Chest & Respiratory',
    iconName: 'HeartPulse',
    commonSymptoms: [
      'Chest tightness / Pressure',
      'Shortness of breath / Wheezing',
      'Persistent dry or wet cough',
      'Rapid or fluttering heartbeat',
      'Pain when taking a deep breath',
    ],
  },
  {
    id: 'abdomen',
    name: 'Stomach & Digestion',
    iconName: 'Activity',
    commonSymptoms: [
      'Sharp abdominal pain / Cramps',
      'Nausea or Vomiting',
      'Acid reflux / Heartburn',
      'Bloating & gas',
      'Diarrhea or Loose stools',
      'Constipation / Difficulty passing stool',
      'Loss of appetite',
    ],
  },
  {
    id: 'back-spine',
    name: 'Back & Spine',
    iconName: 'Zap',
    commonSymptoms: [
      'Lower back dull ache',
      'Sharp shooting pain down leg (Sciatica)',
      'Upper back & shoulder tension',
      'Spinal stiffness in the morning',
    ],
  },
  {
    id: 'limbs-joints',
    name: 'Arms, Legs & Joints',
    iconName: 'Move',
    commonSymptoms: [
      'Joint swelling / Inflammation',
      'Muscle aches / Soreness',
      'Numbness or tingling in fingers/toes',
      'Sprained ankle or wrist pain',
      'Knee instability / Cracking pain',
    ],
  },
  {
    id: 'skin-surface',
    name: 'Skin & Allergies',
    iconName: 'Sparkles',
    commonSymptoms: [
      'Itchy red rash or hives',
      'Unexplained bruising',
      'Dry, flaking, or peeling skin',
      'Insect bite swelling',
      'Localized burning or stinging',
    ],
  },
  {
    id: 'general-whole',
    name: 'Systemic / Whole Body',
    iconName: 'Thermometer',
    commonSymptoms: [
      'Fever & Chills',
      'Severe exhaustion / Chronic fatigue',
      'Unexplained body chills / Shivering',
      'Sudden lightheadedness / Weakness',
      'Difficulty sleeping / Insomnia',
      'Unintended weight change',
    ],
  },
];

export const PRE_EXISTING_OPTIONS = [
  'Asthma / COPD',
  'High Blood Pressure (Hypertension)',
  'Diabetes (Type 1 or 2)',
  'Heart Disease',
  'Seasonal or Food Allergies',
  'Migraines',
  'Kidney Disease',
  'Immunocompromised condition',
  'Anxiety / Depression',
  'Thyroid Disorder',
];

export const DURATION_OPTIONS = [
  'Just started (Less than 6 hours)',
  'Past 24 hours',
  '2 to 3 days',
  '4 to 7 days (About 1 week)',
  '1 to 2 weeks',
  'Over 2 weeks (Chronic/Ongoing)',
];
