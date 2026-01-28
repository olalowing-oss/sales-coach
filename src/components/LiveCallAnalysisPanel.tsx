import React from 'react';
import { Sparkles, TrendingUp, Building2, Target, DollarSign, Calendar } from 'lucide-react';
import type { CallAnalysis } from '../types';

interface LiveCallAnalysisPanelProps {
  analysis: Partial<CallAnalysis>;
  onUpdate: (analysis: Partial<CallAnalysis>) => void;
}

export const LiveCallAnalysisPanel: React.FC<LiveCallAnalysisPanelProps> = ({
  analysis,
  onUpdate
}) => {
  const updateField = <K extends keyof CallAnalysis>(field: K, value: CallAnalysis[K]) => {
    onUpdate({ ...analysis, [field]: value });
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-purple-500" />
        <h3 className="text-lg font-semibold text-white">Live Samtalsanalys</h3>
      </div>

      {/* Quick metrics grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Call Purpose */}
        <div className="bg-gray-900/50 rounded-lg p-3">
          <label className="text-xs text-gray-400 mb-1 block flex items-center gap-1">
            <Target className="w-3 h-3" />
            Syfte
          </label>
          <select
            value={analysis.callPurpose || ''}
            onChange={(e) => updateField('callPurpose', e.target.value as any)}
            className="w-full bg-gray-700 text-white text-sm rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Välj...</option>
            <option value="Prospektering">Prospektering</option>
            <option value="Demo">Demo</option>
            <option value="Uppföljning">Uppföljning</option>
            <option value="Förhandling">Förhandling</option>
            <option value="Closing">Closing</option>
          </select>
        </div>

        {/* Interest Level */}
        <div className="bg-gray-900/50 rounded-lg p-3">
          <label className="text-xs text-gray-400 mb-1 block flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Intresse
          </label>
          <select
            value={analysis.interestLevel || ''}
            onChange={(e) => updateField('interestLevel', e.target.value as any)}
            className={`w-full text-sm rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              analysis.interestLevel === 'Hög' ? 'bg-green-700 text-white' :
              analysis.interestLevel === 'Medel' ? 'bg-yellow-700 text-white' :
              analysis.interestLevel === 'Låg' ? 'bg-red-700 text-white' :
              'bg-gray-700 text-white'
            }`}
          >
            <option value="">Välj...</option>
            <option value="Hög">Hög</option>
            <option value="Medel">Medel</option>
            <option value="Låg">Låg</option>
          </select>
        </div>

        {/* Industry */}
        <div className="bg-gray-900/50 rounded-lg p-3">
          <label className="text-xs text-gray-400 mb-1 block flex items-center gap-1">
            <Building2 className="w-3 h-3" />
            Bransch
          </label>
          <input
            type="text"
            value={analysis.industry || ''}
            onChange={(e) => updateField('industry', e.target.value)}
            className="w-full bg-gray-700 text-white text-sm rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="t.ex. Teknologi"
          />
        </div>

        {/* Company Size */}
        <div className="bg-gray-900/50 rounded-lg p-3">
          <label className="text-xs text-gray-400 mb-1 block">Storlek</label>
          <select
            value={analysis.companySize || ''}
            onChange={(e) => updateField('companySize', e.target.value as any)}
            className="w-full bg-gray-700 text-white text-sm rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Välj...</option>
            <option value="1-50">1-50</option>
            <option value="51-200">51-200</option>
            <option value="201-1000">201-1000</option>
            <option value="1000+">1000+</option>
          </select>
        </div>
      </div>

      {/* Business metrics */}
      <div className="grid grid-cols-2 gap-3">
        {/* Estimated Value */}
        <div className="bg-gray-900/50 rounded-lg p-3">
          <label className="text-xs text-gray-400 mb-1 block flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            Värde (SEK)
          </label>
          <input
            type="number"
            value={analysis.estimatedValue || ''}
            onChange={(e) => updateField('estimatedValue', parseInt(e.target.value) || undefined)}
            className="w-full bg-gray-700 text-white text-sm rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="100000"
          />
        </div>

        {/* Decision Timeframe */}
        <div className="bg-gray-900/50 rounded-lg p-3">
          <label className="text-xs text-gray-400 mb-1 block flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Tidsram
          </label>
          <select
            value={analysis.decisionTimeframe || ''}
            onChange={(e) => updateField('decisionTimeframe', e.target.value as any)}
            className="w-full bg-gray-700 text-white text-sm rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Välj...</option>
            <option value="Omedelbart">Omedelbart</option>
            <option value="1-3 månader">1-3 mån</option>
            <option value="3-6 månader">3-6 mån</option>
            <option value="6-12 månader">6-12 mån</option>
            <option value="Okänt">Okänt</option>
          </select>
        </div>
      </div>

      {/* Probability slider */}
      <div className="bg-gray-900/50 rounded-lg p-3">
        <label className="text-xs text-gray-400 mb-2 block">
          Sannolikhet: <span className="text-white font-semibold">{analysis.probability || 50}%</span>
        </label>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={analysis.probability || 50}
          onChange={(e) => updateField('probability', parseInt(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Auto-detected items */}
      {analysis.productsDiscussed && analysis.productsDiscussed.length > 0 && (
        <div className="bg-gray-900/50 rounded-lg p-3">
          <label className="text-xs text-gray-400 mb-2 block">Produkter diskuterade</label>
          <div className="flex flex-wrap gap-1">
            {analysis.productsDiscussed.map((product, idx) => (
              <span
                key={idx}
                className="bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded text-xs"
              >
                {product}
              </span>
            ))}
          </div>
        </div>
      )}

      {analysis.competitorsMentioned && analysis.competitorsMentioned.length > 0 && (
        <div className="bg-gray-900/50 rounded-lg p-3">
          <label className="text-xs text-gray-400 mb-2 block">Konkurrenter nämnda</label>
          <div className="flex flex-wrap gap-1">
            {analysis.competitorsMentioned.map((competitor, idx) => (
              <span
                key={idx}
                className="bg-red-600/20 text-red-400 px-2 py-0.5 rounded text-xs"
              >
                {competitor}
              </span>
            ))}
          </div>
        </div>
      )}

      {analysis.objectionsRaised && analysis.objectionsRaised.length > 0 && (
        <div className="bg-gray-900/50 rounded-lg p-3">
          <label className="text-xs text-gray-400 mb-2 block">Invändningar</label>
          <div className="flex flex-wrap gap-1">
            {analysis.objectionsRaised.map((objection, idx) => (
              <span
                key={idx}
                className="bg-yellow-600/20 text-yellow-400 px-2 py-0.5 rounded text-xs"
              >
                {objection}
              </span>
            ))}
          </div>
        </div>
      )}

      {analysis.painPoints && analysis.painPoints.length > 0 && (
        <div className="bg-gray-900/50 rounded-lg p-3">
          <label className="text-xs text-gray-400 mb-2 block">Pain Points</label>
          <div className="flex flex-wrap gap-1">
            {analysis.painPoints.map((painPoint, idx) => (
              <span
                key={idx}
                className="bg-purple-600/20 text-purple-400 px-2 py-0.5 rounded text-xs"
              >
                {painPoint}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Call Outcome */}
      <div className="bg-gray-900/50 rounded-lg p-3">
        <label className="text-xs text-gray-400 mb-1 block">Samtalets resultat</label>
        <select
          value={analysis.callOutcome || ''}
          onChange={(e) => updateField('callOutcome', e.target.value as any)}
          className="w-full bg-gray-700 text-white text-sm rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Välj resultat...</option>
          <option value="Bokat möte">Bokat möte</option>
          <option value="Skickat offert">Skickat offert</option>
          <option value="Behöver tänka">Behöver tänka</option>
          <option value="Nej tack">Nej tack</option>
          <option value="Uppföljning krävs">Uppföljning krävs</option>
          <option value="Avslutad affär">Avslutad affär</option>
        </select>
      </div>

      {/* Next Steps */}
      <div className="bg-gray-900/50 rounded-lg p-3">
        <label className="text-xs text-gray-400 mb-1 block">Nästa steg</label>
        <textarea
          value={analysis.nextSteps || ''}
          onChange={(e) => updateField('nextSteps', e.target.value)}
          className="w-full bg-gray-700 text-white text-sm rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[60px] resize-none"
          placeholder="Vad ska göras härnäst..."
        />
      </div>

      <p className="text-xs text-gray-500 text-center">
        Analysen sparas automatiskt när samtalet avslutas
      </p>
    </div>
  );
};
