// @ts-nocheck
import React, { useState } from 'react';
import { X, Building2, Users, Phone, Mail, FileText, ClipboardList, Save } from 'lucide-react';

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
  source: string;
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
  total_calls: number;
  last_call_date: string | null;
  total_duration_minutes: number;
  questionnaire_completion: number;
  recent_calls: RecentCall[];
  contacts: Contact[];
  questionnaire_answers: QuestionnaireAnswer[];
}

interface AccountDetailsModalProps {
  account: Account;
  onClose: () => void;
  onSave?: (updatedAccount: Partial<Account>) => Promise<void>;
}

export const AccountDetailsModal: React.FC<AccountDetailsModalProps> = ({
  account,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    company_name: account.company_name,
    org_number: account.org_number || '',
    industry: account.industry || '',
    company_size: account.company_size || '',
    website: account.website || '',
    account_status: account.account_status || '',
    lifecycle_stage: account.lifecycle_stage || '',
    estimated_annual_value: account.estimated_annual_value || '',
    notes: account.notes || '',
    tags: account.tags?.join(', ') || ''
  });

  const [activeTab, setActiveTab] = useState<'basic' | 'contacts' | 'questionnaire'>('basic');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (onSave) {
      setIsSaving(true);
      try {
        await onSave({
          ...formData,
          estimated_annual_value: formData.estimated_annual_value ? Number(formData.estimated_annual_value) : null,
          tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : null
        });
        onClose();
      } catch (error) {
        console.error('Error saving account:', error);
        alert('Kunde inte spara ändringar');
      } finally {
        setIsSaving(false);
      }
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Building2 className="w-6 h-6 text-teal-500" />
              {account.company_name}
            </h2>
            {account.org_number && (
              <p className="text-gray-400 mt-1">
                Org.nr: {account.org_number}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-700 px-6">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('basic')}
              className={`px-4 py-3 text-sm font-medium transition-colors flex items-center gap-2 border-b-2 ${
                activeTab === 'basic'
                  ? 'border-teal-400 text-teal-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              Grundläggande Info
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className={`px-4 py-3 text-sm font-medium transition-colors flex items-center gap-2 border-b-2 ${
                activeTab === 'contacts'
                  ? 'border-teal-400 text-teal-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              Kontakter & Samtal
              <span className="px-2 py-0.5 bg-teal-500/20 text-teal-300 rounded-full text-xs">
                {account.contacts.length + account.recent_calls.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('questionnaire')}
              className={`px-4 py-3 text-sm font-medium transition-colors flex items-center gap-2 border-b-2 ${
                activeTab === 'questionnaire'
                  ? 'border-teal-400 text-teal-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              Frågeformulär
              {account.questionnaire_answers.length > 0 && (
                <span className="px-2 py-0.5 bg-teal-500/20 text-teal-300 rounded-full text-xs">
                  {account.questionnaire_answers.length}/25
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-8">
          {/* Tab: Grundläggande information */}
          {activeTab === 'basic' && (
            <>
              <section>
                <h3 className="text-lg font-semibold text-white mb-4">Företagsinformation</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Företagsnamn
                    </label>
                    <input
                      type="text"
                      value={formData.company_name}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                      className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Organisationsnummer
                    </label>
                    <input
                      type="text"
                      value={formData.org_number}
                      onChange={(e) => setFormData({ ...formData, org_number: e.target.value })}
                      className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Bransch
                    </label>
                    <input
                      type="text"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="t.ex. Teknologi, Tillverkning..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Företagsstorlek
                    </label>
                    <select
                      value={formData.company_size}
                      onChange={(e) => setFormData({ ...formData, company_size: e.target.value })}
                      className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">Välj storlek</option>
                      <option value="1-50">1-50 anställda</option>
                      <option value="51-200">51-200 anställda</option>
                      <option value="201-1000">201-1000 anställda</option>
                      <option value="1000+">1000+ anställda</option>
                    </select>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-white mb-4">Affärsdata</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Webbplats
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Uppskattat årsvärde (SEK)
                    </label>
                    <input
                      type="number"
                      value={formData.estimated_annual_value}
                      onChange={(e) => setFormData({ ...formData, estimated_annual_value: e.target.value })}
                      className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="100000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Livscykelstadium
                    </label>
                    <select
                      value={formData.lifecycle_stage}
                      onChange={(e) => setFormData({ ...formData, lifecycle_stage: e.target.value })}
                      className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">Välj stadium</option>
                      <option value="prospect">Prospect</option>
                      <option value="qualified">Qualified</option>
                      <option value="opportunity">Opportunity</option>
                      <option value="customer">Customer</option>
                      <option value="champion">Champion</option>
                    </select>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-white mb-4">Övrig information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Taggar (separera med komma)
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="t.ex. Viktig kund, SaaS, Stockholm"
                      className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Anteckningar
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[100px]"
                      placeholder="Fria anteckningar om kunden..."
                    />
                  </div>
                </div>
              </section>
            </>
          )}

          {/* Tab: Kontakter & Samtal */}
          {activeTab === 'contacts' && (
            <>
              {/* Contacts */}
              {account.contacts.length > 0 && (
                <section>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Kontakter ({account.contacts.length})
                  </h3>
                  <div className="space-y-3">
                    {account.contacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="p-4 bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white font-medium">
                              {contact.first_name} {contact.last_name}
                            </div>
                            {contact.role && (
                              <div className="text-gray-400 text-sm mt-1">{contact.role}</div>
                            )}
                            {contact.email && (
                              <div className="flex items-center gap-2 text-gray-400 text-sm mt-1">
                                <Mail className="w-3 h-3" />
                                {contact.email}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {contact.is_primary && (
                              <span className="px-2 py-1 bg-teal-600 text-white text-xs rounded">
                                Primär
                              </span>
                            )}
                            {contact.is_decision_maker && (
                              <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded">
                                Beslutsfattare
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Recent Calls */}
              {account.recent_calls.length > 0 && (
                <section>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Samtalshistorik ({account.recent_calls.length})
                  </h3>
                  <div className="space-y-3">
                    {account.recent_calls.map((call) => (
                      <div
                        key={call.id}
                        className="p-4 bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="text-white font-medium">
                              {call.call_purpose || 'Samtal'}
                              {call.customer_name && (
                                <span className="text-gray-400 font-normal ml-2">
                                  med {call.customer_name}
                                </span>
                              )}
                            </div>
                            <div className="text-gray-400 text-sm mt-1">
                              {formatDate(call.started_at)}
                              {call.duration_seconds && (
                                <span className="ml-2">
                                  • {Math.round(call.duration_seconds / 60)} min
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {call.call_outcome && (
                              <span className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded">
                                {call.call_outcome}
                              </span>
                            )}
                            {call.probability !== null && (
                              <span
                                className={`px-2 py-1 text-xs rounded font-medium ${
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
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {account.contacts.length === 0 && account.recent_calls.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Inga kontakter eller samtal registrerade ännu</p>
                </div>
              )}
            </>
          )}

          {/* Tab: Frågeformulär */}
          {activeTab === 'questionnaire' && (
            <section>
              {account.questionnaire_answers.length > 0 ? (
                <div className="space-y-3">
                  {account.questionnaire_answers.map((qa) => (
                    <div
                      key={qa.id}
                      className="p-4 bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="text-sm text-gray-400 mb-1">{qa.question_text}</div>
                          <div className="text-white">{qa.answer}</div>
                          <div className="text-xs text-gray-500 mt-2">
                            Uppdaterad: {formatDate(qa.updated_at)}
                          </div>
                          {qa.source_quote && (
                            <div className="mt-2 pl-3 border-l-2 border-gray-600 text-xs text-gray-400 italic">
                              "{qa.source_quote}"
                            </div>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          {qa.source === 'manual' ? (
                            <span className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded">
                              Manuellt
                            </span>
                          ) : qa.source === 'ai_auto_fill' ? (
                            <span className="px-2 py-1 bg-purple-600/20 text-purple-400 text-xs rounded">
                              AI-ifylld
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded">
                              Live-analys
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <ClipboardList className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Inga frågeformulär besvarade ännu</p>
                </div>
              )}
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-800 border-t border-gray-700 p-6 flex justify-between items-center gap-4">
          <div></div>
          <div className="flex gap-4">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              Avbryt
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sparar...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Spara
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
