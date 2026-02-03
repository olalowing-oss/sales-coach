// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  X,
  Package,
  Play,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  CheckCircle,
  Clock,
  Users,
  Wand2,
  Loader
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { DemoScript, DemoStep, DemoQuestion } from '../types';

interface Product {
  id: string;
  name: string;
  description?: string;
}

interface DemoAdminPanelProps {
  onClose: () => void;
}

export const DemoAdminPanel: React.FC<DemoAdminPanelProps> = ({ onClose }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [demoScripts, setDemoScripts] = useState<DemoScript[]>([]);
  const [editingScript, setEditingScript] = useState<DemoScript | null>(null);
  const [creatingScript, setCreatingScript] = useState(false);
  const [expandedScript, setExpandedScript] = useState<string | null>(null);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

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
        .order('created_at', { ascending: false });

      if (!error && data) {
        const mappedScripts = data.map(mapDbScriptToScript);
        setDemoScripts(mappedScripts);
      }
    };

    fetchDemoScripts();
  }, [selectedProduct]);

  const handleDelete = async (scriptId: string) => {
    if (!confirm('Är du säker på att du vill radera detta demo-script?')) return;

    const { error } = await supabase
      .from('demo_scripts')
      .delete()
      .eq('id', scriptId);

    if (!error) {
      setDemoScripts(scripts => scripts.filter(s => s.id !== scriptId));
    }
  };

  const handleAIGenerate = async (targetAudience: string, demoType: string) => {
    if (!selectedProduct) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-demo-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          targetAudience,
          demoType
        })
      });

      const data = await response.json();

      if (!data.success || !data.demoScript) {
        throw new Error(data.error || 'Failed to generate demo script');
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Save to database
      const scriptData = {
        user_id: user.id,
        product_id: selectedProduct.id,
        name: data.demoScript.name,
        description: data.demoScript.description,
        duration_minutes: data.demoScript.durationMinutes,
        target_audience: data.demoScript.targetAudience,
        opening_hook: data.demoScript.openingHook,
        key_talking_points: data.demoScript.keyTalkingPoints,
        demo_flow: data.demoScript.demoFlow,
        common_questions: data.demoScript.commonQuestions,
        objection_handling: data.demoScript.objectionHandling,
        success_criteria: data.demoScript.successCriteria,
        next_steps: data.demoScript.nextSteps,
        is_active: true
      };

      const { data: savedScript, error: saveError } = await supabase
        .from('demo_scripts')
        .insert(scriptData)
        .select()
        .single();

      if (saveError) throw saveError;

      // Map and add to list
      const mappedScript = mapDbScriptToScript(savedScript);
      setDemoScripts(prev => [mappedScript, ...prev]);
      setShowAIGenerator(false);

      alert('Demo-script genererat och sparat! 🎉');
    } catch (error: any) {
      console.error('Error generating demo script:', error);
      alert(`Fel vid generering: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Demo-administratorn</h1>
            <p className="text-gray-400">Skapa och hantera interaktiva demo-scripts för dina produkter</p>
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

        {selectedProduct && (
          <>
            {/* Scripts Overview */}
            <div className="bg-gray-800 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Demo-scripts - {selectedProduct.name}</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAIGenerator(true)}
                    disabled={isGenerating}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2"
                  >
                    {isGenerating ? <Loader size={18} className="animate-spin" /> : <Wand2 size={18} />}
                    AI-generera
                  </button>
                  <button
                    onClick={() => setCreatingScript(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Nytt demo-script
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {demoScripts.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Inga demo-scripts än. Klicka "Nytt demo-script" för att komma igång.
                  </p>
                ) : (
                  demoScripts.map(script => (
                    <DemoScriptCard
                      key={script.id}
                      script={script}
                      expanded={expandedScript === script.id}
                      onToggle={() => setExpandedScript(expandedScript === script.id ? null : script.id)}
                      onEdit={() => setEditingScript(script)}
                      onDelete={() => handleDelete(script.id)}
                    />
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {/* Create/Edit Modal */}
        {(creatingScript || editingScript) && (
          <DemoScriptModal
            script={editingScript}
            productId={selectedProduct?.id || ''}
            onClose={() => {
              setCreatingScript(false);
              setEditingScript(null);
            }}
            onSave={(script) => {
              if (editingScript) {
                setDemoScripts(scripts => scripts.map(s => s.id === script.id ? script : s));
              } else {
                setDemoScripts(scripts => [script, ...scripts]);
              }
              setCreatingScript(false);
              setEditingScript(null);
            }}
          />
        )}

        {/* AI Generator Modal */}
        {showAIGenerator && (
          <AIGeneratorModal
            productName={selectedProduct?.name || ''}
            isGenerating={isGenerating}
            onClose={() => setShowAIGenerator(false)}
            onGenerate={handleAIGenerate}
          />
        )}
      </div>
    </div>
  );
};

// AI Generator Modal Component
interface AIGeneratorModalProps {
  productName: string;
  isGenerating: boolean;
  onClose: () => void;
  onGenerate: (targetAudience: string, demoType: string) => void;
}

const AIGeneratorModal: React.FC<AIGeneratorModalProps> = ({ productName, isGenerating, onClose, onGenerate }) => {
  const [targetAudience, setTargetAudience] = useState('IT-chefer och beslutsfattare');
  const [demoType, setDemoType] = useState('Grundläggande produktdemo');

  const handleGenerate = () => {
    if (targetAudience.trim() && demoType.trim()) {
      onGenerate(targetAudience, demoType);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">AI-generera Demo-script</h2>
              <p className="text-gray-400 mt-1">För {productName}</p>
            </div>
            <button
              onClick={onClose}
              disabled={isGenerating}
              className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 disabled:cursor-not-allowed"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Info box */}
            <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Wand2 className="text-purple-400 mt-0.5 flex-shrink-0" size={20} />
                <div className="text-sm text-gray-300">
                  <p className="font-medium text-purple-400 mb-1">AI genererar ett komplett demo-script</p>
                  <p>Baserat på produktdokumentation i kunskapsbasen skapas ett professionellt demo-script med:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-gray-400">
                    <li>Öppningshook och nyckelbudskap</li>
                    <li>6-8 demo-steg med talking points</li>
                    <li>Vanliga frågor med svar</li>
                    <li>Invändningshantering</li>
                    <li>Framgångskriterier och nästa steg</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Målgrupp
              </label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                disabled={isGenerating}
                placeholder="T.ex. IT-chefer, CTO:er, verksamhetschefer..."
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 disabled:opacity-50"
              />
              <p className="text-xs text-gray-400 mt-1">Vem ska demon rikta sig till?</p>
            </div>

            {/* Demo Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Demotyp
              </label>
              <select
                value={demoType}
                onChange={(e) => setDemoType(e.target.value)}
                disabled={isGenerating}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white disabled:opacity-50"
              >
                <option value="Grundläggande produktdemo">Grundläggande produktdemo</option>
                <option value="Teknisk djupdemo">Teknisk djupdemo</option>
                <option value="Executive overview">Executive overview</option>
                <option value="ROI och business case">ROI och business case</option>
                <option value="Konkurrensjämförelse">Konkurrensjämförelse</option>
                <option value="Implementation och onboarding">Implementation och onboarding</option>
                <option value="Advanced features showcase">Advanced features showcase</option>
              </select>
              <p className="text-xs text-gray-400 mt-1">Vilken typ av demo ska genereras?</p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                onClick={onClose}
                disabled={isGenerating}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg"
              >
                Avbryt
              </button>
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !targetAudience.trim() || !demoType.trim()}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Genererar...
                  </>
                ) : (
                  <>
                    <Wand2 size={18} />
                    Generera Demo-script
                  </>
                )}
              </button>
            </div>

            {/* Warning */}
            {isGenerating && (
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
                <p className="text-sm text-yellow-400">
                  ⏱️ Detta kan ta 30-60 sekunder. AI:n analyserar produktdokumentation och skapar ett komplett demo-script.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Demo Script Card Component
interface DemoScriptCardProps {
  script: DemoScript;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const DemoScriptCard: React.FC<DemoScriptCardProps> = ({ script, expanded, onToggle, onEdit, onDelete }) => {
  return (
    <div className="bg-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 cursor-pointer" onClick={onToggle}>
          <h3 className="text-lg font-semibold text-white mb-2">{script.name}</h3>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            {script.durationMinutes && (
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>{script.durationMinutes} min</span>
              </div>
            )}
            {script.targetAudience && (
              <div className="flex items-center gap-1">
                <Users size={14} />
                <span>{script.targetAudience}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Play size={14} />
              <span>{script.demoFlow?.length || 0} steg</span>
            </div>
            {script.commonQuestions && script.commonQuestions.length > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare size={14} />
                <span>{script.commonQuestions.length} vanliga frågor</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="p-2 hover:bg-gray-600 rounded text-gray-400"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 hover:bg-red-600/20 rounded text-red-400"
          >
            <Trash2 size={16} />
          </button>
          <button
            onClick={onToggle}
            className="p-2 hover:bg-gray-600 rounded text-gray-400"
          >
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 space-y-4 border-t border-gray-600 pt-4">
          {script.description && (
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-1">Beskrivning</h4>
              <p className="text-sm text-gray-400">{script.description}</p>
            </div>
          )}

          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Öppningshook</h4>
            <p className="text-sm text-gray-400 italic">"{script.openingHook}"</p>
          </div>

          {script.keyTalkingPoints && script.keyTalkingPoints.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">Viktiga punkter</h4>
              <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
                {script.keyTalkingPoints.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            </div>
          )}

          {script.demoFlow && script.demoFlow.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">Demo-flöde ({script.demoFlow.length} steg)</h4>
              <div className="space-y-2">
                {script.demoFlow.map((step, idx) => (
                  <div key={step.id} className="bg-gray-600 rounded p-3">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-400 font-semibold">{idx + 1}.</span>
                      <div className="flex-1">
                        <p className="text-white font-medium">{step.title}</p>
                        <p className="text-sm text-gray-400 mt-1">{step.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {script.successCriteria && script.successCriteria.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">Framgångskriterier</h4>
              <ul className="space-y-1">
                {script.successCriteria.map((criteria, idx) => (
                  <li key={idx} className="text-sm text-gray-400 flex items-start gap-2">
                    <CheckCircle size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                    <span>{criteria}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Demo Script Modal Component
interface DemoScriptModalProps {
  script: DemoScript | null;
  productId: string;
  onClose: () => void;
  onSave: (script: DemoScript) => void;
}

const DemoScriptModal: React.FC<DemoScriptModalProps> = ({ script, productId, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<DemoScript>>({
    name: script?.name || '',
    description: script?.description || '',
    durationMinutes: script?.durationMinutes || 30,
    targetAudience: script?.targetAudience || '',
    openingHook: script?.openingHook || '',
    keyTalkingPoints: script?.keyTalkingPoints || [],
    demoFlow: script?.demoFlow || [],
    commonQuestions: script?.commonQuestions || [],
    successCriteria: script?.successCriteria || [],
    nextSteps: script?.nextSteps || [],
    isActive: script?.isActive ?? true
  });

  const [newTalkingPoint, setNewTalkingPoint] = useState('');
  const [newSuccessCriteria, setNewSuccessCriteria] = useState('');
  const [editingStep, setEditingStep] = useState<DemoStep | null>(null);

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const demoScriptData = {
      user_id: user.id,
      product_id: productId,
      name: formData.name,
      description: formData.description,
      duration_minutes: formData.durationMinutes,
      target_audience: formData.targetAudience,
      opening_hook: formData.openingHook,
      key_talking_points: formData.keyTalkingPoints,
      demo_flow: formData.demoFlow,
      common_questions: formData.commonQuestions,
      objection_handling: null,
      success_criteria: formData.successCriteria,
      next_steps: formData.nextSteps,
      is_active: formData.isActive
    };

    if (script) {
      // Update existing
      const { data, error } = await supabase
        .from('demo_scripts')
        .update(demoScriptData)
        .eq('id', script.id)
        .select()
        .single();

      if (!error && data) {
        const mappedScript: DemoScript = {
          id: data.id,
          userId: data.user_id,
          productId: data.product_id,
          name: data.name,
          description: data.description,
          durationMinutes: data.duration_minutes,
          targetAudience: data.target_audience,
          openingHook: data.opening_hook,
          keyTalkingPoints: data.key_talking_points || [],
          demoFlow: data.demo_flow || [],
          commonQuestions: data.common_questions || [],
          objectionHandling: data.objection_handling || [],
          successCriteria: data.success_criteria || [],
          nextSteps: data.next_steps || [],
          isActive: data.is_active,
          createdAt: data.created_at ? new Date(data.created_at) : undefined,
          updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
        };
        onSave(mappedScript);
      }
    } else {
      // Create new
      const { data, error } = await supabase
        .from('demo_scripts')
        .insert(demoScriptData)
        .select()
        .single();

      if (!error && data) {
        const mappedScript: DemoScript = {
          id: data.id,
          userId: data.user_id,
          productId: data.product_id,
          name: data.name,
          description: data.description,
          durationMinutes: data.duration_minutes,
          targetAudience: data.target_audience,
          openingHook: data.opening_hook,
          keyTalkingPoints: data.key_talking_points || [],
          demoFlow: data.demo_flow || [],
          commonQuestions: data.common_questions || [],
          objectionHandling: data.objection_handling || [],
          successCriteria: data.success_criteria || [],
          nextSteps: data.next_steps || [],
          isActive: data.is_active,
          createdAt: data.created_at ? new Date(data.created_at) : undefined,
          updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
        };
        onSave(mappedScript);
      }
    }
  };

  const addTalkingPoint = () => {
    if (newTalkingPoint.trim()) {
      setFormData({
        ...formData,
        keyTalkingPoints: [...(formData.keyTalkingPoints || []), newTalkingPoint.trim()]
      });
      setNewTalkingPoint('');
    }
  };

  const removeTalkingPoint = (index: number) => {
    setFormData({
      ...formData,
      keyTalkingPoints: formData.keyTalkingPoints?.filter((_, i) => i !== index)
    });
  };

  const addSuccessCriteria = () => {
    if (newSuccessCriteria.trim()) {
      setFormData({
        ...formData,
        successCriteria: [...(formData.successCriteria || []), newSuccessCriteria.trim()]
      });
      setNewSuccessCriteria('');
    }
  };

  const removeSuccessCriteria = (index: number) => {
    setFormData({
      ...formData,
      successCriteria: formData.successCriteria?.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
      <div className="bg-gray-800 rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">
            {script ? 'Redigera demo-script' : 'Nytt demo-script'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Basic Info */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Namn *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="t.ex. M365 Introduktionsdemo"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Varaktighet (min)</label>
              <input
                type="number"
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Målgrupp</label>
              <input
                type="text"
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                placeholder="t.ex. IT-chefer, VD, Slutanvändare"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Beskrivning</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              placeholder="Kort beskrivning av demon"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Öppningshook *</label>
            <textarea
              value={formData.openingHook}
              onChange={(e) => setFormData({ ...formData, openingHook: e.target.value })}
              rows={3}
              placeholder="Hur startar du demon? Vilken hook använder du för att fånga intresset?"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>

          {/* Key Talking Points */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Viktiga diskussionspunkter</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newTalkingPoint}
                onChange={(e) => setNewTalkingPoint(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTalkingPoint()}
                placeholder="Lägg till punkt (tryck Enter)"
                className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
              <button
                onClick={addTalkingPoint}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="space-y-2">
              {formData.keyTalkingPoints?.map((point, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-gray-700 px-3 py-2 rounded">
                  <span className="flex-1 text-white text-sm">{point}</span>
                  <button
                    onClick={() => removeTalkingPoint(idx)}
                    className="text-gray-400 hover:text-red-400"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Success Criteria */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Framgångskriterier</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newSuccessCriteria}
                onChange={(e) => setNewSuccessCriteria(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSuccessCriteria()}
                placeholder="Vad definierar en lyckad demo?"
                className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
              <button
                onClick={addSuccessCriteria}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="space-y-2">
              {formData.successCriteria?.map((criteria, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-gray-700 px-3 py-2 rounded">
                  <CheckCircle size={14} className="text-green-400 flex-shrink-0" />
                  <span className="flex-1 text-white text-sm">{criteria}</span>
                  <button
                    onClick={() => removeSuccessCriteria(idx)}
                    className="text-gray-400 hover:text-red-400"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={!formData.name || !formData.openingHook}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {script ? 'Uppdatera' : 'Skapa'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
          >
            Avbryt
          </button>
        </div>
      </div>
    </div>
  );
};
