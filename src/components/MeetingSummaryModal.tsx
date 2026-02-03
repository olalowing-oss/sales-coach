// @ts-nocheck
import React, { useState } from 'react';
import { X, Download, Mail, FileText, TrendingUp, CheckCircle, AlertCircle, Clock, Users } from 'lucide-react';
import type { MeetingSummary as MeetingSummaryType } from '../lib/meetingAI';

interface MeetingSummaryModalProps {
  summary: MeetingSummaryType;
  onClose: () => void;
}

export function MeetingSummaryModal({ summary, onClose }: MeetingSummaryModalProps) {
  const [exportFormat, setExportFormat] = useState<'json' | 'markdown' | 'email'>('markdown');

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDealScoreColor = (score: number): string => {
    if (score >= 75) return 'text-green-600 bg-green-100';
    if (score >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getDealScoreLabel = (score: number): string => {
    if (score >= 75) return 'Hög sannolikhet';
    if (score >= 50) return 'Medel sannolikhet';
    return 'Låg sannolikhet';
  };

  const getUrgencyColor = (urgency: string): string => {
    if (urgency === 'high') return 'text-red-600 bg-red-100';
    if (urgency === 'medium') return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  // Export as Markdown
  const exportAsMarkdown = (): string => {
    return `# Mötessammanfattning - ${summary.overview.company}

## Översikt
- **Kund:** ${summary.overview.company}${summary.overview.contactPerson ? ` - ${summary.overview.contactPerson}` : ''}
- **Längd:** ${formatDuration(summary.overview.duration)}
- **Anteckningar:** ${summary.overview.noteCount}
- **Deal Score:** ${summary.dealScore}/100 (${getDealScoreLabel(summary.dealScore)})

## Kvalificering (BANT)
- **Completion Rate:** ${summary.qualification.completionRate.toFixed(0)}%

### Budget
${summary.qualification.budget?.amount
  ? `- Belopp: ${summary.qualification.budget.amount.toLocaleString('sv-SE')} kr`
  : '- Status: Ej identifierad'}
- Status: ${summary.qualification.budget?.status || 'unknown'}

### Beslutsmakt
${summary.qualification.authority?.decisionMaker
  ? `- Beslutsfattare: ${summary.qualification.authority.decisionMaker}`
  : '- Status: Ej identifierad'}
- Status: ${summary.qualification.authority?.status || 'unknown'}

### Behov
${summary.qualification.need.painPoints.length > 0
  ? summary.qualification.need.painPoints.map(p => `- ${p}`).join('\n')
  : '- Inga pain points identifierade'}

${summary.qualification.need.requirements.length > 0
  ? `\n**Krav:**\n${summary.qualification.need.requirements.map(r => `- ${r}`).join('\n')}`
  : ''}

### Tidsplan
${summary.qualification.timeline?.deadline
  ? `- Deadline: ${summary.qualification.timeline.deadline}`
  : '- Deadline: Ej specificerad'}
- Urgency: ${summary.qualification.timeline?.urgency || 'low'}

## Viktiga insikter
${summary.keyInsights.map((insight, i) => `${i + 1}. ${insight}`).join('\n')}

## Ämnen diskuterade
${summary.topicsDiscussed.map(t => `- ${t}`).join('\n')}

${summary.competitorsMentioned.length > 0
  ? `\n## Konkurrenter nämnda\n${summary.competitorsMentioned.map(c => `- ${c}`).join('\n')}\n`
  : ''}

## Nästa steg
${summary.nextSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

## Rekommenderade åtgärder
${summary.recommendedActions.map((action, i) => `${i + 1}. ${action}`).join('\n')}

---
*Genererad av SalesCoach Meeting Assistant*
`;
  };

  // Export as JSON
  const exportAsJSON = (): string => {
    return JSON.stringify(summary, null, 2);
  };

  // Export as Email template
  const exportAsEmail = (): string => {
    return `Ämne: Mötessammanfattning - ${summary.overview.company}

Hej,

Här är sammanfattningen från vårt möte med ${summary.overview.company}${summary.overview.contactPerson ? ` (${summary.overview.contactPerson})` : ''}.

ÖVERSIKT
Längd: ${formatDuration(summary.overview.duration)}
Deal Score: ${summary.dealScore}/100

VIKTIGA INSIKTER
${summary.keyInsights.map((insight, i) => `${i + 1}. ${insight}`).join('\n')}

BANT-KVALIFICERING (${summary.qualification.completionRate.toFixed(0)}%)
• Budget: ${summary.qualification.budget?.amount ? `${summary.qualification.budget.amount.toLocaleString('sv-SE')} kr` : 'Ej identifierad'}
• Beslutsmakt: ${summary.qualification.authority?.decisionMaker || 'Ej identifierad'}
• Behov: ${summary.qualification.need.painPoints.length > 0 ? summary.qualification.need.painPoints.join(', ') : 'Ej identifierade'}
• Tidsplan: ${summary.qualification.timeline?.deadline || 'Ej specificerad'}

NÄSTA STEG
${summary.nextSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

${summary.competitorsMentioned.length > 0
  ? `KONKURRENTER NÄMNDA\n${summary.competitorsMentioned.join(', ')}\n\n`
  : ''}Med vänlig hälsning,
[Ditt namn]

---
Genererad av SalesCoach Meeting Assistant
`;
  };

  const handleExport = () => {
    let content = '';
    let filename = '';
    let mimeType = '';

    switch (exportFormat) {
      case 'markdown':
        content = exportAsMarkdown();
        filename = `meeting-summary-${summary.overview.company.replace(/\s+/g, '-')}.md`;
        mimeType = 'text/markdown';
        break;
      case 'json':
        content = exportAsJSON();
        filename = `meeting-summary-${summary.overview.company.replace(/\s+/g, '-')}.json`;
        mimeType = 'application/json';
        break;
      case 'email':
        content = exportAsEmail();
        filename = `meeting-summary-${summary.overview.company.replace(/\s+/g, '-')}.txt`;
        mimeType = 'text/plain';
        break;
    }

    // Create download
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    let content = '';
    switch (exportFormat) {
      case 'markdown':
        content = exportAsMarkdown();
        break;
      case 'json':
        content = exportAsJSON();
        break;
      case 'email':
        content = exportAsEmail();
        break;
    }

    try {
      await navigator.clipboard.writeText(content);
      alert('Kopierat till urklipp!');
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Kunde inte kopiera till urklipp');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              📊 Mötessammanfattning
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {summary.overview.company}
              {summary.overview.contactPerson && ` - ${summary.overview.contactPerson}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <div className="text-xs font-medium text-gray-600">Längd</div>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatDuration(summary.overview.duration)}
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="w-5 h-5 text-purple-600" />
                <div className="text-xs font-medium text-gray-600">Anteckningar</div>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {summary.overview.noteCount}
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <div className="text-xs font-medium text-gray-600">Deal Score</div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-2xl font-bold text-gray-900">
                  {summary.dealScore}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDealScoreColor(summary.dealScore)}`}>
                  {getDealScoreLabel(summary.dealScore)}
                </span>
              </div>
            </div>
          </div>

          {/* BANT Qualification */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">BANT Kvalificering</h3>
              <div className="flex items-center space-x-2">
                <div className="text-sm font-medium text-gray-700">
                  {summary.qualification.completionRate.toFixed(0)}% complete
                </div>
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                    style={{ width: `${summary.qualification.completionRate}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Budget */}
              <div className="p-3 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  {summary.qualification.budget?.status === 'confirmed' ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-gray-400" />
                  )}
                  <div className="text-sm font-semibold text-gray-900">Budget</div>
                </div>
                {summary.qualification.budget?.amount ? (
                  <div className="text-lg font-bold text-gray-900">
                    {summary.qualification.budget.amount.toLocaleString('sv-SE')} kr
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">Ej identifierad</div>
                )}
                <div className="text-xs text-gray-500 mt-1">
                  Status: {summary.qualification.budget?.status || 'unknown'}
                </div>
              </div>

              {/* Authority */}
              <div className="p-3 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  {summary.qualification.authority?.status === 'confirmed' ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-gray-400" />
                  )}
                  <div className="text-sm font-semibold text-gray-900">Beslutsmakt</div>
                </div>
                {summary.qualification.authority?.decisionMaker ? (
                  <div className="text-sm font-medium text-gray-900">
                    {summary.qualification.authority.decisionMaker}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">Ej identifierad</div>
                )}
                <div className="text-xs text-gray-500 mt-1">
                  Status: {summary.qualification.authority?.status || 'unknown'}
                </div>
              </div>

              {/* Need */}
              <div className="p-3 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  {summary.qualification.need.painPoints.length > 0 ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-gray-400" />
                  )}
                  <div className="text-sm font-semibold text-gray-900">Behov</div>
                </div>
                {summary.qualification.need.painPoints.length > 0 ? (
                  <ul className="space-y-1">
                    {summary.qualification.need.painPoints.slice(0, 2).map((point, i) => (
                      <li key={i} className="text-xs text-gray-700 flex items-start space-x-1">
                        <span className="text-orange-600">•</span>
                        <span className="flex-1">{point}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-gray-500">Ej identifierade</div>
                )}
              </div>

              {/* Timeline */}
              <div className="p-3 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  {summary.qualification.timeline?.deadline ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-gray-400" />
                  )}
                  <div className="text-sm font-semibold text-gray-900">Tidsplan</div>
                </div>
                {summary.qualification.timeline?.deadline ? (
                  <div className="text-sm font-medium text-gray-900">
                    {summary.qualification.timeline.deadline}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">Ej specificerad</div>
                )}
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${getUrgencyColor(summary.qualification.timeline?.urgency || 'low')}`}>
                  {summary.qualification.timeline?.urgency || 'low'} urgency
                </span>
              </div>
            </div>
          </div>

          {/* Key Insights */}
          {summary.keyInsights.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Viktiga insikter</h3>
              <ul className="space-y-2">
                {summary.keyInsights.map((insight, i) => (
                  <li key={i} className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    <span className="flex-1 text-sm text-gray-800">{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Topics & Competitors */}
          <div className="grid grid-cols-2 gap-4">
            {summary.topicsDiscussed.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Ämnen diskuterade</h3>
                <div className="flex flex-wrap gap-2">
                  {summary.topicsDiscussed.map((topic, i) => (
                    <span key={i} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {summary.competitorsMentioned.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Konkurrenter nämnda</h3>
                <div className="flex flex-wrap gap-2">
                  {summary.competitorsMentioned.map((competitor, i) => (
                    <span key={i} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                      {competitor}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Next Steps */}
          {summary.nextSteps.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Nästa steg</h3>
              <ul className="space-y-2">
                {summary.nextSteps.map((step, i) => (
                  <li key={i} className="flex items-start space-x-2 text-sm text-gray-700">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommended Actions */}
          {summary.recommendedActions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Rekommenderade åtgärder</h3>
              <ul className="space-y-2">
                {summary.recommendedActions.map((action, i) => (
                  <li key={i} className="flex items-start space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-800">{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer - Export Options */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Export format:</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setExportFormat('markdown')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    exportFormat === 'markdown'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Markdown
                </button>
                <button
                  onClick={() => setExportFormat('json')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    exportFormat === 'json'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  JSON
                </button>
                <button
                  onClick={() => setExportFormat('email')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    exportFormat === 'email'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Email
                </button>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>Kopiera</span>
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all text-sm font-medium flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Ladda ner</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
