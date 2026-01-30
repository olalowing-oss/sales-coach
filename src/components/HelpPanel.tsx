import React, { useState } from 'react';
import { X, Phone, GraduationCap, Beaker, Clock, Settings, Target } from 'lucide-react';

interface HelpPanelProps {
  onClose: () => void;
}

export const HelpPanel: React.FC<HelpPanelProps> = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState<string>('dashboard');

  const sections = [
    { id: 'dashboard', title: 'Dashboard', icon: Phone },
    { id: 'training', title: 'AI-Säljträning', icon: GraduationCap },
    { id: 'demo', title: 'Demosamtal', icon: Beaker },
    { id: 'live', title: 'Live Kundsamtal', icon: Phone },
    { id: 'history', title: 'Historik & Analys', icon: Clock },
    { id: 'admin', title: 'Admin & Hantering', icon: Settings },
    { id: 'tips', title: 'Tips & Tricks', icon: Target },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-700 max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white">Sales Coach AI - Hjälp</h2>
            <p className="text-sm text-gray-400 mt-1">Snabbguide över de viktigaste funktionerna</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Navigation */}
          <div className="w-64 border-r border-gray-700 p-4 overflow-y-auto">
            <nav className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                      activeSection === section.id
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-600/50'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{section.title}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeSection === 'dashboard' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">🎯 Dashboard (Startsida)</h3>
                  <p className="text-gray-300 mb-4">
                    När du loggar in möts du av en översiktlig dashboard med:
                  </p>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span><strong className="text-white">📊 Statistikkort:</strong> Se dina totala samtal, träningssessioner och framgång</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span><strong className="text-white">🕒 Senaste samtal:</strong> De 5 senaste samtalen med kund, företag, tid och sentiment</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span><strong className="text-white">🎓 Säljträning:</strong> Snabbåtkomst till 6 träningsscenarier</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span><strong className="text-white">🧪 Demosamtal:</strong> Prova förinspelat samtalsscript</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span><strong className="text-white">⚡ Snabbåtgärder:</strong> Stora knappar för att starta historik, träning eller demo</span>
                    </li>
                  </ul>
                  <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-4 mt-4">
                    <p className="text-blue-300 text-sm">
                      <strong>Tips:</strong> Klicka på logotypen "Sales Coach AI" för att alltid komma tillbaka till Dashboard.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'training' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">🎭 AI-Säljträning</h3>

                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-white mb-2">Starta träning</h4>
                    <ol className="space-y-2 text-gray-300 list-decimal list-inside">
                      <li>Klicka på <strong className="text-white">"Säljträning"</strong> i menyn eller på Dashboard</li>
                      <li>Välj ett scenario baserat på svårighetsgrad:
                        <ul className="ml-6 mt-2 space-y-1">
                          <li className="flex items-center gap-2">
                            <span className="text-green-400">😊 Lätt:</span> T.ex. "Entusiastisk Startup CTO"
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-yellow-400">😐 Medel:</span> T.ex. "Skeptisk CTO"
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-red-400">😰 Svår:</span> T.ex. "Prisfokuserad Inköpschef"
                          </li>
                        </ul>
                      </li>
                    </ol>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-white mb-2">Under träningen</h4>
                    <div className="space-y-4">
                      <div>
                        <p className="font-medium text-white mb-2">Real-time funktioner:</p>
                        <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                          <div>
                            <p className="text-white font-medium mb-2">Kundintresse-indikator:</p>
                            <p className="text-gray-300 text-sm mb-2">Se kundens intresse i realtid (0-100%)</p>
                            <ul className="space-y-1 text-sm">
                              <li className="flex items-center gap-2">
                                <span className="text-green-400">😊 Grön (70%+):</span> Hög intresse
                              </li>
                              <li className="flex items-center gap-2">
                                <span className="text-yellow-400">😐 Gul (40-69%):</span> Medel intresse
                              </li>
                              <li className="flex items-center gap-2">
                                <span className="text-red-400">😠 Röd (&lt;40%):</span> Låg intresse
                              </li>
                              <li className="flex items-center gap-2">
                                <span className="text-blue-400">↑↓ Trendpilar:</span> Visar om intresset ökar eller minskar
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="font-medium text-white mb-2">Coaching-panelen (höger sida):</p>
                        <ul className="space-y-2 text-gray-300">
                          <li><strong className="text-green-400">🎓 Nybörjare:</strong> Full coaching med alla tips och uppmuntran</li>
                          <li><strong className="text-blue-400">💼 Erfaren:</strong> Förbättringsförslag och nästa steg</li>
                          <li><strong className="text-purple-400">🏆 Expert:</strong> Minimal coaching, endast scenario-info</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-medium text-white mb-2">Feedback under samtalet:</p>
                        <ul className="space-y-2 text-gray-300">
                          <li className="flex items-start gap-2">
                            <span className="text-green-400">👍</span>
                            <span><strong className="text-white">Bra jobbat:</strong> Visar vad som fungerade bra</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-yellow-400">💡</span>
                            <span><strong className="text-white">Förbättra:</strong> Konkreta förbättringsområden</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-blue-400">🎯</span>
                            <span><strong className="text-white">Nästa steg:</strong> Rekommendation för nästa handling</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-purple-400">⚡</span>
                            <span><strong className="text-white">Tips:</strong> Praktiska säljtekniker</span>
                          </li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-medium text-white mb-2">Röster:</p>
                        <ul className="space-y-1 text-gray-300 text-sm">
                          <li>• Manliga personas använder <strong className="text-white">Mattias</strong> (sv-SE-MattiasNeural)</li>
                          <li>• Kvinnliga personas använder <strong className="text-white">Sofie</strong> (sv-SE-SofieNeural) eller <strong className="text-white">Hillevi</strong> (sv-SE-HilleviNeural)</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Kontroller</h4>
                    <ul className="space-y-1 text-gray-300">
                      <li>• <strong className="text-white">Pausa:</strong> Pausa träningen för att tänka</li>
                      <li>• <strong className="text-white">Starta om:</strong> Börja om från början</li>
                      <li>• <strong className="text-white">Avsluta:</strong> Gå tillbaka till scenario-valet</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'demo' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">🧪 Demosamtal</h3>

                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-white mb-2">Vad är det?</h4>
                    <p className="text-gray-300">
                      Förinspelat samtalsscript som simulerar ett riktigt säljsamtal. Perfekt för att:
                    </p>
                    <ul className="mt-2 space-y-1 text-gray-300">
                      <li>• Lära dig systemet utan press</li>
                      <li>• Testa olika funktioner</li>
                      <li>• Se hur coaching fungerar</li>
                    </ul>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-white mb-2">Starta demo</h4>
                    <ol className="space-y-2 text-gray-300 list-decimal list-inside">
                      <li>Klicka på <strong className="text-white">"Demosamtal"</strong> i menyn</li>
                      <li>Välj ett scenario från dropdown (t.ex. "Copilot Success Story")</li>
                      <li>Klicka på <strong className="text-white">"Starta samtal"</strong> för att börja</li>
                    </ol>
                    <div className="bg-teal-600/10 border border-teal-600/30 rounded-lg p-4 mt-4">
                      <p className="text-teal-300 text-sm">
                        <strong>Demo-badge:</strong> När du är i demo-läge visas en turkos badge i headern.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Tillgängliga demos</h4>
                    <ul className="space-y-1 text-gray-300">
                      <li>• Copilot Success Story</li>
                      <li>• Teams Adoption Challenge</li>
                      <li>• Security Compliance Discussion</li>
                      <li>• Budget Constraint Scenario</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'live' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">📞 Live Kundsamtal</h3>

                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-white mb-2">Starta live-samtal</h4>
                    <ol className="space-y-2 text-gray-300 list-decimal list-inside">
                      <li>Klicka på <strong className="text-white">"Samtal"</strong> i menyn</li>
                      <li>Välj <strong className="text-white">"Visa samtalsvyn"</strong></li>
                      <li>Klicka på <strong className="text-white">"Starta samtal"</strong> (mikrofon-knapp)</li>
                    </ol>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-white mb-2">Under samtalet</h4>
                    <ul className="space-y-2 text-gray-300">
                      <li>• <strong className="text-white">Transkript-panel</strong> (vänster): Ser vad som sägs i realtid</li>
                      <li>• <strong className="text-white">Coaching-panel</strong> (höger): Får live-feedback och tips</li>
                      <li>• <strong className="text-white">Live-analys</strong> (under): AI:n analyserar samtalet kontinuerligt</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Kontroller</h4>
                    <ul className="space-y-2 text-gray-300">
                      <li>• <strong className="text-white">⏸️ Pausa:</strong> Pausa inspelningen</li>
                      <li>• <strong className="text-white">⏹️ Stoppa:</strong> Avsluta samtalet</li>
                      <li className="mt-3">
                        <strong className="text-white">Tangentbordsgenvägar:</strong>
                        <ul className="ml-6 mt-1 space-y-1 text-sm">
                          <li>• <code className="bg-gray-800 px-2 py-1 rounded">Ctrl+Shift+S</code>: Start/Stopp</li>
                          <li>• <code className="bg-gray-800 px-2 py-1 rounded">Ctrl+Shift+P</code>: Pausa/Fortsätt</li>
                        </ul>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'history' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">📂 Historik & Analys</h3>

                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-white mb-2">Se tidigare samtal</h4>
                    <ol className="space-y-2 text-gray-300 list-decimal list-inside">
                      <li>Klicka på <strong className="text-white">"Historik"</strong> från Dashboard eller Samtal-menyn</li>
                      <li>Se alla tidigare samtal med:
                        <ul className="ml-6 mt-2 space-y-1">
                          <li>• Kundnamn och företag</li>
                          <li>• Datum och tid</li>
                          <li>• Sentiment (😊😐😟)</li>
                          <li>• Samtalslängd</li>
                          <li>• AI-sammanfattning</li>
                        </ul>
                      </li>
                    </ol>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Detaljvy</h4>
                    <p className="text-gray-300 mb-2">Klicka på ett samtal för att se:</p>
                    <ul className="space-y-1 text-gray-300">
                      <li>• Full transkript</li>
                      <li>• AI-analys och coaching</li>
                      <li>• Sentiment-analys</li>
                      <li>• Förbättringsförslag</li>
                      <li>• Nästa steg</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'admin' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">⚙️ Admin & Hantering</h3>

                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-white mb-2">Scenario-hantering</h4>
                    <p className="text-gray-300 mb-2">
                      <strong className="text-white">Säljträning</strong> → <strong className="text-white">Hantera scenarier</strong>
                    </p>
                    <ul className="space-y-1 text-gray-300">
                      <li>• Skapa egna träningsscenarier</li>
                      <li>• Redigera befintliga scenarier</li>
                      <li>• Välj röst per scenario</li>
                      <li>• Ange svårighetsgrad</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Coaching-inställningar</h4>
                    <p className="text-gray-300 mb-2">
                      <strong className="text-white">Samtal</strong> → <strong className="text-white">Coaching-inställningar</strong>
                    </p>
                    <ul className="space-y-1 text-gray-300">
                      <li>• Anpassa coaching-regler</li>
                      <li>• Sätt prioriteringar för tips</li>
                      <li>• Konfigurera feedback-nivåer</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'tips' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">💡 Tips & Tricks</h3>

                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-white mb-2">För bästa resultat</h4>
                    <ol className="space-y-2 text-gray-300 list-decimal list-inside">
                      <li><strong className="text-white">Använd headset:</strong> Bättre ljudkvalitet = bättre transkription</li>
                      <li><strong className="text-white">Prata tydligt:</strong> Azure Speech förstår svenska väl, men tydligt tal hjälper</li>
                      <li><strong className="text-white">Börja med lätt:</strong> Välj lätta scenarier först för att lära dig systemet</li>
                      <li><strong className="text-white">Prova coaching-nivåer:</strong> Hitta rätt nivå för din erfarenhet</li>
                      <li><strong className="text-white">Lyssna på AI-kunden:</strong> Intressenivån visar hur bra du presterar</li>
                    </ol>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-white mb-2">Felsökning</h4>
                    <ul className="space-y-2 text-gray-300">
                      <li>• <strong className="text-white">Ingen ljuduppspelning?</strong> Kontrollera att Azure Speech-nyckeln är konfigurerad</li>
                      <li>• <strong className="text-white">Dashboard visas inte?</strong> Klicka på logotypen eller rensa localStorage</li>
                      <li>• <strong className="text-white">Demo fastnar?</strong> Ladda om sidan (F5)</li>
                    </ul>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-white mb-2">Navigation</h4>
                    <div className="bg-gray-800 rounded-lg p-4">
                      <p className="text-white font-medium mb-2">Header-meny:</p>
                      <ul className="space-y-1 text-gray-300 text-sm">
                        <li>• <strong className="text-white">📱 Samtal:</strong> Live-samtal, historik och inställningar</li>
                        <li>• <strong className="text-white">🧪 Demosamtal:</strong> Välj förinspelat script</li>
                        <li>• <strong className="text-white">🎓 Säljträning:</strong> Starta träning eller hantera scenarier</li>
                        <li>• <strong className="text-white">👤 Användarmeny:</strong> Profil och logga ut</li>
                      </ul>
                      <p className="text-teal-300 text-sm mt-3">
                        <strong>Klickbar logotyp:</strong> Klicka på "Sales Coach AI" för att alltid komma tillbaka till Dashboard.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Tangentbordsgenvägar</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <code className="bg-gray-800 px-3 py-2 rounded text-blue-400">Ctrl+Shift+S</code>
                        <span className="text-gray-300">Starta/Stoppa samtal</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <code className="bg-gray-800 px-3 py-2 rounded text-blue-400">Ctrl+Shift+P</code>
                        <span className="text-gray-300">Pausa/Fortsätt samtal</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-700 p-4 bg-gray-800/50">
          <div className="flex items-center justify-between text-sm">
            <p className="text-gray-400">
              Version 1.0.0 • Uppdaterad: 2026-01-30
            </p>
            <p className="text-gray-500">
              Built with Claude Code
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
