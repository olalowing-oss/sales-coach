// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, ChevronDown, ChevronRight, AlertCircle, Bot } from 'lucide-react';

interface QuestionAnswer {
  questionId: string;
  answer: string;
  isAnswered: boolean;
}

interface QuestionnaireCategory {
  category: string;
  description: string;
  questions: {
    id: string;
    question: string;
    placeholder: string;
    required?: boolean;
    multiline?: boolean;
  }[];
}

interface PostCallQuestionnaireProps {
  onAnswersChange: (answers: Record<string, string>) => void;
  initialAnswers?: Record<string, string>;
  aiFilledQuestions?: Set<string>;
}

const QUESTIONNAIRE_STRUCTURE: QuestionnaireCategory[] = [
  {
    category: 'Nuläge & Utmaningar',
    description: 'Förstå kundens nuvarande situation',
    questions: [
      {
        id: 'current_challenges',
        question: 'Vilka är de 3 största utmaningarna kunden har idag?',
        placeholder: 'T.ex. Långsamma manuella processer, bristande dataöverblick, dåligt samarbete...',
        required: true,
        multiline: true
      },
      {
        id: 'cost_of_problems',
        question: 'Vad kostar dessa problem kunden idag? (tid, pengar, resurser)',
        placeholder: 'T.ex. 20h/vecka manuellt arbete, 500k SEK/år i onödiga kostnader...',
        multiline: true
      },
      {
        id: 'problem_duration',
        question: 'Hur länge har problemet funnits?',
        placeholder: 'T.ex. 6 månader, 2 år, osäkert...'
      },
      {
        id: 'previous_attempts',
        question: 'Vad har de provat tidigare för att lösa det?',
        placeholder: 'T.ex. Använt Excel, testat Konkurrent X, egen utveckling...',
        multiline: true
      }
    ]
  },
  {
    category: 'Målbild & Krav',
    description: 'Definiera kundens önskade framtida tillstånd',
    questions: [
      {
        id: 'ideal_solution',
        question: 'Vad är den ideala lösningen enligt kunden?',
        placeholder: 'T.ex. Helt automatiserad process, realtidsdata, enkel för alla att använda...',
        required: true,
        multiline: true
      },
      {
        id: 'success_metrics',
        question: 'Vilka KPI:er använder de för att mäta framgång?',
        placeholder: 'T.ex. Minska tid med 50%, öka försäljning 20%, förbättra kundnöjdhet...',
        multiline: true
      },
      {
        id: 'must_have_features',
        question: 'Vilka funktioner är absolut nödvändiga?',
        placeholder: 'T.ex. Integration med CRM, mobilapp, GDPR-compliance...',
        required: true,
        multiline: true
      },
      {
        id: 'nice_to_have_features',
        question: 'Vilka funktioner är önskvärda men inte kritiska?',
        placeholder: 'T.ex. Advanced reporting, AI-assistans, white-labeling...',
        multiline: true
      },
      {
        id: 'deal_breakers',
        question: 'Finns det något som skulle stoppa affären helt?',
        placeholder: 'T.ex. För dyrt över 100k, måste fungera offline, kräver on-premise...',
        multiline: true
      }
    ]
  },
  {
    category: 'Beslutsprocess',
    description: 'Kartlägg hur beslut fattas',
    questions: [
      {
        id: 'final_decision_maker',
        question: 'Vem fattar det slutliga beslutet?',
        placeholder: 'T.ex. VD, IT-chef, Inköpsavdelning...',
        required: true
      },
      {
        id: 'approval_stakeholders',
        question: 'Vilka andra behöver godkänna?',
        placeholder: 'T.ex. CFO för budget, IT-avd för teknik, slutanvändare för användbarhet...',
        multiline: true
      },
      {
        id: 'procurement_steps',
        question: 'Vilka steg ingår i deras inköpsprocess?',
        placeholder: 'T.ex. Demo → Offert → Teknisk utvärdering → Budget-godkännande → Kontrakt...',
        multiline: true
      },
      {
        id: 'budget_status',
        question: 'Finns det budget avsatt redan?',
        placeholder: 'T.ex. Ja, 200k SEK, Nej men kan omfördelas, Planeras i nästa budget...'
      },
      {
        id: 'decision_timeline',
        question: 'Vad driver tidslinjen för beslutet?',
        placeholder: 'T.ex. Nuvarande avtal går ut i mars, ny VD vill se resultat Q2, inget specifikt...',
        multiline: true
      }
    ]
  },
  {
    category: 'Konkurrens & Alternativ',
    description: 'Förstå konkurrenssituationen',
    questions: [
      {
        id: 'alternatives_evaluated',
        question: 'Vilka alternativ utvärderar de?',
        placeholder: 'T.ex. Konkurrent A, Konkurrent B, bygga själva, behålla nuvarande...',
        multiline: true
      },
      {
        id: 'vendor_selection_criteria',
        question: 'Vad är viktigast vid val av leverantör?',
        placeholder: 'T.ex. Pris, funktionalitet, support, säkerhet, referenser...',
        multiline: true
      },
      {
        id: 'previous_vendor_experience',
        question: 'Har de arbetat med liknande leverantörer tidigare?',
        placeholder: 'T.ex. Ja, mycket bra med X, dålig erfarenhet av Y...',
        multiline: true
      },
      {
        id: 'biggest_concerns',
        question: 'Vad är deras största farhågor/tveksamheter?',
        placeholder: 'T.ex. Komplexitet vid implementation, datamigration, kostnad, leverantörsberoende...',
        multiline: true
      }
    ]
  },
  {
    category: 'Tekniska & Praktiska Aspekter',
    description: 'Samla tekniska krav och praktiska överväganden',
    questions: [
      {
        id: 'integration_requirements',
        question: 'Vilka system måste lösningen integreras med?',
        placeholder: 'T.ex. Salesforce, Microsoft 365, ERP-system, befintlig databas...',
        multiline: true
      },
      {
        id: 'user_count',
        question: 'Hur många användare kommer att använda systemet?',
        placeholder: 'T.ex. 50 användare initialt, 200 inom ett år...'
      },
      {
        id: 'departments_affected',
        question: 'Vilka avdelningar kommer att påverkas?',
        placeholder: 'T.ex. Försäljning, Marknad, Kundservice, IT...'
      },
      {
        id: 'compliance_requirements',
        question: 'Finns det specifika compliance- eller säkerhetskrav?',
        placeholder: 'T.ex. GDPR, ISO 27001, HIPAA, data måste lagras i EU...',
        multiline: true
      },
      {
        id: 'rollout_plan',
        question: 'Hur planerar de att rulla ut lösningen?',
        placeholder: 'T.ex. Pilot med 10 användare först, sedan alla, avdelning för avdelning...',
        multiline: true
      }
    ]
  }
];

export const PostCallQuestionnaire: React.FC<PostCallQuestionnaireProps> = ({
  onAnswersChange,
  initialAnswers = {},
  aiFilledQuestions = new Set()
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set([QUESTIONNAIRE_STRUCTURE[0].category]) // First category expanded by default
  );

  // Sync internal state when initialAnswers changes (for AI auto-fill)
  useEffect(() => {
    setAnswers(initialAnswers);
  }, [initialAnswers]);

  const handleAnswerChange = (questionId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    onAnswersChange(newAnswers);
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const getCategoryProgress = (category: QuestionnaireCategory) => {
    const totalQuestions = category.questions.length;
    const answeredQuestions = category.questions.filter(
      q => answers[q.id]?.trim()
    ).length;
    return { answered: answeredQuestions, total: totalQuestions };
  };

  const getOverallProgress = () => {
    const allQuestions = QUESTIONNAIRE_STRUCTURE.flatMap(cat => cat.questions);
    const totalRequired = allQuestions.filter(q => q.required).length;
    const answeredRequired = allQuestions.filter(
      q => q.required && answers[q.id]?.trim()
    ).length;
    const totalAll = allQuestions.length;
    const answeredAll = allQuestions.filter(q => answers[q.id]?.trim()).length;

    return {
      required: { answered: answeredRequired, total: totalRequired },
      all: { answered: answeredAll, total: totalAll }
    };
  };

  const progress = getOverallProgress();

  return (
    <div className="space-y-4">
      {/* Progress Summary */}
      <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium text-white">
            Frågeformulär - Eftersamtalsinformation
          </div>
          <div className="text-sm text-gray-400">
            {progress.all.answered}/{progress.all.total} frågor besvarade
          </div>
        </div>

        {/* Progress bars */}
        <div className="space-y-2">
          <div>
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>Obligatoriska frågor</span>
              <span>{progress.required.answered}/{progress.required.total}</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  progress.required.answered === progress.required.total
                    ? 'bg-green-500'
                    : 'bg-yellow-500'
                }`}
                style={{
                  width: `${(progress.required.answered / progress.required.total) * 100}%`
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>Alla frågor</span>
              <span>{progress.all.answered}/{progress.all.total}</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-500 transition-all duration-300"
                style={{
                  width: `${(progress.all.answered / progress.all.total) * 100}%`
                }}
              />
            </div>
          </div>
        </div>

        {progress.required.answered < progress.required.total && (
          <div className="flex items-center gap-2 mt-3 text-xs text-yellow-400">
            <AlertCircle className="w-4 h-4" />
            <span>Obligatoriska frågor saknar svar</span>
          </div>
        )}
      </div>

      {/* Question Categories */}
      <div className="space-y-3">
        {QUESTIONNAIRE_STRUCTURE.map((category) => {
          const isExpanded = expandedCategories.has(category.category);
          const categoryProgress = getCategoryProgress(category);

          return (
            <div
              key={category.category}
              className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden"
            >
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.category)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                  <div className="text-left">
                    <div className="text-sm font-medium text-white">
                      {category.category}
                    </div>
                    <div className="text-xs text-gray-400">
                      {category.description}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">
                    {categoryProgress.answered}/{categoryProgress.total}
                  </span>
                  {categoryProgress.answered === categoryProgress.total ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-600" />
                  )}
                </div>
              </button>

              {/* Questions */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-4 border-t border-gray-800">
                  {category.questions.map((question, index) => {
                    const isAnswered = !!answers[question.id]?.trim();
                    const isAiFilled = aiFilledQuestions.has(question.id);

                    return (
                      <div key={question.id} className="pt-4">
                        <label className="block">
                          <div className="flex items-start gap-2 mb-2">
                            {isAnswered ? (
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            ) : (
                              <Circle className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <div className="text-sm font-medium text-white">
                                  {question.question}
                                  {question.required && (
                                    <span className="text-red-400 ml-1">*</span>
                                  )}
                                </div>
                                {isAiFilled && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30">
                                    <Bot className="w-3 h-3" />
                                    AI-ifylld
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {question.multiline ? (
                            <textarea
                              value={answers[question.id] || ''}
                              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                              placeholder={question.placeholder}
                              rows={3}
                              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400"
                            />
                          ) : (
                            <input
                              type="text"
                              value={answers[question.id] || ''}
                              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                              placeholder={question.placeholder}
                              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400"
                            />
                          )}
                        </label>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Completion Message */}
      {progress.all.answered === progress.all.total && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <div className="text-sm text-green-200">
            Alla frågor besvarade! Din kunddata är komplett.
          </div>
        </div>
      )}
    </div>
  );
};
