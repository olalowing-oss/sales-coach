// @ts-nocheck
import React, { useState } from 'react';
import { Edit3, Trash2, Check, X } from 'lucide-react';
import { useMeetingAssistantStore, type MeetingNote } from '../store/meetingAssistantStore';

export function MeetingTimeline() {
  const { notes, updateNote, deleteNote } = useMeetingAssistantStore();
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  if (notes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-3">📝</div>
        <p className="text-gray-500 text-sm">
          Inga anteckningar än.
          <br />
          Använd Quick Tags eller skriv för att börja dokumentera mötet.
        </p>
      </div>
    );
  }

  const handleStartEdit = (note: MeetingNote) => {
    setEditingNoteId(note.id);
    setEditText(note.text);
  };

  const handleSaveEdit = (noteId: string) => {
    if (editText.trim()) {
      updateNote(noteId, editText);
    }
    setEditingNoteId(null);
    setEditText('');
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditText('');
  };

  const formatTime = (date: Date): string => {
    return new Date(date).toLocaleTimeString('sv-SE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSpeakerIcon = (speaker: MeetingNote['speaker']): string => {
    switch (speaker) {
      case 'customer':
        return '💬';
      case 'seller':
        return '🎯';
      case 'observation':
        return '📝';
      default:
        return '💬';
    }
  };

  const getSpeakerLabel = (speaker: MeetingNote['speaker']): string => {
    switch (speaker) {
      case 'customer':
        return 'Kund';
      case 'seller':
        return 'Du';
      case 'observation':
        return 'Notering';
      default:
        return 'Kund';
    }
  };

  const getSpeakerColor = (speaker: MeetingNote['speaker']): string => {
    switch (speaker) {
      case 'customer':
        return 'bg-blue-50 border-blue-200';
      case 'seller':
        return 'bg-green-50 border-green-200';
      case 'observation':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          Senaste anteckningar
        </h4>
        <span className="text-xs text-gray-500">
          {notes.length} anteckningar
        </span>
      </div>

      {notes.map((note) => (
        <div
          key={note.id}
          className={`border rounded-lg p-3 ${getSpeakerColor(note.speaker)} transition-all hover:shadow-md`}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{getSpeakerIcon(note.speaker)}</span>
              <span className="text-xs font-medium text-gray-600">
                {getSpeakerLabel(note.speaker)}
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-500">
                {formatTime(note.timestamp)}
              </span>
            </div>

            {editingNoteId !== note.id && (
              <div className="flex space-x-1">
                <button
                  onClick={() => handleStartEdit(note)}
                  className="p-1 hover:bg-white rounded transition-colors"
                  title="Redigera"
                >
                  <Edit3 className="w-3.5 h-3.5 text-gray-500" />
                </button>
                <button
                  onClick={() => {
                    if (confirm('Radera denna anteckning?')) {
                      deleteNote(note.id);
                    }
                  }}
                  className="p-1 hover:bg-white rounded transition-colors"
                  title="Radera"
                >
                  <Trash2 className="w-3.5 h-3.5 text-gray-500" />
                </button>
              </div>
            )}
          </div>

          {/* Content */}
          {editingNoteId === note.id ? (
            <div className="space-y-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm resize-none"
                rows={3}
                autoFocus
              />
              <div className="flex space-x-2">
                <button
                  onClick={() => handleSaveEdit(note.id)}
                  className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Spara</span>
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center space-x-1 px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Avbryt</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{note.text}</p>

              {/* Tags */}
              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {note.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white bg-opacity-60 text-gray-700 border border-gray-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Detected Entities */}
              {note.detectedEntities && (
                <div className="mt-2 space-y-1">
                  {note.detectedEntities.budget && (
                    <div className="text-xs text-gray-600 flex items-center space-x-1">
                      <span className="font-medium">💰 Budget:</span>
                      <span>{note.detectedEntities.budget.toLocaleString('sv-SE')} kr</span>
                    </div>
                  )}
                  {note.detectedEntities.painPoint && (
                    <div className="text-xs text-gray-600 flex items-center space-x-1">
                      <span className="font-medium">⚠️ Pain Point:</span>
                      <span>{note.detectedEntities.painPoint}</span>
                    </div>
                  )}
                  {note.detectedEntities.competitor && (
                    <div className="text-xs text-gray-600 flex items-center space-x-1">
                      <span className="font-medium">🏢 Competitor:</span>
                      <span className="capitalize">{note.detectedEntities.competitor}</span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}
