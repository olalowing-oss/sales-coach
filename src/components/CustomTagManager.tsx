// @ts-nocheck
import React, { useState } from 'react';
import { Plus, X, Tag, Lightbulb, FileText, MessageSquare } from 'lucide-react';
import { useMeetingAssistantStore } from '../store/meetingAssistantStore';
import type { QuickTag, DiscoveryItem } from '../store/meetingAssistantStore';

interface CustomTagManagerProps {
  onClose: () => void;
}

export function CustomTagManager({ onClose }: CustomTagManagerProps) {
  const { quickTags, addCustomTag } = useMeetingAssistantStore();

  const [formData, setFormData] = useState({
    label: '',
    icon: '🏷️',
    category: 'customer_question' as 'customer_question' | 'pain_point' | 'custom',
    detailPrompt: '',
    enableAutoTriggers: false,
    battlecardId: '',
    ragSearchQuery: '',
    followUpQuestions: ['', ''],
    updateDiscovery: '' as '' | DiscoveryItem
  });

  const iconOptions = [
    '🏷️', '💡', '⚡', '🎯', '📊', '💰', '⏰', '🔌',
    '⚙️', '🆘', '📁', '🔍', '✅', '❌', '⭐', '🚀',
    '📞', '💬', '📈', '🔔', '⚠️', '🎁', '🌟', '🔥'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.label.trim()) {
      alert('Tag måste ha en label');
      return;
    }

    const newTag: Omit<QuickTag, 'usageCount'> = {
      id: `custom-${Date.now()}`,
      label: formData.label.trim(),
      icon: formData.icon,
      category: formData.category,
      detailPrompt: formData.detailPrompt.trim() || undefined,
      autoTriggers: formData.enableAutoTriggers
        ? {
            showBattlecard: formData.battlecardId || undefined,
            ragSearch: formData.ragSearchQuery || undefined,
            suggestFollowUp: formData.followUpQuestions.filter(q => q.trim()),
            updateDiscovery: formData.updateDiscovery || undefined
          }
        : undefined
    };

    addCustomTag(newTag);

    // Reset form
    setFormData({
      label: '',
      icon: '🏷️',
      category: 'customer_question',
      detailPrompt: '',
      enableAutoTriggers: false,
      battlecardId: '',
      ragSearchQuery: '',
      followUpQuestions: ['', ''],
      updateDiscovery: ''
    });

    alert(`Tag "${formData.label}" skapad!`);
  };

  const customTags = quickTags.filter(tag => tag.id.startsWith('custom-'));
  const defaultTags = quickTags.filter(tag => !tag.id.startsWith('custom-'));

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              🏷️ Hantera Quick Tags
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Skapa egna snabbtaggar för möten
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
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Left: Create New Tag */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Skapa ny tag</span>
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Label */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Label *
                  </label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    placeholder="T.ex. ROI, Demo, Referens..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>

                {/* Icon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icon
                  </label>
                  <div className="grid grid-cols-8 gap-2">
                    {iconOptions.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon })}
                        className={`p-2 text-xl border rounded-lg hover:bg-gray-50 transition-colors ${
                          formData.icon === icon
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-300'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="customer_question">Kundfråga</option>
                    <option value="pain_point">Pain Point</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                {/* Detail Prompt */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Detail Prompt (valfritt)
                  </label>
                  <input
                    type="text"
                    value={formData.detailPrompt}
                    onChange={(e) => setFormData({ ...formData, detailPrompt: e.target.value })}
                    placeholder="T.ex. 'Vilket företag?' eller 'Hur många användare?'"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Om satt, kommer användaren uppmanas att fylla i detaljer när de klickar på taggen
                  </p>
                </div>

                {/* Auto-triggers */}
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <label className="flex items-center space-x-2 mb-3">
                    <input
                      type="checkbox"
                      checked={formData.enableAutoTriggers}
                      onChange={(e) => setFormData({ ...formData, enableAutoTriggers: e.target.checked })}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Aktivera auto-triggers
                    </span>
                  </label>

                  {formData.enableAutoTriggers && (
                    <div className="space-y-3">
                      {/* RAG Search Query */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          RAG sökfråga
                        </label>
                        <input
                          type="text"
                          value={formData.ragSearchQuery}
                          onChange={(e) => setFormData({ ...formData, ragSearchQuery: e.target.value })}
                          placeholder="T.ex. 'ROI beräkning kalkyl'"
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
                        />
                      </div>

                      {/* Update Discovery */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Uppdatera discovery
                        </label>
                        <select
                          value={formData.updateDiscovery}
                          onChange={(e) => setFormData({ ...formData, updateDiscovery: e.target.value as any })}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
                        >
                          <option value="">Ingen</option>
                          <option value="budget">Budget</option>
                          <option value="authority">Authority</option>
                          <option value="need">Need</option>
                          <option value="timeline">Timeline</option>
                        </select>
                      </div>

                      {/* Follow-up Questions */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Uppföljningsfrågor
                        </label>
                        {formData.followUpQuestions.map((q, i) => (
                          <input
                            key={i}
                            type="text"
                            value={q}
                            onChange={(e) => {
                              const newQuestions = [...formData.followUpQuestions];
                              newQuestions[i] = e.target.value;
                              setFormData({ ...formData, followUpQuestions: newQuestions });
                            }}
                            placeholder={`Fråga ${i + 1}...`}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs mb-1"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium flex items-center justify-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Skapa tag</span>
                </button>
              </form>
            </div>

            {/* Right: Tag Lists */}
            <div className="space-y-6">
              {/* Custom Tags */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Dina custom tags ({customTags.length})
                </h3>
                {customTags.length > 0 ? (
                  <div className="space-y-2">
                    {customTags.map((tag) => (
                      <div
                        key={tag.id}
                        className="p-3 bg-purple-50 border border-purple-200 rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{tag.icon}</span>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {tag.label}
                              </div>
                              <div className="text-xs text-gray-500">
                                {tag.category} • Använd {tag.usageCount}x
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {tag.autoTriggers && (
                              <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                                Auto
                              </span>
                            )}
                            <button
                              onClick={() => {
                                if (confirm(`Ta bort "${tag.label}"?`)) {
                                  useMeetingAssistantStore.setState(state => ({
                                    quickTags: state.quickTags.filter(t => t.id !== tag.id)
                                  }));
                                }
                              }}
                              className="p-1 hover:bg-purple-100 rounded"
                            >
                              <X className="w-4 h-4 text-gray-500" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 border border-gray-200 rounded-lg">
                    <Tag className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      Inga custom tags än. Skapa din första!
                    </p>
                  </div>
                )}
              </div>

              {/* Default Tags */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Standard tags ({defaultTags.length})
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {defaultTags.map((tag) => (
                    <div
                      key={tag.id}
                      className="p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                    >
                      <div className="flex items-center space-x-1">
                        <span>{tag.icon}</span>
                        <span className="font-medium text-gray-700">{tag.label}</span>
                      </div>
                      <div className="text-gray-500 mt-0.5">
                        Använd {tag.usageCount}x
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tag Usage Tips */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-blue-900 mb-1">
                      Tips för bra tags
                    </h4>
                    <ul className="text-xs text-blue-800 space-y-1">
                      <li>• Använd korta, tydliga labels (1-2 ord)</li>
                      <li>• Välj distinktiva ikoner</li>
                      <li>• Aktivera auto-triggers för relevanta dokument</li>
                      <li>• Använd detail prompts för precisare input</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Stäng
          </button>
        </div>
      </div>
    </div>
  );
}
