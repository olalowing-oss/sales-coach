import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, TrendingUp, TrendingDown, Minus, Trash2, Eye, Sparkles, CheckCircle } from 'lucide-react';
import { loadSessionsFromDb, deleteSessionFromDb, saveSessionAnalysisToDb } from '../lib/supabaseOperations';
import { CallAnalysisModal } from './CallAnalysisModal';
import type { Database } from '../types/database';
import type { CallAnalysis } from '../types';

type DbSession = Database['public']['Tables']['call_sessions']['Row'];

interface HistoryPanelProps {
  onClose: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ onClose }) => {
  const [sessions, setSessions] = useState<DbSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<DbSession | null>(null);
  const [viewingTranscript, setViewingTranscript] = useState<string | null>(null);
  const [analyzingSession, setAnalyzingSession] = useState<DbSession | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    const data = await loadSessionsFromDb();
    setSessions(data);
    setLoading(false);
  };

  const handleDelete = async (sessionId: string) => {
    if (!window.confirm('Är du säker på att du vill ta bort detta samtal?')) return;

    const success = await deleteSessionFromDb(sessionId);
    if (success) {
      setSessions(sessions.filter(s => s.id !== sessionId));
      if (selectedSession?.id === sessionId) {
        setSelectedSession(null);
      }
    }
  };

  const handleViewTranscript = async (session: DbSession) => {
    setViewingTranscript(session.id);
  };

  const handleAnalyze = (session: DbSession) => {
    setAnalyzingSession(session);
  };

  const handleSaveAnalysis = async (analysis: CallAnalysis) => {
    if (!analyzingSession) return;

    const success = await saveSessionAnalysisToDb(analyzingSession.id, analysis);
    if (success) {
      // Reload sessions to get updated data
      await loadSessions();
      setAnalyzingSession(null);
    } else {
      throw new Error('Failed to save analysis');
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getSentimentIcon = (sentiment: 'positive' | 'neutral' | 'negative' | null) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'negative':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getExistingAnalysis = (session: DbSession): Partial<CallAnalysis> | undefined => {
    if (!session.is_analyzed) return undefined;

    return {
      industry: session.industry || undefined,
      companySize: session.company_size || undefined,
      callPurpose: session.call_purpose || undefined,
      callOutcome: session.call_outcome || undefined,
      interestLevel: session.interest_level || undefined,
      estimatedValue: session.estimated_value || undefined,
      decisionTimeframe: session.decision_timeframe || undefined,
      probability: session.probability || undefined,
      productsDiscussed: session.products_discussed || undefined,
      competitorsMentioned: session.competitors_mentioned || undefined,
      objectionsRaised: session.objections_raised || undefined,
      painPoints: session.pain_points || undefined,
      nextSteps: session.next_steps || undefined,
      followUpDate: session.follow_up_date ? new Date(session.follow_up_date) : undefined,
      notes: session.notes || undefined,
      aiSummary: session.ai_summary || undefined,
      keyTopics: session.key_topics || undefined,
      analyzedAt: session.analyzed_at ? new Date(session.analyzed_at) : undefined,
      isAnalyzed: session.is_analyzed || false
    };
  };

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Samtalshistorik</h1>
            <p className="text-gray-400">Alla tidigare samtal sparade i databasen</p>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2"
          >
            <X size={18} />
            Stäng
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Inga samtal ännu</h3>
            <p className="text-gray-400">
              Starta ditt första samtal för att se historik här
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Customer info */}
                    <div className="mb-3">
                      {session.customer_name ? (
                        <>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-white">
                              {session.customer_name}
                            </h3>
                            {session.is_analyzed && (
                              <span title="Analyserad">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              </span>
                            )}
                          </div>
                          {session.customer_company && (
                            <p className="text-sm text-gray-400">{session.customer_company}</p>
                          )}
                          {session.customer_role && (
                            <p className="text-xs text-gray-500">{session.customer_role}</p>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-white">Unnamed Call</h3>
                          {session.is_analyzed && (
                            <span title="Analyserad">
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Calendar className="w-4 h-4" />
                        {formatDate(session.started_at)}
                      </div>

                      <div className="flex items-center gap-2 text-gray-400">
                        <Clock className="w-4 h-4" />
                        {formatDuration(session.duration_seconds || 0)}
                      </div>

                      {session.sentiment && (
                        <div className="flex items-center gap-2">
                          {getSentimentIcon(session.sentiment)}
                          <span className="text-gray-400 capitalize">{session.sentiment}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-xs ${
                            session.status === 'stopped'
                              ? 'bg-gray-700 text-gray-300'
                              : 'bg-blue-600/20 text-blue-400'
                          }`}
                        >
                          {session.status}
                        </span>
                      </div>
                    </div>

                    {/* Analysis summary (if analyzed) */}
                    {session.is_analyzed && (
                      <div className="mt-4 p-4 bg-gray-900/50 rounded-lg space-y-3">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          {session.call_purpose && (
                            <div>
                              <span className="text-gray-500">Syfte:</span>
                              <span className="text-white ml-2">{session.call_purpose}</span>
                            </div>
                          )}
                          {session.call_outcome && (
                            <div>
                              <span className="text-gray-500">Resultat:</span>
                              <span className="text-white ml-2">{session.call_outcome}</span>
                            </div>
                          )}
                          {session.interest_level && (
                            <div>
                              <span className="text-gray-500">Intresse:</span>
                              <span className={`ml-2 ${
                                session.interest_level === 'Hög' ? 'text-green-400' :
                                session.interest_level === 'Medel' ? 'text-yellow-400' :
                                'text-red-400'
                              }`}>
                                {session.interest_level}
                              </span>
                            </div>
                          )}
                          {session.estimated_value && (
                            <div>
                              <span className="text-gray-500">Värde:</span>
                              <span className="text-white ml-2">{session.estimated_value.toLocaleString('sv-SE')} SEK</span>
                            </div>
                          )}
                        </div>

                        {session.next_steps && (
                          <div className="text-sm">
                            <span className="text-gray-500">Nästa steg:</span>
                            <p className="text-gray-300 mt-1">{session.next_steps}</p>
                          </div>
                        )}

                        {session.follow_up_date && (
                          <div className="text-sm">
                            <span className="text-gray-500">Uppföljning:</span>
                            <span className="text-white ml-2">{formatDate(session.follow_up_date)}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Topics */}
                    {session.topics && session.topics.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {session.topics.map((topic, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-blue-600/10 text-blue-400 text-xs rounded"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Transcript preview */}
                    {session.full_transcript && !session.is_analyzed && (
                      <div className="mt-3 p-3 bg-gray-900/50 rounded text-sm text-gray-400 line-clamp-2">
                        {session.full_transcript}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => handleAnalyze(session)}
                      className={`p-2 ${
                        session.is_analyzed
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-purple-600 hover:bg-purple-700'
                      } text-white rounded-lg flex items-center gap-2`}
                      title={session.is_analyzed ? 'Visa/redigera analys' : 'Analysera samtal'}
                    >
                      <Sparkles size={18} />
                      {session.is_analyzed && <span className="text-xs">Visa</span>}
                    </button>

                    {session.full_transcript && (
                      <button
                        onClick={() => handleViewTranscript(session)}
                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                        title="Visa transkript"
                      >
                        <Eye size={18} />
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(session.id)}
                      className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                      title="Ta bort"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transcript modal */}
      {viewingTranscript && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-6">
          <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Transkript</h2>
              <button
                onClick={() => setViewingTranscript(null)}
                className="p-2 hover:bg-gray-700 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <p className="text-gray-300 whitespace-pre-wrap">
                {sessions.find(s => s.id === viewingTranscript)?.full_transcript}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Analysis modal */}
      {analyzingSession && (
        <CallAnalysisModal
          sessionId={analyzingSession.id}
          customerName={analyzingSession.customer_name || undefined}
          customerCompany={analyzingSession.customer_company || undefined}
          transcript={analyzingSession.full_transcript || ''}
          existingAnalysis={getExistingAnalysis(analyzingSession)}
          onSave={handleSaveAnalysis}
          onClose={() => setAnalyzingSession(null)}
        />
      )}
    </div>
  );
};
