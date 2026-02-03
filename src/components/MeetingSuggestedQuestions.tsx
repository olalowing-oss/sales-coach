// @ts-nocheck
import React from 'react';
import { ArrowRight, Lightbulb } from 'lucide-react';
import { useMeetingAssistantStore } from '../store/meetingAssistantStore';

export function MeetingSuggestedQuestions() {
  const { suggestedQuestions, useSuggestedQuestion, notes } = useMeetingAssistantStore();

  if (suggestedQuestions.length === 0) {
    return (
      <div className="text-center py-6">
        <Lightbulb className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-xs text-gray-500">
          {notes.length === 0
            ? 'Börja dokumentera mötet för att få föreslagna frågor'
            : 'Genererar förslag...'}
        </p>
      </div>
    );
  }

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'BANT':
        return 'bg-red-100 text-red-800';
      case 'Pain':
        return 'bg-orange-100 text-orange-800';
      case 'Product':
        return 'bg-blue-100 text-blue-800';
      case 'SPIN':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Lightbulb className="w-4 h-4 text-yellow-600" />
        <h4 className="text-sm font-semibold text-gray-700">
          Suggested Questions
        </h4>
      </div>

      <div className="space-y-3">
        {suggestedQuestions.map((question, index) => (
          <div
            key={question.id}
            className="p-3 bg-white border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all"
          >
            {/* Priority Badge */}
            <div className="flex items-start justify-between mb-2">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(question.type)}`}>
                {question.type}
              </span>
              {index === 0 && (
                <span className="text-xs text-yellow-600 font-medium">
                  ⭐ Top priority
                </span>
              )}
            </div>

            {/* Question Text */}
            <p className="text-sm font-medium text-gray-900 mb-2">
              "{question.text}"
            </p>

            {/* Rationale */}
            <div className="flex items-start space-x-1.5 mb-3">
              <span className="text-gray-400 text-xs mt-0.5">💡</span>
              <p className="text-xs text-gray-600 italic">
                {question.rationale}
              </p>
            </div>

            {/* Use Button */}
            <button
              onClick={() => useSuggestedQuestion(question.id)}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all text-sm font-medium group"
            >
              <span>Använd fråga</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        ))}
      </div>

      {/* Context Info */}
      {notes.length > 0 && (
        <div className="mt-4 p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            <span className="font-medium">Baserat på:</span> {notes[notes.length - 1].text.substring(0, 50)}
            {notes[notes.length - 1].text.length > 50 ? '...' : ''}
          </p>
        </div>
      )}
    </div>
  );
}
