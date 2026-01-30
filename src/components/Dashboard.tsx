import React, { useState, useEffect } from 'react';
import { Phone, GraduationCap, Beaker, Clock, TrendingUp, Target, Calendar, ChevronRight, Play } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getAllDemoScripts } from '../data/demoScripts';
import { useAuth } from '../contexts/AuthContext';

interface DashboardProps {
  onStartTraining: () => void;
  onSelectDemoScript: (scriptId: string) => void;
  onOpenHistory: () => void;
}

interface RecentCall {
  id: string;
  customer_name: string | null;
  customer_company: string | null;
  started_at: string;
  duration_seconds: number | null;
  sentiment: 'positive' | 'neutral' | 'negative' | null;
  call_outcome: string | null;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onStartTraining,
  onSelectDemoScript,
  onOpenHistory
}) => {
  const { user } = useAuth();
  const [recentCalls, setRecentCalls] = useState<RecentCall[]>([]);
  const [trainingScenarios, setTrainingScenarios] = useState<any[]>([]);
  const [isLoadingCalls, setIsLoadingCalls] = useState(true);
  const [isLoadingScenarios, setIsLoadingScenarios] = useState(true);
  const [stats, setStats] = useState({
    totalCalls: 0,
    totalTraining: 0,
    avgSentiment: 0
  });

  // Fetch recent calls
  useEffect(() => {
    const fetchRecentCalls = async () => {
      if (!user) return;

      setIsLoadingCalls(true);
      try {
        const { data, error } = await supabase
          .from('call_sessions')
          .select('id, customer_name, customer_company, started_at, duration_seconds, sentiment, call_outcome')
          .eq('user_id', user.id)
          .order('started_at', { ascending: false })
          .limit(5);

        if (error) {
          console.error('Error fetching calls:', error);
        } else if (data) {
          setRecentCalls(data);
        }

        // Fetch stats
        const { count: totalCount } = await supabase
          .from('call_sessions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        setStats(prev => ({ ...prev, totalCalls: totalCount || 0 }));
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoadingCalls(false);
      }
    };

    fetchRecentCalls();
  }, [user]);

  // Fetch training scenarios
  useEffect(() => {
    const fetchScenarios = async () => {
      setIsLoadingScenarios(true);
      try {
        const { data, error } = await supabase
          .from('training_scenarios')
          .select('*')
          .eq('is_global', true)
          .order('difficulty', { ascending: true })
          .limit(6);

        if (error) {
          console.error('Error fetching scenarios:', error);
        } else if (data) {
          setTrainingScenarios(data);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoadingScenarios(false);
      }
    };

    fetchScenarios();
  }, []);

  const demoScripts = getAllDemoScripts().slice(0, 4);

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m sedan`;
    if (diffHours < 24) return `${diffHours}h sedan`;
    if (diffDays < 7) return `${diffDays}d sedan`;
    return date.toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' });
  };

  const getSentimentColor = (sentiment: string | null) => {
    switch (sentiment) {
      case 'positive': return 'text-green-400';
      case 'neutral': return 'text-yellow-400';
      case 'negative': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getSentimentIcon = (sentiment: string | null) => {
    switch (sentiment) {
      case 'positive': return '😊';
      case 'neutral': return '😐';
      case 'negative': return '😟';
      default: return '❓';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Välkommen tillbaka, {user?.email?.split('@')[0] || 'Säljare'}! 👋
        </h1>
        <p className="text-blue-100">
          Redo att förbättra dina säljfärdigheter? Välj ett alternativ nedan för att komma igång.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <Phone className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-gray-400">Totala samtal</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.totalCalls}</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <GraduationCap className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-gray-400">Träningssessioner</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.totalTraining}</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span className="text-sm text-gray-400">Framgång</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {stats.avgSentiment > 0 ? `${Math.round(stats.avgSentiment)}%` : '-'}
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent History */}
        <div className="bg-gray-800 rounded-xl border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-400" />
                <h2 className="text-xl font-semibold text-white">Senaste samtal</h2>
              </div>
              <button
                onClick={onOpenHistory}
                className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                Visa alla
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {isLoadingCalls ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : recentCalls.length > 0 ? (
              <div className="space-y-3">
                {recentCalls.map((call) => (
                  <div
                    key={call.id}
                    className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                    onClick={() => onOpenHistory()}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-white">
                          {call.customer_name || call.customer_company || 'Samtal utan namn'}
                        </span>
                        {call.customer_name && call.customer_company && (
                          <span className="text-xs text-gray-400">
                            • {call.customer_company}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span>{formatDate(call.started_at)}</span>
                        <span>•</span>
                        <span>{formatDuration(call.duration_seconds)}</span>
                        {call.sentiment && (
                          <>
                            <span>•</span>
                            <span className={getSentimentColor(call.sentiment)}>
                              {getSentimentIcon(call.sentiment)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Phone className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">Inga samtal ännu</p>
                <p className="text-gray-500 text-xs mt-1">Starta ditt första samtal för att se historik här</p>
              </div>
            )}
          </div>
        </div>

        {/* Training Scenarios */}
        <div className="bg-gray-800 rounded-xl border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <GraduationCap className="w-5 h-5 text-purple-400" />
                <h2 className="text-xl font-semibold text-white">Säljträning</h2>
              </div>
              <button
                onClick={onStartTraining}
                className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                Visa alla
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {isLoadingScenarios ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : trainingScenarios.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {trainingScenarios.map((scenario) => (
                  <button
                    key={scenario.id}
                    onClick={onStartTraining}
                    className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-purple-600/20 hover:border-purple-600 border border-transparent transition-all text-left group"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-white">
                          {scenario.name}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          scenario.difficulty === 'easy' ? 'bg-green-600/20 text-green-400' :
                          scenario.difficulty === 'medium' ? 'bg-yellow-600/20 text-yellow-400' :
                          'bg-red-600/20 text-red-400'
                        }`}>
                          {scenario.difficulty === 'easy' ? 'Lätt' : scenario.difficulty === 'medium' ? 'Medel' : 'Svår'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 line-clamp-1">
                        {scenario.description}
                      </p>
                    </div>
                    <Play className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transition-colors ml-3" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <GraduationCap className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">Inga träningsscenarier tillgängliga</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Demo Scripts Section */}
      <div className="bg-gray-800 rounded-xl border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Beaker className="w-5 h-5 text-teal-400" />
            <h2 className="text-xl font-semibold text-white">Demosamtal</h2>
          </div>
          <p className="text-sm text-gray-400 mt-2">
            Öva med förinspelat samtalsscript för att träna på olika säljsituationer
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {demoScripts.map((script) => (
              <button
                key={script.id}
                onClick={() => {
                  onSelectDemoScript(script.id);
                }}
                className="flex items-start gap-3 p-4 bg-gray-700/50 rounded-lg hover:bg-teal-600/20 hover:border-teal-600 border border-transparent transition-all text-left group"
              >
                <Target className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-white mb-1">{script.name}</h3>
                  <p className="text-xs text-gray-400 line-clamp-2">
                    {script.description}
                  </p>
                </div>
                <Play className="w-4 h-4 text-gray-500 group-hover:text-teal-400 transition-colors flex-shrink-0 mt-0.5" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={onOpenHistory}
          className="p-6 bg-blue-600/10 border-2 border-blue-600/30 rounded-xl hover:bg-blue-600/20 hover:border-blue-600/50 transition-all group"
        >
          <Phone className="w-8 h-8 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="text-lg font-semibold text-white mb-1">Visa historik</h3>
          <p className="text-sm text-gray-400">Se alla tidigare samtal och analyser</p>
        </button>

        <button
          onClick={onStartTraining}
          className="p-6 bg-purple-600/10 border-2 border-purple-600/30 rounded-xl hover:bg-purple-600/20 hover:border-purple-600/50 transition-all group"
        >
          <GraduationCap className="w-8 h-8 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="text-lg font-semibold text-white mb-1">Starta träning</h3>
          <p className="text-sm text-gray-400">Träna mot AI-kunder i olika scenarion</p>
        </button>

        <button
          onClick={() => onSelectDemoScript(demoScripts[0].id)}
          className="p-6 bg-teal-600/10 border-2 border-teal-600/30 rounded-xl hover:bg-teal-600/20 hover:border-teal-600/50 transition-all group"
        >
          <Beaker className="w-8 h-8 text-teal-400 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="text-lg font-semibold text-white mb-1">Prova demo</h3>
          <p className="text-sm text-gray-400">Testa med förinspelat samtalsscript</p>
        </button>
      </div>
    </div>
  );
};
