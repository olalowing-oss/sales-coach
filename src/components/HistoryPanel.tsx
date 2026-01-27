import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, TrendingUp, TrendingDown, Minus, Trash2, Eye } from 'lucide-react';
import { loadSessionsFromDb, deleteSessionFromDb } from '../lib/supabaseOperations';
import type { Database } from '../types/database';

type DbSession = Database['public']['Tables']['call_sessions']['Row'];

interface HistoryPanelProps {
  onClose: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ onClose }) => {
  const [sessions, setSessions] = useState<DbSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<DbSession | null>(null);
  const [viewingTranscript, setViewingTranscript] = useState<string | null>(null);

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
    // Could load segments here if needed
    // const segments = await loadSessionSegments(session.id);
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
                          <h3 className="text-lg font-semibold text-white">
                            {session.customer_name}
                          </h3>
                          {session.customer_company && (
                            <p className="text-sm text-gray-400">{session.customer_company}</p>
                          )}
                          {session.customer_role && (
                            <p className="text-xs text-gray-500">{session.customer_role}</p>
                          )}
                        </>
                      ) : (
                        <h3 className="text-lg font-semibold text-white">Unnamed Call</h3>
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
                    {session.full_transcript && (
                      <div className="mt-3 p-3 bg-gray-900/50 rounded text-sm text-gray-400 line-clamp-2">
                        {session.full_transcript}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 ml-4">
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
    </div>
  );
};
