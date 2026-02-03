import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Copy, ChevronDown, ChevronRight } from 'lucide-react';

export interface SuggestedQuestion {
  question: string;
  reason: string;
  category: 'Ekonomi' | 'Tekniskt' | 'Beslutsprocess' | 'Behov' | 'Konkurrens' | 'Tidslinje';
  priority: 'Hög' | 'Medel' | 'Låg';
}

interface SuggestedQuestionsProps {
  questions: SuggestedQuestion[];
  onQuestionAnswered?: (question: SuggestedQuestion, answer: string) => void;
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'Hög':
      return 'text-red-400 bg-red-500/10 border-red-500/20';
    case 'Medel':
      return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    case 'Låg':
      return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    default:
      return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Ekonomi':
      return 'bg-green-500/20 text-green-300';
    case 'Tekniskt':
      return 'bg-blue-500/20 text-blue-300';
    case 'Beslutsprocess':
      return 'bg-purple-500/20 text-purple-300';
    case 'Behov':
      return 'bg-orange-500/20 text-orange-300';
    case 'Konkurrens':
      return 'bg-red-500/20 text-red-300';
    case 'Tidslinje':
      return 'bg-teal-500/20 text-teal-300';
    default:
      return 'bg-gray-500/20 text-gray-300';
  }
};

export const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({
  questions,
  onQuestionAnswered
}) => {
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set());
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [copiedQuestion, setCopiedQuestion] = useState<string | null>(null);

  if (!questions || questions.length === 0) {
    return null;
  }

  const handleCopyQuestion = (question: string) => {
    navigator.clipboard.writeText(question);
    setCopiedQuestion(question);
    setTimeout(() => setCopiedQuestion(null), 2000);
  };

  const handleMarkAsAnswered = (question: SuggestedQuestion) => {
    const newAnswered = new Set(answeredQuestions);
    newAnswered.add(question.question);
    setAnsweredQuestions(newAnswered);

    if (onQuestionAnswered && answers[question.question]) {
      onQuestionAnswered(question, answers[question.question]);
    }
  };

  const toggleExpanded = (question: string) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(question)) {
      newExpanded.delete(question);
    } else {
      newExpanded.add(question);
    }
    setExpandedQuestions(newExpanded);
  };

  // Group questions by priority
  const highPriority = questions.filter(q => q.priority === 'Hög');
  const mediumPriority = questions.filter(q => q.priority === 'Medel');
  const lowPriority = questions.filter(q => q.priority === 'Låg');

  const groupedQuestions = [
    { priority: 'Hög', questions: highPriority },
    { priority: 'Medel', questions: mediumPriority },
    { priority: 'Låg', questions: lowPriority }
  ].filter(group => group.questions.length > 0);

  const answeredCount = answeredQuestions.size;
  const totalCount = questions.length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            AI-föreslagna Uppföljningsfrågor
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Frågor baserade på saknad eller otydlig information från samtalet
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">
            {answeredCount}/{totalCount}
          </div>
          <div className="text-xs text-gray-400">besvarade</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-teal-500 transition-all duration-300"
          style={{ width: `${(answeredCount / totalCount) * 100}%` }}
        />
      </div>

      {/* Grouped Questions */}
      <div className="space-y-4">
        {groupedQuestions.map((group) => (
          <div key={group.priority}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(group.priority)}`}>
                {group.priority} prioritet
              </div>
              <div className="text-xs text-gray-400">
                {group.questions.length} {group.questions.length === 1 ? 'fråga' : 'frågor'}
              </div>
            </div>

            <div className="space-y-2">
              {group.questions.map((q, index) => {
                const isAnswered = answeredQuestions.has(q.question);
                const isExpanded = expandedQuestions.has(q.question);

                return (
                  <div
                    key={index}
                    className={`bg-gray-800 rounded-lg border ${
                      isAnswered ? 'border-green-500/30' : 'border-gray-700'
                    } overflow-hidden`}
                  >
                    {/* Question Header */}
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        {/* Answered checkbox */}
                        <button
                          onClick={() =>
                            isAnswered
                              ? setAnsweredQuestions(prev => {
                                  const newSet = new Set(prev);
                                  newSet.delete(q.question);
                                  return newSet;
                                })
                              : handleMarkAsAnswered(q)
                          }
                          className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            isAnswered
                              ? 'bg-green-500 border-green-500'
                              : 'border-gray-600 hover:border-gray-500'
                          }`}
                        >
                          {isAnswered && <CheckCircle2 className="w-4 h-4 text-white" />}
                        </button>

                        {/* Question content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2 mb-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(q.category)}`}>
                              {q.category}
                            </span>
                          </div>

                          <div className="font-medium text-white mb-1">
                            {q.question}
                          </div>

                          <div className="text-sm text-gray-400 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {q.reason}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleCopyQuestion(q.question)}
                            className="p-2 hover:bg-gray-700 rounded transition-colors"
                            title="Kopiera fråga"
                          >
                            <Copy className={`w-4 h-4 ${
                              copiedQuestion === q.question ? 'text-green-400' : 'text-gray-400'
                            }`} />
                          </button>

                          <button
                            onClick={() => toggleExpanded(q.question)}
                            className="p-2 hover:bg-gray-700 rounded transition-colors"
                            title={isExpanded ? 'Dölj svar' : 'Besvara'}
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Answer input (expanded) */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-gray-700">
                          <label className="block">
                            <div className="text-sm text-gray-400 mb-2">Ditt svar:</div>
                            <textarea
                              value={answers[q.question] || ''}
                              onChange={(e) => setAnswers({ ...answers, [q.question]: e.target.value })}
                              placeholder="Skriv svaret här..."
                              rows={2}
                              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400"
                            />
                          </label>

                          <div className="flex items-center justify-end gap-2 mt-2">
                            <button
                              onClick={() => toggleExpanded(q.question)}
                              className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
                            >
                              Avbryt
                            </button>
                            <button
                              onClick={() => {
                                handleMarkAsAnswered(q);
                                toggleExpanded(q.question);
                              }}
                              disabled={!answers[q.question]?.trim()}
                              className="px-3 py-1.5 text-sm bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Markera som besvarad
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Completion message */}
      {answeredCount === totalCount && totalCount > 0 && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          <div className="text-sm text-green-200">
            Alla uppföljningsfrågor har besvarats! Du har nu en komplett bild av kundens situation.
          </div>
        </div>
      )}
    </div>
  );
};
