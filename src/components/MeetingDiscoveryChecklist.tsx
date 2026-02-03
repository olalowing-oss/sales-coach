// @ts-nocheck
import React from 'react';
import { CheckCircle2, Clock, HelpCircle } from 'lucide-react';
import { useMeetingAssistantStore } from '../store/meetingAssistantStore';

export function MeetingDiscoveryChecklist() {
  const { discoveryStatus, generateSuggestedQuestions } = useMeetingAssistantStore();

  const items = [
    { key: 'budget', label: 'Budget', icon: '💰' },
    { key: 'authority', label: 'Authority', icon: '👤' },
    { key: 'need', label: 'Need', icon: '🎯' },
    { key: 'timeline', label: 'Timeline', icon: '📅' }
  ] as const;

  const completedCount = Object.values(discoveryStatus).filter(
    item => item.completed
  ).length;

  const handleSuggestQuestion = (item: typeof items[number]['key']) => {
    // This would trigger question generation for this specific BANT item
    generateSuggestedQuestions();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
          ✓ Discovery Status (BANT)
        </h4>
        <div className="text-xs text-gray-600 font-medium">
          {completedCount}/4 completed
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div
          className="bg-gradient-to-r from-green-500 to-green-600 h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${(completedCount / 4) * 100}%` }}
        ></div>
      </div>

      {/* Checklist Items */}
      <div className="space-y-2">
        {items.map(({ key, label, icon }) => {
          const status = discoveryStatus[key];

          return (
            <div
              key={key}
              className={`flex items-center justify-between p-2.5 rounded-lg border ${
                status.completed
                  ? 'bg-green-50 border-green-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center space-x-2 flex-1">
                {status.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                )}

                <span className="text-base">{icon}</span>

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800">
                    {label}
                  </div>
                  {status.completed && status.value && (
                    <div className="text-xs text-gray-600 truncate">
                      {status.value}
                    </div>
                  )}
                </div>
              </div>

              {!status.completed && (
                <button
                  onClick={() => handleSuggestQuestion(key)}
                  className="p-1.5 hover:bg-white rounded transition-colors flex-shrink-0"
                  title="Föreslå fråga"
                >
                  <HelpCircle className="w-4 h-4 text-indigo-600" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Completion Message */}
      {completedCount === 4 && (
        <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2 text-sm text-green-800">
            <CheckCircle2 className="w-4 h-4" />
            <span className="font-medium">Full BANT discovery completed!</span>
          </div>
        </div>
      )}
    </div>
  );
}
