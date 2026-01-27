import React, { useState } from 'react';
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
import { Battlecard, ObjectionHandler, CaseStudy, TriggerPattern } from '../types';

interface CoachingAdminPanelProps {
  onClose: () => void;
}

type TabType = 'triggers' | 'battlecards' | 'objections' | 'cases';

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
    { id: 'cases', label: 'Kundcase', icon: <BookOpen size={18} /> }
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
        </div>
      </div>
    </div>
  );
};

// === TRIGGERS TAB ===
const TriggersTab: React.FC = () => {
  const { triggerPatterns, addTriggerPattern, updateTriggerPattern, deleteTriggerPattern } = useCoachingStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTrigger, setNewTrigger] = useState({ id: '', keywords: '', response: 'objection' as TriggerPattern['response'], category: '' });
  const [showAddForm, setShowAddForm] = useState(false);

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
      category: newTrigger.category || undefined
    });
    setNewTrigger({ id: '', keywords: '', response: 'objection', category: '' });
    setShowAddForm(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Trigger-mönster</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
        >
          <Plus size={18} />
          Lägg till trigger
        </button>
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
        {Object.entries(triggerPatterns).map(([id, pattern]) => (
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
  const [newCard, setNewCard] = useState<Omit<Battlecard, 'id'>>({
    competitor: '',
    theirStrengths: [],
    theirWeaknesses: [],
    ourAdvantages: [],
    talkingPoints: [],
    commonObjections: []
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
      commonObjections: []
    });
    setShowAddForm(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Battlecards</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
        >
          <Plus size={18} />
          Lägg till battlecard
        </button>
      </div>

      {showAddForm && (
        <BattlecardForm
          battlecard={newCard}
          onChange={setNewCard}
          onSave={handleAdd}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <div className="space-y-4">
        {battlecards.map((bc) => (
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
    </div>
  );
};

const BattlecardForm: React.FC<{
  battlecard: Omit<Battlecard, 'id'> | Battlecard;
  onChange: (bc: Omit<Battlecard, 'id'>) => void;
  onSave: () => void;
  onCancel: () => void;
  isEdit?: boolean;
}> = ({ battlecard, onChange, onSave, onCancel, isEdit }) => {
  const update = (field: keyof Omit<Battlecard, 'id'>, value: string | string[]) => {
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
  const [newHandler, setNewHandler] = useState<Omit<ObjectionHandler, 'id'>>({
    objection: '',
    triggers: [],
    category: 'price',
    responses: { short: '', detailed: '', followUpQuestions: [] }
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
      responses: { short: '', detailed: '', followUpQuestions: [] }
    });
    setShowAddForm(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Invändningshantering</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
        >
          <Plus size={18} />
          Lägg till invändning
        </button>
      </div>

      {showAddForm && (
        <ObjectionForm
          handler={newHandler}
          categories={categories}
          onChange={setNewHandler}
          onSave={handleAdd}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <div className="space-y-4">
        {objectionHandlers.map((oh) => (
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
    </div>
  );
};

const ObjectionForm: React.FC<{
  handler: Omit<ObjectionHandler, 'id'> | ObjectionHandler;
  categories: { value: string; label: string }[];
  onChange: (h: Omit<ObjectionHandler, 'id'>) => void;
  onSave: () => void;
  onCancel: () => void;
  isEdit?: boolean;
}> = ({ handler, categories, onChange, onSave, onCancel, isEdit }) => {
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
  const [newCase, setNewCase] = useState<Omit<CaseStudy, 'id'>>({
    customer: '',
    industry: '',
    challenge: '',
    solution: '',
    results: [],
    quote: '',
    isPublic: true
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
      isPublic: true
    });
    setShowAddForm(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Kundcase</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
        >
          <Plus size={18} />
          Lägg till kundcase
        </button>
      </div>

      {showAddForm && (
        <CaseForm
          caseStudy={newCase}
          onChange={setNewCase}
          onSave={handleAdd}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <div className="space-y-4">
        {caseStudies.map((cs) => (
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
    </div>
  );
};

const CaseForm: React.FC<{
  caseStudy: Omit<CaseStudy, 'id'> | CaseStudy;
  onChange: (cs: Omit<CaseStudy, 'id'>) => void;
  onSave: () => void;
  onCancel: () => void;
  isEdit?: boolean;
}> = ({ caseStudy, onChange, onSave, onCancel, isEdit }) => {
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
