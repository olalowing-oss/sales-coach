import React, { useState } from 'react';
import { X, Building2, User, Briefcase } from 'lucide-react';

interface StartSessionModalProps {
  onStart: (customerInfo: {
    company: string;
    name?: string;
    role?: string;
  }) => void;
  onClose: () => void;
}

export const StartSessionModal: React.FC<StartSessionModalProps> = ({ onStart, onClose }) => {
  const [company, setCompany] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!company.trim()) {
      alert('Företagsnamn måste fyllas i');
      return;
    }

    onStart({
      company: company.trim(),
      name: name.trim() || undefined,
      role: role.trim() || undefined
    });
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .session-modal-input {
          color: rgb(255, 255, 255) !important;
          background-color: rgb(55, 65, 81) !important;
          -webkit-text-fill-color: rgb(255, 255, 255) !important;
        }
        .session-modal-input::placeholder {
          color: rgb(156, 163, 175) !important;
          opacity: 1 !important;
        }
      `}} />
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Starta nytt samtal</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Company (required) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-teal-400" />
                Företag <span className="text-red-400">*</span>
              </div>
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="t.ex. Acme AB"
              className="session-modal-input w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg placeholder-gray-400 focus:outline-none focus:border-teal-500"
              required
              autoFocus
            />
          </div>

          {/* Contact person (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-teal-400" />
                Kontaktperson <span className="text-gray-500 text-xs">(frivilligt)</span>
              </div>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="t.ex. Anna Andersson"
              className="session-modal-input w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg placeholder-gray-400 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Role (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-teal-400" />
                Roll <span className="text-gray-500 text-xs">(frivilligt)</span>
              </div>
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="t.ex. VD, IT-chef"
              className="session-modal-input w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg placeholder-gray-400 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Avbryt
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors"
            >
              Starta inspelning
            </button>
          </div>
        </form>

        {/* Helper text */}
        <p className="text-xs text-gray-400 mt-4">
          💡 Företagsnamn behövs för att spara data i kundregistret
        </p>
      </div>
    </div>
    </>
  );
};
