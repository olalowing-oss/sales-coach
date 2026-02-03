import React from 'react';
import { Clock, Target, TrendingUp, AlertCircle, CheckCircle2, Lightbulb, ArrowRight } from 'lucide-react';
import type { MeetingSummary } from '../lib/meetingAI';

interface MeetingAssistantHistoryCardProps {
  summary: MeetingSummary;
  startedAt: string;
  formatDuration: (seconds: number) => string;
  formatDate: (dateStr: string) => string;
}

export function MeetingAssistantHistoryCard({
  summary,
  startedAt,
  formatDuration,
  formatDate
}: MeetingAssistantHistoryCardProps) {
  const getBantStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'partial':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'unknown':
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getBantStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Bekräftad';
      case 'partial':
        return 'Delvis';
      case 'unknown':
        return 'Okänd';
      default:
        return status;
    }
  };

  const getDealScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getDealScoreLabel = (score: number) => {
    if (score >= 70) return 'Hög potential';
    if (score >= 40) return 'Medel potential';
    return 'Låg potential';
  };

  return (
    <div className="mt-4 p-5 bg-gradient-to-r from-purple-900/20 to-indigo-900/20 rounded-lg border border-purple-700/30 space-y-4">
      {/* Header Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-purple-600 text-white text-xs font-semibold rounded-full">
            📋 Meeting Assistant
          </span>
          <span className="text-xs text-gray-400">{formatDate(startedAt)}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-gray-400">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{formatDuration(summary.overview.duration)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-400">
            <Target className="w-4 h-4" />
            <span className="text-sm">{summary.overview.noteCount} anteckningar</span>
          </div>
        </div>
      </div>

      {/* Deal Score */}
      <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
        <div>
          <div className="text-sm text-gray-400 mb-1">Deal Score</div>
          <div className="flex items-center gap-2">
            <span className={`text-3xl font-bold ${getDealScoreColor(summary.dealScore)}`}>
              {summary.dealScore}
            </span>
            <span className="text-sm text-gray-400">/ 100</span>
          </div>
          <div className={`text-xs mt-1 ${getDealScoreColor(summary.dealScore)}`}>
            {getDealScoreLabel(summary.dealScore)}
          </div>
        </div>

        {/* BANT Completion */}
        <div className="text-right">
          <div className="text-sm text-gray-400 mb-1">BANT Discovery</div>
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  summary.qualification.completionRate >= 70
                    ? 'bg-green-500'
                    : summary.qualification.completionRate >= 40
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${summary.qualification.completionRate}%` }}
              />
            </div>
            <span className="text-sm text-white font-semibold">
              {summary.qualification.completionRate}%
            </span>
          </div>
        </div>
      </div>

      {/* BANT Details */}
      <div className="grid grid-cols-2 gap-3">
        {/* Budget */}
        <div className="p-3 bg-gray-900/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-400 uppercase">Budget</span>
            {getBantStatusIcon(summary.qualification.budget.status)}
          </div>
          <div className="text-sm text-gray-300">
            {getBantStatusLabel(summary.qualification.budget.status)}
          </div>
          {summary.qualification.budget.range && (
            <div className="text-xs text-gray-500 mt-1">
              {summary.qualification.budget.range}
            </div>
          )}
        </div>

        {/* Authority */}
        <div className="p-3 bg-gray-900/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-400 uppercase">Authority</span>
            {getBantStatusIcon(summary.qualification.authority.status)}
          </div>
          <div className="text-sm text-gray-300">
            {getBantStatusLabel(summary.qualification.authority.status)}
          </div>
          {summary.qualification.authority.decisionMaker && (
            <div className="text-xs text-gray-500 mt-1">
              {summary.qualification.authority.decisionMaker}
            </div>
          )}
        </div>

        {/* Need */}
        <div className="p-3 bg-gray-900/30 rounded-lg col-span-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-400 uppercase">Need</span>
            <span className="text-xs text-gray-500">
              {summary.qualification.need.painPoints.length} pain points
            </span>
          </div>
          {summary.qualification.need.painPoints.length > 0 ? (
            <ul className="space-y-1">
              {summary.qualification.need.painPoints.slice(0, 2).map((pain, idx) => (
                <li key={idx} className="text-xs text-gray-300 flex items-start gap-1.5">
                  <span className="text-orange-500 flex-shrink-0">•</span>
                  <span>{pain}</span>
                </li>
              ))}
              {summary.qualification.need.painPoints.length > 2 && (
                <li className="text-xs text-gray-500 italic">
                  +{summary.qualification.need.painPoints.length - 2} fler...
                </li>
              )}
            </ul>
          ) : (
            <div className="text-sm text-gray-500">Inga pain points identifierade</div>
          )}
        </div>

        {/* Timeline */}
        <div className="p-3 bg-gray-900/30 rounded-lg col-span-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-400 uppercase">Timeline</span>
            <span className={`text-xs px-2 py-0.5 rounded ${
              summary.qualification.timeline.urgency === 'high'
                ? 'bg-red-600/20 text-red-400'
                : summary.qualification.timeline.urgency === 'medium'
                ? 'bg-yellow-600/20 text-yellow-400'
                : 'bg-gray-600/20 text-gray-400'
            }`}>
              {summary.qualification.timeline.urgency === 'high'
                ? 'Hög'
                : summary.qualification.timeline.urgency === 'medium'
                ? 'Medel'
                : 'Låg'}
            </span>
          </div>
          {summary.qualification.timeline.expectedDecision && (
            <div className="text-sm text-gray-300">
              Förväntat beslut: {summary.qualification.timeline.expectedDecision}
            </div>
          )}
        </div>
      </div>

      {/* Key Insights */}
      {summary.keyInsights.length > 0 && (
        <div className="p-4 bg-blue-900/10 border border-blue-700/30 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold text-blue-300">Viktiga insikter</span>
          </div>
          <ul className="space-y-2">
            {summary.keyInsights.slice(0, 3).map((insight, idx) => (
              <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                <span className="text-blue-400 flex-shrink-0">→</span>
                <span>{insight}</span>
              </li>
            ))}
            {summary.keyInsights.length > 3 && (
              <li className="text-sm text-gray-500 italic">
                +{summary.keyInsights.length - 3} fler insikter...
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Topics Discussed */}
      {summary.topicsDiscussed.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-gray-400 uppercase mb-2">Topics</div>
          <div className="flex flex-wrap gap-2">
            {summary.topicsDiscussed.map((topic, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 bg-indigo-600/20 text-indigo-300 text-xs rounded-full border border-indigo-600/30"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Competitors */}
      {summary.competitorsMentioned.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-gray-400 uppercase mb-2">Konkurrenter nämnda</div>
          <div className="flex flex-wrap gap-2">
            {summary.competitorsMentioned.map((competitor, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 bg-red-600/20 text-red-300 text-xs rounded-full border border-red-600/30"
              >
                {competitor}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Next Steps */}
      {summary.nextSteps.length > 0 && (
        <div className="p-4 bg-green-900/10 border border-green-700/30 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <ArrowRight className="w-4 h-4 text-green-400" />
            <span className="text-sm font-semibold text-green-300">Nästa steg</span>
          </div>
          <ul className="space-y-2">
            {summary.nextSteps.map((step, idx) => (
              <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                <span className="text-green-400 flex-shrink-0">{idx + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommended Actions */}
      {summary.recommendedActions.length > 0 && (
        <div className="p-3 bg-yellow-900/10 border border-yellow-700/30 rounded-lg">
          <div className="text-xs font-semibold text-yellow-300 uppercase mb-2">
            Rekommenderade åtgärder
          </div>
          <ul className="space-y-1.5">
            {summary.recommendedActions.map((action, idx) => (
              <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
