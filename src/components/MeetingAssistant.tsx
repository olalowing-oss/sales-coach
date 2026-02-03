import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useMeetingAssistantStore } from '../store/meetingAssistantStore';
import { MeetingQuickInput } from './MeetingQuickInput';
import { MeetingTimeline } from './MeetingTimeline';
import { MeetingDiscoveryChecklist } from './MeetingDiscoveryChecklist';
import { MeetingSuggestedQuestions } from './MeetingSuggestedQuestions';
import { MeetingCoachingTips } from './MeetingCoachingTips';
import { MeetingQuickAccess } from './MeetingQuickAccess';
import { MeetingSummary } from './MeetingSummary';
import { MeetingAIAnswers } from './MeetingAIAnswers';

interface MeetingAssistantProps {
  onClose: () => void;
}

export function MeetingAssistant({ onClose }: MeetingAssistantProps) {
  const {
    isActive,
    customer,
    productId,
    liveSummary,
    updateLiveSummary,
    aiAnswers,
    isLoadingAnswer,
    askQuestion
  } = useMeetingAssistantStore();

  // Update live summary every 10 seconds
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      updateLiveSummary();
    }, 10000);

    return () => clearInterval(interval);
  }, [isActive, updateLiveSummary]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      // Auto-save is handled in addNote, but we could add explicit save here
      console.log('[MeetingAssistant] Auto-save checkpoint');
    }, 30000);

    return () => clearInterval(interval);
  }, [isActive]);

  if (!isActive || !customer) {
    return null;
  }

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full h-full max-w-[1600px] max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-white">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-500">ACTIVE</span>
            </div>
            <div className="h-6 w-px bg-gray-300"></div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                📋 Meeting Assistant
              </h2>
              <p className="text-sm text-gray-600">
                {customer.company}
                {customer.contactPerson && ` - ${customer.contactPerson}`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-500">Duration</div>
              <div className="text-lg font-mono font-semibold text-indigo-600">
                {formatDuration(liveSummary.duration)}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close (meeting will continue in background)"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Main Content - Split Screen */}
        <div className="flex flex-1 min-h-0">
          {/* Left Panel - Meeting Notes */}
          <div className="w-1/2 flex flex-col border-r border-gray-200 bg-gray-50 overflow-y-auto">
            <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                📝 Meeting Notes
              </h3>
            </div>

            {/* Quick Input */}
            <div className="p-4 bg-white border-b border-gray-200 sticky top-[57px] z-10">
              <MeetingQuickInput />
            </div>

            {/* Timeline */}
            <div className="p-4 space-y-4">
              <MeetingTimeline />
            </div>

            {/* Discovery Checklist */}
            <div className="p-4 bg-white border-t border-gray-200">
              <MeetingDiscoveryChecklist />
            </div>

            {/* Live Summary */}
            <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-t border-gray-200">
              <MeetingSummary onMeetingEnded={onClose} />
            </div>
          </div>

          {/* Right Panel - AI Suggestions & Coaching */}
          <div className="w-1/2 flex flex-col bg-white overflow-y-auto">
            <div className="p-4 border-b border-gray-200 sticky top-0 z-10 bg-white">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                🎯 AI Suggestions & Coaching
              </h3>
            </div>

            {/* AI Answers from Knowledge Base */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
              <MeetingAIAnswers
                answers={aiAnswers}
                isLoading={isLoadingAnswer}
                onAskQuestion={askQuestion}
              />
            </div>

            {/* Suggested Questions */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
              <MeetingSuggestedQuestions />
            </div>

            {/* Coaching Tips */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-white">
              <MeetingCoachingTips />
            </div>

            {/* Quick Access */}
            <div className="p-4">
              <MeetingQuickAccess />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
