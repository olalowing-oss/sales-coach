import React from 'react';
import { Eye, EyeOff, History, Settings, Lightbulb, Phone, Upload, ClipboardList, Building2, NotebookPen } from 'lucide-react';

interface KundsamtalDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  showTranscriptPanel: boolean;
  showCoachingPanel: boolean;
  showQuestionnairePanel: boolean;
  onToggleTranscript: () => void;
  onToggleCoaching: () => void;
  onToggleQuestionnaire: () => void;
  onShowCallView: () => void;
  onOpenHistory: () => void;
  onOpenAccountsList: () => void;
  onOpenAdmin: () => void;
  onOpenCoachingAdmin: () => void;
  onOpenImport: () => void;
  onOpenMeetingAssistant: () => void;
}

export const KundsamtalDropdown: React.FC<KundsamtalDropdownProps> = ({
  isOpen,
  onClose,
  showTranscriptPanel,
  showCoachingPanel,
  showQuestionnairePanel,
  onToggleTranscript,
  onToggleCoaching,
  onToggleQuestionnaire,
  onShowCallView,
  onOpenHistory,
  onOpenAccountsList,
  onOpenAdmin,
  onOpenCoachingAdmin,
  onOpenImport,
  onOpenMeetingAssistant,
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
        {/* Meeting Assistant - NEW! */}
        <button
          onClick={() => handleItemClick(onOpenMeetingAssistant)}
          className="w-full px-4 py-3 text-left hover:bg-gray-700 rounded-t-lg transition-colors flex items-center gap-3 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-b border-purple-700/50"
        >
          <NotebookPen className="w-4 h-4 text-purple-400" />
          <div>
            <div className="text-sm font-medium text-white flex items-center gap-2">
              Meeting Assistant
              <span className="text-xs px-2 py-0.5 bg-purple-600 text-white rounded-full">NYTT</span>
            </div>
            <div className="text-xs text-gray-400">AI-anteckningar & coaching i realtid</div>
          </div>
        </button>

        {/* Show Call View */}
        <button
          onClick={() => handleItemClick(onShowCallView)}
          className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-center gap-3"
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

        {/* Toggle Questionnaire Panel */}
        <button
          onClick={() => handleItemClick(onToggleQuestionnaire)}
          className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-center gap-3"
        >
          {showQuestionnairePanel ? (
            <ClipboardList className="w-4 h-4 text-teal-400" />
          ) : (
            <ClipboardList className="w-4 h-4 text-gray-500" />
          )}
          <div className="flex items-center justify-between w-full">
            <div>
              <div className="text-sm font-medium text-white">Visa kundfrågor</div>
              <div className="text-xs text-gray-400">
                {showQuestionnairePanel ? 'Dölj' : 'Visa'} frågeformulär
              </div>
            </div>
            <div className={`text-xs font-medium ${showQuestionnairePanel ? 'text-green-400' : 'text-gray-500'}`}>
              {showQuestionnairePanel ? 'PÅ' : 'AV'}
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

        {/* Accounts List */}
        <button
          onClick={() => handleItemClick(onOpenAccountsList)}
          className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-center gap-3"
        >
          <Building2 className="w-4 h-4 text-teal-400" />
          <div>
            <div className="text-sm font-medium text-white">Kundlista</div>
            <div className="text-xs text-gray-400">Alla företag & kontakter</div>
          </div>
        </button>

        {/* Import Transcript */}
        <button
          onClick={() => handleItemClick(onOpenImport)}
          className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-center gap-3"
        >
          <Upload className="w-4 h-4 text-teal-400" />
          <div>
            <div className="text-sm font-medium text-white">Importera transkription</div>
            <div className="text-xs text-gray-400">Teams-möten & andra källor</div>
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
