import React, { useState, useRef, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { useMeetingAssistantStore, type MeetingSpeaker } from '../store/meetingAssistantStore';
import { CustomTagManager } from './CustomTagManager';

export function MeetingQuickInput() {
  const {
    quickTags,
    activeTag,
    showDetailPrompt,
    detailPromptMessage,
    handleQuickTag,
    addNote
  } = useMeetingAssistantStore();

  const [noteText, setNoteText] = useState('');
  const [speaker, setSpeaker] = useState<MeetingSpeaker>('customer');
  const [detailInput, setDetailInput] = useState('');
  const [showTagManager, setShowTagManager] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const detailInputRef = useRef<HTMLInputElement>(null);

  // Focus detail input when prompt shows
  useEffect(() => {
    if (showDetailPrompt && detailInputRef.current) {
      detailInputRef.current.focus();
    }
  }, [showDetailPrompt]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleAddNote();
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;

    await addNote(noteText, speaker);
    setNoteText('');
    textareaRef.current?.focus();
  };

  const handleQuickTagClick = (tagId: string) => {
    handleQuickTag(tagId);
  };

  const handleDetailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTag && detailInput.trim()) {
      handleQuickTag(activeTag.id, detailInput);
      setDetailInput('');
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .meeting-input-field {
          color: rgb(17, 24, 39) !important;
          background-color: rgb(255, 255, 255) !important;
          -webkit-text-fill-color: rgb(17, 24, 39) !important;
        }
        .meeting-input-field::placeholder {
          color: rgb(156, 163, 175) !important;
          opacity: 1 !important;
        }
      `}} />
      <div className="space-y-4">
        {/* Quick Tag Buttons */}
        <div className="quick-tags">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              🏷️ Kunden frågar om:
            </div>
            <button
              onClick={() => setShowTagManager(true)}
              className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
              title="Hantera tags"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Hantera</span>
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2">
          {quickTags.map(tag => (
            <button
              key={tag.id}
              onClick={() => handleQuickTagClick(tag.id)}
              className="flex items-center justify-center space-x-1 px-3 py-2 bg-gradient-to-r from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 border border-indigo-200 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-md text-sm font-medium text-gray-700"
              title={`Klicka för att logga: "${tag.label}"`}
            >
              <span className="text-base">{tag.icon}</span>
              <span className="text-xs">{tag.label}</span>
            </button>
          ))}
        </div>

        {/* Detail Prompt */}
        {showDetailPrompt && activeTag && (
          <form onSubmit={handleDetailSubmit} className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {detailPromptMessage}
            </label>
            <div className="flex space-x-2">
              <input
                ref={detailInputRef}
                type="text"
                value={detailInput}
                onChange={(e) => setDetailInput(e.target.value)}
                placeholder="T.ex. Salesforce, Dynamics..."
                className="meeting-input-field flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                Logga
              </button>
              <button
                type="button"
                onClick={() => handleQuickTag(activeTag.id)}
                className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                title="Skippa detalj"
              >
                Skippa
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Separator */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="px-3 bg-gray-50 text-xs font-medium text-gray-500 uppercase">
            eller skriv egen anteckning
          </span>
        </div>
      </div>

      {/* Free-text Input */}
      <div className="space-y-2">
        <textarea
          ref={textareaRef}
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Kunden säger..."
          rows={3}
          className="meeting-input-field w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-sm"
        />

        {/* Speaker Selection & Submit */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setSpeaker('customer')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                speaker === 'customer'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              💬 Kund
            </button>
            <button
              type="button"
              onClick={() => setSpeaker('seller')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                speaker === 'seller'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🎯 Du
            </button>
            <button
              type="button"
              onClick={() => setSpeaker('observation')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                speaker === 'observation'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              📝 Notering
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs text-gray-500">Ctrl+Enter för att lägga till</span>
            <button
              onClick={handleAddNote}
              disabled={!noteText.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              Lägg till
            </button>
          </div>
        </div>
      </div>
      </div>

      {/* Custom Tag Manager Modal */}
      {showTagManager && (
        <CustomTagManager onClose={() => setShowTagManager(false)} />
      )}
    </>
  );
}
