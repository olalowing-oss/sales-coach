import React, { useState, useEffect } from 'react';
import {
  X,
  RotateCcw,
  Plus,
  Edit2,
  Trash2,
  Zap,
  Swords,
  AlertTriangle,
  BookOpen,
  Save,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useCoachingStore } from '../store/coachingStore';
import { Battlecard, ObjectionHandler, CaseStudy, TriggerPattern, Offer } from '../types';
import { supabase } from '../lib/supabase';

// Hook to fetch active products
const useProducts = () => {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('product_profiles')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (!error && data) {
        setProducts(data);
      }
    };

    fetchProducts();
  }, []);

  return products;
};

interface CoachingAdminPanelProps {
  onClose: () => void;
}

type TabType = 'triggers' | 'battlecards' | 'objections' | 'cases' | 'offers';

export const CoachingAdminPanel: React.FC<CoachingAdminPanelProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('triggers');

  const { resetToDefaults } = useCoachingStore();

  const handleReset = () => {
    if (window.confirm('Vill du återställa all coachning-data till standardvärdena? Detta kan inte ångras.')) {
      resetToDefaults();
    }
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'triggers', label: 'Triggers', icon: <Zap size={18} /> },
    { id: 'battlecards', label: 'Battlecards', icon: <Swords size={18} /> },
    { id: 'objections', label: 'Invändningar', icon: <AlertTriangle size={18} /> },
    { id: 'cases', label: 'Kundcase', icon: <BookOpen size={18} /> },
    { id: 'offers', label: 'Erbjudanden', icon: <Save size={18} /> }
  ];

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Coachning-inställningar</h1>
            <p className="text-gray-400">Hantera triggers, battlecards, invändningar och kundcase</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2"
            >
              <RotateCcw size={18} />
              Återställ allt
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

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-700 pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-gray-800 rounded-xl p-6">
          {activeTab === 'triggers' && <TriggersTab />}
          {activeTab === 'battlecards' && <BattlecardsTab />}
          {activeTab === 'objections' && <ObjectionsTab />}
          {activeTab === 'cases' && <CasesTab />}
          {activeTab === 'offers' && <OffersTab />}
        </div>
      </div>
    </div>
  );
};

// === TRIGGERS TAB ===
const TriggersTab: React.FC = () => {
  const { triggerPatterns, addTriggerPattern, updateTriggerPattern, deleteTriggerPattern } = useCoachingStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTrigger, setNewTrigger] = useState({ id: '', keywords: '', response: 'objection' as TriggerPattern['response'], category: '', productId: null as string | null });
  const [showAddForm, setShowAddForm] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedProductForGeneration, setSelectedProductForGeneration] = useState<string>('');
  const [selectedProductFilter, setSelectedProductFilter] = useState<string>(''); // Filter for displaying items
  const [generatedTriggers, setGeneratedTriggers] = useState<Array<{ id: string; keywords: string[]; response: TriggerPattern['response']; category?: string }>>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string>('');
  const products = useProducts();

  // Filter triggers based on selected product
  const filteredTriggers = Object.entries(triggerPatterns).filter(([_, pattern]) => {
    if (!selectedProductFilter) return true; // Show all if no filter
    // Only show items that match the selected product ID
    return pattern.productId === selectedProductFilter;
  });

  console.log('Triggers Filter Debug:', {
    selectedProductFilter,
    totalTriggers: Object.keys(triggerPatterns).length,
    filteredCount: filteredTriggers.length,
    availableProducts: products.length,
    productNames: products.map(p => p.name),
    sampleProductIds: Object.values(triggerPatterns).slice(0, 3).map(p => p.productId)
  });

  const responseTypes = [
    { value: 'objection', label: 'Invändning' },
    { value: 'battlecard', label: 'Battlecard' },
    { value: 'offer', label: 'Erbjudande' },
    { value: 'solution', label: 'Lösning' },
    { value: 'expand', label: 'Expandera' }
  ];

  const handleAddTrigger = () => {
    if (!newTrigger.id || !newTrigger.keywords) return;
    addTriggerPattern(newTrigger.id, {
      keywords: newTrigger.keywords.split(',').map(k => k.trim()),
      response: newTrigger.response,
      category: newTrigger.category || undefined,
      productId: newTrigger.productId
    });
    setNewTrigger({ id: '', keywords: '', response: 'objection', category: '', productId: null });
    setShowAddForm(false);
  };

  const handleGenerateTriggers = async () => {
    if (!selectedProductForGeneration) {
      setGenerateError('Välj en produkt först');
      return;
    }

    setIsGenerating(true);
    setGenerateError('');
    setGeneratedTriggers([]);

    try {
      const response = await fetch('/api/generate-triggers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProductForGeneration,
          count: 5
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Kunde inte generera triggers');
      }

      setGeneratedTriggers(data.triggers);

    } catch (error: any) {
      console.error('Generate triggers error:', error);
      setGenerateError(error.message || 'Ett fel uppstod vid generering');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveGeneratedTrigger = (trigger: typeof generatedTriggers[0]) => {
    addTriggerPattern(trigger.id, {
      keywords: trigger.keywords,
      response: trigger.response,
      category: trigger.category,
      productId: selectedProductForGeneration
    });
    setGeneratedTriggers(prev => prev.filter(t => t !== trigger));
  };

  const handleSaveAllGeneratedTriggers = () => {
    generatedTriggers.forEach(trigger => {
      addTriggerPattern(trigger.id, {
        keywords: trigger.keywords,
        response: trigger.response,
        category: trigger.category,
        productId: selectedProductForGeneration
      });
    });
    setGeneratedTriggers([]);
    setShowGenerateModal(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Trigger-mönster</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowGenerateModal(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2"
          >
            <Zap size={18} />
            Generera från produktdokument
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
          >
            <Plus size={18} />
            Lägg till manuellt
          </button>
        </div>
      </div>

      {/* Product Filter */}
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-2">Filtrera per produkt</label>
        <select
          value={selectedProductFilter}
          onChange={(e) => setSelectedProductFilter(e.target.value)}
          className="w-full max-w-xs px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
        >
          <option value="">Alla produkter</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {showAddForm && (
        <div className="bg-gray-700 rounded-lg p-4 mb-4">
          <h3 className="text-white font-medium mb-3">Ny trigger</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">ID (unikt namn)</label>
              <input
                type="text"
                value={newTrigger.id}
                onChange={(e) => setNewTrigger({ ...newTrigger, id: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                placeholder="t.ex. microsoft-teams"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Typ av respons</label>
              <select
                value={newTrigger.response}
                onChange={(e) => setNewTrigger({ ...newTrigger, response: e.target.value as TriggerPattern['response'] })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
              >
                {responseTypes.map(rt => (
                  <option key={rt.value} value={rt.value}>{rt.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-1">Nyckelord (kommaseparerade)</label>
            <input
              type="text"
              value={newTrigger.keywords}
              onChange={(e) => setNewTrigger({ ...newTrigger, keywords: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
              placeholder="t.ex. Teams, Microsoft Teams, videosamtal"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-1">Kategori (valfritt)</label>
            <input
              type="text"
              value={newTrigger.category}
              onChange={(e) => setNewTrigger({ ...newTrigger, category: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
              placeholder="t.ex. price, timing, competition"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-1">Produkt (valfritt)</label>
            <select
              value={newTrigger.productId || ''}
              onChange={(e) => setNewTrigger({ ...newTrigger, productId: e.target.value || null })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
            >
              <option value="">Global (alla produkter)</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddTrigger}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
            >
              <Save size={18} />
              Spara
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg"
            >
              Avbryt
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {filteredTriggers.map(([id, pattern]) => (
          <TriggerItem
            key={id}
            id={id}
            pattern={pattern}
            isEditing={editingId === id}
            onEdit={() => setEditingId(editingId === id ? null : id)}
            onUpdate={(updated) => {
              updateTriggerPattern(id, updated);
              setEditingId(null);
            }}
            onDelete={() => deleteTriggerPattern(id)}
          />
        ))}
      </div>

      {/* Generate Triggers Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">Generera Triggers från Produktdokument</h3>
              <button
                onClick={() => {
                  setShowGenerateModal(false);
                  setGeneratedTriggers([]);
                  setGenerateError('');
                }}
                className="p-2 hover:bg-gray-700 rounded-lg text-gray-400"
              >
                <X size={20} />
              </button>
            </div>

            {generatedTriggers.length === 0 ? (
              <div>
                <p className="text-gray-400 mb-4">
                  Välj en produkt för att generera triggers baserat på uppladdade dokument.
                </p>

                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">Välj produkt</label>
                  <select
                    value={selectedProductForGeneration}
                    onChange={(e) => setSelectedProductForGeneration(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="">-- Välj en produkt --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {generateError && (
                  <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded-lg text-red-200">
                    {generateError}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={handleGenerateTriggers}
                    disabled={!selectedProductForGeneration || isGenerating}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Genererar...
                      </>
                    ) : (
                      <>
                        <Zap size={18} />
                        Generera triggers
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowGenerateModal(false);
                      setGenerateError('');
                    }}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg"
                  >
                    Avbryt
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <p className="text-gray-400">
                    {generatedTriggers.length} triggers genererade. Granska och spara de du vill ha.
                  </p>
                  <button
                    onClick={handleSaveAllGeneratedTriggers}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
                  >
                    <Save size={18} />
                    Spara alla
                  </button>
                </div>

                <div className="space-y-3">
                  {generatedTriggers.map((trigger, idx) => (
                    <div key={idx} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-mono text-blue-400">{trigger.id}</span>
                            <span className="px-2 py-0.5 bg-gray-600 text-xs rounded text-gray-300">
                              {trigger.response}
                            </span>
                            {trigger.category && (
                              <span className="px-2 py-0.5 bg-gray-600 text-xs rounded text-gray-400">
                                {trigger.category}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400">
                            <strong>Nyckelord:</strong> {trigger.keywords.join(', ')}
                          </p>
                        </div>
                        <button
                          onClick={() => handleSaveGeneratedTrigger(trigger)}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm flex items-center gap-1"
                        >
                          <Save size={16} />
                          Spara
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => {
                      setGeneratedTriggers([]);
                      setSelectedProductForGeneration('');
                    }}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg"
                  >
                    Generera nya
                  </button>
                  <button
                    onClick={() => {
                      setShowGenerateModal(false);
                      setGeneratedTriggers([]);
                    }}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg"
                  >
                    Stäng
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const TriggerItem: React.FC<{
  id: string;
  pattern: TriggerPattern;
  isEditing: boolean;
  onEdit: () => void;
  onUpdate: (pattern: Partial<TriggerPattern>) => void;
  onDelete: () => void;
}> = ({ id, pattern, isEditing, onEdit, onUpdate, onDelete }) => {
  const [keywords, setKeywords] = useState(pattern.keywords.join(', '));

  return (
    <div className="bg-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="font-mono text-blue-400">{id}</span>
            <span className="px-2 py-0.5 bg-gray-600 text-xs rounded text-gray-300">
              {pattern.response}
            </span>
            {pattern.category && (
              <span className="px-2 py-0.5 bg-gray-600 text-xs rounded text-gray-400">
                {pattern.category}
              </span>
            )}
          </div>
          {!isEditing && (
            <p className="text-gray-400 text-sm mt-1">
              {pattern.keywords.join(', ')}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={onEdit} className="p-2 hover:bg-gray-600 rounded-lg text-gray-400">
            {isEditing ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          <button onClick={onDelete} className="p-2 hover:bg-red-600/20 rounded-lg text-red-400">
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      {isEditing && (
        <div className="mt-4 pt-4 border-t border-gray-600">
          <label className="block text-sm text-gray-400 mb-1">Nyckelord (kommaseparerade)</label>
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white mb-3"
          />
          <button
            onClick={() => onUpdate({ keywords: keywords.split(',').map(k => k.trim()) })}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
          >
            <Save size={18} />
            Spara ändringar
          </button>
        </div>
      )}
    </div>
  );
};

// === BATTLECARDS TAB ===
const BattlecardsTab: React.FC = () => {
  const { battlecards, addBattlecard, updateBattlecard, deleteBattlecard } = useCoachingStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedProductForGeneration, setSelectedProductForGeneration] = useState<string>('');
  const [selectedProductFilter, setSelectedProductFilter] = useState<string>('');
  const [generatedBattlecards, setGeneratedBattlecards] = useState<Omit<Battlecard, 'id'>[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string>('');
  const products = useProducts();

  // Filter battlecards based on selected product
  const filteredBattlecards = battlecards.filter((bc) => {
    if (!selectedProductFilter) return true;
    // Only show items that match the selected product ID
    return bc.productId === selectedProductFilter;
  });
  const [newCard, setNewCard] = useState<Omit<Battlecard, 'id'>>({
    competitor: '',
    theirStrengths: [],
    theirWeaknesses: [],
    ourAdvantages: [],
    talkingPoints: [],
    commonObjections: [],
    productId: null
  });

  const handleAdd = () => {
    if (!newCard.competitor) return;
    addBattlecard(newCard);
    setNewCard({
      competitor: '',
      theirStrengths: [],
      theirWeaknesses: [],
      ourAdvantages: [],
      talkingPoints: [],
      commonObjections: [],
      productId: null
    });
    setShowAddForm(false);
  };

  const handleGenerateBattlecards = async () => {
    if (!selectedProductForGeneration) {
      setGenerateError('Välj en produkt först');
      return;
    }

    setIsGenerating(true);
    setGenerateError('');
    setGeneratedBattlecards([]);

    try {
      const response = await fetch('/api/generate-battlecards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProductForGeneration,
          count: 3
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Kunde inte generera battlecards');
      }

      const battlecardsWithProductId = data.battlecards.map((bc: Omit<Battlecard, 'id'>) => ({
        ...bc,
        productId: selectedProductForGeneration
      }));

      setGeneratedBattlecards(battlecardsWithProductId);

    } catch (error: any) {
      console.error('Generate battlecards error:', error);
      setGenerateError(error.message || 'Ett fel uppstod vid generering');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveGeneratedBattlecard = (battlecard: Omit<Battlecard, 'id'>) => {
    addBattlecard(battlecard);
    setGeneratedBattlecards(prev => prev.filter(bc => bc !== battlecard));
  };

  const handleSaveAllGeneratedBattlecards = () => {
    generatedBattlecards.forEach(bc => addBattlecard(bc));
    setGeneratedBattlecards([]);
    setShowGenerateModal(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Battlecards</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowGenerateModal(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2"
          >
            <Zap size={18} />
            Generera från produktdokument
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
          >
            <Plus size={18} />
            Lägg till manuellt
          </button>
        </div>
      </div>

      {/* Product Filter */}
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-2">Filtrera per produkt</label>
        <select
          value={selectedProductFilter}
          onChange={(e) => setSelectedProductFilter(e.target.value)}
          className="w-full max-w-xs px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
        >
          <option value="">Alla produkter</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {showAddForm && (
        <BattlecardForm
          battlecard={newCard}
          products={products}
          onChange={setNewCard}
          onSave={handleAdd}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <div className="space-y-4">
        {filteredBattlecards.map((bc) => (
          <div key={bc.id} className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Swords className="text-red-400" size={20} />
                vs {bc.competitor}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingId(editingId === bc.id ? null : bc.id)}
                  className="p-2 hover:bg-gray-600 rounded-lg text-blue-400"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => deleteBattlecard(bc.id)}
                  className="p-2 hover:bg-red-600/20 rounded-lg text-red-400"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {editingId === bc.id ? (
              <BattlecardForm
                battlecard={bc}
                products={products}
                onChange={(updated) => updateBattlecard(bc.id, updated)}
                onSave={() => setEditingId(null)}
                onCancel={() => setEditingId(null)}
                isEdit
              />
            ) : (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 mb-1">Deras styrkor:</p>
                  <ul className="list-disc list-inside text-gray-300">
                    {bc.theirStrengths.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Våra fördelar:</p>
                  <ul className="list-disc list-inside text-green-400">
                    {bc.ourAdvantages.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Generate Battlecards Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">Generera Battlecards från Produktdokument</h3>
              <button
                onClick={() => {
                  setShowGenerateModal(false);
                  setGeneratedBattlecards([]);
                  setGenerateError('');
                }}
                className="p-2 hover:bg-gray-700 rounded-lg text-gray-400"
              >
                <X size={20} />
              </button>
            </div>

            {generatedBattlecards.length === 0 ? (
              <div>
                <p className="text-gray-400 mb-4">
                  Välj en produkt för att generera battlecards baserat på uppladdade dokument.
                </p>

                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">Välj produkt</label>
                  <select
                    value={selectedProductForGeneration}
                    onChange={(e) => setSelectedProductForGeneration(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="">-- Välj en produkt --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {generateError && (
                  <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded-lg text-red-200">
                    {generateError}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={handleGenerateBattlecards}
                    disabled={!selectedProductForGeneration || isGenerating}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Genererar...
                      </>
                    ) : (
                      <>
                        <Zap size={18} />
                        Generera battlecards
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowGenerateModal(false);
                      setGenerateError('');
                    }}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg"
                  >
                    Avbryt
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <p className="text-gray-400">
                    {generatedBattlecards.length} battlecards genererade. Granska och spara de du vill ha.
                  </p>
                  <button
                    onClick={handleSaveAllGeneratedBattlecards}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
                  >
                    <Save size={18} />
                    Spara alla
                  </button>
                </div>

                <div className="space-y-4">
                  {generatedBattlecards.map((bc, idx) => (
                    <div key={idx} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                          <Swords className="text-red-400" size={20} />
                          vs {bc.competitor}
                        </h4>
                        <button
                          onClick={() => handleSaveGeneratedBattlecard(bc)}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm flex items-center gap-1"
                        >
                          <Save size={16} />
                          Spara
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong className="text-gray-300">Deras styrkor:</strong>
                          <ul className="list-disc list-inside text-gray-400 mt-1">
                            {bc.theirStrengths.map((s, i) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <strong className="text-gray-300">Deras svagheter:</strong>
                          <ul className="list-disc list-inside text-gray-400 mt-1">
                            {bc.theirWeaknesses.map((s, i) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <strong className="text-gray-300">Våra fördelar:</strong>
                          <ul className="list-disc list-inside text-green-400 mt-1">
                            {bc.ourAdvantages.map((s, i) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <strong className="text-gray-300">Argumentationspunkter:</strong>
                          <ul className="list-disc list-inside text-gray-400 mt-1">
                            {bc.talkingPoints.map((s, i) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {bc.commonObjections.length > 0 && (
                        <div className="mt-3">
                          <strong className="text-gray-300 text-sm">Vanliga invändningar:</strong>
                          <ul className="list-disc list-inside text-gray-400 mt-1 text-sm">
                            {bc.commonObjections.map((obj, i) => (
                              <li key={i}>{obj}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => {
                      setGeneratedBattlecards([]);
                      setSelectedProductForGeneration('');
                    }}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg"
                  >
                    Generera nya
                  </button>
                  <button
                    onClick={() => {
                      setShowGenerateModal(false);
                      setGeneratedBattlecards([]);
                    }}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg"
                  >
                    Stäng
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const BattlecardForm: React.FC<{
  battlecard: Omit<Battlecard, 'id'> | Battlecard;
  products: any[];
  onChange: (bc: Omit<Battlecard, 'id'>) => void;
  onSave: () => void;
  onCancel: () => void;
  isEdit?: boolean;
}> = ({ battlecard, products, onChange, onSave, onCancel, isEdit }) => {
  const update = (field: keyof Omit<Battlecard, 'id'>, value: string | string[] | null) => {
    onChange({ ...battlecard, [field]: value });
  };

  return (
    <div className={`${isEdit ? '' : 'bg-gray-700 rounded-lg p-4 mb-4'}`}>
      {!isEdit && (
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-1">Konkurrent</label>
          <input
            type="text"
            value={battlecard.competitor}
            onChange={(e) => update('competitor', e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
            placeholder="t.ex. Atea"
          />
        </div>
      )}
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-1">Produkt (valfritt)</label>
        <select
          value={(battlecard as any).productId || ''}
          onChange={(e) => update('productId', e.target.value || null)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
        >
          <option value="">Global (alla produkter)</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Deras styrkor (en per rad)</label>
          <textarea
            value={battlecard.theirStrengths.join('\n')}
            onChange={(e) => update('theirStrengths', e.target.value.split('\n').filter(Boolean))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white h-24"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Deras svagheter (en per rad)</label>
          <textarea
            value={battlecard.theirWeaknesses.join('\n')}
            onChange={(e) => update('theirWeaknesses', e.target.value.split('\n').filter(Boolean))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white h-24"
          />
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-1">Våra fördelar (en per rad)</label>
        <textarea
          value={battlecard.ourAdvantages.join('\n')}
          onChange={(e) => update('ourAdvantages', e.target.value.split('\n').filter(Boolean))}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white h-24"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-1">Talking points (en per rad)</label>
        <textarea
          value={battlecard.talkingPoints.join('\n')}
          onChange={(e) => update('talkingPoints', e.target.value.split('\n').filter(Boolean))}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white h-24"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={onSave}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
        >
          <Save size={18} />
          {isEdit ? 'Spara' : 'Lägg till'}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg"
        >
          Avbryt
        </button>
      </div>
    </div>
  );
};

// === OBJECTIONS TAB ===
const ObjectionsTab: React.FC = () => {
  const { objectionHandlers, addObjectionHandler, updateObjectionHandler, deleteObjectionHandler } = useCoachingStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedProductForGeneration, setSelectedProductForGeneration] = useState<string>('');
  const [selectedProductFilter, setSelectedProductFilter] = useState<string>('');
  const [generatedObjections, setGeneratedObjections] = useState<Omit<ObjectionHandler, 'id'>[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string>('');
  const products = useProducts();

  // Filter objections based on selected product
  const filteredObjections = objectionHandlers.filter((obj) => {
    if (!selectedProductFilter) return true;
    // Only show items that match the selected product ID
    return obj.productId === selectedProductFilter;
  });

  console.log('Objections Filter Debug:', {
    selectedProductFilter,
    totalObjections: objectionHandlers.length,
    filteredCount: filteredObjections.length,
    sampleProductIds: objectionHandlers.slice(0, 3).map(o => o.productId)
  });
  const [newHandler, setNewHandler] = useState<Omit<ObjectionHandler, 'id'>>({
    objection: '',
    triggers: [],
    category: 'price',
    responses: { short: '', detailed: '', followUpQuestions: [] },
    productId: null
  });

  const categories = [
    { value: 'price', label: 'Pris' },
    { value: 'timing', label: 'Timing' },
    { value: 'competition', label: 'Konkurrens' },
    { value: 'trust', label: 'Förtroende' },
    { value: 'need', label: 'Behov' }
  ];

  const handleAdd = () => {
    if (!newHandler.objection) return;
    addObjectionHandler(newHandler);
    setNewHandler({
      objection: '',
      triggers: [],
      category: 'price',
      responses: { short: '', detailed: '', followUpQuestions: [] },
      productId: null
    });
    setShowAddForm(false);
  };

  const handleGenerateObjections = async () => {
    if (!selectedProductForGeneration) {
      setGenerateError('Välj en produkt först');
      return;
    }

    setIsGenerating(true);
    setGenerateError('');
    setGeneratedObjections([]);

    try {
      const response = await fetch('/api/generate-objections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProductForGeneration,
          count: 5
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Kunde inte generera invändningar');
      }

      const objectionsWithProductId = data.objections.map((obj: Omit<ObjectionHandler, 'id'>) => ({
        ...obj,
        productId: selectedProductForGeneration
      }));

      setGeneratedObjections(objectionsWithProductId);

    } catch (error: any) {
      console.error('Generate objections error:', error);
      setGenerateError(error.message || 'Ett fel uppstod vid generering');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveGeneratedObjection = (objection: Omit<ObjectionHandler, 'id'>) => {
    addObjectionHandler(objection);
    setGeneratedObjections(prev => prev.filter(obj => obj !== objection));
  };

  const handleSaveAllGeneratedObjections = () => {
    generatedObjections.forEach(obj => addObjectionHandler(obj));
    setGeneratedObjections([]);
    setShowGenerateModal(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Invändningshantering</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowGenerateModal(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2"
          >
            <Zap size={18} />
            Generera från produktdokument
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
          >
            <Plus size={18} />
            Lägg till manuellt
          </button>
        </div>
      </div>

      {/* Product Filter */}
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-2">Filtrera per produkt</label>
        <select
          value={selectedProductFilter}
          onChange={(e) => setSelectedProductFilter(e.target.value)}
          className="w-full max-w-xs px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
        >
          <option value="">Alla produkter</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {showAddForm && (
        <ObjectionForm
          handler={newHandler}
          products={products}
          categories={categories}
          onChange={setNewHandler}
          onSave={handleAdd}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <div className="space-y-4">
        {filteredObjections.map((oh) => (
          <div key={oh.id} className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <AlertTriangle className="text-orange-400" size={20} />
                  "{oh.objection}"
                </h3>
                <span className="text-xs text-gray-400 px-2 py-0.5 bg-gray-600 rounded">
                  {oh.category}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingId(editingId === oh.id ? null : oh.id)}
                  className="p-2 hover:bg-gray-600 rounded-lg text-blue-400"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => deleteObjectionHandler(oh.id)}
                  className="p-2 hover:bg-red-600/20 rounded-lg text-red-400"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {editingId === oh.id ? (
              <ObjectionForm
                handler={oh}
                products={products}
                categories={categories}
                onChange={(updated) => updateObjectionHandler(oh.id, updated)}
                onSave={() => setEditingId(null)}
                onCancel={() => setEditingId(null)}
                isEdit
              />
            ) : (
              <div className="text-sm">
                <p className="text-gray-400 mb-1">Triggers: <span className="text-gray-300">{oh.triggers.join(', ')}</span></p>
                <p className="text-gray-400 mb-1">Kort svar:</p>
                <p className="text-gray-300 mb-2 pl-2 border-l-2 border-gray-600">{oh.responses.short}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Generate Objections Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">Generera Invändningar från Produktdokument</h3>
              <button
                onClick={() => {
                  setShowGenerateModal(false);
                  setGeneratedObjections([]);
                  setGenerateError('');
                }}
                className="p-2 hover:bg-gray-700 rounded-lg text-gray-400"
              >
                <X size={20} />
              </button>
            </div>

            {generatedObjections.length === 0 ? (
              <div>
                <p className="text-gray-400 mb-4">
                  Välj en produkt för att generera invändningar baserat på uppladdade dokument.
                </p>

                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">Välj produkt</label>
                  <select
                    value={selectedProductForGeneration}
                    onChange={(e) => setSelectedProductForGeneration(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="">-- Välj en produkt --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {generateError && (
                  <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded-lg text-red-200">
                    {generateError}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={handleGenerateObjections}
                    disabled={!selectedProductForGeneration || isGenerating}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Genererar...
                      </>
                    ) : (
                      <>
                        <Zap size={18} />
                        Generera invändningar
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowGenerateModal(false);
                      setGenerateError('');
                    }}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg"
                  >
                    Avbryt
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <p className="text-gray-400">
                    {generatedObjections.length} invändningar genererade. Granska och spara de du vill ha.
                  </p>
                  <button
                    onClick={handleSaveAllGeneratedObjections}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
                  >
                    <Save size={18} />
                    Spara alla
                  </button>
                </div>

                <div className="space-y-4">
                  {generatedObjections.map((obj, idx) => (
                    <div key={idx} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
                            <AlertTriangle className="text-orange-400" size={20} />
                            "{obj.objection}"
                          </h4>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-gray-400 px-2 py-0.5 bg-gray-600 rounded">
                              {obj.category}
                            </span>
                            <span className="text-xs text-gray-400">
                              Triggers: {obj.triggers.join(', ')}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleSaveGeneratedObjection(obj)}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm flex items-center gap-1"
                        >
                          <Save size={16} />
                          Spara
                        </button>
                      </div>

                      <div className="text-sm space-y-2">
                        <div>
                          <strong className="text-gray-300">Kort svar:</strong>
                          <p className="text-gray-400 mt-1 pl-2 border-l-2 border-gray-600">{obj.responses.short}</p>
                        </div>
                        <div>
                          <strong className="text-gray-300">Detaljerat svar:</strong>
                          <p className="text-gray-400 mt-1 pl-2 border-l-2 border-gray-600 whitespace-pre-wrap">{obj.responses.detailed}</p>
                        </div>
                        {obj.responses.followUpQuestions.length > 0 && (
                          <div>
                            <strong className="text-gray-300">Uppföljningsfrågor:</strong>
                            <ul className="list-disc list-inside text-gray-400 mt-1">
                              {obj.responses.followUpQuestions.map((q, i) => (
                                <li key={i}>{q}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => {
                      setGeneratedObjections([]);
                      setSelectedProductForGeneration('');
                    }}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg"
                  >
                    Generera nya
                  </button>
                  <button
                    onClick={() => {
                      setShowGenerateModal(false);
                      setGeneratedObjections([]);
                    }}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg"
                  >
                    Stäng
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ObjectionForm: React.FC<{
  handler: Omit<ObjectionHandler, 'id'> | ObjectionHandler;
  products: any[];
  categories: { value: string; label: string }[];
  onChange: (h: Omit<ObjectionHandler, 'id'>) => void;
  onSave: () => void;
  onCancel: () => void;
  isEdit?: boolean;
}> = ({ handler, products, categories, onChange, onSave, onCancel, isEdit }) => {
  const update = (field: string, value: unknown) => {
    if (field.startsWith('responses.')) {
      const responseField = field.split('.')[1];
      onChange({
        ...handler,
        responses: { ...handler.responses, [responseField]: value }
      });
    } else {
      onChange({ ...handler, [field]: value });
    }
  };

  return (
    <div className={`${isEdit ? 'mt-4 pt-4 border-t border-gray-600' : 'bg-gray-700 rounded-lg p-4 mb-4'}`}>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Invändning</label>
          <input
            type="text"
            value={handler.objection}
            onChange={(e) => update('objection', e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
            placeholder="t.ex. Det är för dyrt"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Kategori</label>
          <select
            value={handler.category}
            onChange={(e) => update('category', e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
          >
            {categories.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-1">Produkt (valfritt)</label>
        <select
          value={(handler as any).productId || ''}
          onChange={(e) => update('productId', e.target.value || null)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
        >
          <option value="">Global (alla produkter)</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-1">Triggers (kommaseparerade)</label>
        <input
          type="text"
          value={handler.triggers.join(', ')}
          onChange={(e) => update('triggers', e.target.value.split(',').map(t => t.trim()))}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
          placeholder="t.ex. dyrt, för dyrt, kostar för mycket"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-1">Kort svar</label>
        <textarea
          value={handler.responses.short}
          onChange={(e) => update('responses.short', e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white h-20"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-1">Utförligt svar</label>
        <textarea
          value={handler.responses.detailed}
          onChange={(e) => update('responses.detailed', e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white h-20"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-1">Följdfrågor (en per rad)</label>
        <textarea
          value={handler.responses.followUpQuestions.join('\n')}
          onChange={(e) => update('responses.followUpQuestions', e.target.value.split('\n').filter(Boolean))}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white h-20"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={onSave}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
        >
          <Save size={18} />
          {isEdit ? 'Spara' : 'Lägg till'}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg"
        >
          Avbryt
        </button>
      </div>
    </div>
  );
};

// === CASES TAB ===
const CasesTab: React.FC = () => {
  const { caseStudies, addCaseStudy, updateCaseStudy, deleteCaseStudy } = useCoachingStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedProductForGeneration, setSelectedProductForGeneration] = useState<string>('');
  const [selectedProductFilter, setSelectedProductFilter] = useState<string>('');
  const [generatedCases, setGeneratedCases] = useState<Omit<CaseStudy, 'id'>[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string>('');
  const products = useProducts();

  // Filter cases based on selected product
  const filteredCases = caseStudies.filter((cs) => {
    if (!selectedProductFilter) return true;
    // Only show items that match the selected product ID
    return cs.productId === selectedProductFilter;
  });
  const [newCase, setNewCase] = useState<Omit<CaseStudy, 'id'>>({
    customer: '',
    industry: '',
    challenge: '',
    solution: '',
    results: [],
    quote: '',
    isPublic: true,
    productId: null
  });

  const handleAdd = () => {
    if (!newCase.customer) return;
    addCaseStudy(newCase);
    setNewCase({
      customer: '',
      industry: '',
      challenge: '',
      solution: '',
      results: [],
      quote: '',
      isPublic: true,
      productId: null
    });
    setShowAddForm(false);
  };

  const handleGenerateCases = async () => {
    if (!selectedProductForGeneration) {
      setGenerateError('Välj en produkt först');
      return;
    }

    setIsGenerating(true);
    setGenerateError('');
    setGeneratedCases([]);

    try {
      const response = await fetch('/api/generate-cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProductForGeneration,
          count: 3
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Kunde inte generera kundcase');
      }

      const casesWithProductId = data.cases.map((cs: Omit<CaseStudy, 'id'>) => ({
        ...cs,
        productId: selectedProductForGeneration
      }));

      setGeneratedCases(casesWithProductId);

    } catch (error: any) {
      console.error('Generate cases error:', error);
      setGenerateError(error.message || 'Ett fel uppstod vid generering');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveGeneratedCase = (caseStudy: Omit<CaseStudy, 'id'>) => {
    addCaseStudy(caseStudy);
    setGeneratedCases(prev => prev.filter(cs => cs !== caseStudy));
  };

  const handleSaveAllGeneratedCases = () => {
    generatedCases.forEach(cs => addCaseStudy(cs));
    setGeneratedCases([]);
    setShowGenerateModal(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Kundcase</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowGenerateModal(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2"
          >
            <Zap size={18} />
            Generera från produktdokument
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
          >
            <Plus size={18} />
            Lägg till manuellt
          </button>
        </div>
      </div>

      {/* Product Filter */}
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-2">Filtrera per produkt</label>
        <select
          value={selectedProductFilter}
          onChange={(e) => setSelectedProductFilter(e.target.value)}
          className="w-full max-w-xs px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
        >
          <option value="">Alla produkter</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {showAddForm && (
        <CaseForm
          caseStudy={newCase}
          products={products}
          onChange={setNewCase}
          onSave={handleAdd}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <div className="space-y-4">
        {filteredCases.map((cs) => (
          <div key={cs.id} className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <BookOpen className="text-green-400" size={20} />
                  {cs.customer}
                </h3>
                <span className="text-xs text-gray-400">{cs.industry}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingId(editingId === cs.id ? null : cs.id)}
                  className="p-2 hover:bg-gray-600 rounded-lg text-blue-400"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => deleteCaseStudy(cs.id)}
                  className="p-2 hover:bg-red-600/20 rounded-lg text-red-400"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {editingId === cs.id ? (
              <CaseForm
                caseStudy={cs}
                products={products}
                onChange={(updated) => updateCaseStudy(cs.id, updated)}
                onSave={() => setEditingId(null)}
                onCancel={() => setEditingId(null)}
                isEdit
              />
            ) : (
              <div className="text-sm">
                <p className="text-gray-400 mb-1">Utmaning:</p>
                <p className="text-gray-300 mb-2">{cs.challenge}</p>
                <p className="text-gray-400 mb-1">Resultat:</p>
                <ul className="list-disc list-inside text-green-400">
                  {cs.results.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
                {cs.quote && (
                  <p className="text-gray-400 italic mt-2">"{cs.quote}"</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Generate Cases Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">Generera Kundcase från Produktdokument</h3>
              <button
                onClick={() => {
                  setShowGenerateModal(false);
                  setGeneratedCases([]);
                  setGenerateError('');
                }}
                className="p-2 hover:bg-gray-700 rounded-lg text-gray-400"
              >
                <X size={20} />
              </button>
            </div>

            {generatedCases.length === 0 ? (
              <div>
                <p className="text-gray-400 mb-4">
                  Välj en produkt för att generera kundcase baserat på uppladdade dokument.
                </p>

                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">Välj produkt</label>
                  <select
                    value={selectedProductForGeneration}
                    onChange={(e) => setSelectedProductForGeneration(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="">-- Välj en produkt --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {generateError && (
                  <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded-lg text-red-200">
                    {generateError}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={handleGenerateCases}
                    disabled={!selectedProductForGeneration || isGenerating}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Genererar...
                      </>
                    ) : (
                      <>
                        <Zap size={18} />
                        Generera kundcase
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowGenerateModal(false);
                      setGenerateError('');
                    }}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg"
                  >
                    Avbryt
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <p className="text-gray-400">
                    {generatedCases.length} kundcase genererade. Granska och spara de du vill ha.
                  </p>
                  <button
                    onClick={handleSaveAllGeneratedCases}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
                  >
                    <Save size={18} />
                    Spara alla
                  </button>
                </div>

                <div className="space-y-4">
                  {generatedCases.map((cs, idx) => (
                    <div key={idx} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-white flex items-center gap-2 mb-1">
                            <BookOpen className="text-blue-400" size={20} />
                            {cs.customer}
                          </h4>
                          <span className="text-xs text-gray-400 px-2 py-0.5 bg-gray-600 rounded">
                            {cs.industry}
                          </span>
                        </div>
                        <button
                          onClick={() => handleSaveGeneratedCase(cs)}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm flex items-center gap-1"
                        >
                          <Save size={16} />
                          Spara
                        </button>
                      </div>

                      <div className="text-sm space-y-2">
                        <div>
                          <strong className="text-gray-300">Utmaning:</strong>
                          <p className="text-gray-400 mt-1">{cs.challenge}</p>
                        </div>
                        <div>
                          <strong className="text-gray-300">Lösning:</strong>
                          <p className="text-gray-400 mt-1">{cs.solution}</p>
                        </div>
                        <div>
                          <strong className="text-gray-300">Resultat:</strong>
                          <ul className="list-disc list-inside text-green-400 mt-1">
                            {cs.results.map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        </div>
                        {cs.quote && (
                          <div>
                            <strong className="text-gray-300">Citat:</strong>
                            <p className="text-gray-400 italic mt-1">"{cs.quote}"</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => {
                      setGeneratedCases([]);
                      setSelectedProductForGeneration('');
                    }}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg"
                  >
                    Generera nya
                  </button>
                  <button
                    onClick={() => {
                      setShowGenerateModal(false);
                      setGeneratedCases([]);
                    }}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg"
                  >
                    Stäng
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const CaseForm: React.FC<{
  caseStudy: Omit<CaseStudy, 'id'> | CaseStudy;
  products: any[];
  onChange: (cs: Omit<CaseStudy, 'id'>) => void;
  onSave: () => void;
  onCancel: () => void;
  isEdit?: boolean;
}> = ({ caseStudy, products, onChange, onSave, onCancel, isEdit }) => {
  const update = (field: keyof Omit<CaseStudy, 'id'>, value: unknown) => {
    onChange({ ...caseStudy, [field]: value });
  };

  return (
    <div className={`${isEdit ? 'mt-4 pt-4 border-t border-gray-600' : 'bg-gray-700 rounded-lg p-4 mb-4'}`}>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Kundnamn</label>
          <input
            type="text"
            value={caseStudy.customer}
            onChange={(e) => update('customer', e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
            placeholder="t.ex. Stena Line"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Bransch</label>
          <input
            type="text"
            value={caseStudy.industry}
            onChange={(e) => update('industry', e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
            placeholder="t.ex. Transport & Logistik"
          />
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-1">Produkt (valfritt)</label>
        <select
          value={(caseStudy as any).productId || ''}
          onChange={(e) => update('productId', e.target.value || null)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
        >
          <option value="">Global (alla produkter)</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-1">Utmaning</label>
        <textarea
          value={caseStudy.challenge}
          onChange={(e) => update('challenge', e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white h-20"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-1">Lösning</label>
        <textarea
          value={caseStudy.solution}
          onChange={(e) => update('solution', e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white h-20"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-1">Resultat (ett per rad)</label>
        <textarea
          value={caseStudy.results.join('\n')}
          onChange={(e) => update('results', e.target.value.split('\n').filter(Boolean))}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white h-20"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-1">Citat (valfritt)</label>
        <input
          type="text"
          value={caseStudy.quote || ''}
          onChange={(e) => update('quote', e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
        />
      </div>
      <div className="mb-4">
        <label className="flex items-center gap-2 text-sm text-gray-400">
          <input
            type="checkbox"
            checked={caseStudy.isPublic}
            onChange={(e) => update('isPublic', e.target.checked)}
            className="rounded"
          />
          Publikt case (kan refereras i samtal)
        </label>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onSave}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
        >
          <Save size={18} />
          {isEdit ? 'Spara' : 'Lägg till'}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg"
        >
          Avbryt
        </button>
      </div>
    </div>
  );
};

// ============= OFFERS TAB =============
const OffersTab: React.FC = () => {
  const { offers, addOffer, updateOffer, deleteOffer } = useCoachingStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedProductForGeneration, setSelectedProductForGeneration] = useState<string>('');
  const [selectedProductFilter, setSelectedProductFilter] = useState<string>('');
  const [generatedOffers, setGeneratedOffers] = useState<Omit<Offer, 'id'>[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string>('');
  const products = useProducts();

  // Filter offers based on selected product
  const filteredOffers = offers.filter((offer) => {
    if (!selectedProductFilter) return true;
    // Only show items that match the selected product ID
    return offer.productId === selectedProductFilter;
  });

  console.log('Offers Filter Debug:', {
    selectedProductFilter,
    totalOffers: offers.length,
    filteredCount: filteredOffers.length,
    sampleProductIds: offers.slice(0, 3).map(o => o.productId)
  });
  const [newOffer, setNewOffer] = useState<Omit<Offer, 'id'>>({
    name: '',
    shortDescription: '',
    fullDescription: '',
    deliverables: [],
    duration: '',
    priceRange: { min: 0, max: 0, unit: 'fixed' as const },
    targetAudience: [],
    relatedCases: [],
    productId: null
  });

  const handleAdd = () => {
    if (!newOffer.name) return;
    addOffer(newOffer);
    setNewOffer({
      name: '',
      shortDescription: '',
      fullDescription: '',
      deliverables: [],
      duration: '',
      priceRange: { min: 0, max: 0, unit: 'fixed' as const },
      targetAudience: [],
      relatedCases: [],
      productId: null
    });
    setShowAddForm(false);
  };

  const handleGenerateOffers = async () => {
    if (!selectedProductForGeneration) {
      setGenerateError('Välj en produkt först');
      return;
    }

    setIsGenerating(true);
    setGenerateError('');
    setGeneratedOffers([]);

    try {
      const response = await fetch('/api/generate-offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProductForGeneration,
          count: 3
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Kunde inte generera erbjudanden');
      }

      const offersWithProductId = data.offers.map((offer: Omit<Offer, 'id'>) => ({
        ...offer,
        productId: selectedProductForGeneration,
        relatedCases: []
      }));

      setGeneratedOffers(offersWithProductId);

    } catch (error: any) {
      console.error('Generate offers error:', error);
      setGenerateError(error.message || 'Ett fel uppstod vid generering');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveGeneratedOffer = (offer: Omit<Offer, 'id'>) => {
    addOffer(offer);
    setGeneratedOffers(prev => prev.filter(o => o !== offer));
  };

  const handleSaveAllGeneratedOffers = () => {
    generatedOffers.forEach(offer => addOffer(offer));
    setGeneratedOffers([]);
    setShowGenerateModal(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Erbjudanden</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowGenerateModal(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2"
          >
            <Zap size={18} />
            Generera från produktdokument
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
          >
            <Plus size={18} />
            Lägg till manuellt
          </button>
        </div>
      </div>

      {/* Product Filter */}
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-2">Filtrera per produkt</label>
        <select
          value={selectedProductFilter}
          onChange={(e) => setSelectedProductFilter(e.target.value)}
          className="w-full max-w-xs px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
        >
          <option value="">Alla produkter</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {showAddForm && (
        <OfferForm
          offer={newOffer}
          products={products}
          onChange={setNewOffer}
          onSave={handleAdd}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <div className="space-y-3">
        {filteredOffers.map((offer) => (
          <div key={offer.id} className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-white">{offer.name}</h3>
                <p className="text-sm text-gray-400 mt-1">{offer.shortDescription}</p>
                {offer.productId && (
                  <span className="inline-block mt-2 text-xs bg-blue-600 text-white px-2 py-1 rounded">
                    {products.find(p => p.id === offer.productId)?.name || 'Produkt'}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingId(editingId === offer.id ? null : offer.id)}
                  className="p-2 hover:bg-gray-700 rounded-lg text-blue-400"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Vill du ta bort detta erbjudande?')) {
                      deleteOffer(offer.id);
                    }
                  }}
                  className="p-2 hover:bg-gray-700 rounded-lg text-red-400"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="text-sm text-gray-400 space-y-1">
              <div><strong>Pris:</strong> {offer.priceRange.min} - {offer.priceRange.max} kr ({offer.priceRange.unit === 'fixed' ? 'Fast pris' : offer.priceRange.unit === 'hourly' ? 'Per timme' : 'Per dag'})</div>
              <div><strong>Varaktighet:</strong> {offer.duration}</div>
              {offer.deliverables.length > 0 && (
                <div><strong>Leverabler:</strong> {offer.deliverables.join(', ')}</div>
              )}
              {offer.targetAudience.length > 0 && (
                <div><strong>Målgrupp:</strong> {offer.targetAudience.join(', ')}</div>
              )}
            </div>

            {editingId === offer.id && (
              <OfferForm
                offer={offer}
                products={products}
                onChange={(updated) => updateOffer(offer.id, updated)}
                onSave={() => setEditingId(null)}
                onCancel={() => setEditingId(null)}
                isEdit={true}
              />
            )}
          </div>
        ))}
      </div>

      {/* Generate Offers Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">Generera Erbjudanden från Produktdokument</h3>
              <button
                onClick={() => {
                  setShowGenerateModal(false);
                  setGeneratedOffers([]);
                  setGenerateError('');
                }}
                className="p-2 hover:bg-gray-700 rounded-lg text-gray-400"
              >
                <X size={20} />
              </button>
            </div>

            {generatedOffers.length === 0 ? (
              <div>
                <p className="text-gray-400 mb-4">
                  Välj en produkt för att generera erbjudanden baserat på uppladdade dokument.
                </p>

                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">Välj produkt</label>
                  <select
                    value={selectedProductForGeneration}
                    onChange={(e) => setSelectedProductForGeneration(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="">-- Välj en produkt --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {generateError && (
                  <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded-lg text-red-200">
                    {generateError}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={handleGenerateOffers}
                    disabled={!selectedProductForGeneration || isGenerating}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Genererar...
                      </>
                    ) : (
                      <>
                        <Zap size={18} />
                        Generera erbjudanden
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowGenerateModal(false);
                      setGenerateError('');
                    }}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg"
                  >
                    Avbryt
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <p className="text-gray-400">
                    {generatedOffers.length} erbjudanden genererade. Granska och spara de du vill ha.
                  </p>
                  <button
                    onClick={handleSaveAllGeneratedOffers}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
                  >
                    <Save size={18} />
                    Spara alla
                  </button>
                </div>

                <div className="space-y-4">
                  {generatedOffers.map((offer, idx) => (
                    <div key={idx} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-white text-lg">{offer.name}</h4>
                          <p className="text-sm text-gray-400 mt-1">{offer.shortDescription}</p>
                        </div>
                        <button
                          onClick={() => handleSaveGeneratedOffer(offer)}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm flex items-center gap-1"
                        >
                          <Save size={16} />
                          Spara
                        </button>
                      </div>

                      <div className="mt-3 space-y-2 text-sm">
                        <div>
                          <strong className="text-gray-300">Beskrivning:</strong>
                          <p className="text-gray-400 mt-1 whitespace-pre-wrap">{offer.fullDescription}</p>
                        </div>

                        <div>
                          <strong className="text-gray-300">Leverabler:</strong>
                          <ul className="list-disc list-inside text-gray-400 mt-1">
                            {offer.deliverables.map((d, i) => (
                              <li key={i}>{d}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <strong className="text-gray-300">Varaktighet:</strong>
                            <p className="text-gray-400">{offer.duration}</p>
                          </div>
                          <div>
                            <strong className="text-gray-300">Pris:</strong>
                            <p className="text-gray-400">
                              {offer.priceRange.min.toLocaleString()} - {offer.priceRange.max.toLocaleString()} kr
                              ({offer.priceRange.unit === 'fixed' ? 'Fast pris' : offer.priceRange.unit === 'hourly' ? 'Per timme' : 'Per dag'})
                            </p>
                          </div>
                        </div>

                        {offer.targetAudience.length > 0 && (
                          <div>
                            <strong className="text-gray-300">Målgrupp:</strong>
                            <p className="text-gray-400">{offer.targetAudience.join(', ')}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => {
                      setGeneratedOffers([]);
                      setSelectedProductForGeneration('');
                    }}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg"
                  >
                    Generera nya
                  </button>
                  <button
                    onClick={() => {
                      setShowGenerateModal(false);
                      setGeneratedOffers([]);
                    }}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg"
                  >
                    Stäng
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const OfferForm: React.FC<{
  offer: Omit<Offer, 'id'> | Offer;
  products: any[];
  onChange: (offer: Omit<Offer, 'id'>) => void;
  onSave: () => void;
  onCancel: () => void;
  isEdit?: boolean;
}> = ({ offer, products, onChange, onSave, onCancel, isEdit }) => {
  const update = (field: keyof Omit<Offer, 'id'>, value: unknown) => {
    onChange({ ...offer, [field]: value });
  };

  return (
    <div className={`${isEdit ? 'mt-4 pt-4 border-t border-gray-600' : 'bg-gray-700 rounded-lg p-4 mb-4'}`}>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Namn på erbjudandet</label>
          <input
            type="text"
            value={offer.name}
            onChange={(e) => update('name', e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
            placeholder="t.ex. Premium Coaching Paket"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Produkt (valfritt)</label>
          <select
            value={(offer as any).productId || ''}
            onChange={(e) => update('productId', e.target.value || null)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
          >
            <option value="">Global (alla produkter)</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-1">Kort beskrivning</label>
        <input
          type="text"
          value={offer.shortDescription}
          onChange={(e) => update('shortDescription', e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
          placeholder="En kort sammanfattning av erbjudandet"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-1">Fullständig beskrivning</label>
        <textarea
          value={offer.fullDescription}
          onChange={(e) => update('fullDescription', e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
          rows={4}
          placeholder="Detaljerad beskrivning av erbjudandet..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Varaktighet</label>
          <input
            type="text"
            value={offer.duration}
            onChange={(e) => update('duration', e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
            placeholder="t.ex. 3 månader, 10 timmar"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Pristyp</label>
          <select
            value={offer.priceRange.unit}
            onChange={(e) => update('priceRange', { ...offer.priceRange, unit: e.target.value as 'fixed' | 'hourly' | 'daily' })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
          >
            <option value="fixed">Fast pris</option>
            <option value="hourly">Per timme</option>
            <option value="daily">Per dag</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Minpris (kr)</label>
          <input
            type="number"
            value={offer.priceRange.min}
            onChange={(e) => update('priceRange', { ...offer.priceRange, min: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Maxpris (kr)</label>
          <input
            type="number"
            value={offer.priceRange.max}
            onChange={(e) => update('priceRange', { ...offer.priceRange, max: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-1">Leverabler (kommaseparerade)</label>
        <input
          type="text"
          value={offer.deliverables.join(', ')}
          onChange={(e) => update('deliverables', e.target.value.split(',').map(d => d.trim()).filter(Boolean))}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
          placeholder="Leverabel 1, Leverabel 2, Leverabel 3"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-1">Målgrupp (kommaseparerade)</label>
        <input
          type="text"
          value={offer.targetAudience.join(', ')}
          onChange={(e) => update('targetAudience', e.target.value.split(',').map(d => d.trim()).filter(Boolean))}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
          placeholder="Småföretag, Storföretag, Startups"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={onSave}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
        >
          <Save size={18} />
          {isEdit ? 'Spara' : 'Lägg till'}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg"
        >
          Avbryt
        </button>
      </div>
    </div>
  );
};
