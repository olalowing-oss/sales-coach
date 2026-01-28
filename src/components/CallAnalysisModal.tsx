import React, { useState } from 'react';
import { X, Save, Sparkles } from 'lucide-react';
import type { CallAnalysis } from '../types';

interface CallAnalysisModalProps {
  sessionId: string;
  customerName?: string;
  customerCompany?: string;
  transcript: string;
  existingAnalysis?: Partial<CallAnalysis>;
  onSave: (analysis: CallAnalysis) => Promise<void>;
  onClose: () => void;
}

export const CallAnalysisModal: React.FC<CallAnalysisModalProps> = ({
  customerName,
  customerCompany,
  existingAnalysis,
  onSave,
  onClose
}) => {
  const [analysis, setAnalysis] = useState<CallAnalysis>({
    industry: existingAnalysis?.industry || '',
    companySize: existingAnalysis?.companySize,
    callPurpose: existingAnalysis?.callPurpose,
    callOutcome: existingAnalysis?.callOutcome,
    interestLevel: existingAnalysis?.interestLevel,
    estimatedValue: existingAnalysis?.estimatedValue,
    decisionTimeframe: existingAnalysis?.decisionTimeframe,
    probability: existingAnalysis?.probability || 50,
    productsDiscussed: existingAnalysis?.productsDiscussed || [],
    competitorsMentioned: existingAnalysis?.competitorsMentioned || [],
    objectionsRaised: existingAnalysis?.objectionsRaised || [],
    painPoints: existingAnalysis?.painPoints || [],
    nextSteps: existingAnalysis?.nextSteps || '',
    followUpDate: existingAnalysis?.followUpDate,
    notes: existingAnalysis?.notes || '',
    aiSummary: existingAnalysis?.aiSummary || '',
    keyTopics: existingAnalysis?.keyTopics || [],
    isAnalyzed: true
  });

  const [isSaving, setIsSaving] = useState(false);
  const [newItem, setNewItem] = useState({
    product: '',
    competitor: '',
    objection: '',
    painPoint: '',
    keyTopic: ''
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        ...analysis,
        analyzedAt: new Date(),
        isAnalyzed: true
      });
      onClose();
    } catch (error) {
      console.error('Failed to save analysis:', error);
      alert('Misslyckades med att spara analysen. Försök igen.');
    } finally {
      setIsSaving(false);
    }
  };

  const addToList = (field: keyof typeof newItem, listField: keyof CallAnalysis) => {
    const value = newItem[field].trim();
    if (!value) return;

    setAnalysis(prev => ({
      ...prev,
      [listField]: [...(prev[listField] as string[] || []), value]
    }));
    setNewItem(prev => ({ ...prev, [field]: '' }));
  };

  const removeFromList = (listField: keyof CallAnalysis, index: number) => {
    setAnalysis(prev => ({
      ...prev,
      [listField]: (prev[listField] as string[] || []).filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-blue-500" />
              Samtalsanalys
            </h2>
            {customerName && (
              <p className="text-gray-400 mt-1">
                {customerName} {customerCompany && `- ${customerCompany}`}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-8">
          {/* Grundläggande information */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-4">Grundläggande information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bransch
                </label>
                <input
                  type="text"
                  value={analysis.industry}
                  onChange={(e) => setAnalysis({ ...analysis, industry: e.target.value })}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="t.ex. Teknologi, Tillverkning..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Företagsstorlek
                </label>
                <select
                  value={analysis.companySize || ''}
                  onChange={(e) => setAnalysis({ ...analysis, companySize: e.target.value as any })}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Välj storlek</option>
                  <option value="1-50">1-50 anställda</option>
                  <option value="51-200">51-200 anställda</option>
                  <option value="201-1000">201-1000 anställda</option>
                  <option value="1000+">1000+ anställda</option>
                </select>
              </div>
            </div>
          </section>

          {/* Samtalets kontext */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-4">Samtalets kontext</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Samtalets syfte
                </label>
                <select
                  value={analysis.callPurpose || ''}
                  onChange={(e) => setAnalysis({ ...analysis, callPurpose: e.target.value as any })}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Välj syfte</option>
                  <option value="Prospektering">Prospektering</option>
                  <option value="Demo">Demo</option>
                  <option value="Uppföljning">Uppföljning</option>
                  <option value="Förhandling">Förhandling</option>
                  <option value="Closing">Closing</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Samtalets resultat
                </label>
                <select
                  value={analysis.callOutcome || ''}
                  onChange={(e) => setAnalysis({ ...analysis, callOutcome: e.target.value as any })}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Välj resultat</option>
                  <option value="Bokat möte">Bokat möte</option>
                  <option value="Skickat offert">Skickat offert</option>
                  <option value="Behöver tänka">Behöver tänka</option>
                  <option value="Nej tack">Nej tack</option>
                  <option value="Uppföljning krävs">Uppföljning krävs</option>
                  <option value="Avslutad affär">Avslutad affär</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Intressenivå
                </label>
                <select
                  value={analysis.interestLevel || ''}
                  onChange={(e) => setAnalysis({ ...analysis, interestLevel: e.target.value as any })}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Välj nivå</option>
                  <option value="Hög">Hög</option>
                  <option value="Medel">Medel</option>
                  <option value="Låg">Låg</option>
                </select>
              </div>
            </div>
          </section>

          {/* Affärsdata */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-4">Affärsdata</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Uppskattat värde (SEK)
                </label>
                <input
                  type="number"
                  value={analysis.estimatedValue || ''}
                  onChange={(e) => setAnalysis({ ...analysis, estimatedValue: parseInt(e.target.value) || undefined })}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="100000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tidsram för beslut
                </label>
                <select
                  value={analysis.decisionTimeframe || ''}
                  onChange={(e) => setAnalysis({ ...analysis, decisionTimeframe: e.target.value as any })}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Välj tidsram</option>
                  <option value="Omedelbart">Omedelbart</option>
                  <option value="1-3 månader">1-3 månader</option>
                  <option value="3-6 månader">3-6 månader</option>
                  <option value="6-12 månader">6-12 månader</option>
                  <option value="Okänt">Okänt</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Sannolikhet: {analysis.probability}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={analysis.probability}
                  onChange={(e) => setAnalysis({ ...analysis, probability: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
          </section>

          {/* Produkter diskuterade */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-4">Produkter/tjänster diskuterade</h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newItem.product}
                onChange={(e) => setNewItem({ ...newItem, product: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && addToList('product', 'productsDiscussed')}
                className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Lägg till produkt..."
              />
              <button
                onClick={() => addToList('product', 'productsDiscussed')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Lägg till
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {analysis.productsDiscussed?.map((product, idx) => (
                <span
                  key={idx}
                  className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {product}
                  <button
                    onClick={() => removeFromList('productsDiscussed', idx)}
                    className="hover:text-blue-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </section>

          {/* Konkurrenter nämnda */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-4">Konkurrenter nämnda</h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newItem.competitor}
                onChange={(e) => setNewItem({ ...newItem, competitor: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && addToList('competitor', 'competitorsMentioned')}
                className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Lägg till konkurrent..."
              />
              <button
                onClick={() => addToList('competitor', 'competitorsMentioned')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Lägg till
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {analysis.competitorsMentioned?.map((competitor, idx) => (
                <span
                  key={idx}
                  className="bg-red-600/20 text-red-400 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {competitor}
                  <button
                    onClick={() => removeFromList('competitorsMentioned', idx)}
                    className="hover:text-red-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </section>

          {/* Invändningar */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-4">Invändningar som kom upp</h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newItem.objection}
                onChange={(e) => setNewItem({ ...newItem, objection: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && addToList('objection', 'objectionsRaised')}
                className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Lägg till invändning..."
              />
              <button
                onClick={() => addToList('objection', 'objectionsRaised')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Lägg till
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {analysis.objectionsRaised?.map((objection, idx) => (
                <span
                  key={idx}
                  className="bg-yellow-600/20 text-yellow-400 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {objection}
                  <button
                    onClick={() => removeFromList('objectionsRaised', idx)}
                    className="hover:text-yellow-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </section>

          {/* Pain points */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-4">Kundens pain points</h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newItem.painPoint}
                onChange={(e) => setNewItem({ ...newItem, painPoint: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && addToList('painPoint', 'painPoints')}
                className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Lägg till pain point..."
              />
              <button
                onClick={() => addToList('painPoint', 'painPoints')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Lägg till
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {analysis.painPoints?.map((painPoint, idx) => (
                <span
                  key={idx}
                  className="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {painPoint}
                  <button
                    onClick={() => removeFromList('painPoints', idx)}
                    className="hover:text-purple-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </section>

          {/* Uppföljning */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-4">Uppföljning</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nästa steg
                </label>
                <textarea
                  value={analysis.nextSteps}
                  onChange={(e) => setAnalysis({ ...analysis, nextSteps: e.target.value })}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                  placeholder="Beskriv vad som ska göras härnäst..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Uppföljningsdatum
                </label>
                <input
                  type="date"
                  value={analysis.followUpDate ? new Date(analysis.followUpDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setAnalysis({ ...analysis, followUpDate: e.target.value ? new Date(e.target.value) : undefined })}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Övriga anteckningar
                </label>
                <textarea
                  value={analysis.notes}
                  onChange={(e) => setAnalysis({ ...analysis, notes: e.target.value })}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                  placeholder="Fria anteckningar om samtalet..."
                />
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-800 border-t border-gray-700 p-6 flex justify-end gap-4">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            Avbryt
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sparar...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Spara analys
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
