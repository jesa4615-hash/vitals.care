import React, { useState } from 'react';
import { FIRST_AID_DATA } from '../data/firstAidTopics';
import { FirstAidTopic } from '../types';
import {
  Search,
  AlertOctagon,
  ShieldCheck,
  Heart,
  Bandage,
  Sun,
  Wind,
  Flame,
  Zap,
  Activity,
  Skull,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface FirstAidLibraryProps {
  initialTopicId?: string | null;
  onOpenEmergencyModal: () => void;
}

export const FirstAidLibrary: React.FC<FirstAidLibraryProps> = ({
  initialTopicId,
  onOpenEmergencyModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(initialTopicId || 'cpr-adult');

  // AI-generated on-demand guide state
  const [aiGuideTopic, setAiGuideTopic] = useState('');
  const [aiGuideLoading, setAiGuideLoading] = useState(false);
  const [customAiGuide, setCustomAiGuide] = useState<FirstAidTopic | null>(null);

  const categories = [
    'All',
    'Critical Emergencies',
    'Wounds & Trauma',
    'Environmental & Bites',
    'Common Illnesses',
  ];

  const getTopicIcon = (iconName: string) => {
    switch (iconName) {
      case 'Heart':
        return <Heart className="w-4 h-4 text-rose-500" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-4 h-4 text-amber-500" />;
      case 'AlertTriangle':
        return <AlertOctagon className="w-4 h-4 text-rose-600" />;
      case 'Bandage':
        return <Bandage className="w-4 h-4 text-red-500" />;
      case 'Flame':
        return <Flame className="w-4 h-4 text-orange-500" />;
      case 'Activity':
        return <Activity className="w-4 h-4 text-teal-500" />;
      case 'Sun':
        return <Sun className="w-4 h-4 text-amber-500" />;
      case 'Skull':
        return <Skull className="w-4 h-4 text-purple-500" />;
      case 'Zap':
        return <Zap className="w-4 h-4 text-yellow-500" />;
      case 'Wind':
        return <Wind className="w-4 h-4 text-sky-500" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-teal-600" />;
    }
  };

  const filteredTopics = FIRST_AID_DATA.filter((topic) => {
    const matchesCat = selectedCategory === 'All' || topic.category === selectedCategory;
    const matchesSearch =
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.quickActionSteps.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleGenerateAiGuide = async (topicName?: string) => {
    const target = topicName || searchQuery;
    if (!target.trim()) return;

    setAiGuideLoading(true);
    try {
      const res = await fetch('/api/health/first-aid-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: target }),
      });
      const data = await res.json();
      if (data && data.quickActionSteps) {
        const newTopic: FirstAidTopic = {
          id: `ai-${Date.now()}`,
          title: data.title || target,
          category: 'Common Illnesses',
          icon: 'ShieldCheck',
          shortDesc: `AI-generated clinical first-aid protocol for ${target}`,
          isEmergency: data.isEmergency ?? false,
          quickActionSteps: data.quickActionSteps,
          doNotDoList: data.doNotDoList || [],
          seekEmergencyIf: data.seekEmergencyIf || [],
        };
        setCustomAiGuide(newTopic);
        setExpandedTopicId(newTopic.id);
      }
    } catch (err) {
      console.error('Failed to generate AI guide:', err);
    } finally {
      setAiGuideLoading(false);
    }
  };

  return (
    <div id="first-aid-library" className="space-y-4 animate-fade-in">
      {/* Search & Category Filter Bar */}
      <div className="bg-[#0A0A0A] rounded-2xl p-4 sm:p-5 border border-[#1A1A1A] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">First-Aid & Emergency Protocols</h2>
            <p className="text-xs text-[#888] mt-0.5">
              Instant evidence-based action steps for common medical emergencies & injuries
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenEmergencyModal}
            className="flex items-center space-x-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold px-3 py-1.5 rounded-xl border border-red-500/30 text-xs transition-colors shrink-0 cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Emergency SOS</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#555] absolute left-3.5 top-3" />
          <input
            id="first-aid-search-input"
            type="text"
            placeholder="Search first aid (e.g. CPR, burn, choking, fracture, bee sting)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#141414] border border-[#222] rounded-xl text-xs text-[#E0E0E0] placeholder:text-[#555] outline-none focus:border-teal-500/50"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {categories.map((cat) => (
            <button
              key={cat}
              id={`cat-btn-${cat.replace(/\s+/g, '-').toLowerCase()}`}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-white text-black shadow-xs'
                  : 'bg-[#141414] border border-[#222] text-[#888] hover:text-white hover:bg-[#1A1A1A]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* AI On-demand Protocol Search Banner */}
      {searchQuery.trim().length > 2 && (
        <div className="p-3.5 bg-teal-500/5 border border-teal-500/20 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-teal-400 shrink-0" />
            <span className="text-[#CCC] font-medium">
              Looking for guidance on <strong className="text-teal-300 font-bold">"{searchQuery}"</strong>?
            </span>
          </div>
          <button
            type="button"
            id="generate-ai-firstaid-btn"
            onClick={() => handleGenerateAiGuide()}
            disabled={aiGuideLoading}
            className="bg-teal-600 hover:bg-teal-500 text-white font-semibold px-3 py-1.5 rounded-lg shadow-xs transition-colors shrink-0 flex items-center space-x-1 cursor-pointer"
          >
            {aiGuideLoading ? (
              <span>Generating...</span>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask AI Protocol</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Custom AI Generated Guide (if generated) */}
      {customAiGuide && (
        <div className="bg-[#0A0A0A] rounded-2xl border border-teal-500/40 shadow-lg p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-teal-400" />
              <h3 className="font-bold text-sm text-white">{customAiGuide.title} (AI Guidance)</h3>
            </div>
            <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold px-2 py-0.5 rounded-full">
              Custom AI Generated
            </span>
          </div>

          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400">Immediate Action Steps:</h4>
            <ol className="space-y-1.5 pl-2 text-xs text-[#CCC]">
              {customAiGuide.quickActionSteps.map((step, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="w-4 h-4 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {customAiGuide.doNotDoList.length > 0 && (
            <div className="bg-red-500/5 p-3 rounded-xl border border-red-500/20 text-xs text-red-300 space-y-1">
              <strong className="font-bold block flex items-center space-x-1 text-red-400">
                <XCircle className="w-3.5 h-3.5 text-red-400" />
                <span>Critical "DO NOT" Actions:</span>
              </strong>
              {customAiGuide.doNotDoList.map((item, idx) => (
                <p key={idx}>• {item}</p>
              ))}
            </div>
          )}

          {customAiGuide.seekEmergencyIf.length > 0 && (
            <div className="bg-yellow-500/5 p-3 rounded-xl border border-yellow-500/20 text-xs text-yellow-300 space-y-1">
              <strong className="font-bold block flex items-center space-x-1 text-yellow-400">
                <AlertOctagon className="w-3.5 h-3.5 text-yellow-400" />
                <span>Call Emergency Services If:</span>
              </strong>
              {customAiGuide.seekEmergencyIf.map((item, idx) => (
                <p key={idx}>• {item}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Topics Accordion List */}
      <div className="space-y-3">
        {filteredTopics.map((topic) => {
          const isExpanded = expandedTopicId === topic.id;
          return (
            <div
              key={topic.id}
              id={`firstaid-card-${topic.id}`}
              className="bg-[#0A0A0A] rounded-2xl border border-[#1A1A1A] shadow-xs overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => setExpandedTopicId(isExpanded ? null : topic.id)}
                className="w-full p-4 text-left flex items-center justify-between hover:bg-[#141414] transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-[#141414] border border-[#222] rounded-xl">{getTopicIcon(topic.icon)}</div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-semibold text-white">{topic.title}</h3>
                      {topic.isEmergency && (
                        <span className="text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full">
                          Emergency
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#888] mt-0.5 line-clamp-1">{topic.shortDesc}</p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-[#888]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#888]" />
                )}
              </button>

              {isExpanded && (
                <div className="p-4 pt-0 border-t border-[#1A1A1A] space-y-4 text-xs leading-relaxed">
                  {/* Action Steps */}
                  <div className="pt-3 space-y-2">
                    <h4 className="font-bold uppercase tracking-wider text-teal-400 text-[11px] flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                      <span>Step-by-Step Action Protocol</span>
                    </h4>
                    <div className="space-y-2">
                      {topic.quickActionSteps.map((step, idx) => (
                        <div key={idx} className="flex items-start space-x-2.5 bg-[#141414] p-2.5 rounded-xl border border-[#222]">
                          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-teal-600 text-white font-bold text-[10px] shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="text-[#DDD] font-medium">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Do Not List */}
                  {topic.doNotDoList.length > 0 && (
                    <div className="bg-red-500/5 p-3 rounded-xl border border-red-500/20 text-red-300 space-y-1.5">
                      <div className="flex items-center space-x-1.5 font-bold text-red-400 text-xs">
                        <XCircle className="w-4 h-4 text-red-400" />
                        <span>DO NOT DO the Following:</span>
                      </div>
                      <ul className="list-disc pl-4 space-y-1 text-red-300 text-xs marker:text-red-400">
                        {topic.doNotDoList.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Seek Emergency If */}
                  {topic.seekEmergencyIf.length > 0 && (
                    <div className="bg-yellow-500/5 p-3 rounded-xl border border-yellow-500/20 text-yellow-300 space-y-1.5">
                      <div className="flex items-center space-x-1.5 font-bold text-yellow-400 text-xs">
                        <AlertOctagon className="w-4 h-4 text-yellow-400" />
                        <span>Call Emergency Services (911/112) Immediately If:</span>
                      </div>
                      <ul className="list-disc pl-4 space-y-1 text-yellow-300 text-xs marker:text-yellow-400">
                        {topic.seekEmergencyIf.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filteredTopics.length === 0 && !customAiGuide && (
          <div className="text-center py-10 bg-[#0A0A0A] rounded-2xl border border-[#1A1A1A] p-6 space-y-3">
            <p className="text-[#888] text-xs font-medium">
              No matching standard topic found for "{searchQuery}".
            </p>
            <button
              type="button"
              onClick={() => handleGenerateAiGuide()}
              className="bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-xs inline-flex items-center space-x-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask AI First-Aid Assistant for "{searchQuery}"</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
