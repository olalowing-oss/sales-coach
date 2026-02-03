// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { X, Building2, User, Briefcase, FileText, Mic, Bot } from 'lucide-react';
import { useMeetingAssistantStore } from '../store/meetingAssistantStore';
import { useAuth } from '../contexts/AuthContext';
import { useSessionStore } from '../store/sessionStore';

interface StartMeetingAssistantModalProps {
  onClose: () => void;
  onMeetingStarted: () => void;
}

type SessionMode = 'live_call' | 'training' | 'meeting_assistant';

export function StartMeetingAssistantModal({ onClose, onMeetingStarted }: StartMeetingAssistantModalProps) {
  const { user } = useAuth();
  const { userProductId } = useSessionStore();
  const { startMeeting } = useMeetingAssistantStore();

  const [mode, setMode] = useState<SessionMode>('meeting_assistant');
  const [company, setCompany] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [role, setRole] = useState('');
  const [isStarting, setIsStarting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!company.trim()) {
      alert('Företagsnamn måste fyllas i');
      return;
    }

    if (!user || !userProductId) {
      alert('Användare eller produkt saknas');
      return;
    }

    // Only Meeting Assistant mode uses this component
    // Other modes would be handled differently
    if (mode !== 'meeting_assistant') {
      alert('Endast Meeting Assistant mode är tillgängligt här');
      return;
    }

    setIsStarting(true);

    try {
      await startMeeting(
        {
          company: company.trim(),
          contactPerson: contactPerson.trim() || undefined,
          role: role.trim() || undefined
        },
        userProductId,
        user.id
      );

      onMeetingStarted();
    } catch (error) {
      console.error('[StartMeetingAssistantModal] Failed to start meeting:', error);
      alert('Kunde inte starta mötet. Försök igen.');
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .meeting-modal-input {
          color: rgb(17, 24, 39) !important;
          background-color: rgb(255, 255, 255) !important;
          -webkit-text-fill-color: rgb(17, 24, 39) !important;
        }
        .meeting-modal-input::placeholder {
          color: rgb(156, 163, 175) !important;
          opacity: 1 !important;
        }
      `}} />
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Starta samtal</h2>
            <p className="text-sm text-gray-600 mt-1">
              Välj mode och fyll i kundinformation
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Mode Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Välj mode
            </label>
            <div className="grid grid-cols-3 gap-3">
              {/* Live Call */}
              <button
                type="button"
                onClick={() => setMode('live_call')}
                disabled
                className={`relative p-4 border-2 rounded-lg transition-all text-left ${
                  mode === 'live_call'
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Mic className="w-5 h-5 text-red-600" />
                  <span className="font-semibold text-gray-900">Live Call</span>
                </div>
                <p className="text-xs text-gray-600">
                  Röstinspelning i realtid
                </p>
                <div className="absolute top-2 right-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                  Coming soon
                </div>
              </button>

              {/* Training */}
              <button
                type="button"
                onClick={() => setMode('training')}
                disabled
                className={`relative p-4 border-2 rounded-lg transition-all text-left ${
                  mode === 'training'
                    ? 'border-green-600 bg-green-50'
                    : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Bot className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-gray-900">Training</span>
                </div>
                <p className="text-xs text-gray-600">
                  AI-kund för träning
                </p>
                <div className="absolute top-2 right-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                  Coming soon
                </div>
              </button>

              {/* Meeting Assistant */}
              <button
                type="button"
                onClick={() => setMode('meeting_assistant')}
                className={`p-4 border-2 rounded-lg transition-all text-left ${
                  mode === 'meeting_assistant'
                    ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200'
                    : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <span className="font-semibold text-gray-900">Meeting Assistant</span>
                </div>
                <p className="text-xs text-gray-600">
                  Textbaserad dokumentation
                </p>
              </button>
            </div>
          </div>

          {/* Mode Description */}
          {mode === 'meeting_assistant' && (
            <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg">
              <h4 className="text-sm font-semibold text-indigo-900 mb-2">
                📋 Meeting Assistant Mode
              </h4>
              <ul className="text-xs text-indigo-800 space-y-1">
                <li className="flex items-start space-x-2">
                  <span className="text-indigo-600 flex-shrink-0">✓</span>
                  <span>Quick Tags för snabb dokumentation av kundfrågor</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-indigo-600 flex-shrink-0">✓</span>
                  <span>AI-föreslagna frågor baserat på kontext</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-indigo-600 flex-shrink-0">✓</span>
                  <span>Automatisk BANT-discovery tracking</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-indigo-600 flex-shrink-0">✓</span>
                  <span>Live sammanfattning och next steps</span>
                </li>
              </ul>
            </div>
          )}

          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">
              Kundinformation
            </h3>

            {/* Company (required) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  <span>Företag <span className="text-red-600">*</span></span>
                </div>
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="t.ex. Volvo AB"
                required
                autoFocus
                className="meeting-modal-input w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Contact Person (optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-indigo-600" />
                  <span>
                    Kontaktperson{' '}
                    <span className="text-gray-400 text-xs font-normal">(frivilligt)</span>
                  </span>
                </div>
              </label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="t.ex. Anna Svensson"
                className="meeting-modal-input w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Role (optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-4 h-4 text-indigo-600" />
                  <span>
                    Roll{' '}
                    <span className="text-gray-400 text-xs font-normal">(frivilligt)</span>
                  </span>
                </div>
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="t.ex. CTO, IT-chef"
                className="meeting-modal-input w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Avbryt
            </button>

            <button
              type="submit"
              disabled={!company.trim() || isStarting}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:from-indigo-700 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all font-medium"
            >
              {isStarting ? 'Startar möte...' : 'Starta Meeting Assistant'}
            </button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
}
