import React, { useState } from 'react';
import { SymptomInput, UserProfile } from '../types';
import { BODY_REGIONS, PRE_EXISTING_OPTIONS, DURATION_OPTIONS } from '../data/bodyAreas';
import {
  Sparkles,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  User,
  Heart,
  Brain,
  Activity,
  Zap,
  Move,
  Thermometer,
  Shield,
  Stethoscope,
} from 'lucide-react';

interface SymptomInputFormProps {
  onSubmit: (input: SymptomInput) => void;
  isLoading: boolean;
}

export const SymptomInputForm: React.FC<SymptomInputFormProps> = ({ onSubmit, isLoading }) => {
  const [primarySymptoms, setPrimarySymptoms] = useState('');
  const [selectedBodyParts, setSelectedBodyParts] = useState<string[]>([]);
  const [activeRegionId, setActiveRegionId] = useState<string>('head-neck');
  const [duration, setDuration] = useState('2 to 3 days');
  const [severity, setSeverity] = useState<number>(4);
  const [onset, setOnset] = useState<'sudden' | 'gradual'>('gradual');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Profile Context
  const [showProfile, setShowProfile] = useState(false);
  const [ageGroup, setAgeGroup] = useState('18-35');
  const [biologicalSex, setBiologicalSex] = useState<'male' | 'female' | 'other' | 'unspecified'>('female');
  const [isPregnant, setIsPregnant] = useState(false);
  const [preExistingConditions, setPreExistingConditions] = useState<string[]>([]);
  const [medicationInput, setMedicationInput] = useState('');
  const [medications, setMedications] = useState<string[]>([]);

  const handleToggleBodyPart = (name: string) => {
    setSelectedBodyParts((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
    );
  };

  const handleAddSymptomChip = (symptom: string) => {
    if (!primarySymptoms.includes(symptom)) {
      setPrimarySymptoms((prev) => (prev ? `${prev}, ${symptom}` : symptom));
    }
  };

  const handleTogglePreExisting = (condition: string) => {
    setPreExistingConditions((prev) =>
      prev.includes(condition) ? prev.filter((c) => c !== condition) : [...prev, condition]
    );
  };

  const handleAddMedication = () => {
    if (medicationInput.trim() && !medications.includes(medicationInput.trim())) {
      setMedications([...medications, medicationInput.trim()]);
      setMedicationInput('');
    }
  };

  const handleRemoveMedication = (med: string) => {
    setMedications(medications.filter((m) => m !== med));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!primarySymptoms.trim()) return;

    const profile: UserProfile = {
      ageGroup,
      biologicalSex,
      isPregnant: biologicalSex === 'female' ? isPregnant : false,
      preExistingConditions,
      currentMedications: medications,
    };

    onSubmit({
      primarySymptoms,
      selectedBodyParts,
      duration,
      severity,
      onset,
      additionalNotes,
      profile,
    });
  };

  const getSeverityLabel = (val: number) => {
    if (val <= 2) return { text: 'Mild Discomfort', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
    if (val <= 4) return { text: 'Moderate Ache', color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' };
    if (val <= 6) return { text: 'Noticeable Pain', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' };
    if (val <= 8) return { text: 'Severe / Distressing', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' };
    return { text: 'Very Severe / Unbearable', color: 'text-red-400 bg-red-500/10 border-red-500/20' };
  };

  const currentRegion = BODY_REGIONS.find((r) => r.id === activeRegionId) || BODY_REGIONS[0];

  const getRegionIcon = (iconName: string) => {
    switch (iconName) {
      case 'Brain':
        return <Brain className="w-4 h-4" />;
      case 'HeartPulse':
        return <Heart className="w-4 h-4" />;
      case 'Activity':
        return <Activity className="w-4 h-4" />;
      case 'Zap':
        return <Zap className="w-4 h-4" />;
      case 'Move':
        return <Move className="w-4 h-4" />;
      case 'Thermometer':
        return <Thermometer className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <form id="symptom-input-form" onSubmit={handleSubmit} className="space-y-5">
      {/* Primary Symptom Description Box */}
      <div className="bg-[#0A0A0A] rounded-2xl p-4 sm:p-5 border border-[#1A1A1A] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor="primary-symptoms-input" className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center space-x-1.5">
            <Stethoscope className="w-4 h-4 text-teal-400" />
            <span>Describe What You Are Feeling *</span>
          </label>
          <span className="text-[11px] text-[#666] font-medium">Natural language or tap chips</span>
        </div>

        <textarea
          id="primary-symptoms-input"
          value={primarySymptoms}
          onChange={(e) => setPrimarySymptoms(e.target.value)}
          placeholder="e.g., I have a persistent sharp pain in my lower right abdomen and a mild fever since this morning."
          rows={3}
          required
          className="w-full text-sm text-[#E0E0E0] placeholder:text-[#555] bg-[#141414] border border-[#222] rounded-xl p-3.5 focus:border-teal-500/50 focus:outline-none transition-all resize-none"
        />

        {/* Quick Body Area Explorer */}
        <div className="pt-2">
          <p className="text-[11px] font-semibold text-[#888] uppercase tracking-wider mb-2">
            Select Body Region for Quick Symptoms:
          </p>

          {/* Region Tabs */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {BODY_REGIONS.map((region) => {
              const isActive = region.id === activeRegionId;
              return (
                <button
                  key={region.id}
                  type="button"
                  id={`region-tab-${region.id}`}
                  onClick={() => {
                    setActiveRegionId(region.id);
                    if (!selectedBodyParts.includes(region.name)) {
                      handleToggleBodyPart(region.name);
                    }
                  }}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-sm shadow-teal-900/30 border border-teal-500'
                      : 'bg-[#141414] border border-[#222] text-[#888] hover:text-white hover:border-[#333]'
                  }`}
                >
                  {getRegionIcon(region.iconName)}
                  <span>{region.name}</span>
                </button>
              );
            })}
          </div>

          {/* Suggested Symptom Chips for Region */}
          <div className="p-3 bg-[#141414] rounded-xl border border-[#222]">
            <p className="text-[11px] text-[#888] mb-2 font-medium">
              Common {currentRegion.name} symptoms (click to add):
            </p>
            <div className="flex flex-wrap gap-1.5">
              {currentRegion.commonSymptoms.map((symptom) => {
                const isSelected = primarySymptoms.includes(symptom);
                return (
                  <button
                    key={symptom}
                    type="button"
                    id={`symptom-chip-${symptom.replace(/\s+/g, '-').toLowerCase()}`}
                    onClick={() => handleAddSymptomChip(symptom)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-teal-500/10 border-teal-500/40 text-teal-300 font-medium'
                        : 'bg-[#0A0A0A] border-[#222] text-[#AAA] hover:border-teal-500/30 hover:text-teal-300'
                    }`}
                  >
                    + {symptom}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Severity & Duration Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Severity Slider */}
        <div className="bg-[#0A0A0A] rounded-2xl p-4 sm:p-5 border border-[#1A1A1A] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="severity-range" className="text-xs font-bold uppercase tracking-wider text-[#888]">
              Discomfort / Pain Level
            </label>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                getSeverityLabel(severity).color
              }`}
            >
              {severity}/10 · {getSeverityLabel(severity).text}
            </span>
          </div>

          <input
            id="severity-range"
            type="range"
            min={1}
            max={10}
            step={1}
            value={severity}
            onChange={(e) => setSeverity(Number(e.target.value))}
            className="w-full h-2 bg-[#222] rounded-lg appearance-none cursor-pointer accent-teal-500 focus:outline-none"
          />

          <div className="flex justify-between text-[11px] text-[#666] font-medium px-0.5">
            <span>1 (Mild)</span>
            <span>5 (Moderate)</span>
            <span>10 (Severe)</span>
          </div>
        </div>

        {/* Duration & Onset */}
        <div className="bg-[#0A0A0A] rounded-2xl p-4 sm:p-5 border border-[#1A1A1A] shadow-sm space-y-3">
          <div>
            <label htmlFor="duration-select" className="text-xs font-bold uppercase tracking-wider text-[#888] block mb-1.5">
              How Long Has This Been Going On?
            </label>
            <select
              id="duration-select"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full text-xs font-medium text-[#E0E0E0] bg-[#141414] border border-[#222] rounded-xl p-2.5 focus:border-teal-500/50 outline-none"
            >
              {DURATION_OPTIONS.map((opt) => (
                <option key={opt} value={opt} className="bg-[#141414] text-[#E0E0E0]">
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#888] block mb-1.5">
              Onset Pattern
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                id="onset-gradual-btn"
                onClick={() => setOnset('gradual')}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                  onset === 'gradual'
                    ? 'bg-teal-500/10 border-teal-500/40 text-teal-300 shadow-xs'
                    : 'bg-[#141414] border-[#222] text-[#888] hover:text-white hover:bg-[#1A1A1A]'
                }`}
              >
                Gradual (Over time)
              </button>
              <button
                type="button"
                id="onset-sudden-btn"
                onClick={() => setOnset('sudden')}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                  onset === 'sudden'
                    ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-300 shadow-xs'
                    : 'bg-[#141414] border-[#222] text-[#888] hover:text-white hover:bg-[#1A1A1A]'
                }`}
              >
                Sudden (Abrupt onset)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Health Profile Context (Collapsible) */}
      <div className="bg-[#0A0A0A] rounded-2xl border border-[#1A1A1A] shadow-sm overflow-hidden transition-all">
        <button
          type="button"
          id="toggle-profile-btn"
          onClick={() => setShowProfile(!showProfile)}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-[#141414] transition-colors cursor-pointer"
        >
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-[#141414] border border-[#222] rounded-lg text-teal-400">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Patient Profile & Medical History (Optional)
              </h3>
              <p className="text-xs text-[#888] mt-0.5">
                Age, biological sex, conditions & medications for more tailored insights
              </p>
            </div>
          </div>
          {showProfile ? (
            <ChevronUp className="w-4 h-4 text-[#888]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#888]" />
          )}
        </button>

        {showProfile && (
          <div className="p-4 sm:p-5 pt-0 border-t border-[#1A1A1A] space-y-4 text-xs">
            {/* Age & Sex Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
              <div>
                <label htmlFor="age-group-select" className="font-semibold text-[#888] block mb-1">
                  Age Group:
                </label>
                <select
                  id="age-group-select"
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value)}
                  className="w-full bg-[#141414] border border-[#222] rounded-lg p-2 text-xs text-[#E0E0E0] outline-none focus:border-teal-500/50"
                >
                  <option value="Child (under 12)" className="bg-[#141414] text-[#E0E0E0]">Child (Under 12)</option>
                  <option value="Adolescent (13-17)" className="bg-[#141414] text-[#E0E0E0]">Adolescent (13-17)</option>
                  <option value="18-35" className="bg-[#141414] text-[#E0E0E0]">Young Adult (18-35)</option>
                  <option value="36-50" className="bg-[#141414] text-[#E0E0E0]">Adult (36-50)</option>
                  <option value="51-65" className="bg-[#141414] text-[#E0E0E0]">Mature Adult (51-65)</option>
                  <option value="65+" className="bg-[#141414] text-[#E0E0E0]">Senior (65+)</option>
                </select>
              </div>

              <div>
                <label htmlFor="sex-select" className="font-semibold text-[#888] block mb-1">
                  Biological Sex:
                </label>
                <select
                  id="sex-select"
                  value={biologicalSex}
                  onChange={(e) => setBiologicalSex(e.target.value as any)}
                  className="w-full bg-[#141414] border border-[#222] rounded-lg p-2 text-xs text-[#E0E0E0] outline-none focus:border-teal-500/50"
                >
                  <option value="female" className="bg-[#141414] text-[#E0E0E0]">Female</option>
                  <option value="male" className="bg-[#141414] text-[#E0E0E0]">Male</option>
                  <option value="other" className="bg-[#141414] text-[#E0E0E0]">Other / Prefer not to say</option>
                </select>
              </div>

              {biologicalSex === 'female' && (
                <div className="flex items-center pt-5">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      id="pregnant-checkbox"
                      type="checkbox"
                      checked={isPregnant}
                      onChange={(e) => setIsPregnant(e.target.checked)}
                      className="w-4 h-4 accent-teal-500 rounded-sm bg-[#141414] border-[#222]"
                    />
                    <span className="font-semibold text-[#888]">Currently pregnant</span>
                  </label>
                </div>
              )}
            </div>

            {/* Pre-existing conditions */}
            <div>
              <label className="font-semibold text-[#888] block mb-1.5">
                Known Medical Conditions:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {PRE_EXISTING_OPTIONS.map((c) => {
                  const isChecked = preExistingConditions.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleTogglePreExisting(c)}
                      className={`text-left text-xs p-2 rounded-lg border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-teal-500/10 border-teal-500/40 text-teal-300 font-medium'
                          : 'bg-[#141414] border-[#222] text-[#888] hover:text-white hover:bg-[#1A1A1A]'
                      }`}
                    >
                      {isChecked ? '✓ ' : '+ '}
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Current Medications */}
            <div>
              <label className="font-semibold text-[#888] block mb-1.5">
                Current Medications or Supplements:
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={medicationInput}
                  onChange={(e) => setMedicationInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddMedication();
                    }
                  }}
                  placeholder="e.g., Lisinopril 10mg, Multivitamin, Ibuprofen"
                  className="flex-1 bg-[#141414] border border-[#222] rounded-lg p-2 text-xs text-[#E0E0E0] outline-none focus:border-teal-500/50"
                />
                <button
                  type="button"
                  onClick={handleAddMedication}
                  className="px-3 py-2 bg-[#1A1A1A] hover:bg-[#222] border border-[#222] text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Add
                </button>
              </div>
              {medications.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {medications.map((m) => (
                    <span
                      key={m}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#141414] text-teal-300 text-[11px] border border-teal-500/30 font-medium"
                    >
                      <span>{m}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMedication(m)}
                        className="hover:text-red-400 cursor-pointer ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        id="start-assessment-btn"
        disabled={isLoading || !primarySymptoms.trim()}
        className={`w-full py-3.5 px-6 rounded-xl font-semibold text-sm text-white shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer ${
          isLoading || !primarySymptoms.trim()
            ? 'bg-[#1A1A1A] border border-[#222] cursor-not-allowed text-[#555]'
            : 'bg-teal-600 hover:bg-teal-500 shadow-teal-900/30 active:scale-[0.99]'
        }`}
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Analyzing Clinical Picture with AI...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            <span>Analyze with AI</span>
          </>
        )}
      </button>

      {/* Non-intrusive safety note below submit */}
      <div className="text-center text-[11px] text-[#666] flex items-center justify-center space-x-1.5">
        <Shield className="w-3.5 h-3.5 text-[#555]" />
        <span>For educational & triage guidance only · Not a replacement for a doctor</span>
      </div>
    </form>
  );
};
