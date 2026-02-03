import React, { useState, useEffect } from 'react';
import {
  X,
  Package,
  Zap,
  Swords,
  AlertTriangle,
  BookOpen,
  Save,
  Plus,
  Edit2,
  Trash2,
  Activity
} from 'lucide-react';
import { useCoachingStore } from '../store/coachingStore';
import { supabase } from '../lib/supabase';

interface Product {
  id: string;
  name: string;
  description?: string | null;
}

interface ProductAdminPanelProps {
  onClose: () => void;
}

export const ProductAdminPanel: React.FC<ProductAdminPanelProps> = ({ onClose }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [generateProgress, setGenerateProgress] = useState<string>('');
  const [generateError, setGenerateError] = useState<string>('');

  // Edit modals state
  const [editingTrigger, setEditingTrigger] = useState<{ id: string; data: any } | null>(null);
  const [editingBattlecard, setEditingBattlecard] = useState<any | null>(null);
  const [editingObjection, setEditingObjection] = useState<any | null>(null);
  const [editingCase, setEditingCase] = useState<any | null>(null);
  const [editingOffer, setEditingOffer] = useState<any | null>(null);

  // Create modals state
  const [creatingTrigger, setCreatingTrigger] = useState(false);
  const [creatingBattlecard, setCreatingBattlecard] = useState(false);
  const [creatingObjection, setCreatingObjection] = useState(false);
  const [creatingCase, setCreatingCase] = useState(false);
  const [creatingOffer, setCreatingOffer] = useState(false);

  // Expanded sections state
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Scroll to expanded section
  useEffect(() => {
    if (expandedSection) {
      const element = document.getElementById(`section-${expandedSection}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [expandedSection]);

  const {
    triggerPatterns,
    battlecards,
    objectionHandlers,
    caseStudies,
    offers,
    addTriggerPattern,
    addBattlecard,
    addObjectionHandler,
    addCaseStudy,
    addOffer,
    updateTriggerPattern,
    updateBattlecard,
    updateObjectionHandler,
    updateCaseStudy,
    updateOffer,
    deleteTriggerPattern,
    deleteBattlecard,
    deleteObjectionHandler,
    deleteCaseStudy,
    deleteOffer
  } = useCoachingStore();

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

  // Filter coaching data by selected product (include both product-specific AND global data)
  const productTriggers = selectedProduct
    ? Object.entries(triggerPatterns).filter(([_, t]) =>
        t.productId === selectedProduct.id || t.productId === null || t.productId === undefined
      )
    : [];

  // DEBUG: Log trigger filtering
  console.log('🔍 Trigger Filter Debug:', {
    selectedProductFilter: selectedProduct?.id,
    totalTriggers: Object.keys(triggerPatterns).length,
    filteredCount: productTriggers.length,
    sampleTriggers: Object.entries(triggerPatterns).slice(0, 3).map(([id, t]) => ({
      id,
      productId: t.productId,
      productIdType: typeof t.productId,
      matchesSelected: t.productId === selectedProduct?.id,
      isNull: t.productId === null,
      isUndefined: t.productId === undefined
    })),
    uniqueProductIds: [...new Set(Object.values(triggerPatterns).map(t => t.productId || 'null/undefined'))]
  });

  const productBattlecards = selectedProduct
    ? battlecards.filter(bc =>
        bc.productId === selectedProduct.id || bc.productId === null || bc.productId === undefined
      )
    : [];

  const productObjections = selectedProduct
    ? objectionHandlers.filter(oh =>
        oh.productId === selectedProduct.id || oh.productId === null || oh.productId === undefined
      )
    : [];

  const productCases = selectedProduct
    ? caseStudies.filter(cs =>
        cs.productId === selectedProduct.id || cs.productId === null || cs.productId === undefined
      )
    : [];

  const productOffers = selectedProduct
    ? offers.filter(o =>
        o.productId === selectedProduct.id || o.productId === null || o.productId === undefined
      )
    : [];

  // Generate all coaching data for selected product
  const handleGenerateAll = async () => {
    if (!selectedProduct) return;

    setIsGeneratingAll(true);
    setGenerateError('');

    const types = [
      { name: 'Triggers', endpoint: '/api/generate-triggers', count: 5 },
      { name: 'Battlecards', endpoint: '/api/generate-battlecards', count: 3 },
      { name: 'Invändningar', endpoint: '/api/generate-objections', count: 5 },
      { name: 'Kundcase', endpoint: '/api/generate-cases', count: 3 },
      { name: 'Erbjudanden', endpoint: '/api/generate-offers', count: 3 }
    ];

    let successCount = 0;

    for (const type of types) {
      try {
        setGenerateProgress(`Genererar ${type.name}...`);

        const response = await fetch(type.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: selectedProduct.id,
            count: type.count
          })
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(`${type.name}: ${data.error}`);
        }

        // Save generated data
        if (type.name === 'Triggers') {
          data.triggers.forEach((trigger: any) => {
            addTriggerPattern(trigger.id, {
              keywords: trigger.keywords,
              response: trigger.response,
              category: trigger.category,
              productId: selectedProduct.id
            });
          });
        } else if (type.name === 'Battlecards') {
          data.battlecards.forEach((bc: any) => {
            addBattlecard({ ...bc, productId: selectedProduct.id });
          });
        } else if (type.name === 'Invändningar') {
          data.objections.forEach((obj: any) => {
            addObjectionHandler({ ...obj, productId: selectedProduct.id });
          });
        } else if (type.name === 'Kundcase') {
          data.cases.forEach((cs: any) => {
            addCaseStudy({ ...cs, productId: selectedProduct.id });
          });
        } else if (type.name === 'Erbjudanden') {
          data.offers.forEach((offer: any) => {
            addOffer({ ...offer, productId: selectedProduct.id, relatedCases: [] });
          });
        }

        successCount++;

      } catch (error: any) {
        console.error(`Error generating ${type.name}:`, error);
        setGenerateError(`Fel vid generering av ${type.name}: ${error.message}`);
        break;
      }
    }

    setGenerateProgress('');
    setIsGeneratingAll(false);

    if (successCount === types.length) {
      alert(`✅ Alla ${successCount} typer av coaching-data har genererats!`);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Produktadministration</h1>
            <p className="text-gray-400">Hantera all coaching-data kopplad till dina produkter</p>
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
            Välj produkt att administrera
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
            {/* Statistics Dashboard */}
            <div className="bg-gray-800 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Översikt - {selectedProduct.name}</h2>
                <button
                  onClick={handleGenerateAll}
                  disabled={isGeneratingAll}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2"
                >
                  {isGeneratingAll ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      {generateProgress || 'Genererar...'}
                    </>
                  ) : (
                    <>
                      <Zap size={18} />
                      Generera allt AI-innehåll
                    </>
                  )}
                </button>
              </div>

              {generateError && (
                <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded-lg text-red-200">
                  {generateError}
                </div>
              )}

              <div className="grid grid-cols-5 gap-4">
                <div
                  className="bg-gray-700 hover:bg-gray-600 rounded-lg p-4 cursor-pointer transition-colors"
                  onClick={() => setExpandedSection(expandedSection === 'triggers' ? null : 'triggers')}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="text-yellow-400" size={20} />
                    <span className="text-sm text-gray-400">Triggers</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{productTriggers.length}</p>
                </div>

                <div
                  className="bg-gray-700 hover:bg-gray-600 rounded-lg p-4 cursor-pointer transition-colors"
                  onClick={() => setExpandedSection(expandedSection === 'battlecards' ? null : 'battlecards')}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Swords className="text-red-400" size={20} />
                    <span className="text-sm text-gray-400">Battlecards</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{productBattlecards.length}</p>
                </div>

                <div
                  className="bg-gray-700 hover:bg-gray-600 rounded-lg p-4 cursor-pointer transition-colors"
                  onClick={() => setExpandedSection(expandedSection === 'objections' ? null : 'objections')}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="text-orange-400" size={20} />
                    <span className="text-sm text-gray-400">Invändningar</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{productObjections.length}</p>
                </div>

                <div
                  className="bg-gray-700 hover:bg-gray-600 rounded-lg p-4 cursor-pointer transition-colors"
                  onClick={() => setExpandedSection(expandedSection === 'cases' ? null : 'cases')}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="text-blue-400" size={20} />
                    <span className="text-sm text-gray-400">Kundcase</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{productCases.length}</p>
                </div>

                <div
                  className="bg-gray-700 hover:bg-gray-600 rounded-lg p-4 cursor-pointer transition-colors"
                  onClick={() => setExpandedSection(expandedSection === 'offers' ? null : 'offers')}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Save className="text-green-400" size={20} />
                    <span className="text-sm text-gray-400">Erbjudanden</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{productOffers.length}</p>
                </div>
              </div>
            </div>

            {/* Coaching Data Sections */}
            <div className="space-y-6">
              {/* Show all sections when nothing is expanded, otherwise only show the expanded section */}
              {(!expandedSection || expandedSection === 'triggers') && (
                <CoachingSection
                  id="triggers"
                  title="Triggers"
                  icon={<Zap className="text-yellow-400" size={20} />}
                  count={productTriggers.length}
                  items={productTriggers.map(([id, trigger]) => ({
                    id,
                    title: id,
                    subtitle: trigger.keywords.join(', '),
                    badge: trigger.response
                  }))}
                  onAdd={() => setCreatingTrigger(true)}
                  onEdit={(id) => {
                    const trigger = productTriggers.find(([triggerId]) => triggerId === id);
                    if (trigger) {
                      setEditingTrigger({ id: trigger[0], data: trigger[1] });
                    }
                  }}
                  onDelete={(id) => {
                    if (confirm('Är du säker på att du vill radera denna trigger?')) {
                      deleteTriggerPattern(id);
                    }
                  }}
                  isExpanded={expandedSection === 'triggers'}
                  onToggle={() => setExpandedSection(expandedSection === 'triggers' ? null : 'triggers')}
                />
              )}

              {(!expandedSection || expandedSection === 'battlecards') && (
                <CoachingSection
                  id="battlecards"
                  title="Battlecards"
                  icon={<Swords className="text-red-400" size={20} />}
                  count={productBattlecards.length}
                  items={productBattlecards.map(bc => ({
                    id: bc.id,
                    title: `vs ${bc.competitor}`,
                    subtitle: `${bc.ourAdvantages.length} fördelar • ${bc.talkingPoints.length} argumentationspunkter`
                  }))}
                  onAdd={() => setCreatingBattlecard(true)}
                  onEdit={(id) => {
                    const bc = productBattlecards.find(b => b.id === id);
                    if (bc) setEditingBattlecard(bc);
                  }}
                  onDelete={(id) => {
                    if (confirm('Är du säker på att du vill radera detta battlecard?')) {
                      deleteBattlecard(id);
                    }
                  }}
                  isExpanded={expandedSection === 'battlecards'}
                  onToggle={() => setExpandedSection(expandedSection === 'battlecards' ? null : 'battlecards')}
                />
              )}

              {(!expandedSection || expandedSection === 'objections') && (
                <CoachingSection
                  id="objections"
                  title="Invändningar"
                  icon={<AlertTriangle className="text-orange-400" size={20} />}
                  count={productObjections.length}
                  items={productObjections.map(oh => ({
                    id: oh.id,
                    title: oh.objection,
                    subtitle: oh.triggers.join(', '),
                    badge: oh.category
                  }))}
                  onAdd={() => setCreatingObjection(true)}
                  onEdit={(id) => {
                    const oh = productObjections.find(o => o.id === id);
                    if (oh) setEditingObjection(oh);
                  }}
                  onDelete={(id) => {
                    if (confirm('Är du säker på att du vill radera denna invändning?')) {
                      deleteObjectionHandler(id);
                    }
                  }}
                  isExpanded={expandedSection === 'objections'}
                  onToggle={() => setExpandedSection(expandedSection === 'objections' ? null : 'objections')}
                />
              )}

              {(!expandedSection || expandedSection === 'cases') && (
                <CoachingSection
                  id="cases"
                  title="Kundcase"
                  icon={<BookOpen className="text-blue-400" size={20} />}
                  count={productCases.length}
                  items={productCases.map(cs => ({
                    id: cs.id,
                    title: cs.customer,
                    subtitle: `${cs.industry} • ${cs.results.length} resultat`
                  }))}
                  onAdd={() => setCreatingCase(true)}
                  onEdit={(id) => {
                    const cs = productCases.find(c => c.id === id);
                    if (cs) setEditingCase(cs);
                  }}
                  onDelete={(id) => {
                    if (confirm('Är du säker på att du vill radera detta kundcase?')) {
                      deleteCaseStudy(id);
                    }
                  }}
                  isExpanded={expandedSection === 'cases'}
                  onToggle={() => setExpandedSection(expandedSection === 'cases' ? null : 'cases')}
                />
              )}

              {(!expandedSection || expandedSection === 'offers') && (
                <CoachingSection
                  id="offers"
                  title="Erbjudanden"
                  icon={<Save className="text-green-400" size={20} />}
                  count={productOffers.length}
                  items={productOffers.map(offer => ({
                    id: offer.id,
                    title: offer.name,
                    subtitle: `${offer.priceRange.min.toLocaleString()} - ${offer.priceRange.max.toLocaleString()} kr • ${offer.duration}`
                  }))}
                  onAdd={() => setCreatingOffer(true)}
                  onEdit={(id) => {
                    const offer = productOffers.find(o => o.id === id);
                    if (offer) setEditingOffer(offer);
                  }}
                  onDelete={(id) => {
                    if (confirm('Är du säker på att du vill radera detta erbjudande?')) {
                      deleteOffer(id);
                    }
                  }}
                  isExpanded={expandedSection === 'offers'}
                  onToggle={() => setExpandedSection(expandedSection === 'offers' ? null : 'offers')}
                />
              )}
            </div>
          </>
        )}

        {/* Edit Modals */}
        {editingTrigger && (
          <TriggerEditModal
            trigger={editingTrigger}
            onClose={() => setEditingTrigger(null)}
            onSave={(updatedData) => {
              updateTriggerPattern(editingTrigger.id, updatedData);
              setEditingTrigger(null);
            }}
          />
        )}

        {editingBattlecard && (
          <BattlecardEditModal
            battlecard={editingBattlecard}
            onClose={() => setEditingBattlecard(null)}
            onSave={(updatedData) => {
              updateBattlecard(editingBattlecard.id, updatedData);
              setEditingBattlecard(null);
            }}
          />
        )}

        {editingObjection && (
          <ObjectionEditModal
            objection={editingObjection}
            onClose={() => setEditingObjection(null)}
            onSave={(updatedData) => {
              updateObjectionHandler(editingObjection.id, updatedData);
              setEditingObjection(null);
            }}
          />
        )}

        {editingCase && (
          <CaseStudyEditModal
            caseStudy={editingCase}
            onClose={() => setEditingCase(null)}
            onSave={(updatedData) => {
              updateCaseStudy(editingCase.id, updatedData);
              setEditingCase(null);
            }}
          />
        )}

        {editingOffer && (
          <OfferEditModal
            offer={editingOffer}
            onClose={() => setEditingOffer(null)}
            onSave={(updatedData) => {
              updateOffer(editingOffer.id, updatedData);
              setEditingOffer(null);
            }}
          />
        )}

        {/* Create Modals */}
        {creatingTrigger && selectedProduct && (
          <TriggerCreateModal
            productId={selectedProduct.id}
            onClose={() => setCreatingTrigger(false)}
            onSave={(triggerId, triggerData) => {
              addTriggerPattern(triggerId, triggerData);
              setCreatingTrigger(false);
            }}
          />
        )}

        {creatingBattlecard && selectedProduct && (
          <BattlecardCreateModal
            productId={selectedProduct.id}
            onClose={() => setCreatingBattlecard(false)}
            onSave={(battlecardData) => {
              addBattlecard(battlecardData);
              setCreatingBattlecard(false);
            }}
          />
        )}

        {creatingObjection && selectedProduct && (
          <ObjectionCreateModal
            productId={selectedProduct.id}
            onClose={() => setCreatingObjection(false)}
            onSave={(objectionData) => {
              addObjectionHandler(objectionData);
              setCreatingObjection(false);
            }}
          />
        )}

        {creatingCase && selectedProduct && (
          <CaseStudyCreateModal
            productId={selectedProduct.id}
            onClose={() => setCreatingCase(false)}
            onSave={(caseData) => {
              addCaseStudy(caseData);
              setCreatingCase(false);
            }}
          />
        )}

        {creatingOffer && selectedProduct && (
          <OfferCreateModal
            productId={selectedProduct.id}
            onClose={() => setCreatingOffer(false)}
            onSave={(offerData) => {
              addOffer(offerData);
              setCreatingOffer(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

// Reusable section component
interface CoachingSectionProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  count: number;
  items: Array<{
    id: string;
    title: string;
    subtitle: string;
    badge?: string;
  }>;
  onAdd: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isExpanded: boolean;
  onToggle: () => void;
}

const CoachingSection: React.FC<CoachingSectionProps> = ({ id, title, icon, count, items, onAdd, onEdit, onDelete, isExpanded, onToggle }) => {
  return (
    <div id={`section-${id}`} className="bg-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between">
        <div
          className="flex items-center gap-3 flex-1 cursor-pointer"
          onClick={onToggle}
        >
          {icon}
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <span className="px-2 py-0.5 bg-gray-700 text-xs rounded text-gray-300">
            {count}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAdd();
            }}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm flex items-center gap-1"
          >
            <Plus size={16} />
            Lägg till
          </button>
          <Activity
            size={18}
            className={`text-gray-400 transition-transform cursor-pointer ${isExpanded ? 'rotate-90' : ''}`}
            onClick={onToggle}
          />
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-2">
          {items.length === 0 ? (
            <p className="text-gray-500 text-sm">Inga {title.toLowerCase()} än. Klicka "Lägg till" för att skapa manuellt eller använd "Generera allt AI-innehåll".</p>
          ) : (
            items.map(item => (
              <div key={item.id} className="bg-gray-700 rounded-lg p-3 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-white text-sm">{item.title}</h4>
                    {item.badge && (
                      <span className="px-2 py-0.5 bg-gray-600 text-xs rounded text-gray-300">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{item.subtitle}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(item.id);
                    }}
                    className="p-1 hover:bg-gray-600 rounded text-gray-400"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.id);
                    }}
                    className="p-1 hover:bg-red-600/20 rounded text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// Edit Modal Components
interface TriggerEditModalProps {
  trigger: { id: string; data: any };
  onClose: () => void;
  onSave: (data: any) => void;
}

const TriggerEditModal: React.FC<TriggerEditModalProps> = ({ trigger, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    keywords: trigger.data.keywords || [],
    response: trigger.data.response || 'solution',
    category: trigger.data.category || 'features'
  });
  const [keywordInput, setKeywordInput] = useState('');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
      <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Redigera Trigger: {trigger.id}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nyckelord</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && keywordInput.trim()) {
                    setFormData({ ...formData, keywords: [...formData.keywords, keywordInput.trim()] });
                    setKeywordInput('');
                  }
                }}
                placeholder="Lägg till nyckelord (tryck Enter)"
                className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
              <button
                onClick={() => {
                  if (keywordInput.trim()) {
                    setFormData({ ...formData, keywords: [...formData.keywords, keywordInput.trim()] });
                    setKeywordInput('');
                  }
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.keywords.map((kw: string, idx: number) => (
                <span key={idx} className="px-3 py-1 bg-gray-700 text-white rounded-full text-sm flex items-center gap-2">
                  {kw}
                  <button
                    onClick={() => setFormData({ ...formData, keywords: formData.keywords.filter((_: string, i: number) => i !== idx) })}
                    className="text-gray-400 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Responstyp</label>
            <select
              value={formData.response}
              onChange={(e) => setFormData({ ...formData, response: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            >
              <option value="objection">Objection</option>
              <option value="battlecard">Battlecard</option>
              <option value="offer">Offer</option>
              <option value="solution">Solution</option>
              <option value="expand">Expand</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Kategori</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            >
              <option value="features">Features</option>
              <option value="price">Price</option>
              <option value="timing">Timing</option>
              <option value="competition">Competition</option>
              <option value="trust">Trust</option>
              <option value="need">Need</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => onSave(formData)}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Spara
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
// Helper component for array inputs
interface ArrayInputSectionProps {
  title: string;
  items: string[];
  newValue: string;
  setNewValue: (value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

const ArrayInputSection: React.FC<ArrayInputSectionProps> = ({ title, items, newValue, setNewValue, onAdd, onRemove }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">{title}</label>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onAdd();
            }
          }}
          placeholder={`Lägg till ${title.toLowerCase()}`}
          className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
        />
        <button
          onClick={onAdd}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          <Plus size={20} />
        </button>
      </div>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 bg-gray-700 px-3 py-2 rounded">
            <span className="flex-1 text-white text-sm">{item}</span>
            <button
              onClick={() => onRemove(idx)}
              className="text-gray-400 hover:text-red-400"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

interface BattlecardEditModalProps {
  battlecard: any;
  onClose: () => void;
  onSave: (data: any) => void;
}

const BattlecardEditModal: React.FC<BattlecardEditModalProps> = ({ battlecard, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    competitor: battlecard.competitor || '',
    theirStrengths: battlecard.theirStrengths || [],
    theirWeaknesses: battlecard.theirWeaknesses || [],
    ourAdvantages: battlecard.ourAdvantages || [],
    talkingPoints: battlecard.talkingPoints || [],
    commonObjections: battlecard.commonObjections || []
  });

  const [newStrength, setNewStrength] = useState('');
  const [newWeakness, setNewWeakness] = useState('');
  const [newAdvantage, setNewAdvantage] = useState('');
  const [newTalkingPoint, setNewTalkingPoint] = useState('');
  const [newObjection, setNewObjection] = useState('');

  const addToArray = (field: string, value: string, setValue: (v: string) => void) => {
    if (value.trim()) {
      setFormData({ ...formData, [field]: [...(formData as any)[field], value.trim()] });
      setValue('');
    }
  };

  const removeFromArray = (field: string, index: number) => {
    setFormData({ ...formData, [field]: (formData as any)[field].filter((_: any, i: number) => i !== index) });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
      <div className="bg-gray-800 rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Redigera Battlecard vs {battlecard.competitor}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Konkurrent</label>
            <input
              type="text"
              value={formData.competitor}
              onChange={(e) => setFormData({ ...formData, competitor: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>

          <ArrayInputSection
            title="Deras styrkor"
            items={formData.theirStrengths}
            newValue={newStrength}
            setNewValue={setNewStrength}
            onAdd={() => addToArray('theirStrengths', newStrength, setNewStrength)}
            onRemove={(idx) => removeFromArray('theirStrengths', idx)}
          />

          <ArrayInputSection
            title="Deras svagheter"
            items={formData.theirWeaknesses}
            newValue={newWeakness}
            setNewValue={setNewWeakness}
            onAdd={() => addToArray('theirWeaknesses', newWeakness, setNewWeakness)}
            onRemove={(idx) => removeFromArray('theirWeaknesses', idx)}
          />

          <ArrayInputSection
            title="Våra fördelar"
            items={formData.ourAdvantages}
            newValue={newAdvantage}
            setNewValue={setNewAdvantage}
            onAdd={() => addToArray('ourAdvantages', newAdvantage, setNewAdvantage)}
            onRemove={(idx) => removeFromArray('ourAdvantages', idx)}
          />

          <ArrayInputSection
            title="Argumentationspunkter"
            items={formData.talkingPoints}
            newValue={newTalkingPoint}
            setNewValue={setNewTalkingPoint}
            onAdd={() => addToArray('talkingPoints', newTalkingPoint, setNewTalkingPoint)}
            onRemove={(idx) => removeFromArray('talkingPoints', idx)}
          />

          <ArrayInputSection
            title="Vanliga invändningar"
            items={formData.commonObjections}
            newValue={newObjection}
            setNewValue={setNewObjection}
            onAdd={() => addToArray('commonObjections', newObjection, setNewObjection)}
            onRemove={(idx) => removeFromArray('commonObjections', idx)}
          />
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={() => onSave(formData)} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
            Spara
          </button>
          <button onClick={onClose} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">
            Avbryt
          </button>
        </div>
      </div>
    </div>
  );
};

interface ObjectionEditModalProps {
  objection: any;
  onClose: () => void;
  onSave: (data: any) => void;
}

const ObjectionEditModal: React.FC<ObjectionEditModalProps> = ({ objection, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    objection: objection.objection || '',
    triggers: objection.triggers || [],
    category: objection.category || 'price',
    responses: {
      short: objection.responses?.short || '',
      detailed: objection.responses?.detailed || '',
      followUpQuestions: objection.responses?.followUpQuestions || []
    }
  });

  const [newTrigger, setNewTrigger] = useState('');
  const [newQuestion, setNewQuestion] = useState('');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
      <div className="bg-gray-800 rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Redigera Invändning</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Invändning</label>
            <textarea
              value={formData.objection}
              onChange={(e) => setFormData({ ...formData, objection: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Kategori</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            >
              <option value="price">Price</option>
              <option value="timing">Timing</option>
              <option value="competition">Competition</option>
              <option value="trust">Trust</option>
              <option value="need">Need</option>
            </select>
          </div>

          <ArrayInputSection
            title="Triggers"
            items={formData.triggers}
            newValue={newTrigger}
            setNewValue={setNewTrigger}
            onAdd={() => {
              if (newTrigger.trim()) {
                setFormData({ ...formData, triggers: [...formData.triggers, newTrigger.trim()] });
                setNewTrigger('');
              }
            }}
            onRemove={(idx) => setFormData({ ...formData, triggers: formData.triggers.filter((_: string, i: number) => i !== idx) })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Kort svar</label>
            <textarea
              value={formData.responses.short}
              onChange={(e) => setFormData({ ...formData, responses: { ...formData.responses, short: e.target.value } })}
              rows={3}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Detaljerat svar</label>
            <textarea
              value={formData.responses.detailed}
              onChange={(e) => setFormData({ ...formData, responses: { ...formData.responses, detailed: e.target.value } })}
              rows={6}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>

          <ArrayInputSection
            title="Uppföljningsfrågor"
            items={formData.responses.followUpQuestions}
            newValue={newQuestion}
            setNewValue={setNewQuestion}
            onAdd={() => {
              if (newQuestion.trim()) {
                setFormData({
                  ...formData,
                  responses: {
                    ...formData.responses,
                    followUpQuestions: [...formData.responses.followUpQuestions, newQuestion.trim()]
                  }
                });
                setNewQuestion('');
              }
            }}
            onRemove={(idx) => setFormData({
              ...formData,
              responses: {
                ...formData.responses,
                followUpQuestions: formData.responses.followUpQuestions.filter((_: string, i: number) => i !== idx)
              }
            })}
          />
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={() => onSave(formData)} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
            Spara
          </button>
          <button onClick={onClose} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">
            Avbryt
          </button>
        </div>
      </div>
    </div>
  );
};

interface CaseStudyEditModalProps {
  caseStudy: any;
  onClose: () => void;
  onSave: (data: any) => void;
}

const CaseStudyEditModal: React.FC<CaseStudyEditModalProps> = ({ caseStudy, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    customer: caseStudy.customer || '',
    industry: caseStudy.industry || '',
    challenge: caseStudy.challenge || '',
    solution: caseStudy.solution || '',
    results: caseStudy.results || [],
    quote: caseStudy.quote || '',
    isPublic: caseStudy.isPublic !== false
  });

  const [newResult, setNewResult] = useState('');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
      <div className="bg-gray-800 rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Redigera Kundcase</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Kund</label>
            <input
              type="text"
              value={formData.customer}
              onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Bransch</label>
            <input
              type="text"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Utmaning</label>
            <textarea
              value={formData.challenge}
              onChange={(e) => setFormData({ ...formData, challenge: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Lösning</label>
            <textarea
              value={formData.solution}
              onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>

          <ArrayInputSection
            title="Resultat"
            items={formData.results}
            newValue={newResult}
            setNewValue={setNewResult}
            onAdd={() => {
              if (newResult.trim()) {
                setFormData({ ...formData, results: [...formData.results, newResult.trim()] });
                setNewResult('');
              }
            }}
            onRemove={(idx) => setFormData({ ...formData, results: formData.results.filter((_: string, i: number) => i !== idx) })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Citat</label>
            <textarea
              value={formData.quote}
              onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isPublic"
              checked={formData.isPublic}
              onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="isPublic" className="text-sm text-gray-300">Publikt case (kan delas med kunder)</label>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={() => onSave(formData)} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
            Spara
          </button>
          <button onClick={onClose} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">
            Avbryt
          </button>
        </div>
      </div>
    </div>
  );
};

interface OfferEditModalProps {
  offer: any;
  onClose: () => void;
  onSave: (data: any) => void;
}

const OfferEditModal: React.FC<OfferEditModalProps> = ({ offer, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: offer.name || '',
    shortDescription: offer.shortDescription || '',
    fullDescription: offer.fullDescription || '',
    deliverables: offer.deliverables || [],
    duration: offer.duration || '',
    priceRange: {
      min: offer.priceRange?.min || 0,
      max: offer.priceRange?.max || 0,
      unit: offer.priceRange?.unit || 'fixed'
    },
    targetAudience: offer.targetAudience || []
  });

  const [newDeliverable, setNewDeliverable] = useState('');
  const [newAudience, setNewAudience] = useState('');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
      <div className="bg-gray-800 rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Redigera Erbjudande</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Namn</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Kort beskrivning</label>
            <textarea
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Fullständig beskrivning</label>
            <textarea
              value={formData.fullDescription}
              onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>

          <ArrayInputSection
            title="Leverabler"
            items={formData.deliverables}
            newValue={newDeliverable}
            setNewValue={setNewDeliverable}
            onAdd={() => {
              if (newDeliverable.trim()) {
                setFormData({ ...formData, deliverables: [...formData.deliverables, newDeliverable.trim()] });
                setNewDeliverable('');
              }
            }}
            onRemove={(idx) => setFormData({ ...formData, deliverables: formData.deliverables.filter((_: string, i: number) => i !== idx) })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Varaktighet</label>
            <input
              type="text"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="t.ex. 3 månader"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Min pris (kr)</label>
              <input
                type="number"
                value={formData.priceRange.min}
                onChange={(e) => setFormData({ ...formData, priceRange: { ...formData.priceRange, min: parseInt(e.target.value) || 0 } })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Max pris (kr)</label>
              <input
                type="number"
                value={formData.priceRange.max}
                onChange={(e) => setFormData({ ...formData, priceRange: { ...formData.priceRange, max: parseInt(e.target.value) || 0 } })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Enhet</label>
              <select
                value={formData.priceRange.unit}
                onChange={(e) => setFormData({ ...formData, priceRange: { ...formData.priceRange, unit: e.target.value as any } })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              >
                <option value="fixed">Fast pris</option>
                <option value="hourly">Per timme</option>
                <option value="daily">Per dag</option>
              </select>
            </div>
          </div>

          <ArrayInputSection
            title="Målgrupp"
            items={formData.targetAudience}
            newValue={newAudience}
            setNewValue={setNewAudience}
            onAdd={() => {
              if (newAudience.trim()) {
                setFormData({ ...formData, targetAudience: [...formData.targetAudience, newAudience.trim()] });
                setNewAudience('');
              }
            }}
            onRemove={(idx) => setFormData({ ...formData, targetAudience: formData.targetAudience.filter((_: string, i: number) => i !== idx) })}
          />
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={() => onSave(formData)} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
            Spara
          </button>
          <button onClick={onClose} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">
            Avbryt
          </button>
        </div>
      </div>
    </div>
  );
};
// Create Modal Components
interface TriggerCreateModalProps {
  productId: string;
  onClose: () => void;
  onSave: (triggerId: string, data: any) => void;
}

const TriggerCreateModal: React.FC<TriggerCreateModalProps> = ({ productId, onClose, onSave }) => {
  const [triggerId, setTriggerId] = useState('');
  const [formData, setFormData] = useState({
    keywords: [] as string[],
    response: 'solution',
    category: 'features',
    productId
  });
  const [keywordInput, setKeywordInput] = useState('');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
      <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Skapa Ny Trigger</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Trigger ID</label>
            <input
              type="text"
              value={triggerId}
              onChange={(e) => setTriggerId(e.target.value)}
              placeholder="t.ex. price_discussion"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nyckelord</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && keywordInput.trim()) {
                    setFormData({ ...formData, keywords: [...formData.keywords, keywordInput.trim()] });
                    setKeywordInput('');
                  }
                }}
                placeholder="Lägg till nyckelord (tryck Enter)"
                className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
              <button
                onClick={() => {
                  if (keywordInput.trim()) {
                    setFormData({ ...formData, keywords: [...formData.keywords, keywordInput.trim()] });
                    setKeywordInput('');
                  }
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.keywords.map((kw: string, idx: number) => (
                <span key={idx} className="px-3 py-1 bg-gray-700 text-white rounded-full text-sm flex items-center gap-2">
                  {kw}
                  <button
                    onClick={() => setFormData({ ...formData, keywords: formData.keywords.filter((_: string, i: number) => i !== idx) })}
                    className="text-gray-400 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Responstyp</label>
            <select
              value={formData.response}
              onChange={(e) => setFormData({ ...formData, response: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            >
              <option value="objection">Objection</option>
              <option value="battlecard">Battlecard</option>
              <option value="offer">Offer</option>
              <option value="solution">Solution</option>
              <option value="expand">Expand</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Kategori</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            >
              <option value="features">Features</option>
              <option value="price">Price</option>
              <option value="timing">Timing</option>
              <option value="competition">Competition</option>
              <option value="trust">Trust</option>
              <option value="need">Need</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => {
              if (triggerId.trim()) {
                onSave(triggerId.trim(), formData);
              }
            }}
            disabled={!triggerId.trim() || formData.keywords.length === 0}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Skapa
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

interface BattlecardCreateModalProps {
  productId: string;
  onClose: () => void;
  onSave: (data: any) => void;
}

const BattlecardCreateModal: React.FC<BattlecardCreateModalProps> = ({ productId, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    competitor: '',
    theirStrengths: [] as string[],
    theirWeaknesses: [] as string[],
    ourAdvantages: [] as string[],
    talkingPoints: [] as string[],
    commonObjections: [] as string[],
    productId
  });

  const [newStrength, setNewStrength] = useState('');
  const [newWeakness, setNewWeakness] = useState('');
  const [newAdvantage, setNewAdvantage] = useState('');
  const [newTalkingPoint, setNewTalkingPoint] = useState('');
  const [newObjection, setNewObjection] = useState('');

  const addToArray = (field: string, value: string, setValue: (v: string) => void) => {
    if (value.trim()) {
      setFormData({ ...formData, [field]: [...(formData as any)[field], value.trim()] });
      setValue('');
    }
  };

  const removeFromArray = (field: string, index: number) => {
    setFormData({ ...formData, [field]: (formData as any)[field].filter((_: any, i: number) => i !== index) });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
      <div className="bg-gray-800 rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Skapa Nytt Battlecard</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Konkurrent</label>
            <input
              type="text"
              value={formData.competitor}
              onChange={(e) => setFormData({ ...formData, competitor: e.target.value })}
              placeholder="t.ex. Microsoft, Salesforce"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>

          <ArrayInputSection
            title="Deras styrkor"
            items={formData.theirStrengths}
            newValue={newStrength}
            setNewValue={setNewStrength}
            onAdd={() => addToArray('theirStrengths', newStrength, setNewStrength)}
            onRemove={(idx) => removeFromArray('theirStrengths', idx)}
          />

          <ArrayInputSection
            title="Deras svagheter"
            items={formData.theirWeaknesses}
            newValue={newWeakness}
            setNewValue={setNewWeakness}
            onAdd={() => addToArray('theirWeaknesses', newWeakness, setNewWeakness)}
            onRemove={(idx) => removeFromArray('theirWeaknesses', idx)}
          />

          <ArrayInputSection
            title="Våra fördelar"
            items={formData.ourAdvantages}
            newValue={newAdvantage}
            setNewValue={setNewAdvantage}
            onAdd={() => addToArray('ourAdvantages', newAdvantage, setNewAdvantage)}
            onRemove={(idx) => removeFromArray('ourAdvantages', idx)}
          />

          <ArrayInputSection
            title="Argumentationspunkter"
            items={formData.talkingPoints}
            newValue={newTalkingPoint}
            setNewValue={setNewTalkingPoint}
            onAdd={() => addToArray('talkingPoints', newTalkingPoint, setNewTalkingPoint)}
            onRemove={(idx) => removeFromArray('talkingPoints', idx)}
          />

          <ArrayInputSection
            title="Vanliga invändningar"
            items={formData.commonObjections}
            newValue={newObjection}
            setNewValue={setNewObjection}
            onAdd={() => addToArray('commonObjections', newObjection, setNewObjection)}
            onRemove={(idx) => removeFromArray('commonObjections', idx)}
          />
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => onSave(formData)}
            disabled={!formData.competitor.trim()}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Skapa
          </button>
          <button onClick={onClose} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">
            Avbryt
          </button>
        </div>
      </div>
    </div>
  );
};

interface ObjectionCreateModalProps {
  productId: string;
  onClose: () => void;
  onSave: (data: any) => void;
}

const ObjectionCreateModal: React.FC<ObjectionCreateModalProps> = ({ productId, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    objection: '',
    triggers: [] as string[],
    category: 'price',
    responses: {
      short: '',
      detailed: '',
      followUpQuestions: [] as string[]
    },
    productId
  });

  const [newTrigger, setNewTrigger] = useState('');
  const [newQuestion, setNewQuestion] = useState('');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
      <div className="bg-gray-800 rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Skapa Ny Invändning</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Invändning</label>
            <textarea
              value={formData.objection}
              onChange={(e) => setFormData({ ...formData, objection: e.target.value })}
              rows={2}
              placeholder="t.ex. Det är för dyrt"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Kategori</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            >
              <option value="price">Price</option>
              <option value="timing">Timing</option>
              <option value="competition">Competition</option>
              <option value="trust">Trust</option>
              <option value="need">Need</option>
            </select>
          </div>

          <ArrayInputSection
            title="Triggers"
            items={formData.triggers}
            newValue={newTrigger}
            setNewValue={setNewTrigger}
            onAdd={() => {
              if (newTrigger.trim()) {
                setFormData({ ...formData, triggers: [...formData.triggers, newTrigger.trim()] });
                setNewTrigger('');
              }
            }}
            onRemove={(idx) => setFormData({ ...formData, triggers: formData.triggers.filter((_: string, i: number) => i !== idx) })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Kort svar</label>
            <textarea
              value={formData.responses.short}
              onChange={(e) => setFormData({ ...formData, responses: { ...formData.responses, short: e.target.value } })}
              rows={3}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Detaljerat svar</label>
            <textarea
              value={formData.responses.detailed}
              onChange={(e) => setFormData({ ...formData, responses: { ...formData.responses, detailed: e.target.value } })}
              rows={6}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>

          <ArrayInputSection
            title="Uppföljningsfrågor"
            items={formData.responses.followUpQuestions}
            newValue={newQuestion}
            setNewValue={setNewQuestion}
            onAdd={() => {
              if (newQuestion.trim()) {
                setFormData({
                  ...formData,
                  responses: {
                    ...formData.responses,
                    followUpQuestions: [...formData.responses.followUpQuestions, newQuestion.trim()]
                  }
                });
                setNewQuestion('');
              }
            }}
            onRemove={(idx) => setFormData({
              ...formData,
              responses: {
                ...formData.responses,
                followUpQuestions: formData.responses.followUpQuestions.filter((_: string, i: number) => i !== idx)
              }
            })}
          />
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => onSave(formData)}
            disabled={!formData.objection.trim()}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Skapa
          </button>
          <button onClick={onClose} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">
            Avbryt
          </button>
        </div>
      </div>
    </div>
  );
};

interface CaseStudyCreateModalProps {
  productId: string;
  onClose: () => void;
  onSave: (data: any) => void;
}

const CaseStudyCreateModal: React.FC<CaseStudyCreateModalProps> = ({ productId, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    customer: '',
    industry: '',
    challenge: '',
    solution: '',
    results: [] as string[],
    quote: '',
    isPublic: true,
    productId
  });

  const [newResult, setNewResult] = useState('');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
      <div className="bg-gray-800 rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Skapa Nytt Kundcase</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Kund</label>
            <input
              type="text"
              value={formData.customer}
              onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
              placeholder="t.ex. Acme AB"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Bransch</label>
            <input
              type="text"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              placeholder="t.ex. Tillverkning"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Utmaning</label>
            <textarea
              value={formData.challenge}
              onChange={(e) => setFormData({ ...formData, challenge: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Lösning</label>
            <textarea
              value={formData.solution}
              onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>

          <ArrayInputSection
            title="Resultat"
            items={formData.results}
            newValue={newResult}
            setNewValue={setNewResult}
            onAdd={() => {
              if (newResult.trim()) {
                setFormData({ ...formData, results: [...formData.results, newResult.trim()] });
                setNewResult('');
              }
            }}
            onRemove={(idx) => setFormData({ ...formData, results: formData.results.filter((_: string, i: number) => i !== idx) })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Citat</label>
            <textarea
              value={formData.quote}
              onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isPublic"
              checked={formData.isPublic}
              onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="isPublic" className="text-sm text-gray-300">Publikt case (kan delas med kunder)</label>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => onSave(formData)}
            disabled={!formData.customer.trim()}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Skapa
          </button>
          <button onClick={onClose} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">
            Avbryt
          </button>
        </div>
      </div>
    </div>
  );
};

interface OfferCreateModalProps {
  productId: string;
  onClose: () => void;
  onSave: (data: any) => void;
}

const OfferCreateModal: React.FC<OfferCreateModalProps> = ({ productId, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    shortDescription: '',
    fullDescription: '',
    deliverables: [] as string[],
    duration: '',
    priceRange: {
      min: 0,
      max: 0,
      unit: 'fixed'
    },
    targetAudience: [] as string[],
    productId
  });

  const [newDeliverable, setNewDeliverable] = useState('');
  const [newAudience, setNewAudience] = useState('');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
      <div className="bg-gray-800 rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Skapa Nytt Erbjudande</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Namn</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="t.ex. Startpaket"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Kort beskrivning</label>
            <textarea
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Fullständig beskrivning</label>
            <textarea
              value={formData.fullDescription}
              onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>

          <ArrayInputSection
            title="Leverabler"
            items={formData.deliverables}
            newValue={newDeliverable}
            setNewValue={setNewDeliverable}
            onAdd={() => {
              if (newDeliverable.trim()) {
                setFormData({ ...formData, deliverables: [...formData.deliverables, newDeliverable.trim()] });
                setNewDeliverable('');
              }
            }}
            onRemove={(idx) => setFormData({ ...formData, deliverables: formData.deliverables.filter((_: string, i: number) => i !== idx) })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Varaktighet</label>
            <input
              type="text"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="t.ex. 3 månader"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Min pris (kr)</label>
              <input
                type="number"
                value={formData.priceRange.min}
                onChange={(e) => setFormData({ ...formData, priceRange: { ...formData.priceRange, min: parseInt(e.target.value) || 0 } })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Max pris (kr)</label>
              <input
                type="number"
                value={formData.priceRange.max}
                onChange={(e) => setFormData({ ...formData, priceRange: { ...formData.priceRange, max: parseInt(e.target.value) || 0 } })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Enhet</label>
              <select
                value={formData.priceRange.unit}
                onChange={(e) => setFormData({ ...formData, priceRange: { ...formData.priceRange, unit: e.target.value as any } })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              >
                <option value="fixed">Fast pris</option>
                <option value="hourly">Per timme</option>
                <option value="daily">Per dag</option>
              </select>
            </div>
          </div>

          <ArrayInputSection
            title="Målgrupp"
            items={formData.targetAudience}
            newValue={newAudience}
            setNewValue={setNewAudience}
            onAdd={() => {
              if (newAudience.trim()) {
                setFormData({ ...formData, targetAudience: [...formData.targetAudience, newAudience.trim()] });
                setNewAudience('');
              }
            }}
            onRemove={(idx) => setFormData({ ...formData, targetAudience: formData.targetAudience.filter((_: string, i: number) => i !== idx) })}
          />
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => onSave(formData)}
            disabled={!formData.name.trim()}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Skapa
          </button>
          <button onClick={onClose} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">
            Avbryt
          </button>
        </div>
      </div>
    </div>
  );
};
