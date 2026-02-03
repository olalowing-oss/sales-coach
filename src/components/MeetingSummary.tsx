// @ts-nocheck
import React, { useState } from 'react';
import { Clock, FileText, Target, TrendingUp, CheckCircle } from 'lucide-react';
import { useMeetingAssistantStore } from '../store/meetingAssistantStore';
import { MeetingSummaryModal } from './MeetingSummaryModal';
import type { MeetingSummary as AISummary } from '../lib/meetingAI';

interface MeetingSummaryProps {
  onMeetingEnded?: () => void;
}

export function MeetingSummary({ onMeetingEnded }: MeetingSummaryProps) {
  const { liveSummary, endMeeting, isActive } = useMeetingAssistantStore();
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [aiSummary, setAiSummary] = useState<AISummary | null>(null);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getInterestLevelColor = (level: number): string => {
    if (level >= 75) return 'text-green-600';
    if (level >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getInterestLevelText = (level: number): string => {
    if (level >= 75) return 'Hög';
    if (level >= 50) return 'Medel';
    return 'Låg';
  };

  const handleEndMeeting = async () => {
    if (!confirm('Avsluta mötet och generera sammanfattning?')) return;

    try {
      await endMeeting();
      console.log('[MeetingSummary] Meeting ended');

      // Fetch full AI summary from database
      const { sessionId, notes, discoveryStatus, customer } = useMeetingAssistantStore.getState();

      if (!sessionId || !customer) {
        alert('Kunde inte hämta mötesdata');
        return;
      }

      // Generate AI summary
      const { generateMeetingSummary } = await import('../lib/meetingAI');
      const duration = liveSummary.duration;
      const fullSummary = await generateMeetingSummary(notes, discoveryStatus, customer, duration);

      setAiSummary(fullSummary);
      setShowSummaryModal(true);
    } catch (error) {
      console.error('[MeetingSummary] Failed to end meeting:', error);
      alert('Kunde inte avsluta mötet. Försök igen.');
    }
  };

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-700">
            📊 Live Summary
          </h4>
          {isActive && (
            <button
              onClick={handleEndMeeting}
              className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-all text-xs font-medium"
            >
              Avsluta möte
            </button>
          )}
        </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        {/* Duration */}
        <div className="p-2.5 bg-white bg-opacity-60 rounded-lg border border-indigo-200">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-600">Längd</div>
              <div className="text-sm font-semibold text-gray-900 font-mono">
                {formatDuration(liveSummary.duration)}
              </div>
            </div>
          </div>
        </div>

        {/* Notes Count */}
        <div className="p-2.5 bg-white bg-opacity-60 rounded-lg border border-indigo-200">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-600">Anteckningar</div>
              <div className="text-sm font-semibold text-gray-900">
                {liveSummary.noteCount}
              </div>
            </div>
          </div>
        </div>

        {/* Discovery Progress */}
        <div className="p-2.5 bg-white bg-opacity-60 rounded-lg border border-indigo-200">
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-600">Discovery</div>
              <div className="text-sm font-semibold text-gray-900">
                {liveSummary.discoveryCompletionRate.toFixed(0)}%
              </div>
            </div>
          </div>
        </div>

        {/* Interest Level */}
        <div className="p-2.5 bg-white bg-opacity-60 rounded-lg border border-indigo-200">
          <div className="flex items-center space-x-2">
            <TrendingUp className={`w-4 h-4 flex-shrink-0 ${getInterestLevelColor(liveSummary.interestLevel)}`} />
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-600">Intresse</div>
              <div className={`text-sm font-semibold ${getInterestLevelColor(liveSummary.interestLevel)}`}>
                {getInterestLevelText(liveSummary.interestLevel)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Topics Discussed */}
      {liveSummary.topicsDiscussed.length > 0 && (
        <div className="p-2.5 bg-white bg-opacity-60 rounded-lg border border-indigo-200">
          <div className="text-xs font-medium text-gray-700 mb-1.5">Topics:</div>
          <div className="flex flex-wrap gap-1.5">
            {liveSummary.topicsDiscussed.map((topic, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Pain Points */}
      {liveSummary.painPoints.length > 0 && (
        <div className="p-2.5 bg-white bg-opacity-60 rounded-lg border border-orange-200">
          <div className="text-xs font-medium text-gray-700 mb-1.5">Pain Points:</div>
          <ul className="space-y-1">
            {liveSummary.painPoints.map((painPoint, index) => (
              <li key={index} className="text-xs text-gray-700 flex items-start space-x-1.5">
                <span className="text-orange-600 flex-shrink-0">⚠️</span>
                <span className="flex-1">{painPoint}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Completion Status */}
      {liveSummary.discoveryCompletionRate === 100 && (
        <div className="p-2.5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2 text-xs text-green-800">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium">
              Full discovery completed! Ready för nästa steg.
            </span>
          </div>
        </div>
      )}
      </div>

      {/* Summary Modal */}
      {showSummaryModal && aiSummary && (
        <MeetingSummaryModal
          summary={aiSummary}
          onClose={() => {
            setShowSummaryModal(false);
            // Close the main Meeting Assistant window after the summary modal is closed
            if (onMeetingEnded) {
              onMeetingEnded();
            }
          }}
        />
      )}
    </>
  );
}
