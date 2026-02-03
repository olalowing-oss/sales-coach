// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { X, Wand2, Save, Trash2, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Product {
  id: string;
  name: string;
  description: string | null;
}

interface GeneratedScenario {
  name: string;
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  persona_name: string;
  persona_role: string;
  company_name: string;
  company_size: string;
  industry: string;
  personality: string;
  pain_points: string[];
  budget: string;
  decision_timeframe: string;
  objectives: string[];
  competitors: string[];
  opening_line: string;
  success_criteria: string[];
  common_mistakes: string[];
}

interface ScenarioGeneratorProps {
  onClose: () => void;
}

export const ScenarioGenerator: React.FC<ScenarioGeneratorProps> = ({ onClose }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [numberOfScenarios, setNumberOfScenarios] = useState(3);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedScenarios, setGeneratedScenarios] = useState<GeneratedScenario[]>([]);
  const [selectedScenarios, setSelectedScenarios] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [expandedScenario, setExpandedScenario] = useState<number | null>(null);

  // Fetch user's accessible products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data: userProducts, error: upError } = await supabase
          .from('user_products')
          .select('product_id')
          .eq('is_active', true);

        if (upError) throw upError;

        const productIds = userProducts?.map(up => up.product_id) || [];

        if (productIds.length === 0) {
          setError('Du har ingen produktåtkomst. Tilldela en produkt först.');
          return;
        }

        const { data: productsData, error: pError } = await supabase
          .from('product_profiles')
          .select('id, name, description')
          .in('id', productIds);

        if (pError) throw pError;

        setProducts(productsData || []);
        if (productsData && productsData.length > 0) {
          setSelectedProductId(productsData[0].id);
        }
      } catch (err: any) {
        console.error('Error fetching products:', err);
        setError('Kunde inte hämta produkter');
      }
    };

    fetchProducts();
  }, []);

  const handleGenerate = async () => {
    if (!selectedProductId) return;

    setIsGenerating(true);
    setError(null);
    setSuccess(null);
    setGeneratedScenarios([]);
    setSelectedScenarios(new Set());

    try {
      const response = await fetch('/api/generate-scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProductId,
          numberOfScenarios,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Kunde inte generera scenarier');
      }

      setGeneratedScenarios(data.scenarios);
      // Select all by default
      setSelectedScenarios(new Set(data.scenarios.map((_: any, idx: number) => idx)));
      setSuccess(`Genererade ${data.scenarios.length} scenarier från ${data.productName}!`);
    } catch (err: any) {
      console.error('Generation error:', err);
      setError(err.message || 'Kunde inte generera scenarier');
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper function to generate a unique ID from scenario name
  const generateScenarioId = (name: string, index: number): string => {
    const slug = name
      .toLowerCase()
      .replace(/å/g, 'a')
      .replace(/ä/g, 'a')
      .replace(/ö/g, 'o')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Add timestamp and index to ensure uniqueness
    const timestamp = Date.now().toString(36);
    return `${slug}-${timestamp}-${index}`;
  };

  const handleSaveSelected = async () => {
    if (selectedScenarios.size === 0) {
      setError('Välj minst ett scenario att spara');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Du måste vara inloggad');
      }

      const scenariosToSave = Array.from(selectedScenarios).map((idx, arrayIndex) => {
        const scenario = generatedScenarios[idx];
        return {
          id: generateScenarioId(scenario.name, arrayIndex),
          name: scenario.name,
          difficulty: scenario.difficulty,
          description: scenario.description,
          persona_name: scenario.persona_name,
          persona_role: scenario.persona_role,
          company_name: scenario.company_name,
          company_size: scenario.company_size,
          industry: scenario.industry,
          personality: scenario.personality,
          pain_points: scenario.pain_points,
          budget: scenario.budget,
          decision_timeframe: scenario.decision_timeframe,
          objectives: scenario.objectives,
          competitors: scenario.competitors,
          opening_line: scenario.opening_line,
          success_criteria: scenario.success_criteria,
          common_mistakes: scenario.common_mistakes,
          product_id: selectedProductId,
          user_id: user.id,
          is_global: false,
          auto_generated: true,
        };
      });

      const { error: insertError } = await supabase
        .from('training_scenarios')
        .insert(scenariosToSave);

      if (insertError) {
        throw insertError;
      }

      setSuccess(`✅ Sparade ${scenariosToSave.length} scenarier till databasen!`);

      // Clear generated scenarios after 2 seconds
      setTimeout(() => {
        setGeneratedScenarios([]);
        setSelectedScenarios(new Set());
      }, 2000);

    } catch (err: any) {
      console.error('Save error:', err);
      setError(err.message || 'Kunde inte spara scenarier');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleScenarioSelection = (idx: number) => {
    const newSelected = new Set(selectedScenarios);
    if (newSelected.has(idx)) {
      newSelected.delete(idx);
    } else {
      newSelected.add(idx);
    }
    setSelectedScenarios(newSelected);
  };

  const toggleExpand = (idx: number) => {
    setExpandedScenario(expandedScenario === idx ? null : idx);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-900 text-green-300 border-green-700';
      case 'medium': return 'bg-yellow-900 text-yellow-300 border-yellow-700';
      case 'hard': return 'bg-red-900 text-red-300 border-red-700';
      default: return 'bg-gray-900 text-gray-300 border-gray-700';
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-95 z-50 overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Wand2 className="text-purple-400" size={32} />
              AI Scenario Generator
            </h1>
            <p className="text-gray-400">
              Generera träningsscenarier automatiskt från din kunskapsbas
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        {/* Generator Form */}
        <div className="mb-6 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">Konfigurera generering</h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Välj produkt
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              >
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Antal scenarier
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={numberOfScenarios}
                onChange={(e) => setNumberOfScenarios(parseInt(e.target.value) || 3)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !selectedProductId}
            className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Genererar scenarier... (kan ta 10-30 sekunder)
              </>
            ) : (
              <>
                <Wand2 size={20} />
                Generera scenarier
              </>
            )}
          </button>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-900 bg-opacity-50 border border-red-700 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-900 bg-opacity-50 border border-green-700 rounded-lg text-green-200 flex items-center gap-2">
            <CheckCircle2 size={20} />
            {success}
          </div>
        )}

        {/* Generated Scenarios */}
        {generatedScenarios.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">
                Genererade scenarier ({selectedScenarios.size} av {generatedScenarios.length} valda)
              </h2>
              <button
                onClick={handleSaveSelected}
                disabled={isSaving || selectedScenarios.size === 0}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Sparar...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Spara valda ({selectedScenarios.size})
                  </>
                )}
              </button>
            </div>

            <div className="space-y-4">
              {generatedScenarios.map((scenario, idx) => (
                <div
                  key={idx}
                  className={`bg-gray-800 rounded-lg p-4 border-2 transition-colors ${
                    selectedScenarios.has(idx)
                      ? 'border-purple-600'
                      : 'border-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <input
                          type="checkbox"
                          checked={selectedScenarios.has(idx)}
                          onChange={() => toggleScenarioSelection(idx)}
                          className="w-5 h-5 rounded"
                        />
                        <h3 className="text-lg font-bold text-white">{scenario.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(scenario.difficulty)}`}>
                          {scenario.difficulty}
                        </span>
                      </div>

                      <p className="text-gray-300 text-sm mb-3 ml-8">{scenario.description}</p>

                      <div className="ml-8 grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-400">Persona:</span>
                          <span className="text-white ml-2">{scenario.persona_name} ({scenario.persona_role})</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Företag:</span>
                          <span className="text-white ml-2">{scenario.company_name}</span>
                        </div>
                      </div>

                      {expandedScenario === idx && (
                        <div className="ml-8 mt-4 space-y-3 text-sm">
                          <div>
                            <span className="text-gray-400 font-medium">Pain Points:</span>
                            <ul className="list-disc list-inside text-gray-300 mt-1">
                              {scenario.pain_points.map((pp, i) => <li key={i}>{pp}</li>)}
                            </ul>
                          </div>
                          <div>
                            <span className="text-gray-400 font-medium">Objectives:</span>
                            <ul className="list-disc list-inside text-gray-300 mt-1">
                              {scenario.objectives.map((obj, i) => <li key={i}>{obj}</li>)}
                            </ul>
                          </div>
                          <div>
                            <span className="text-gray-400 font-medium">Opening Line:</span>
                            <p className="text-white italic mt-1">"{scenario.opening_line}"</p>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <span className="text-gray-400">Budget:</span>
                              <span className="text-white ml-2">{scenario.budget}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Tidsram:</span>
                              <span className="text-white ml-2">{scenario.decision_timeframe}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => toggleExpand(idx)}
                      className="p-2 hover:bg-gray-700 rounded-lg text-gray-400"
                    >
                      {expandedScenario === idx ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="bg-blue-900 bg-opacity-30 border border-blue-700 rounded-lg p-4">
          <h3 className="text-blue-300 font-medium mb-2">ℹ️ Så fungerar det</h3>
          <ul className="text-blue-200 text-sm space-y-1 list-disc list-inside">
            <li>AI läser igenom ALLA dokument i kunskapsbasen för vald produkt</li>
            <li>Baserat på produktinfo, priser, features och kundcase genereras realistiska scenarier</li>
            <li>Varje scenario får unik persona, pain points och objectives från dokumentationen</li>
            <li>Granska scenarierna och välj vilka du vill spara</li>
            <li>Sparade scenarier dyker upp direkt i träningsläget</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
