// @ts-nocheck
import React, { useState, useRef } from 'react';
import { X, Upload, FileText, Calendar, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { parseTranscript, validateTranscript, formatTranscriptForDisplay, ParsedTranscript } from '../utils/transcriptParser';
import { supabase } from '../lib/supabase';

interface ImportTranscriptModalProps {
  onClose: () => void;
  onImportSuccess?: (sessionId: string) => void;
}

export const ImportTranscriptModal: React.FC<ImportTranscriptModalProps> = ({
  onClose,
  onImportSuccess
}) => {
  const [step, setStep] = useState<'upload' | 'review' | 'metadata' | 'processing'>('upload');
  const [transcriptContent, setTranscriptContent] = useState('');
  const [parsedTranscript, setParsedTranscript] = useState<ParsedTranscript | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Metadata
  const [customerName, setCustomerName] = useState('');
  const [customerCompany, setCustomerCompany] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    try {
      const text = await file.text();
      setTranscriptContent(text);
      processTranscript(text);
    } catch (err) {
      setError('Kunde inte läsa filen. Kontrollera att det är en textfil.');
    }
  };

  // Handle paste
  const handlePaste = () => {
    if (transcriptContent.trim()) {
      processTranscript(transcriptContent);
    }
  };

  // Process transcript
  const processTranscript = (content: string) => {
    try {
      const parsed = parseTranscript(content);
      const validation = validateTranscript(parsed);

      if (!validation.valid) {
        setValidationErrors(validation.errors);
        return;
      }

      setParsedTranscript(parsed);
      setValidationErrors([]);
      setSelectedParticipants(parsed.participants);
      setStep('review');
    } catch (err: any) {
      setError(`Fel vid parsing: ${err.message}`);
    }
  };

  // Proceed to metadata step
  const handleProceedToMetadata = () => {
    setStep('metadata');
  };

  // Import transcript
  const handleImport = async () => {
    if (!parsedTranscript) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Ingen inloggad användare');
      }

      // Create call session
      const now = new Date();
      const originalMeetingDate = meetingDate ? new Date(meetingDate) : now;

      const sessionData = {
        user_id: user.id,
        status: 'stopped',
        customer_name: customerName || null,
        customer_company: customerCompany || null,
        full_transcript: parsedTranscript.fullText,
        duration_seconds: parsedTranscript.duration || 0,
        started_at: originalMeetingDate.toISOString(),
        ended_at: originalMeetingDate.toISOString(),
        created_at: now.toISOString(),
        updated_at: now.toISOString(),

        // Import metadata
        import_source: 'teams',
        original_meeting_date: originalMeetingDate.toISOString(),
        meeting_participants: selectedParticipants,

        // Mark as not analyzed yet
        is_analyzed: false
      };

      const { data: session, error: sessionError } = await supabase
        .from('call_sessions')
        .insert([sessionData])
        .select()
        .single();

      if (sessionError) {
        throw sessionError;
      }

      // Create transcript segments
      if (parsedTranscript.segments.length > 0) {
        const segments = parsedTranscript.segments.map((seg, index) => ({
          session_id: session.id,
          text: seg.text,
          speaker: seg.speaker,
          timestamp: seg.timestamp || '',
          is_final: true,
          sequence_number: index,
          created_at: now.toISOString()
        }));

        const { error: segmentsError } = await supabase
          .from('transcript_segments')
          .insert(segments);

        if (segmentsError) {
          console.error('Error saving segments:', segmentsError);
          // Don't fail the import if segments fail
        }
      }

      // Trigger AI analysis
      try {
        const response = await fetch('/api/analyze-call', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: session.id,
            transcript: parsedTranscript.fullText
          })
        });

        if (!response.ok) {
          console.error('AI analysis failed, but import succeeded');
        }
      } catch (aiError) {
        console.error('AI analysis error:', aiError);
        // Don't fail the import if AI analysis fails
      }

      setStep('processing');

      // Call success callback
      if (onImportSuccess) {
        onImportSuccess(session.id);
      }

      // Auto-close after short delay
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (err: any) {
      console.error('Import error:', err);
      setError(err.message || 'Kunde inte importera transkriptionen');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white">Importera Teams-transkription</h2>
            <p className="text-sm text-gray-400 mt-1">
              Ladda upp eller klistra in transkription från Teams-möte
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-900/50">
          <div className={`flex items-center gap-2 ${step === 'upload' ? 'text-teal-400' : 'text-gray-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'upload' ? 'bg-teal-400/20' : 'bg-gray-700'}`}>
              1
            </div>
            <span className="text-sm font-medium">Ladda upp</span>
          </div>

          <div className="w-12 h-0.5 bg-gray-700" />

          <div className={`flex items-center gap-2 ${step === 'review' ? 'text-teal-400' : 'text-gray-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'review' ? 'bg-teal-400/20' : 'bg-gray-700'}`}>
              2
            </div>
            <span className="text-sm font-medium">Granska</span>
          </div>

          <div className="w-12 h-0.5 bg-gray-700" />

          <div className={`flex items-center gap-2 ${step === 'metadata' ? 'text-teal-400' : 'text-gray-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'metadata' ? 'bg-teal-400/20' : 'bg-gray-700'}`}>
              3
            </div>
            <span className="text-sm font-medium">Metadata</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-200">{error}</div>
            </div>
          )}

          {/* Step 1: Upload */}
          {step === 'upload' && (
            <div className="space-y-6">
              {/* File upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Välj fil (VTT, TXT, eller annat textformat)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".vtt,.txt,.text,.log"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-6 py-12 border-2 border-dashed border-gray-600 rounded-lg hover:border-teal-400 transition-colors flex flex-col items-center gap-3 group"
                >
                  <Upload className="w-12 h-12 text-gray-400 group-hover:text-teal-400 transition-colors" />
                  <div className="text-center">
                    <div className="text-white font-medium">Klicka för att välja fil</div>
                    <div className="text-sm text-gray-400 mt-1">VTT, TXT eller annat textformat</div>
                  </div>
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-gray-700" />
                <span className="text-sm text-gray-400">ELLER</span>
                <div className="flex-1 h-px bg-gray-700" />
              </div>

              {/* Paste area */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Klistra in transkription direkt från Teams
                </label>
                <textarea
                  value={transcriptContent}
                  onChange={(e) => setTranscriptContent(e.target.value)}
                  placeholder="Klistra in transkriptionen här..."
                  rows={12}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400 font-mono text-sm"
                />
                <button
                  onClick={handlePaste}
                  disabled={!transcriptContent.trim()}
                  className="mt-3 px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Bearbeta transkription
                </button>
              </div>

              {validationErrors.length > 0 && (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="text-sm font-medium text-yellow-200 mb-2">Valideringsfel:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {validationErrors.map((err, i) => (
                      <li key={i} className="text-sm text-yellow-100">{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Review */}
          {step === 'review' && parsedTranscript && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-gray-900 rounded-lg">
                  <div className="text-sm text-gray-400">Deltagare</div>
                  <div className="text-2xl font-bold text-white mt-1">{parsedTranscript.participants.length}</div>
                </div>
                <div className="p-4 bg-gray-900 rounded-lg">
                  <div className="text-sm text-gray-400">Segment</div>
                  <div className="text-2xl font-bold text-white mt-1">{parsedTranscript.segments.length}</div>
                </div>
                <div className="p-4 bg-gray-900 rounded-lg">
                  <div className="text-sm text-gray-400">Längd</div>
                  <div className="text-2xl font-bold text-white mt-1">
                    {parsedTranscript.duration
                      ? `${Math.floor(parsedTranscript.duration / 60)}m ${Math.floor(parsedTranscript.duration % 60)}s`
                      : 'Okänd'}
                  </div>
                </div>
              </div>

              {/* Participants */}
              <div>
                <div className="text-sm font-medium text-gray-300 mb-2">Identifierade deltagare:</div>
                <div className="flex flex-wrap gap-2">
                  {parsedTranscript.participants.map((p, i) => (
                    <span key={i} className="px-3 py-1 bg-gray-900 rounded-full text-sm text-white">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div>
                <div className="text-sm font-medium text-gray-300 mb-2">Förhandsvisning:</div>
                <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                    {formatTranscriptForDisplay(parsedTranscript).slice(0, 2000)}
                    {formatTranscriptForDisplay(parsedTranscript).length > 2000 && '\n... (klipptes av)'}
                  </pre>
                </div>
              </div>

              <button
                onClick={handleProceedToMetadata}
                className="w-full px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium"
              >
                Fortsätt till metadata
              </button>
            </div>
          )}

          {/* Step 3: Metadata */}
          {step === 'metadata' && parsedTranscript && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {/* Customer name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Kundnamn
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="T.ex. Anna Andersson"
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                </div>

                {/* Customer company */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Företag
                  </label>
                  <input
                    type="text"
                    value={customerCompany}
                    onChange={(e) => setCustomerCompany(e.target.value)}
                    placeholder="T.ex. Acme AB"
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                </div>
              </div>

              {/* Meeting date */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Mötesdatum
                </label>
                <input
                  type="datetime-local"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>

              {/* Participants selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Deltagare (valbara)
                </label>
                <div className="space-y-2">
                  {parsedTranscript.participants.map((p, i) => (
                    <label key={i} className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedParticipants.includes(p)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedParticipants([...selectedParticipants, p]);
                          } else {
                            setSelectedParticipants(selectedParticipants.filter(sp => sp !== p));
                          }
                        }}
                        className="w-4 h-4 text-teal-500 bg-gray-700 border-gray-600 rounded focus:ring-teal-400"
                      />
                      <span className="text-white">{p}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Import button */}
              <button
                onClick={handleImport}
                disabled={isProcessing}
                className="w-full px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Importerar...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Importera och analysera
                  </>
                )}
              </button>
            </div>
          )}

          {/* Processing/Success */}
          {step === 'processing' && (
            <div className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="w-16 h-16 text-green-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Import lyckades!</h3>
              <p className="text-gray-400 text-center">
                Transkriptionen har importerats och AI-analys körs i bakgrunden.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
