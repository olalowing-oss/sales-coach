// @ts-nocheck
import React, { useState } from 'react';
import { Lightbulb, AlertTriangle, FileText, ShoppingBag, Building2, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useMeetingAssistantStore } from '../store/meetingAssistantStore';

export function MeetingCoachingTips() {
  const { coachingTips } = useMeetingAssistantStore();
  const [expandedTipId, setExpandedTipId] = useState<string | null>(null);

  if (coachingTips.length === 0) {
    return (
      <div className="p-4 text-center">
        <Lightbulb className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-xs text-gray-500">
          Coaching tips dyker upp här när kunden säger något relevant
        </p>
      </div>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'objection':
        return <AlertTriangle className="w-4 h-4" />;
      case 'battlecard':
        return <FileText className="w-4 h-4" />;
      case 'offer':
        return <ShoppingBag className="w-4 h-4" />;
      case 'case':
        return <Building2 className="w-4 h-4" />;
      default:
        return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string, priority: string) => {
    if (type === 'objection' || priority === 'high') {
      return 'from-red-50 to-orange-50 border-red-200';
    }
    if (type === 'warning') {
      return 'from-yellow-50 to-amber-50 border-yellow-200';
    }
    return 'from-blue-50 to-indigo-50 border-blue-200';
  };

  const getTypeTextColor = (type: string) => {
    if (type === 'objection') return 'text-red-700';
    if (type === 'warning') return 'text-yellow-700';
    return 'text-blue-700';
  };

  const toggleExpand = (tipId: string) => {
    setExpandedTipId(expandedTipId === tipId ? null : tipId);
  };

  const removeTip = (tipId: string) => {
    // Remove tip from list
    useMeetingAssistantStore.setState(state => ({
      coachingTips: state.coachingTips.filter(t => t.id !== tipId)
    }));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Lightbulb className="w-4 h-4 text-yellow-600" />
        <h4 className="text-sm font-semibold text-gray-700">
          Coaching Tips
        </h4>
        <span className="text-xs text-gray-500">
          ({coachingTips.length})
        </span>
      </div>

      <div className="space-y-2">
        {coachingTips.map((tip) => {
          const isExpanded = expandedTipId === tip.id;

          return (
            <div
              key={tip.id}
              className={`p-3 bg-gradient-to-r border rounded-lg transition-all ${getTypeColor(tip.type, tip.priority)}`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2 flex-1">
                  <div className={getTypeTextColor(tip.type)}>
                    {getTypeIcon(tip.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className={`text-sm font-semibold ${getTypeTextColor(tip.type)}`}>
                      {tip.title}
                    </h5>
                    {tip.trigger && (
                      <p className="text-xs text-gray-600 mt-0.5">
                        Trigger: {tip.trigger}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                  {tip.fullContext && (
                    <button
                      onClick={() => toggleExpand(tip.id)}
                      className="p-1 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
                      title={isExpanded ? 'Dölj detaljer' : 'Visa full kontext'}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => removeTip(tip.id)}
                    className="p-1 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
                    title="Stäng tip"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="text-sm text-gray-800 whitespace-pre-wrap">
                {tip.content}
              </div>

              {/* Talking Points */}
              {tip.talkingPoints && tip.talkingPoints.length > 0 && (
                <div className="mt-2 space-y-1">
                  {tip.talkingPoints.map((point, index) => (
                    <div key={index} className="flex items-start space-x-2 text-xs text-gray-700">
                      <span className={`${getTypeTextColor(tip.type)} flex-shrink-0`}>•</span>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Full Context (Expandable) */}
              {isExpanded && tip.fullContext && (
                <div className="mt-3 pt-3 border-t border-gray-300">
                  <div className="text-xs font-semibold text-gray-700 mb-1.5">
                    Full kontext från dokument:
                  </div>
                  <div className="text-xs text-gray-700 whitespace-pre-wrap bg-white bg-opacity-60 p-2 rounded">
                    {tip.fullContext}
                  </div>
                </div>
              )}

              {/* Related Offer */}
              {tip.relatedOffer && (
                <div className="mt-2 p-2 bg-white bg-opacity-60 rounded border border-gray-300">
                  <div className="flex items-center space-x-2">
                    <ShoppingBag className="w-3.5 h-3.5 text-purple-600" />
                    <div className="flex-1">
                      <div className="text-xs font-medium text-gray-900">
                        {tip.relatedOffer.name}
                      </div>
                      {tip.relatedOffer.duration && (
                        <div className="text-xs text-gray-600">
                          {tip.relatedOffer.duration} • {tip.relatedOffer.priceRange}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Related Case */}
              {tip.relatedCase && (
                <div className="mt-2 p-2 bg-white bg-opacity-60 rounded border border-gray-300">
                  <div className="flex items-center space-x-2 mb-1">
                    <Building2 className="w-3.5 h-3.5 text-green-600" />
                    <div className="text-xs font-medium text-gray-900">
                      {tip.relatedCase.customer}
                    </div>
                  </div>
                  {tip.relatedCase.quote && (
                    <div className="text-xs text-gray-700 italic pl-5">
                      "{tip.relatedCase.quote}"
                    </div>
                  )}
                  {tip.relatedCase.results && (
                    <div className="mt-1 pl-5 space-y-0.5">
                      {tip.relatedCase.results.map((result, index) => (
                        <div key={index} className="text-xs text-gray-600">
                          ✓ {result}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Priority Badge */}
              {tip.priority === 'high' && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    🔥 High Priority
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
