import React from 'react';
import { 
  Lightbulb, 
  Swords, 
  AlertTriangle, 
  Package, 
  BookOpen,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { CoachingTip, TipType } from '../types';
import { useSessionStore } from '../store/sessionStore';

interface CoachingPanelProps {
  tips: CoachingTip[];
}

export const CoachingPanel: React.FC<CoachingPanelProps> = ({ tips }) => {
  const { dismissTip } = useSessionStore();
  
  const activeTips = tips.filter(t => !t.dismissed);

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden flex flex-col h-[600px]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-700 flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-yellow-400" />
        <h2 className="font-semibold">Coaching</h2>
        {activeTips.length > 0 && (
          <span className="ml-auto px-2 py-0.5 bg-blue-600 text-xs rounded-full">
            {activeTips.length}
          </span>
        )}
      </div>

      {/* Tips content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTips.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>Inga aktiva tips just nu</p>
            <p className="text-sm mt-2">
              Tips dyker upp automatiskt baserat på samtalet
            </p>
          </div>
        )}

        {activeTips.map((tip) => (
          <TipCard 
            key={tip.id} 
            tip={tip} 
            onDismiss={() => dismissTip(tip.id)}
          />
        ))}
      </div>

      {/* Quick reference footer */}
      <div className="px-4 py-3 border-t border-gray-700 bg-gray-800/50">
        <p className="text-xs text-gray-500 text-center">
          💡 Tips visas automatiskt baserat på vad kunden säger
        </p>
      </div>
    </div>
  );
};

// === TIP CARD COMPONENT ===

interface TipCardProps {
  tip: CoachingTip;
  onDismiss: () => void;
}

const TipCard: React.FC<TipCardProps> = ({ tip, onDismiss }) => {
  const [isExpanded, setIsExpanded] = React.useState(true);
  
  const config = getTipConfig(tip.type);
  const Icon = config.icon;

  return (
    <div 
      className={`rounded-lg border overflow-hidden transition-all ${config.borderColor} ${config.bgColor}`}
    >
      {/* Header */}
      <div className="px-4 py-3 flex items-start gap-3">
        <div className={`p-2 rounded-lg ${config.iconBg}`}>
          <Icon className={`w-4 h-4 ${config.iconColor}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-medium text-sm truncate">{tip.title}</h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 hover:bg-gray-700/50 rounded transition-colors"
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>
              <button
                onClick={onDismiss}
                className="p-1 hover:bg-gray-700/50 rounded transition-colors"
                title="Ignorera"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
          
          {/* Trigger badge */}
          <span className="inline-block mt-1 px-2 py-0.5 bg-gray-700/50 text-xs text-gray-400 rounded">
            Trigger: "{tip.trigger}"
          </span>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Main content */}
          <div className="pl-11">
            <p className="text-sm text-gray-300 leading-relaxed">
              {tip.content}
            </p>
          </div>

          {/* Talking points */}
          {tip.talkingPoints && tip.talkingPoints.length > 0 && (
            <div className="pl-11 space-y-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                Förslag att säga:
              </p>
              <ul className="space-y-2">
                {tip.talkingPoints.map((point, index) => (
                  <li 
                    key={index}
                    className="text-sm text-gray-400 pl-4 border-l-2 border-gray-600 hover:border-blue-500 hover:text-gray-200 transition-colors cursor-pointer"
                    title="Klicka för att kopiera"
                    onClick={() => navigator.clipboard.writeText(point)}
                  >
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Related offer */}
          {tip.relatedOffer && (
            <div className="pl-11 mt-3 p-3 bg-gray-700/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-gray-400">Relaterat erbjudande</span>
              </div>
              <p className="font-medium text-sm">{tip.relatedOffer.name}</p>
              <p className="text-xs text-gray-400 mt-1">
                {tip.relatedOffer.duration} • {formatPrice(tip.relatedOffer.priceRange)}
              </p>
            </div>
          )}

          {/* Related case */}
          {tip.relatedCase && (
            <div className="pl-11 mt-3 p-3 bg-gray-700/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-green-400" />
                <span className="text-xs text-gray-400">Kundcase</span>
              </div>
              <p className="font-medium text-sm">{tip.relatedCase.customer}</p>
              <p className="text-xs text-gray-400 mt-1">
                {tip.relatedCase.results[0]}
              </p>
              {tip.relatedCase.quote && (
                <p className="text-xs text-gray-500 mt-2 italic">
                  "{tip.relatedCase.quote}"
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// === HELPERS ===

interface TipConfig {
  icon: typeof Lightbulb;
  iconColor: string;
  iconBg: string;
  borderColor: string;
  bgColor: string;
}

const getTipConfig = (type: TipType): TipConfig => {
  const configs: Record<TipType, TipConfig> = {
    suggestion: {
      icon: Lightbulb,
      iconColor: 'text-yellow-400',
      iconBg: 'bg-yellow-400/10',
      borderColor: 'border-yellow-500/30',
      bgColor: 'bg-yellow-500/5'
    },
    battlecard: {
      icon: Swords,
      iconColor: 'text-red-400',
      iconBg: 'bg-red-400/10',
      borderColor: 'border-red-500/30',
      bgColor: 'bg-red-500/5'
    },
    objection: {
      icon: AlertTriangle,
      iconColor: 'text-orange-400',
      iconBg: 'bg-orange-400/10',
      borderColor: 'border-orange-500/30',
      bgColor: 'bg-orange-500/5'
    },
    offer: {
      icon: Package,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-400/10',
      borderColor: 'border-blue-500/30',
      bgColor: 'bg-blue-500/5'
    },
    case: {
      icon: BookOpen,
      iconColor: 'text-green-400',
      iconBg: 'bg-green-400/10',
      borderColor: 'border-green-500/30',
      bgColor: 'bg-green-500/5'
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-red-400',
      iconBg: 'bg-red-400/10',
      borderColor: 'border-red-500/30',
      bgColor: 'bg-red-500/5'
    }
  };
  
  return configs[type] || configs.suggestion;
};

const formatPrice = (priceRange: { min: number; max: number; unit: string }): string => {
  const formatNum = (n: number) => n.toLocaleString('sv-SE');
  const unitText = priceRange.unit === 'fixed' ? 'kr' : priceRange.unit === 'hourly' ? 'kr/h' : 'kr/dag';
  
  if (priceRange.min === priceRange.max) {
    return `${formatNum(priceRange.min)} ${unitText}`;
  }
  return `${formatNum(priceRange.min)} - ${formatNum(priceRange.max)} ${unitText}`;
};
