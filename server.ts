import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client lazily/safely
let genAIClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set. Using safe fallback responses.');
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

// Health check
app.get('/api/health-check', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Follow-up questions generator
app.post('/api/health/generate-followups', async (req, res) => {
  try {
    const { primarySymptoms, selectedBodyParts, duration, severity, onset, profile } = req.body;

    const ai = getGenAI();
    if (!ai) {
      // Safe fallback follow-up questions
      return res.json({
        questions: [
          {
            id: 'q1',
            question: 'Are you experiencing any shortness of breath, chest pressure, or difficulty swallowing?',
            options: ['None of these', 'Mild shortness of breath', 'Chest tightness or discomfort', 'Difficulty swallowing'],
            allowMultiple: false,
            explanation: 'Critical for ruling out immediate cardiovascular or respiratory distress.',
          },
          {
            id: 'q2',
            question: 'How did these symptoms begin and how have they progressed?',
            options: ['Started suddenly and rapidly worsened', 'Developed gradually over days', 'Comes and goes in waves', 'Constant and steady'],
            allowMultiple: false,
            explanation: 'Onset speed helps differentiate acute conditions from subacute or chronic ones.',
          },
          {
            id: 'q3',
            question: 'Do you have a measured fever or chills?',
            options: ['No fever', 'Low-grade fever (< 100.4°F / 38°C)', 'High fever (≥ 100.4°F / 38°C)', 'Chills or night sweats without measured temp'],
            allowMultiple: false,
            explanation: 'Helps evaluate potential infectious or inflammatory processes.',
          },
          {
            id: 'q4',
            question: 'Does anything specific make the symptoms noticeably better or worse?',
            options: ['Worse with movement / physical activity', 'Worse when lying down', 'Relieved by rest or OTC painkillers', 'No noticeable triggers or relief'],
            allowMultiple: true,
            explanation: 'Positional and exertion triggers provide vital diagnostic clues.',
          },
        ],
      });
    }

    const prompt = `You are an expert, empathetic clinical triage assistant for a mobile health app.
A patient has reported the following initial symptoms and health profile:
- Primary Symptoms: ${primarySymptoms}
- Affected Body Areas: ${Array.isArray(selectedBodyParts) ? selectedBodyParts.join(', ') : 'None specified'}
- Duration: ${duration}
- Pain/Discomfort Severity (1-10): ${severity}
- Onset: ${onset}
- Age Group: ${profile?.ageGroup || 'Adult'}
- Biological Sex: ${profile?.biologicalSex || 'Unspecified'}
- Pre-existing Conditions: ${profile?.preExistingConditions?.join(', ') || 'None reported'}
- Current Medications: ${profile?.currentMedications?.join(', ') || 'None reported'}
- Pregnancy status: ${profile?.isPregnant ? 'Yes, pregnant' : 'No / Not applicable'}

Generate exactly 3 to 5 targeted, high-yield clarifying clinical follow-up questions.
Focus on:
1. Identifying or ruling out emergency red flags (e.g. chest pain, neurological deficits, severe breathing difficulty, anaphylaxis).
2. Clarifying radiation of pain, character of symptom (sharp, dull, throbbing, burning), or associated systemic signs (fever, nausea, rash).
3. Contextual triggers or relieving factors.

Ensure questions are easy for a non-medical person to understand.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  allowMultiple: { type: Type.BOOLEAN },
                  explanation: { type: Type.STRING },
                },
                required: ['id', 'question', 'options'],
              },
            },
          },
          required: ['questions'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error generating followups:', error);
    res.status(500).json({
      error: 'Failed to generate follow-up questions',
      details: error.message,
    });
  }
});

// Full Symptom Analysis & Triage Endpoint
app.post('/api/health/analyze-symptoms', async (req, res) => {
  try {
    const { symptoms, followUpAnswers } = req.body;
    const ai = getGenAI();

    const formattedFollowUps = Array.isArray(followUpAnswers)
      ? followUpAnswers
          .map((a: any) => `Q: ${a.question}\nUser Answer: ${a.selectedOptions?.join(', ')}${a.customText ? ` (Note: ${a.customText})` : ''}`)
          .join('\n\n')
      : 'No follow-up questions answered.';

    const patientProfile = `
- Primary Symptoms: ${symptoms.primarySymptoms}
- Affected Body Areas: ${symptoms.selectedBodyParts?.join(', ') || 'General / Unspecified'}
- Duration: ${symptoms.duration}
- Severity (1-10): ${symptoms.severity}
- Onset: ${symptoms.onset}
- Additional Notes: ${symptoms.additionalNotes || 'None'}
- Age Group: ${symptoms.profile?.ageGroup || 'Adult'}
- Biological Sex: ${symptoms.profile?.biologicalSex || 'Unspecified'}
- Pregnant: ${symptoms.profile?.isPregnant ? 'Yes' : 'No'}
- Pre-existing Conditions: ${symptoms.profile?.preExistingConditions?.join(', ') || 'None reported'}
- Current Medications: ${symptoms.profile?.currentMedications?.join(', ') || 'None reported'}
    `.trim();

    if (!ai) {
      // Safe fallback assessment if API key is missing
      const isHighSeverity = symptoms.severity >= 8;
      const fallbackResult = {
        symptomSummary: `Evaluation for: ${symptoms.primarySymptoms} (${symptoms.duration}, severity ${symptoms.severity}/10).`,
        triageLevel: isHighSeverity ? 'URGENT_CARE' : 'SELF_CARE',
        triageHeadline: isHighSeverity
          ? 'Recommended: Prompt Medical Evaluation within 24 Hours'
          : 'Recommended: Home Self-Care with Active Symptom Monitoring',
        triageRationale: isHighSeverity
          ? 'Due to elevated discomfort and symptom profile, an in-person medical evaluation is recommended to assess your condition properly.'
          : 'Symptoms appear suitable for initial conservative management, but monitor closely for any red flags or worsening.',
        emergencyAlert: null,
        possibleConditions: [
          {
            conditionName: 'Acute Symptom Flare / Non-specific Presentation',
            matchLikelihood: 'Moderate',
            overview: 'A common temporary physiological reaction or mild illness corresponding with your reported symptoms.',
            whyItMatches: 'Aligns with your primary symptom report and reported duration.',
            questionsForDoctor: ['What diagnostic tests or physical exams are appropriate if this persists?', 'Are there specific over-the-counter options suited for my medical profile?'],
            selfCareTips: ['Get adequate rest and maintain hydration', 'Track changes in temperature, pain level, or new signs in your symptom diary'],
            whenToSeekCare: 'Seek immediate care if symptoms abruptly worsen or red flags emerge.',
          },
        ],
        firstAidAndImmediateCare: [
          {
            title: 'General Symptom Comfort Protocol',
            steps: ['Rest in a calm, well-ventilated room', 'Stay hydrated with water or electrolyte solutions', 'Avoid strenuous physical exertion'],
            importantPrecautions: ['Do not take medications without verifying interactions if you have existing conditions.'],
            urgencyNote: 'If breathing becomes difficult or acute pain develops, seek emergency help.',
          },
        ],
        redFlagWarnings: [
          'Sudden severe chest pain, pressure, or tightness',
          'Difficulty breathing or sudden shortness of breath',
          'Sudden weakness, facial drooping, or speech difficulty',
          'High fever (>103°F / 39.4°C) or stiff neck with fever',
          'Loss of consciousness, severe confusion, or fainting',
        ],
        generalCareRecommendations: [
          'Maintain consistent hydration and restful sleep',
          'Avoid alcohol, caffeine, or heavy taxing meals until settled',
          'Log your symptoms twice daily to observe trends',
        ],
        suggestedQuestionsForDoctor: [
          'Could my current medications be contributing to these symptoms?',
          'What red flag signs specifically related to my case should prompt urgent attention?',
          'What is the expected timeline for full recovery?',
        ],
        disclaimer:
          'This assessment is generated by an AI assistant for informational and educational purposes only. It is NOT a clinical medical diagnosis, prognosis, or treatment plan. Always consult a qualified healthcare provider for personalized medical evaluation.',
      };
      return res.json(fallbackResult);
    }

    const systemPrompt = `You are an expert clinical triage AI assistant built for a mobile health assistant app.
Your goals:
1. Provide safe, balanced, empathetic, and evidence-informed health information.
2. Accurately categorize the triage level:
   - "EMERGENCY": Immediate life-threatening or organ-threatening signs (e.g. acute coronary syndrome signs, stroke symptoms (FAST), respiratory failure, severe acute abdomen, anaphylaxis, severe head trauma). Triage headline should instruct calling 911 / emergency services.
   - "URGENT_CARE": Needs evaluation within 12-24 hours (e.g., high persistent fever, suspected fracture, severe migraine not responding to meds, deep laceration, suspected UTI with back pain).
   - "ROUTINE_DOCTOR": Non-urgent, schedule regular clinic/telehealth appointment (e.g. chronic joint pain, mild recurring headaches, lingering cough without dyspnea, unexplained mild fatigue).
   - "SELF_CARE": Mild, self-limiting conditions suitable for conservative home care and monitoring (e.g. common cold, mild muscle strain, mild tension headache).

CRITICAL SAFETY DIRECTIVES:
- NEVER give a definitive medical diagnosis. Always use probabilistic, informative terminology like "Possible conditions to explore with a doctor", "Potential considerations".
- Always highlight Red Flag Warning Signs explicitly.
- Provide practical, safe, non-prescriptive first-aid and immediate self-care steps.
- Provide 3-4 structured, actionable questions the user should ask their doctor.
- Always include the clear standard medical disclaimer.`;

    const userPrompt = `Please analyze the following patient case and generate a complete structured health assessment:

PATIENT PROFILE & SYMPTOMS:
${patientProfile}

CLARIFYING QUESTIONS & PATIENT ANSWERS:
${formattedFollowUps}

Please respond strictly in the requested JSON structure.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            symptomSummary: {
              type: Type.STRING,
              description: 'Clear, empathetic synthesis of what the user is experiencing.',
            },
            triageLevel: {
              type: Type.STRING,
              enum: ['EMERGENCY', 'URGENT_CARE', 'ROUTINE_DOCTOR', 'SELF_CARE'],
              description: 'Urgency triage category.',
            },
            triageHeadline: {
              type: Type.STRING,
              description: 'Clear, concise recommendation headline for the user.',
            },
            triageRationale: {
              type: Type.STRING,
              description: 'Brief explanation of why this triage urgency was determined.',
            },
            emergencyAlert: {
              type: Type.STRING,
              nullable: true,
              description: 'Specific emergency call-out if triage is EMERGENCY or urgent red flags exist.',
            },
            possibleConditions: {
              type: Type.ARRAY,
              description: 'List of 2 to 4 possible health conditions to discuss with a doctor.',
              items: {
                type: Type.OBJECT,
                properties: {
                  conditionName: { type: Type.STRING },
                  matchLikelihood: {
                    type: Type.STRING,
                    enum: ['High', 'Moderate', 'Low'],
                  },
                  overview: { type: Type.STRING },
                  whyItMatches: { type: Type.STRING },
                  questionsForDoctor: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  selfCareTips: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  whenToSeekCare: { type: Type.STRING },
                },
                required: [
                  'conditionName',
                  'matchLikelihood',
                  'overview',
                  'whyItMatches',
                  'questionsForDoctor',
                  'selfCareTips',
                  'whenToSeekCare',
                ],
              },
            },
            firstAidAndImmediateCare: {
              type: Type.ARRAY,
              description: 'Safe immediate care / first aid protocols.',
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  steps: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  importantPrecautions: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  urgencyNote: { type: Type.STRING },
                },
                required: ['title', 'steps', 'importantPrecautions'],
              },
            },
            redFlagWarnings: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Warning signs that indicate immediate emergency escalation is needed.',
            },
            generalCareRecommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'General lifestyle, hydration, rest, and comfort recommendations.',
            },
            suggestedQuestionsForDoctor: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'High-value questions to prepare for a healthcare appointment.',
            },
            disclaimer: {
              type: Type.STRING,
              description: 'Medical disclaimer stating this is informational only and not a doctor diagnosis.',
            },
          },
          required: [
            'symptomSummary',
            'triageLevel',
            'triageHeadline',
            'triageRationale',
            'possibleConditions',
            'firstAidAndImmediateCare',
            'redFlagWarnings',
            'generalCareRecommendations',
            'suggestedQuestionsForDoctor',
            'disclaimer',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error analyzing symptoms:', error);
    res.status(500).json({
      error: 'Failed to analyze symptoms',
      details: error.message,
    });
  }
});

// Interactive Health Assistant Follow-up Chat
app.post('/api/health/chat', async (req, res) => {
  try {
    const { message, history, contextAssessment } = req.body;
    const ai = getGenAI();

    if (!ai) {
      return res.json({
        reply:
          'Thank you for your question. As an AI health assistant, I can provide general health information and first-aid education. Please keep in mind that I cannot provide medical prescriptions or direct clinical diagnoses. If you have worsening symptoms or severe pain, please consult a qualified doctor or contact local emergency services.',
        suggestedActions: [
          'What are red flags for my symptoms?',
          'How can I prepare for my doctor visit?',
          'What first-aid measures can help right now?',
        ],
      });
    }

    const systemInstruction = `You are AuraCare, a caring, professional, and safety-focused AI Health Assistant.
Context of the patient's current assessment (if available):
${contextAssessment ? JSON.stringify(contextAssessment) : 'No previous assessment provided.'}

Your rules:
1. Provide clear, empathetic, evidence-based answers to user questions about health, first aid, symptoms, lifestyle comfort, and preparing for medical visits.
2. NEVER diagnose specific illnesses as certainty ("You have X"). Always use phrasing like "This symptom could be related to...", "Common causes include...".
3. NEVER prescribe medications or suggest altering physician-prescribed dosage. You may explain over-the-counter general classes (e.g. saline spray, electrolyte hydration, cold compress) with safety caveats.
4. If the user mentions severe emergency symptoms (crushing chest pain, severe breathing trouble, facial droop, uncontrollable bleeding, suicidal thoughts), immediately urge them to contact emergency services (e.g. 911 / 112 / local emergency hotline) immediately.
5. Keep explanations concise, scannable, and easy to read on mobile devices.
6. Provide 2-3 brief suggested follow-up questions or action prompts.`;

    const chatMessages = Array.isArray(history)
      ? history.slice(-6).map((h: any) => `${h.sender === 'user' ? 'User' : 'Assistant'}: ${h.text}`).join('\n')
      : '';

    const prompt = `${chatMessages ? `Previous conversation:\n${chatMessages}\n\n` : ''}User Question: ${message}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING },
            suggestedActions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['reply', 'suggestedActions'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error in health chat:', error);
    res.status(500).json({
      error: 'Failed to process chat message',
      details: error.message,
    });
  }
});

// First-Aid Guide generator for on-demand query
app.post('/api/health/first-aid-guide', async (req, res) => {
  try {
    const { topic } = req.body;
    const ai = getGenAI();

    if (!ai) {
      return res.json({
        title: topic || 'First Aid Guidance',
        isEmergency: true,
        quickActionSteps: [
          'Ensure the scene is safe before approaching.',
          'Check for responsiveness, normal breathing, and severe bleeding.',
          'Call local emergency numbers (911 / 112) immediately if the person is unresponsive or severely injured.',
          'Keep the individual calm, warm, and resting comfortably until help arrives.',
        ],
        doNotDoList: [
          'Do not move the person if spinal injury is suspected unless in immediate danger.',
          'Do not give food or drinks to an unconscious or drowsy individual.',
        ],
        seekEmergencyIf: [
          'Person becomes unresponsive or has difficulty breathing.',
          'Severe bleeding that does not stop with direct pressure.',
        ],
      });
    }

    const prompt = `Provide an authoritative, clear, step-by-step first-aid protocol for: "${topic}".
Include:
1. Clear action steps in sequential order.
2. Critical "DO NOT" actions to prevent worsening harm.
3. Explicit criteria for when emergency services (911 / 112) MUST be called immediately.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are an emergency medical and first-aid expert. Provide safe, verified, clear instructions adhering to standard Red Cross and AHA first-aid guidelines. Clearly prioritize calling emergency services when life-threatening signs are present.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            isEmergency: { type: Type.BOOLEAN },
            quickActionSteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            doNotDoList: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            seekEmergencyIf: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['title', 'isEmergency', 'quickActionSteps', 'doNotDoList', 'seekEmergencyIf'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error generating first aid guide:', error);
    res.status(500).json({
      error: 'Failed to generate first aid guide',
      details: error.message,
    });
  }
});

// Mount Vite or static server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AuraCare Health Assistant server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
