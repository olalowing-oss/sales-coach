// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Building2, Phone, Clock, TrendingUp, Users, AlertCircle, Calendar, Mail, Briefcase, ExternalLink, ClipboardList, Bot, Edit3 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AccountDetailsModal } from './AccountDetailsModal';

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  role: string | null;
  email: string | null;
  is_primary: boolean | null;
  is_decision_maker: boolean | null;
}

interface QuestionnaireAnswer {
  id: string;
  question_id: string;
  question_text: string;
  answer: string;
  source: string; // 'manual' | 'ai_auto_fill' | 'live_analysis'
  confidence: string | null;
  source_quote: string | null;
  created_at: string;
  updated_at: string;
}

interface RecentCall {
  id: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  call_purpose: string | null;
  call_outcome: string | null;
  probability: number | null;
  customer_name: string | null;
}

interface Account {
  id: string;
  company_name: string;
  org_number: string | null;
  industry: string | null;
  company_size: '1-50' | '51-200' | '201-1000' | '1000+' | null;
  website: string | null;
  account_status: string | null;
  lifecycle_stage: string | null;
  estimated_annual_value: number | null;
  data_completeness: number | null;
  notes: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;

  // Stats
  total_calls: number;
  last_call_date: string | null;
  total_duration_minutes: number;
  questionnaire_completion: number;

  // Related data
  recent_calls: RecentCall[];
  contacts: Contact[];
  questionnaire_answers: QuestionnaireAnswer[];
}

export const AccountsList: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'calls'>('recent');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        setError('Inte inloggad');
        return;
      }

      const response = await fetch('/api/accounts-list', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Kunde inte ladda kundlista');
      }

      const data = await response.json();
      setAccounts(data.accounts || []);
    } catch (err) {
      console.error('Error loading accounts:', err);
      setError(err instanceof Error ? err.message : 'Ett fel uppstod');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAccount = async (updatedData: Partial<Account>) => {
    if (!selectedAccount) return;

    try {
      const { error } = await supabase
        .from('accounts')
        .update(updatedData)
        .eq('id', selectedAccount.id);

      if (error) throw error;

      // Reload accounts to get fresh data
      await loadAccounts();
    } catch (err) {
      console.error('Error updating account:', err);
      throw err;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getLifecycleColor = (stage: string | null) => {
    switch (stage) {
      case 'prospect': return 'bg-gray-500';
      case 'qualified': return 'bg-blue-500';
      case 'opportunity': return 'bg-yellow-500';
      case 'customer': return 'bg-green-500';
      case 'champion': return 'bg-purple-500';
      default: return 'bg-gray-400';
    }
  };

  const getCompletenessColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-400';
    if (percentage >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const sortedAccounts = [...accounts].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.company_name.localeCompare(b.company_name);
      case 'calls':
        return b.total_calls - a.total_calls;
      case 'recent':
      default:
        if (!a.last_call_date) return 1;
        if (!b.last_call_date) return -1;
        return new Date(b.last_call_date).getTime() - new Date(a.last_call_date).getTime();
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Laddar kundlista...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <Building2 className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-lg font-medium mb-2">Inga kunder ännu</p>
        <p className="text-sm">Starta ett samtal för att skapa din första kund</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Kundregister</h2>
          <p className="text-gray-400 text-sm mt-1">{accounts.length} kunder totalt</p>
        </div>

        {/* Sort options */}
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy('recent')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              sortBy === 'recent'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Senaste
          </button>
          <button
            onClick={() => setSortBy('name')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              sortBy === 'name'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Namn
          </button>
          <button
            onClick={() => setSortBy('calls')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              sortBy === 'calls'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Flest samtal
          </button>
        </div>
      </div>

      {/* Accounts list - styled like HistoryPanel */}
      <div className="grid gap-4">
        {sortedAccounts.map((account) => (
          <div
            key={account.id}
            onClick={() => setSelectedAccount(account)}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Company name */}
                <div className="mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-white">
                      {account.company_name}
                    </h3>
                    {account.lifecycle_stage && (
                      <span
                        className={`px-2 py-1 rounded text-xs text-white ${getLifecycleColor(
                          account.lifecycle_stage
                        )}`}
                      >
                        {account.lifecycle_stage}
                      </span>
                    )}
                  </div>
                </div>

                {/* Metadata */}
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar className="w-4 h-4" />
                    {formatDate(account.updated_at)}
                  </div>

                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock className="w-4 h-4" />
                    {formatDuration(account.total_duration_minutes)}
                  </div>

                  <div className="flex items-center gap-2 text-gray-400">
                    <Phone className="w-4 h-4" />
                    {account.total_calls} samtal
                  </div>

                  {account.contacts.length > 0 && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Users className="w-4 h-4" />
                      {account.contacts.length} kontakter
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        account.data_completeness && account.data_completeness >= 80
                          ? 'bg-green-600/20 text-green-400'
                          : account.data_completeness && account.data_completeness >= 50
                          ? 'bg-yellow-600/20 text-yellow-400'
                          : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      Data: {account.data_completeness || 0}%
                    </span>
                  </div>
                </div>

                {/* Company summary (like analysis summary in HistoryPanel) */}
                <div className="mt-4 p-4 bg-gray-900/50 rounded-lg space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {account.industry && (
                      <div>
                        <span className="text-gray-500">Bransch:</span>
                        <span className="text-white ml-2">{account.industry}</span>
                      </div>
                    )}
                    {account.company_size && (
                      <div>
                        <span className="text-gray-500">Storlek:</span>
                        <span className="text-white ml-2">{account.company_size}</span>
                      </div>
                    )}
                    {account.org_number && (
                      <div>
                        <span className="text-gray-500">Org.nr:</span>
                        <span className="text-white ml-2">{account.org_number}</span>
                      </div>
                    )}
                    {account.estimated_annual_value && (
                      <div>
                        <span className="text-gray-500">Årsvärde:</span>
                        <span className="text-white ml-2">
                          {account.estimated_annual_value.toLocaleString('sv-SE')} SEK
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Contacts */}
                  {account.contacts.length > 0 && (
                    <div className="text-sm">
                      <span className="text-gray-500">Kontakter:</span>
                      <div className="text-gray-300 mt-1 space-y-1">
                        {account.contacts.map((contact) => (
                          <div key={contact.id} className="flex items-center gap-2">
                            <span className="text-white">
                              {contact.first_name} {contact.last_name}
                            </span>
                            {contact.role && (
                              <span className="text-gray-400 text-xs">({contact.role})</span>
                            )}
                            {contact.is_primary && (
                              <span className="px-1.5 py-0.5 bg-teal-600 text-white text-xs rounded">
                                Primär
                              </span>
                            )}
                            {contact.is_decision_maker && (
                              <span className="px-1.5 py-0.5 bg-purple-600 text-white text-xs rounded">
                                Beslutsfattare
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {account.notes && (
                    <div className="text-sm">
                      <span className="text-gray-500">Anteckningar:</span>
                      <p className="text-gray-300 mt-1">{account.notes}</p>
                    </div>
                  )}

                  {/* Website */}
                  {account.website && (
                    <div className="text-sm">
                      <span className="text-gray-500">Webbplats:</span>
                      <a
                        href={account.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-400 hover:underline ml-2"
                      >
                        {account.website}
                      </a>
                    </div>
                  )}
                </div>

                {/* Tags (like topics in HistoryPanel) */}
                {account.tags && account.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {account.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-600/10 text-blue-400 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Recent calls preview */}
                {account.recent_calls.length > 0 && (
                  <div className="mt-3 text-sm">
                    <span className="text-gray-500">Senaste samtal:</span>
                    <div className="mt-1 space-y-1">
                      {account.recent_calls.slice(0, 2).map((call) => (
                        <div key={call.id} className="text-gray-300">
                          {call.call_purpose || 'Samtal'} - {formatDateShort(call.started_at)}
                          {call.probability !== null && (
                            <span
                              className={`ml-2 px-1.5 py-0.5 text-xs rounded ${
                                call.probability >= 70
                                  ? 'bg-green-600 text-white'
                                  : call.probability >= 40
                                  ? 'bg-yellow-600 text-white'
                                  : 'bg-red-600 text-white'
                              }`}
                            >
                              {call.probability}%
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Questionnaire completion */}
                {account.questionnaire_answers.length > 0 && (
                  <div className="mt-3 text-sm">
                    <span className="text-gray-500">Frågeformulär:</span>
                    <span className="text-white ml-2">
                      {account.questionnaire_answers.length}/25 besvarade
                    </span>
                    <span
                      className={`ml-2 px-2 py-0.5 rounded text-xs ${
                        account.questionnaire_completion >= 80
                          ? 'bg-green-600/20 text-green-400'
                          : account.questionnaire_completion >= 50
                          ? 'bg-yellow-600/20 text-yellow-400'
                          : 'bg-red-600/20 text-red-400'
                      }`}
                    >
                      {account.questionnaire_completion}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Account Details Modal */}
      {selectedAccount && (
        <AccountDetailsModal
          account={selectedAccount}
          onClose={() => setSelectedAccount(null)}
          onSave={handleSaveAccount}
        />
      )}
    </div>
  );
};
