// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { X, Plus, Edit, Trash2, Save } from 'lucide-react';
import { type TrainingScenario } from '../data/trainingScenarios';
import { supabase } from '../lib/supabase';

interface ScenariosAdminProps {
  onClose: () => void;
}

export const ScenariosAdmin: React.FC<ScenariosAdminProps> = ({ onClose }) => {
  const [scenarios, setScenarios] = useState<TrainingScenario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingScenario, setEditingScenario] = useState<TrainingScenario | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch scenarios on mount
  useEffect(() => {
    fetchScenarios();
  }, []);

  const fetchScenarios = async () => {
    try {
      // Fetch directly from Supabase (much faster than API proxy)
      // RLS policy automatically filters based on user's product access
      const { data, error } = await supabase
        .from('training_scenarios')
        .select('*')
        .order('difficulty', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        console.error('Supabase error:', error);
        setError('Kunde inte hämta scenarier');
      } else if (data) {
        console.log('📥 Fetched scenarios from DB:', data.length, 'scenarios');
        console.log('🔍 First scenario voice_name:', data[0]?.voice_name);

        // Transform snake_case to camelCase
        const transformedScenarios = data.map((scenario: any) => ({
          id: scenario.id,
          name: scenario.name,
          difficulty: scenario.difficulty,
          description: scenario.description,
          personaName: scenario.persona_name,
          personaRole: scenario.persona_role,
          companyName: scenario.company_name,
          companySize: scenario.company_size,
          industry: scenario.industry,
          painPoints: scenario.pain_points,
          budget: scenario.budget,
          decisionTimeframe: scenario.decision_timeframe,
          personality: scenario.personality,
          objectives: scenario.objectives,
          competitors: scenario.competitors,
          openingLine: scenario.opening_line,
          successCriteria: scenario.success_criteria,
          commonMistakes: scenario.common_mistakes,
          voiceName: scenario.voice_name,
          productId: scenario.product_id
        }));

        console.log('✨ Transformed first scenario voiceName:', transformedScenarios[0]?.voiceName);
        setScenarios(transformedScenarios);
      }
    } catch (error) {
      console.error('Error fetching scenarios:', error);
      setError('Kunde inte hämta scenarier');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setEditingScenario({
      id: '',
      name: '',
      difficulty: 'easy',
      description: '',
      personaName: '',
      personaRole: '',
      companyName: '',
      companySize: '',
      industry: '',
      painPoints: [],
      budget: '',
      decisionTimeframe: '',
      personality: '',
      objectives: [],
      competitors: [],
      openingLine: '',
      successCriteria: [],
      commonMistakes: [],
      voiceName: 'sv-SE-SofieNeural',
      productId: null
    });
  };

  const handleSave = async () => {
    if (!editingScenario) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Du måste vara inloggad för att skapa scenarier');
        return;
      }

      // Convert camelCase to snake_case for database
      const dbScenario: any = {
        name: editingScenario.name,
        difficulty: editingScenario.difficulty,
        description: editingScenario.description,
        persona_name: editingScenario.personaName,
        persona_role: editingScenario.personaRole,
        company_name: editingScenario.companyName,
        company_size: editingScenario.companySize,
        industry: editingScenario.industry,
        pain_points: editingScenario.painPoints,
        budget: editingScenario.budget,
        decision_timeframe: editingScenario.decisionTimeframe,
        personality: editingScenario.personality,
        objectives: editingScenario.objectives,
        competitors: editingScenario.competitors,
        opening_line: editingScenario.openingLine,
        success_criteria: editingScenario.successCriteria,
        common_mistakes: editingScenario.commonMistakes,
        voice_name: editingScenario.voiceName || 'sv-SE-SofieNeural',
        product_id: editingScenario.productId || null
      };

      console.log('💾 Saving scenario with voice_name:', {
        voiceName: editingScenario.voiceName,
        voice_name: dbScenario.voice_name,
        isCreating,
        scenarioId: editingScenario.id
      });

      let result;
      if (isCreating) {
        // Insert new scenario - include id and user_id
        dbScenario.id = editingScenario.id;
        dbScenario.user_id = user.id;
        dbScenario.is_global = false;

        result = await supabase
          .from('training_scenarios')
          .insert(dbScenario)
          .select();
      } else {
        // Update existing scenario using API (bypasses RLS)
        console.log('📝 Performing UPDATE for id:', editingScenario.id);
        console.log('📦 Sending updates:', dbScenario);

        const apiResponse = await fetch('/api/update-scenario', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scenarioId: editingScenario.id,
            updates: dbScenario
          })
        });

        const apiData = await apiResponse.json();

        console.log('📊 API response:', apiData);

        if (!apiResponse.ok || !apiData.success) {
          throw new Error(apiData.error || 'Failed to update scenario');
        }

        result = { data: [apiData.data], error: null };
      }

      if (result.error) {
        console.error('❌ Save error:', result.error);
        setError(`Kunde inte spara scenario: ${result.error.message}`);
        return;
      }

      console.log('✅ Saved successfully:', result.data);

      // Verify the update actually worked by fetching the scenario again
      const { data: verifyData, error: verifyError } = await supabase
        .from('training_scenarios')
        .select('id, name, voice_name')
        .eq('id', editingScenario.id)
        .single();

      if (verifyError) {
        console.error('⚠️ Could not verify update:', verifyError);
      } else {
        console.log('🔍 Verified voice_name in DB:', verifyData.voice_name);
      }

      // Refresh scenarios
      await fetchScenarios();
      setEditingScenario(null);
      setIsCreating(false);
      setError(null);
    } catch (error: any) {
      console.error('Error saving scenario:', error);
      setError(`Kunde inte spara scenario: ${error.message}`);
    }
  };

  const handleDelete = async (scenarioId: string) => {
    if (!confirm('Är du säker på att du vill ta bort detta scenario?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('training_scenarios')
        .delete()
        .eq('id', scenarioId);

      if (error) {
        console.error('Delete error:', error);
        setError(`Kunde inte ta bort scenario: ${error.message}`);
        return;
      }

      // Refresh scenarios
      await fetchScenarios();
      setError(null);
    } catch (error: any) {
      console.error('Error deleting scenario:', error);
      setError(`Kunde inte ta bort scenario: ${error.message}`);
    }
  };

  const handleCancel = () => {
    setEditingScenario(null);
    setIsCreating(false);
    setError(null);
  };

  // Render editor
  if (editingScenario) {
    return (
      <div className="fixed inset-0 bg-gray-900 z-50 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-white">
              {isCreating ? 'Skapa nytt scenario' : 'Redigera scenario'}
            </h1>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2"
            >
              <X size={18} />
              Avbryt
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-600/20 border border-red-600/50 rounded-lg text-red-400">
              {error}
            </div>
          )}

          {/* Form */}
          <div className="bg-gray-800 rounded-lg p-6 space-y-4">
            {/* Basic info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Scenario ID</label>
                <input
                  type="text"
                  value={editingScenario.id}
                  onChange={(e) => setEditingScenario({ ...editingScenario, id: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
                  placeholder="enthusiastic-startup-cto"
                  disabled={!isCreating}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Namn</label>
                <input
                  type="text"
                  value={editingScenario.name}
                  onChange={(e) => setEditingScenario({ ...editingScenario, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
                  placeholder="🚀 Entusiastisk Startup CTO"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Svårighetsgrad</label>
              <select
                value={editingScenario.difficulty}
                onChange={(e) => setEditingScenario({ ...editingScenario, difficulty: e.target.value as any })}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
              >
                <option value="easy">Lätt</option>
                <option value="medium">Medel</option>
                <option value="hard">Svår</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Beskrivning</label>
              <textarea
                value={editingScenario.description}
                onChange={(e) => setEditingScenario({ ...editingScenario, description: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
                rows={3}
              />
            </div>

            {/* Persona */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Persona Namn</label>
                <input
                  type="text"
                  value={editingScenario.personaName}
                  onChange={(e) => setEditingScenario({ ...editingScenario, personaName: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Persona Roll</label>
                <input
                  type="text"
                  value={editingScenario.personaRole}
                  onChange={(e) => setEditingScenario({ ...editingScenario, personaRole: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
                />
              </div>
            </div>

            {/* Company */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Företagsnamn</label>
                <input
                  type="text"
                  value={editingScenario.companyName}
                  onChange={(e) => setEditingScenario({ ...editingScenario, companyName: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Företagsstorlek</label>
                <input
                  type="text"
                  value={editingScenario.companySize}
                  onChange={(e) => setEditingScenario({ ...editingScenario, companySize: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Bransch</label>
              <input
                type="text"
                value={editingScenario.industry}
                onChange={(e) => setEditingScenario({ ...editingScenario, industry: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
              />
            </div>

            {/* Arrays - simplified for now */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Pain Points (kommaseparerade)</label>
              <textarea
                value={editingScenario.painPoints.join(', ')}
                onChange={(e) => setEditingScenario({ ...editingScenario, painPoints: e.target.value.split(',').map(s => s.trim()) })}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Budget</label>
                <input
                  type="text"
                  value={editingScenario.budget}
                  onChange={(e) => setEditingScenario({ ...editingScenario, budget: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Beslutshorisonten</label>
                <input
                  type="text"
                  value={editingScenario.decisionTimeframe}
                  onChange={(e) => setEditingScenario({ ...editingScenario, decisionTimeframe: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Personlighet</label>
              <textarea
                value={editingScenario.personality}
                onChange={(e) => setEditingScenario({ ...editingScenario, personality: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Röst</label>
              <select
                value={editingScenario.voiceName || 'sv-SE-SofieNeural'}
                onChange={(e) => setEditingScenario({ ...editingScenario, voiceName: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
              >
                <option value="sv-SE-SofieNeural">Sofie (Kvinna, vänlig)</option>
                <option value="sv-SE-HilleviNeural">Hillevi (Kvinna, tydlig)</option>
                <option value="sv-SE-MattiasNeural">Mattias (Man, professionell)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Opening Line</label>
              <textarea
                value={editingScenario.openingLine}
                onChange={(e) => setEditingScenario({ ...editingScenario, openingLine: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Mål (kommaseparerade)</label>
              <textarea
                value={editingScenario.objectives.join(', ')}
                onChange={(e) => setEditingScenario({ ...editingScenario, objectives: e.target.value.split(',').map(s => s.trim()) })}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Konkurrenter (kommaseparerade)</label>
              <input
                type="text"
                value={editingScenario.competitors.join(', ')}
                onChange={(e) => setEditingScenario({ ...editingScenario, competitors: e.target.value.split(',').map(s => s.trim()) })}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Framgångskriterier (kommaseparerade)</label>
              <textarea
                value={editingScenario.successCriteria.join(', ')}
                onChange={(e) => setEditingScenario({ ...editingScenario, successCriteria: e.target.value.split(',').map(s => s.trim()) })}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Vanliga misstag (kommaseparerade)</label>
              <textarea
                value={editingScenario.commonMistakes.join(', ')}
                onChange={(e) => setEditingScenario({ ...editingScenario, commonMistakes: e.target.value.split(',').map(s => s.trim()) })}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
                rows={3}
              />
            </div>

            {/* Save button */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={handleCancel}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
              >
                Avbryt
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
              >
                <Save size={18} />
                Spara
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render list view
  return (
    <div className="fixed inset-0 bg-gray-900 z-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin: Träningsscenarier</h1>
            <p className="text-gray-400">Hantera och redigera AI-träningsscenarier</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCreateNew}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
            >
              <Plus size={18} />
              Skapa nytt
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2"
            >
              <X size={18} />
              Stäng
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-600/20 border border-red-600/50 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-400">Laddar scenarier...</span>
          </div>
        )}

        {/* Scenarios table */}
        {!isLoading && (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Namn
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Svårighet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Persona
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Företag
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {scenarios.map((scenario) => (
                  <tr key={scenario.id} className="hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{scenario.name}</div>
                      <div className="text-sm text-gray-400">{scenario.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded ${
                        scenario.difficulty === 'easy' ? 'bg-green-600/20 text-green-400' :
                        scenario.difficulty === 'medium' ? 'bg-yellow-600/20 text-yellow-400' :
                        'bg-red-600/20 text-red-400'
                      }`}>
                        {scenario.difficulty === 'easy' ? 'Lätt' : scenario.difficulty === 'medium' ? 'Medel' : 'Svår'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {scenario.personaName} - {scenario.personaRole}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {scenario.companyName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          console.log('✏️ Editing scenario:', scenario.name, 'voiceName:', scenario.voiceName);
                          setEditingScenario(scenario);
                          setIsCreating(false);
                        }}
                        className="text-blue-400 hover:text-blue-300 mr-3"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(scenario.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {scenarios.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                Inga scenarier hittades. Skapa ett nytt scenario för att komma igång.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
