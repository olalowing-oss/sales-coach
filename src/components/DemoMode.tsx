// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Package,
  Play,
  CheckCircle,
  MessageSquare,
  AlertCircle,
  Volume2,
  ChevronDown,
  ChevronUp,
  Target,
  ClipboardList
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { DemoScript, DemoStep, DemoQuestion } from '../types';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { PostCallQuestionnaire } from './PostCallQuestionnaire';

interface Product {
  id: string;
  name: string;
  description?: string;
}

interface DemoModeProps {
  onClose: () => void;
}

// Helper function to convert database snake_case to camelCase
const mapDbScriptToScript = (dbScript: any): DemoScript => {
  return {
    id: dbScript.id,
    userId: dbScript.user_id,
    productId: dbScript.product_id,
    name: dbScript.name,
    description: dbScript.description,
    durationMinutes: dbScript.duration_minutes,
    targetAudience: dbScript.target_audience,
    openingHook: dbScript.opening_hook,
    keyTalkingPoints: dbScript.key_talking_points || [],
    demoFlow: dbScript.demo_flow || [],
    commonQuestions: dbScript.common_questions || [],
    objectionHandling: dbScript.objection_handling || [],
    successCriteria: dbScript.success_criteria || [],
    nextSteps: dbScript.next_steps || [],
    isActive: dbScript.is_active,
    createdAt: dbScript.created_at ? new Date(dbScript.created_at) : undefined,
    updatedAt: dbScript.updated_at ? new Date(dbScript.updated_at) : undefined,
  };
};

export const DemoMode: React.FC<DemoModeProps> = ({ onClose }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [demoScripts, setDemoScripts] = useState<DemoScript[]>([]);
  const [selectedScript, setSelectedScript] = useState<DemoScript | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showQuestions, setShowQuestions] = useState(false);
  const [showObjections, setShowObjections] = useState(false);
  const [showStepDetails, setShowStepDetails] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isDemoStarted, setIsDemoStarted] = useState(false);
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<Record<string, string>>({});

  const { speak, isSpeaking, stop } = useTextToSpeech();

  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('product_profiles')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (!error && data) {
        setProducts(data);
        if (data.length > 0) {
          setSelectedProduct(data[0]);
        }
      }
    };

    fetchProducts();
  }, []);

  // Fetch demo scripts when product changes
  useEffect(() => {
    if (!selectedProduct) return;

    const fetchDemoScripts = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('demo_scripts')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', selectedProduct.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (!error && data) {
        const mappedScripts = data.map(mapDbScriptToScript);
        setDemoScripts(mappedScripts);
      }
    };

    fetchDemoScripts();
  }, [selectedProduct]);

  const handleStartDemo = (script: DemoScript) => {
    setSelectedScript(script);
    setCurrentStepIndex(0);
    setCompletedSteps(new Set());
    setIsDemoStarted(true);
  };

  const handleNextStep = () => {
    if (selectedScript && currentStepIndex < selectedScript.demoFlow.length - 1) {
      setCompletedSteps(prev => new Set(prev).add(currentStepIndex));
      setCurrentStepIndex(currentStepIndex + 1);
      setShowStepDetails(false);
    }
  };

  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      setShowStepDetails(false);
    }
  };

  const handleCompleteStep = () => {
    setCompletedSteps(prev => new Set(prev).add(currentStepIndex));
  };

  const handleSpeak = (text: string) => {
    if (isSpeaking) {
      stop();
    } else {
      speak(text);
    }
  };

  const currentStep = selectedScript?.demoFlow[currentStepIndex];
  const progress = selectedScript ? ((currentStepIndex + 1) / selectedScript.demoFlow.length) * 100 : 0;

  // Script Selection View
  if (!isDemoStarted || !selectedScript) {
    return (
      <div className="fixed inset-0 bg-gray-900 z-50 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Interaktiv Demo</h1>
              <p className="text-gray-400">Välj ett demo-script för att börja din guidade produktdemo</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg text-gray-400"
            >
              <X size={24} />
            </button>
          </div>

          {/* Product Selector */}
          <div className="bg-gray-800 rounded-xl p-6 mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Välj produkt
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedProduct?.id === product.id
                      ? 'border-blue-500 bg-blue-900/20'
                      : 'border-gray-700 bg-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Package className={selectedProduct?.id === product.id ? 'text-blue-400' : 'text-gray-400'} size={24} />
                    <div>
                      <h3 className="font-semibold text-white">{product.name}</h3>
                      {product.description && (
                        <p className="text-xs text-gray-400 mt-1">{product.description}</p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Demo Scripts */}
          {selectedProduct && (
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Tillgängliga demo-scripts - {selectedProduct.name}
              </h2>

              {demoScripts.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Inga demo-scripts tillgängliga för denna produkt.
                </p>
              ) : (
                <div className="space-y-4">
                  {demoScripts.map(script => (
                    <div key={script.id} className="bg-gray-700 rounded-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-2">{script.name}</h3>
                          {script.description && (
                            <p className="text-sm text-gray-400 mb-4">{script.description}</p>
                          )}

                          <div className="flex items-center gap-6 text-sm text-gray-400 mb-4">
                            {script.durationMinutes && (
                              <span>{script.durationMinutes} minuter</span>
                            )}
                            {script.targetAudience && (
                              <span>Målgrupp: {script.targetAudience}</span>
                            )}
                            <span>{script.demoFlow.length} steg</span>
                          </div>

                          <div className="bg-gray-600 rounded-lg p-4 mb-4">
                            <p className="text-sm font-medium text-gray-300 mb-2">Öppningshook:</p>
                            <p className="text-sm text-gray-400 italic">"{script.openingHook}"</p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleStartDemo(script)}
                          className="ml-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                        >
                          <Play size={18} />
                          Starta Demo
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Demo Running View
  return (
    <div className="fixed inset-0 bg-gray-900 z-50 overflow-hidden flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setIsDemoStarted(false);
                setSelectedScript(null);
              }}
              className="p-2 hover:bg-gray-700 rounded-lg text-gray-400"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">{selectedScript.name}</h1>
              <p className="text-sm text-gray-400">
                Steg {currentStepIndex + 1} av {selectedScript.demoFlow.length}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg text-gray-400"
          >
            <X size={24} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentStep && (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Step Header */}
              <div className="bg-gray-800 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl font-bold text-blue-400">
                        {currentStepIndex + 1}
                      </span>
                      <h2 className="text-2xl font-bold text-white">{currentStep.title}</h2>
                    </div>
                    <p className="text-gray-400">{currentStep.description}</p>
                  </div>

                  <button
                    onClick={handleCompleteStep}
                    className={`p-2 rounded-lg transition-colors ${
                      completedSteps.has(currentStepIndex)
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    }`}
                  >
                    <CheckCircle size={24} />
                  </button>
                </div>
              </div>

              {/* Talking Points */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Viktiga punkter att ta upp</h3>
                <ul className="space-y-3">
                  {currentStep.talkingPoints.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-blue-400 mt-1">•</span>
                      <span className="text-gray-300">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Step Details (Expandable) */}
              {(currentStep.expectedQuestions || currentStep.tips) && (
                <div className="bg-gray-800 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setShowStepDetails(!showStepDetails)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-700 transition-colors"
                  >
                    <span className="text-white font-medium">Mer information om detta steg</span>
                    {showStepDetails ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                  </button>

                  {showStepDetails && (
                    <div className="px-6 pb-6 space-y-4 border-t border-gray-700 pt-4">
                      {currentStep.expectedQuestions && currentStep.expectedQuestions.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-300 mb-2">Förväntade frågor:</h4>
                          <ul className="space-y-1">
                            {currentStep.expectedQuestions.map((q, idx) => (
                              <li key={idx} className="text-sm text-gray-400">• {q}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {currentStep.tips && currentStep.tips.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-300 mb-2">Tips:</h4>
                          <ul className="space-y-1">
                            {currentStep.tips.map((tip, idx) => (
                              <li key={idx} className="text-sm text-gray-400">💡 {tip}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePreviousStep}
                  disabled={currentStepIndex === 0}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-lg flex items-center gap-2 transition-colors"
                >
                  <ChevronLeft size={18} />
                  Föregående
                </button>

                <div className="text-gray-400 text-sm">
                  {completedSteps.size} av {selectedScript.demoFlow.length} steg klara
                </div>

                {currentStepIndex < selectedScript.demoFlow.length - 1 ? (
                  <button
                    onClick={handleNextStep}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                  >
                    Nästa
                    <ChevronRight size={18} />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setCompletedSteps(prev => new Set(prev).add(currentStepIndex));
                      // Show completion summary
                    }}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <CheckCircle size={18} />
                    Avsluta Demo
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Quick Access */}
        <div className="w-96 bg-gray-800 border-l border-gray-700 overflow-y-auto flex-shrink-0">
          <div className="p-6 space-y-4">
            {/* Common Questions */}
            {selectedScript.commonQuestions && selectedScript.commonQuestions.length > 0 && (
              <div className="bg-gray-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => setShowQuestions(!showQuestions)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare size={18} className="text-blue-400" />
                    <span className="text-white font-medium">Vanliga frågor</span>
                  </div>
                  {showQuestions ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                </button>

                {showQuestions && (
                  <div className="px-4 pb-4 space-y-3">
                    {selectedScript.commonQuestions.map((q, idx) => (
                      <div key={idx} className="bg-gray-600 rounded p-3">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="text-sm font-medium text-white">{q.question}</p>
                          <button
                            onClick={() => handleSpeak(q.answer)}
                            className="p-1 hover:bg-gray-500 rounded text-blue-400 flex-shrink-0"
                            title="Läs upp svar"
                          >
                            <Volume2 size={14} />
                          </button>
                        </div>
                        <p className="text-xs text-gray-300">{q.answer}</p>
                        {q.category && (
                          <span className="inline-block mt-2 px-2 py-1 bg-gray-700 text-xs text-gray-400 rounded">
                            {q.category}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Objection Handling */}
            {selectedScript.objectionHandling && selectedScript.objectionHandling.length > 0 && (
              <div className="bg-gray-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => setShowObjections(!showObjections)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <AlertCircle size={18} className="text-orange-400" />
                    <span className="text-white font-medium">Invändningar</span>
                  </div>
                  {showObjections ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                </button>

                {showObjections && (
                  <div className="px-4 pb-4 space-y-3">
                    {selectedScript.objectionHandling.map((obj, idx) => (
                      <div key={idx} className="bg-gray-600 rounded p-3">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="text-sm font-medium text-orange-300">"{obj.objection}"</p>
                          <button
                            onClick={() => handleSpeak(obj.response)}
                            className="p-1 hover:bg-gray-500 rounded text-blue-400 flex-shrink-0"
                            title="Läs upp svar"
                          >
                            <Volume2 size={14} />
                          </button>
                        </div>
                        <p className="text-xs text-gray-300">{obj.response}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Success Criteria */}
            {selectedScript.successCriteria && selectedScript.successCriteria.length > 0 && (
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Target size={18} className="text-green-400" />
                  <h3 className="text-white font-medium">Framgångskriterier</h3>
                </div>
                <ul className="space-y-2">
                  {selectedScript.successCriteria.map((criteria, idx) => (
                    <li key={idx} className="text-xs text-gray-300 flex items-start gap-2">
                      <CheckCircle size={12} className="text-green-400 mt-0.5 flex-shrink-0" />
                      <span>{criteria}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Customer Questionnaire */}
            <div className="bg-gray-700 rounded-lg overflow-hidden">
              <button
                onClick={() => setShowQuestionnaire(!showQuestionnaire)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <ClipboardList size={18} className="text-teal-400" />
                  <span className="text-white font-medium">Kundfrågor</span>
                </div>
                {showQuestionnaire ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
              </button>

              {showQuestionnaire && (
                <div className="px-4 pb-4 max-h-[600px] overflow-y-auto">
                  <PostCallQuestionnaire
                    onAnswersChange={setQuestionnaireAnswers}
                    initialAnswers={questionnaireAnswers}
                    aiFilledQuestions={new Set()}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
