import React, { useState } from 'react';
import { Sparkles, BookOpen, ChevronDown, ChevronUp, Loader2, Send } from 'lucide-react';

interface AIAnswer {
  id: string;
  question: string;
  answer: string;
  sources: Array<{ title: string; excerpt: string }>;
  confidence: 'high' | 'medium' | 'low';
  timestamp: Date;
}

interface MeetingAIAnswersProps {
  answers: AIAnswer[];
  isLoading: boolean;
  onAskQuestion: (question: string) => void;
}

export function MeetingAIAnswers({ answers, isLoading, onAskQuestion }: MeetingAIAnswersProps) {
  const [expandedAnswers, setExpandedAnswers] = useState<Set<string>>(new Set());
  const [question, setQuestion] = useState('');

  const toggleAnswer = (id: string) => {
    setExpandedAnswers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getConfidenceLabel = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'Hög tillförlitlighet';
      case 'medium': return 'Medel tillförlitlighet';
      case 'low': return 'Låg tillförlitlighet';
      default: return 'Okänd';
    }
  };

  const handleAskQuestion = () => {
    if (question.trim()) {
      onAskQuestion(question.trim());
      setQuestion('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskQuestion();
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <h4 className="text-sm font-semibold text-gray-700">AI-svar från kunskapsbasen</h4>
        </div>
        {answers.length > 0 && (
          <span className="text-xs text-gray-500">{answers.length} svar</span>
        )}
      </div>

      {/* Question input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Ställ en fråga om produkten..."
          disabled={isLoading}
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <button
          onClick={handleAskQuestion}
          disabled={isLoading || !question.trim()}
          className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center gap-3">
          <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
          <span className="text-sm text-indigo-700">Söker svar...</span>
        </div>
      )}

      {/* Empty state */}
      {answers.length === 0 && !isLoading && (
        <div className="p-4 text-center text-sm text-gray-500">
          Klicka på en quick tag (t.ex. "Support/SLA") eller skriv en fråga ovan för att få AI-svar från dokumenten.
        </div>
      )}

      {/* Answers list */}
      <div className="space-y-2">
        {answers.map((answer) => {
          const isExpanded = expandedAnswers.has(answer.id);

          return (
            <div
              key={answer.id}
              className="p-3 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg"
            >
              {/* Question */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1">
                  <div className="text-xs font-semibold text-indigo-900 mb-1">
                    Fråga:
                  </div>
                  <div className="text-sm text-gray-800 font-medium">
                    {answer.question}
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${getConfidenceColor(answer.confidence)}`}>
                  {getConfidenceLabel(answer.confidence)}
                </span>
              </div>

              {/* Answer */}
              <div className="mb-2">
                <div className="text-xs font-semibold text-indigo-900 mb-1">
                  Svar:
                </div>
                <div className="text-sm text-gray-700 whitespace-pre-wrap">
                  {answer.answer}
                </div>
              </div>

              {/* Sources toggle */}
              {answer.sources.length > 0 && (
                <div>
                  <button
                    onClick={() => toggleAnswer(answer.id)}
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{answer.sources.length} källa(or)</span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* Expanded sources */}
                  {isExpanded && (
                    <div className="mt-2 space-y-2">
                      {answer.sources.map((source, idx) => (
                        <div
                          key={idx}
                          className="p-2 bg-white border border-indigo-100 rounded"
                        >
                          <div className="text-xs font-semibold text-gray-700 mb-1">
                            {source.title}
                          </div>
                          <div className="text-xs text-gray-600">
                            {source.excerpt}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Timestamp */}
              <div className="text-xs text-gray-500 mt-2">
                {new Date(answer.timestamp).toLocaleTimeString('sv-SE', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
