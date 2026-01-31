import React, { useState, useEffect } from 'react';
import { X, Plus, Edit2, Trash2, Package, Save, Building, Target, DollarSign, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type ProductProfile = Database['public']['Tables']['product_profiles']['Row'];
type ProductInsert = Database['public']['Tables']['product_profiles']['Insert'];

interface ProductManagerProps {
  onClose: () => void;
  onSelectProduct?: (productId: string) => void;
  selectedProductId?: string | null;
}

export const ProductManager: React.FC<ProductManagerProps> = ({
  onClose,
  onSelectProduct,
  selectedProductId
}) => {
  const [products, setProducts] = useState<ProductProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductProfile | null>(null);
  const [formData, setFormData] = useState<Partial<ProductInsert>>({
    name: '',
    description: '',
    industry: '',
    target_audience: '',
    key_features: [],
    value_propositions: [],
    common_objections: [],
    pricing_model: '',
    is_active: true,
  });

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('product_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setProducts(data || []);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Kunde inte ladda produkter');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setIsEditing(true);
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      industry: '',
      target_audience: '',
      key_features: [],
      value_propositions: [],
      common_objections: [],
      pricing_model: '',
      is_active: true,
    });
  };

  const handleEdit = (product: ProductProfile) => {
    setIsEditing(true);
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      industry: product.industry,
      target_audience: product.target_audience,
      key_features: product.key_features,
      value_propositions: product.value_propositions,
      common_objections: product.common_objections,
      pricing_model: product.pricing_model,
      is_active: product.is_active,
    });
  };

  const handleSave = async () => {
    if (!formData.name) {
      setError('Produktnamn krävs');
      return;
    }

    setError(null);
    try {
      if (editingProduct) {
        // Update existing product
        const { error: updateError } = await supabase
          .from('product_profiles')
          .update(formData)
          .eq('id', editingProduct.id);

        if (updateError) throw updateError;
      } else {
        // Create new product
        const { error: insertError } = await supabase
          .from('product_profiles')
          .insert([formData as ProductInsert]);

        if (insertError) throw insertError;
      }

      await fetchProducts();
      setIsEditing(false);
      setEditingProduct(null);
    } catch (err: any) {
      console.error('Error saving product:', err);
      setError(err.message || 'Kunde inte spara produkt');
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Är du säker på att du vill ta bort denna produkt? All kopplad kunskap kommer också tas bort.')) {
      return;
    }

    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from('product_profiles')
        .delete()
        .eq('id', productId);

      if (deleteError) throw deleteError;
      await fetchProducts();
    } catch (err: any) {
      console.error('Error deleting product:', err);
      setError(err.message || 'Kunde inte ta bort produkt');
    }
  };

  const handleArrayFieldChange = (field: 'key_features' | 'value_propositions' | 'common_objections', value: string) => {
    const items = value.split('\n').filter(item => item.trim());
    setFormData(prev => ({ ...prev, [field]: items }));
  };

  const getArrayFieldValue = (field: 'key_features' | 'value_propositions' | 'common_objections'): string => {
    const value = formData[field];
    if (Array.isArray(value)) {
      return value.join('\n');
    }
    return '';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl w-full max-w-6xl max-h-[90vh] flex flex-col border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-semibold text-white">Produkthantering</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-600/20 border border-red-600/50 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : isEditing ? (
            /* Edit/Create Form */
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Produktnamn *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    placeholder="t.ex. B3 Sales Coach"
                  />
                </div>

                {/* Industry */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bransch
                  </label>
                  <input
                    type="text"
                    value={formData.industry || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    placeholder="t.ex. SaaS, Sales Tech"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Beskrivning
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none resize-none"
                  placeholder="Kort beskrivning av produkten..."
                />
              </div>

              {/* Target Audience */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Målgrupp
                </label>
                <input
                  type="text"
                  value={formData.target_audience || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, target_audience: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="t.ex. Säljare, Säljledare, Säljorganisationer"
                />
              </div>

              {/* Key Features */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nyckelfunktioner (en per rad)
                </label>
                <textarea
                  value={getArrayFieldValue('key_features')}
                  onChange={(e) => handleArrayFieldChange('key_features', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none resize-none font-mono text-sm"
                  placeholder="AI-drivna kundsamtal&#10;Realtids röstanalys&#10;Personlig coaching&#10;Mätbara resultat"
                />
              </div>

              {/* Value Propositions */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Värdepropositioner (en per rad)
                </label>
                <textarea
                  value={getArrayFieldValue('value_propositions')}
                  onChange={(e) => handleArrayFieldChange('value_propositions', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none resize-none font-mono text-sm"
                  placeholder="Träna när du vill&#10;Inga kostbara kurser&#10;Snabbare onboarding&#10;Högre konverteringsgrad"
                />
              </div>

              {/* Common Objections */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Vanliga invändningar (en per rad)
                </label>
                <textarea
                  value={getArrayFieldValue('common_objections')}
                  onChange={(e) => handleArrayFieldChange('common_objections', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none resize-none font-mono text-sm"
                  placeholder="För dyrt&#10;Har redan en lösning&#10;Behöver tänka på det&#10;Inte rätt tidpunkt"
                />
              </div>

              {/* Pricing Model */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Prismodell
                </label>
                <input
                  type="text"
                  value={formData.pricing_model || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, pricing_model: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="t.ex. Prenumeration per användare, Engångsköp, Freemium"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-700">
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Spara
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditingProduct(null);
                    setError(null);
                  }}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                >
                  Avbryt
                </button>
              </div>
            </div>
          ) : (
            /* Product List */
            <div className="space-y-4">
              {/* Create Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleCreate}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Skapa ny produkt
                </button>
              </div>

              {/* Products Grid */}
              {products.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg mb-2">Inga produkter ännu</p>
                  <p className="text-gray-500 text-sm">Skapa din första produkt för att komma igång</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className={`p-6 bg-gray-700/50 rounded-lg border transition-all ${
                        selectedProductId === product.id
                          ? 'border-blue-500 ring-2 ring-blue-500/20'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-1">{product.name}</h3>
                          {product.industry && (
                            <div className="flex items-center gap-1 text-sm text-gray-400">
                              <Building className="w-3 h-3" />
                              {product.industry}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                            title="Redigera"
                          >
                            <Edit2 className="w-4 h-4 text-gray-400" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 hover:bg-red-600/20 rounded-lg transition-colors"
                            title="Ta bort"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </div>

                      {/* Description */}
                      {product.description && (
                        <p className="text-sm text-gray-300 mb-4 line-clamp-2">
                          {product.description}
                        </p>
                      )}

                      {/* Stats */}
                      <div className="space-y-2">
                        {Array.isArray(product.key_features) && product.key_features.length > 0 && (
                          <div className="flex items-start gap-2 text-xs text-gray-400">
                            <Target className="w-3 h-3 flex-shrink-0 mt-0.5" />
                            <span>{product.key_features.length} funktioner</span>
                          </div>
                        )}
                        {product.pricing_model && (
                          <div className="flex items-start gap-2 text-xs text-gray-400">
                            <DollarSign className="w-3 h-3 flex-shrink-0 mt-0.5" />
                            <span>{product.pricing_model}</span>
                          </div>
                        )}
                      </div>

                      {/* Select Button */}
                      {onSelectProduct && (
                        <button
                          onClick={() => onSelectProduct(product.id)}
                          className={`mt-4 w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                            selectedProductId === product.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-600 hover:bg-gray-500 text-white'
                          }`}
                        >
                          {selectedProductId === product.id ? 'Vald' : 'Välj produkt'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
