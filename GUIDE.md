# Sales Coach AI - Snabbguide

En AI-driven säljträningsplattform med Azure Speech och OpenAI för att förbättra dina säljfärdigheter.

## 🎯 Huvudfunktioner

### 1. Dashboard (Startsida)
När du loggar in möts du av en översiktlig dashboard med:

- **📊 Statistikkort**: Se dina totala samtal, träningssessioner och framgång
- **🕒 Senaste samtal**: De 5 senaste samtalen med kund, företag, tid och sentiment
- **🎓 Säljträning**: Snabbåtkomst till 6 träningsscenarier
- **🧪 Demosamtal**: Prova förinspelat samtalsscript
- **⚡ Snabbåtgärder**: Stora knappar för att starta historik, träning eller demo

**Tips**: Klicka på logotypen "Sales Coach AI" för att alltid komma tillbaka till Dashboard.

---

## 🎭 AI-Säljträning

### Starta träning
1. Klicka på **"Säljträning"** i menyn eller på Dashboard
2. Välj ett scenario baserat på svårighetsgrad:
   - 😊 **Lätt**: T.ex. "Entusiastisk Startup CTO"
   - 😐 **Medel**: T.ex. "Skeptisk CTO"
   - 😰 **Svår**: T.ex. "Prisfokuserad Inköpschef"

### Under träningen
**Real-time funktioner:**
- **Kundintresse-indikator**: Se kundens intresse i realtid (0-100%)
  - 😊 Grön (70%+): Hög intresse
  - 😐 Gul (40-69%): Medel intresse
  - 😠 Röd (<40%): Låg intresse
  - **Trendpilar** (↑↓): Visar om intresset ökar eller minskar

**Coaching-panelen (höger sida):**
- **🎓 Nybörjare**: Full coaching med alla tips och uppmuntran
- **💼 Erfaren**: Förbättringsförslag och nästa steg
- **🏆 Expert**: Minimal coaching, endast scenario-info

**Feedback under samtalet:**
- 👍 **Bra jobbat**: Visar vad som fungerade bra
- 💡 **Förbättra**: Konkreta förbättringsområden
- 🎯 **Nästa steg**: Rekommendation för nästa handling
- ⚡ **Tips**: Praktiska säljtekniker

**Röster:**
- Manliga personas använder **Mattias** (sv-SE-MattiasNeural)
- Kvinnliga personas använder **Sofie** (sv-SE-SofieNeural) eller **Hillevi** (sv-SE-HilleviNeural)

### Kontroller
- **Pausa**: Pausa träningen för att tänka
- **Starta om**: Börja om från början
- **Avsluta**: Gå tillbaka till scenario-valet

---

## 🧪 Demosamtal

### Vad är det?
Förinspelat samtalsscript som simulerar ett riktigt säljsamtal. Perfekt för att:
- Lära dig systemet utan press
- Testa olika funktioner
- Se hur coaching fungerar

### Starta demo
1. Klicka på **"Demosamtal"** i menyn
2. Välj ett scenario från dropdown (t.ex. "Copilot Success Story")
3. Klicka på **"Starta samtal"** för att börja

**Demo-badge**: När du är i demo-läge visas en turkos badge i headern.

### Tillgängliga demos
- Copilot Success Story
- Teams Adoption Challenge
- Security Compliance Discussion
- Budget Constraint Scenario

---

## 📞 Live Kundsamtal

### Starta live-samtal
1. Klicka på **"Samtal"** i menyn
2. Välj **"Visa samtalsvyn"**
3. Klicka på **"Starta samtal"** (mikrofon-knapp)

### Under samtalet
- **Transkript-panel** (vänster): Ser vad som sägs i realtid
- **Coaching-panel** (höger): Får live-feedback och tips
- **Live-analys** (under): AI:n analyserar samtalet kontinuerligt

### Kontroller
- **⏸️ Pausa**: Pausa inspelningen
- **⏹️ Stoppa**: Avsluta samtalet
- **Tangentbordsgenvägar**:
  - `Ctrl+Shift+S`: Start/Stopp
  - `Ctrl+Shift+P`: Pausa/Fortsätt

---

## 📂 Historik & Analys

### Se tidigare samtal
1. Klicka på **"Historik"** från Dashboard eller Samtal-menyn
2. Se alla tidigare samtal med:
   - Kundnamn och företag
   - Datum och tid
   - Sentiment (😊😐😟)
   - Samtalslängd
   - AI-sammanfattning

### Detaljvy
Klicka på ett samtal för att se:
- Full transkript
- AI-analys och coaching
- Sentiment-analys
- Förbättringsförslag
- Nästa steg

---

## ⚙️ Admin & Hantering

### Scenario-hantering
**Säljträning** → **Hantera scenarier**
- Skapa egna träningsscenarier
- Redigera befintliga scenarier
- Välj röst per scenario
- Ange svårighetsgrad

### Coaching-inställningar
**Samtal** → **Coaching-inställningar**
- Anpassa coaching-regler
- Sätt prioriteringar för tips
- Konfigurera feedback-nivåer

---

## 🎨 Navigation

### Header-meny
- **📱 Samtal**: Live-samtal, historik och inställningar
- **🧪 Demosamtal**: Välj förinspelat script
- **🎓 Säljträning**: Starta träning eller hantera scenarier
- **👤 Användarmeny**: Profil och logga ut

### Klickbar logotyp
Klicka på **"Sales Coach AI"** för att alltid komma tillbaka till Dashboard.

---

## 💡 Tips & Tricks

### För bästa resultat
1. **Använd headset**: Bättre ljudkvalitet = bättre transkription
2. **Prata tydligt**: Azure Speech förstår svenska väl, men tydligt tal hjälper
3. **Börja med lätt**: Välj lätta scenarier först för att lära dig systemet
4. **Prova coaching-nivåer**: Hitta rätt nivå för din erfarenhet
5. **Lyssna på AI-kunden**: Intressenivån visar hur bra du presterar

### Felsökning
- **Ingen ljuduppspelning?** Kontrollera att Azure Speech-nyckeln är konfigurerad
- **Dashboard visas inte?** Klicka på logotypen eller rensa localStorage
- **Demo fastnar?** Ladda om sidan (F5)

---

## 🔑 Tangentbordsgenvägar

- `Ctrl+Shift+S` - Starta/Stoppa samtal
- `Ctrl+Shift+P` - Pausa/Fortsätt samtal

---

## 📱 Support

### Problem eller frågor?
- Öppna ett issue på GitHub
- Kontakta support via din organisation
- Se dokumentationen för mer detaljer

---

## 🚀 Snabbstart

**Första gången:**
1. Logga in med ditt konto
2. Se Dashboard-översikten
3. Klicka på **"Prova demo"** för att testa systemet
4. Välj ett demosamtal och klicka **"Starta samtal"**
5. Prova sedan **"Starta träning"** för live AI-interaktion

**Daglig användning:**
1. Dashboard → Se din historik och statistik
2. Säljträning → Träna mot AI i olika scenarion
3. Historik → Granska och lär av tidigare samtal

---

## 🎯 Framtida funktioner

Planerade förbättringar:
- 📊 Träningsdashboard med framstegsgraf
- 🏆 Achievements och badges
- 📈 Poängsystem per träningssession
- 🗣️ Röstanalys (hastighet, fyllnadsord)
- 📱 Mobil-app
- 💾 Offline-läge

---

**Version**: 1.0.0
**Uppdaterad**: 2026-01-30
**Författare**: Built with Claude Code

---

Lycka till med din säljträning! 🚀
