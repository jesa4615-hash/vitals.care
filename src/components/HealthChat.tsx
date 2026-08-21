import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, HealthAssessmentResult } from '../types';
import {
  Send,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Stethoscope,
  HelpCircle,
  Check,
  Copy,
} from 'lucide-react';
import Markdown from 'react-markdown';

interface HealthChatProps {
  currentAssessment: HealthAssessmentResult | null;
  initialPrompt?: string | null;
  onClearInitialPrompt?: () => void;
}

export const HealthChat: React.FC<HealthChatProps> = ({
  currentAssessment,
  initialPrompt,
  onClearInitialPrompt,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'welcome',
        sender: 'assistant',
        text: currentAssessment
          ? `Hello! I have loaded your recent assessment regarding: **${currentAssessment.userInputs.symptoms.primarySymptoms}** (Triage: **${currentAssessment.triageLevel.replace('_', ' ')}**).\n\nFeel free to ask any questions about these symptoms, home comfort measures, understanding medical terms, or how to prepare for your doctor visit.`
          : `Hello! I'm **AuraCare AI Health Assistant**. I can help you understand medical terms, explore general health questions, clarify first-aid steps, and prepare for doctor visits.\n\n*Note: I provide health education and guidance, not clinical diagnoses or prescriptions.*`,
        timestamp: Date.now(),
        suggestedActions: currentAssessment
          ? [
              'What questions should I ask my doctor?',
              'What home comfort measures can help right now?',
              'What red flags should I watch out for?',
            ]
          : [
              'How do I know if a headache is an emergency?',
              'What is the RICE method for sprains?',
              'How can I prepare for a doctor visit?',
            ],
      },
    ];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSendMessage(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/health/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messages.map((m) => ({ sender: m.sender, text: m.text })),
          contextAssessment: currentAssessment
            ? {
                summary: currentAssessment.symptomSummary,
                triage: currentAssessment.triageLevel,
                possibleConditions: currentAssessment.possibleConditions.map((c) => c.conditionName),
              }
            : null,
        }),
      });

      const data = await response.json();
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'I understand your query. Please remember to consult with a doctor for specific medical guidance.',
        timestamp: Date.now(),
        suggestedActions: data.suggestedActions || [],
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'I apologize, but I encountered a network issue. Please ensure your connection is active. For urgent medical concerns, please contact your local healthcare provider or emergency services directly.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'reset',
        sender: 'assistant',
        text: 'Chat history cleared. How can I assist you with your health questions today?',
        timestamp: Date.now(),
        suggestedActions: [
          'What are normal vital signs?',
          'When should I seek urgent care vs ER?',
          'How do I treat a mild fever at home?',
        ],
      },
    ]);
  };

  return (
    <div id="health-chat-container" className="flex flex-col h-[75vh] max-h-[700px] bg-[#0A0A0A] rounded-2xl border border-[#1A1A1A] shadow-sm overflow-hidden animate-fade-in">
      {/* Chat Header */}
      <div className="bg-[#0A0A0A] text-white p-3.5 sm:p-4 flex items-center justify-between border-b border-[#1A1A1A]">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-teal-500/10 text-teal-400 border border-teal-500/30 rounded-xl">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider">AuraCare AI Assistant</h3>
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-[#888]">Educational Guidance · Evidence-Informed</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {currentAssessment && (
            <span className="hidden sm:inline-block text-[10px] bg-teal-500/10 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded-full font-medium">
              Context Loaded
            </span>
          )}
          <button
            type="button"
            onClick={handleClearHistory}
            title="Clear Chat"
            className="p-1.5 text-[#888] hover:text-white rounded-lg hover:bg-[#141414] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages List Container */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#050505]">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
            >
              <div className="flex items-start space-x-2 max-w-[90%] sm:max-w-[80%]">
                {!isUser && (
                  <div className="w-7 h-7 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                    isUser
                      ? 'bg-teal-600 text-white rounded-br-xs shadow-xs'
                      : 'bg-[#141414] text-[#E0E0E0] border border-[#222] rounded-bl-xs shadow-xs'
                  }`}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    <div className="space-y-2 text-[#E0E0E0] font-sans">
                      <Markdown>{msg.text}</Markdown>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-xl bg-[#222] border border-[#333] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              {/* Copy message button & timestamp */}
              <div className="flex items-center space-x-2 px-2 text-[10px] text-[#666]">
                <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                {!isUser && (
                  <button
                    type="button"
                    onClick={() => handleCopyMessage(msg.id, msg.text)}
                    className="hover:text-white flex items-center space-x-0.5 cursor-pointer"
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check className="w-3 h-3 text-teal-400" />
                        <span className="text-teal-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Suggested Follow-up Action Chips (for last assistant message) */}
              {!isUser && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1 pl-9">
                  {msg.suggestedActions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(suggestion)}
                      className="text-[11px] bg-[#141414] border border-teal-500/30 hover:border-teal-400 text-teal-300 font-medium px-2.5 py-1 rounded-full shadow-2xs hover:bg-teal-500/10 transition-all text-left cursor-pointer"
                    >
                      💬 {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center space-x-2 pl-2">
            <div className="w-7 h-7 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-[#141414] border border-[#222] p-3 rounded-2xl text-xs text-[#888] flex items-center space-x-2 shadow-xs">
              <div className="flex space-x-1">
                <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" />
              </div>
              <span className="text-[11px] font-medium text-[#888]">Formulating medical guidance...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <div className="p-3 sm:p-4 bg-[#0A0A0A] border-t border-[#1A1A1A]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2"
        >
          <input
            id="chat-user-input"
            type="text"
            placeholder="Ask a health or first-aid question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 bg-[#141414] border border-[#222] rounded-xl px-3.5 py-2.5 text-xs text-[#E0E0E0] placeholder:text-[#555] outline-none focus:border-teal-500/50 transition-colors"
          />
          <button
            type="submit"
            id="chat-send-btn"
            disabled={isLoading || !input.trim()}
            className={`p-2.5 rounded-xl text-white font-bold transition-all shadow-xs cursor-pointer ${
              isLoading || !input.trim()
                ? 'bg-[#141414] border border-[#222] text-[#555] cursor-not-allowed'
                : 'bg-teal-600 hover:bg-teal-500'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 text-[10px] text-[#666]">
          AI assistant provides informational health guidance · Always consult a medical professional for personal treatment
        </div>
      </div>
    </div>
  );
};
