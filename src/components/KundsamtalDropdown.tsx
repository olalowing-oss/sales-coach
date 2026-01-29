import React from 'react';
import { Eye, EyeOff, History, Settings, Lightbulb, Phone } from 'lucide-react';

interface KundsamtalDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  showTranscriptPanel: boolean;
  showCoachingPanel: boolean;
  onToggleTranscript: () => void;
  onToggleCoaching: () => void;
  onShowCallView: () => void;
  onOpenHistory: () => void;
  onOpenAdmin: () => void;
  onOpenCoachingAdmin: () => void;
}

export const KundsamtalDropdown: React.FC<KundsamtalDropdownProps> = ({
  isOpen,
  onClose,
  showTranscriptPanel,
  showCoachingPanel,
  onToggleTranscript,
  onToggleCoaching,
  onShowCallView,
  onOpenHistory,
  onOpenAdmin,
  onOpenCoachingAdmin,
}) => {
  if (!isOpen) return null;

  const handleItemClick = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-10"
        onClick={onClose}
        aria-label="Close menu"
      />

      {/* Dropdown Menu */}
      <div className="absolute left-0 mt-2 w-72 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20">
        {/* Show Call View */}
        <button
          onClick={() => handleItemClick(onShowCallView)}
          className="w-full px-4 py-3 text-left hover:bg-gray-700 rounded-t-lg transition-colors flex items-center gap-3"
        >
          <Phone className="w-4 h-4 text-blue-400" />
          <div>
            <div className="text-sm font-medium text-white">Samtal</div>
            <div className="text-xs text-gray-400">Visa samtalsvyn</div>
          </div>
        </button>

        {/* Separator */}
        <div className="border-t border-gray-700" />

        {/* Toggle Transcript Panel */}
        <button
          onClick={() => handleItemClick(onToggleTranscript)}
          className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-center gap-3"
        >
          {showTranscriptPanel ? (
            <Eye className="w-4 h-4 text-blue-400" />
          ) : (
            <EyeOff className="w-4 h-4 text-gray-500" />
          )}
          <div className="flex items-center justify-between w-full">
            <div>
              <div className="text-sm font-medium text-white">Visa transkript</div>
              <div className="text-xs text-gray-400">
                {showTranscriptPanel ? 'Dölj' : 'Visa'} transkript-panel
              </div>
            </div>
            <div className={`text-xs font-medium ${showTranscriptPanel ? 'text-green-400' : 'text-gray-500'}`}>
              {showTranscriptPanel ? 'PÅ' : 'AV'}
            </div>
          </div>
        </button>

        {/* Toggle Coaching Panel */}
        <button
          onClick={() => handleItemClick(onToggleCoaching)}
          className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-center gap-3"
        >
          {showCoachingPanel ? (
            <Lightbulb className="w-4 h-4 text-yellow-400" />
          ) : (
            <Lightbulb className="w-4 h-4 text-gray-500" />
          )}
          <div className="flex items-center justify-between w-full">
            <div>
              <div className="text-sm font-medium text-white">Visa coaching</div>
              <div className="text-xs text-gray-400">
                {showCoachingPanel ? 'Dölj' : 'Visa'} coaching-panel
              </div>
            </div>
            <div className={`text-xs font-medium ${showCoachingPanel ? 'text-green-400' : 'text-gray-500'}`}>
              {showCoachingPanel ? 'PÅ' : 'AV'}
            </div>
          </div>
        </button>

        {/* Separator */}
        <div className="border-t border-gray-700" />

        {/* History */}
        <button
          onClick={() => handleItemClick(onOpenHistory)}
          className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-center gap-3"
        >
          <History className="w-4 h-4 text-gray-400" />
          <div>
            <div className="text-sm font-medium text-white">Historik</div>
            <div className="text-xs text-gray-400">Tidigare samtal</div>
          </div>
        </button>

        {/* Separator */}
        <div className="border-t border-gray-700" />

        {/* Manage Offers */}
        <button
          onClick={() => handleItemClick(onOpenAdmin)}
          className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-center gap-3"
        >
          <Settings className="w-4 h-4 text-gray-400" />
          <div>
            <div className="text-sm font-medium text-white">Hantera erbjudanden</div>
            <div className="text-xs text-gray-400">Produkter & tjänster</div>
          </div>
        </button>

        {/* Manage Coaching */}
        <button
          onClick={() => handleItemClick(onOpenCoachingAdmin)}
          className="w-full px-4 py-3 text-left hover:bg-gray-700 rounded-b-lg transition-colors flex items-center gap-3"
        >
          <Lightbulb className="w-4 h-4 text-gray-400" />
          <div>
            <div className="text-sm font-medium text-white">Hantera coachning</div>
            <div className="text-xs text-gray-400">Triggers & battlecards</div>
          </div>
        </button>
      </div>
    </>
  );
};
