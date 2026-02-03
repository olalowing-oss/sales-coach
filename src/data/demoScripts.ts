/**
 * Demo-scripts för att testa olika delar av systemet
 * Varje script är designat för att triggra specifika coaching-regler och analysfunktioner
 */

export interface DemoScript {
  id: string;
  name: string;
  description: string;
  phrases: string[];
  expectedTriggers: string[];
}

export const DEMO_SCRIPTS: DemoScript[] = [
  {
    id: 'copilot-success',
    name: '🎯 Copilot Success Story',
    description: 'Lyckad Copilot-försäljning med Google Workspace-konkurrent. Bokar demo och begär offert.',
    expectedTriggers: ['Copilot', 'Teams', 'Google Workspace', 'Pris', 'Bokat möte'],
    phrases: [
      "Hej! Ja, jag heter Anna Svensson och jag är IT-chef på Nordiska Byggsystem AB",
      "Vi är ett medelstort byggföretag med cirka 250 anställda fördelade över kontor i Stockholm, Göteborg och Malmö",
      "Just nu använder vi en blandning av olika verktyg. Teams har vi för möten och Google Workspace för mail och dokument",
      "Det är verkligen rörigt! Vi har tre stora problem: För det första hittar inte folk information och dokument - de sparar överallt utan struktur",
      "För det andra tar det enormt mycket tid - våra projektledare lägger säkert 15 timmar i veckan på att leta efter dokument och mejla fram och tillbaka",
      "Och för det tredje har vi noll samarbete mellan avdelningarna. Försäljning vet inte vad projekt gör, projekt vet inte vad ekonomi behöver",
      "Det här har pågått i ungefär två år nu, sedan vi växte från 150 till 250 anställda. Då brakade allt samman",
      "Vi har provat både SharePoint och Dropbox tidigare, men ingen har använt det konsekvent. Folk fortsätter mejla filer",
      "Vi vill ha en komplett lösning där allt är på ett ställe - mail, dokument, kalender, och framför allt sökning som faktiskt fungerar",
      "Vi mäter framgång i tid sparad. Om vi kan minska dokumentletandet med 50% så är vi nöjda, det är 750 timmar per månad totalt",
      "Absolut krav är: Integration med vårt CRM Salesforce, mobil-app för byggarbetsplatsen, och GDPR-compliance eftersom vi hanterar kunddata",
      "Nice to have är: Avancerad rapportering och AI som kan hitta information åt oss automatiskt",
      "Det enda som skulle stoppa affären helt är om priserna går över 600 000 kronor per år. Då har vi inte råd",
      "Beslut fattas av vår VD Magnus Ström, men både jag som IT-chef och CFO Karin Lundberg måste också godkänna",
      "Utöver det behöver vi köra förbi inköpsavdelningen och få godkännande från HR eftersom det påverkar alla anställda",
      "Vår inköpsprocess är: Först en demo, sen teknisk utvärdering med IT-teamet, sedan budget-godkännande från ekonomi, och sist kontrakt",
      "Vi har faktiskt redan 500 000 kronor i budget avsatt för digitalisering i år, så pengarna finns",
      "Vår tidsplan drivs av att Google Workspace-avtalet löper ut 31 mars, så vi måste besluta före nyår",
      "Vi utvärderar också Google Workspace Premium och Microsoft 365 med Copilot. Atea har också pitchat sin lösning",
      "Viktigast för oss är funktionalitet och användarvänlighet. Priset är sekundärt så länge vi får en lösning som fungerar",
      "Vi har arbetat med Atea tidigare, men deras lösning för två år sedan löste inte våra dokumentproblem alls",
      "Min största oro är att folk inte kommer använda systemet. Vi har haft för många misslyckade IT-projekt",
      "Systemet måste integreras med Salesforce CRM, vårt ekonomisystem Fortnox, och gärna också BankID för inloggning",
      "Vi kommer ha 250 användare från dag ett, och vi räknar med att växa till 300 inom ett år",
      "Påverkade avdelningar är: Försäljning, Projekt, Ekonomi, HR, och IT naturligtvis",
      "Vi har ISO 27001-krav från vissa av våra större kunder, så säkerhet är kritiskt. All data måste lagras i EU",
      "Vår plan är att rulla ut lösningen pilotvis först - börja med 20 användare från IT och försäljning, utvärdera i en månad, sedan bred utrullning",
      "Copilot låter intressant! Kan det hjälpa oss att hitta information snabbare?",
      "Hur fungerar integrationen mellan Teams och SharePoint?",
      "Vi har budget på omkring 500 000 kronor per år som sagt, så det får inte överskrida det",
      "Det låter faktiskt bättre än vad Atea erbjöd. De kunde inte lösa dokumentproblemet",
      "Kan ni visa en demo för hela ledningsgruppen nästa vecka? Vi är fem personer - VD, CFO, jag själv, HR-chef och säljchef",
      "Perfekt! Vi vill verkligen komma igång så snabbt som möjligt, helst innan årsskiftet",
      "Skicka över en offert så diskuterar vi det internt med ekonomi och VD",
      "Tack så mycket! Det här känns som precis vad vi behöver för att effektivisera vårt arbete och få ordning på kaoset"
    ]
  },
  {
    id: 'azure-complex',
    name: '⚡ Azure Migration Challenge',
    description: 'Komplex Azure-migration med säkerhets- och kostnadsbekymmer. AWS-konkurrent. Behöver tänka på det.',
    expectedTriggers: ['Azure', 'AWS', 'Security', 'Pris', 'Compliance', 'Behöver tänka'],
    phrases: [
      "God morgon! Jag heter Erik Lundström, CTO på Nordic Manufacturing Group",
      "Vi är ett tillverkningsföretag med 400 medarbetare och fabriker i Sverige, Norge och Finland",
      "Våra tre största utmaningar är: För det första är våra on-premise servrar gamla och opålitliga - vi får driftstopp minst en gång per månad",
      "För det andra kan vi inte skala upp tillräckligt snabbt när produktionen ökar. Det tar veckor att få nya servrar",
      "Och för det tredje kostar IT-drift alldeles för mycket - vi har fem heltidsanställda bara för att hålla servrarna igång",
      "Kostnadsmässigt så betalar vi cirka 2 miljoner kronor per år i IT-drift, plus att varje driftstopp kostar oss 50 000 kronor i förlorad produktion",
      "Det här har varit ett växande problem i 15 år, men blev verkligen akut för tre år sedan efter en säkerhetsincident",
      "Vi har försökt uppdatera hårdvaran två gånger, men det är bara lappning och lagning. Vi har också testat edge computing men det blev för komplext",
      "Min drömlösning är ett modernt molnbaserat system där vi slipper ha egna servrar och där allt skalas automatiskt efter behov",
      "Vi mäter framgång i uptime och kostnadsreduktion. Vi vill ha minst 99.9% uptime och minska IT-driftskostnader med 30%",
      "Absolut nödvändigt är: ISO 27001-certifiering, data måste stanna i EU, och full integration med våra produktionssystem",
      "Nice to have vore: AI för prediktiv underhåll, avancerad säkerhetsövervakning, och automatisk disaster recovery",
      "Det som skulle döda affären är om Microsoft inte kan garantera data sovereignty - all data MÅSTE stanna i Europa enligt våra kunder",
      "Det slutliga beslutet fattas av vår VD Anders Kvist, men jag som CTO måste rekommendera lösningen tekniskt",
      "Vi behöver också ha IT-direktören med oss, samt säkerhetschefen för att godkänna säkerhetsaspekterna, och naturligtvis CFO för budgeten",
      "Vår inköpsprocess är: Först teknisk utvärdering och POC, sedan säkerhetsaudit, efter det affärscase till styrelsen, och slutligen juridisk granskning",
      "Vi har inte avsatt någon specifik budget än - det beror helt på vad ni kommer med i förslaget. Men vi kan omfördela från andra IT-investeringar",
      "Tidslinjen drivs av att vårt datacenter-hyresavtal löper ut om 18 månader, så vi måste vara migrerade till molnet innan dess",
      "Vi utvärderar både AWS med Accenture som partner, Azure med er, och även Google Cloud fast de känns mindre mogna för enterprise",
      "Viktigast vid val av leverantör är: Säkerhet först och främst, sen compliance med EU-regler, och tredje global tillgänglighet för våra fabriker",
      "Vi har arbetat med Accenture tidigare på en SAP-implementation. Bra tekniskt men väldigt dyrt och långsamt projekt",
      "Min absolut största oro är vendor lock-in. Jag vill inte sitta fast i Microsofts ekosystem om priserna skjuter i höjden om fem år",
      "Vi behöver integration med vårt ERP-system SAP, MES-systemet för produktion, och vår IoT-plattform för sensorer i fabriken",
      "Användare blir 400 anställda totalt, men bara cirka 50 personer kommer ha direkt åtkomst till molnmiljön - resten kör applikationer",
      "Berörda avdelningar är: IT naturligtvis, Produktion som kör systemen, Säkerhet som övervakar, och Ekonomi som betalar räkningarna",
      "Vi måste uppfylla ISO 27001, ISO 9001 för kvalitet, och vi har också försvarsindustri som kunder så viss data är säkerhetsklassad",
      "Utrullningsplan är att migrera i faser över 12 månader: Först dev/test-miljöer, sen mindre kritiska system, och sist produktionssystemen",
      "Vi har tittat lite på molnlösningar, och AWS verkar ju vara branschstandard enligt alla jag pratat med",
      "Accenture har varit här och pitchat AWS-migration. De hade väldigt imponerande kundreferenser från andra tillverkningsföretag",
      "Men jag har hört att molnet kan bli jättedyrt, särskilt när man väl är inlåst och har all sin data där",
      "Vad är egentligen skillnaden mellan Azure och AWS? AWS känns mer beprövat och har funnits längre",
      "Hur mycket kostar en Azure-migration för ett företag av vår storlek? Vi har ingen aning om vad detta landar på",
      "Vår IT-chef är ganska skeptisk till Microsoft efter dåliga erfarenheter av ett Office 2010-projekt för tio år sen",
      "Det här låter intressant, men vi måste absolut diskutera det internt med hela IT-teamet och säkerhetsavdelningen först",
      "Kan ni skicka teknisk dokumentation och säkerhetscertifikat så kan vårt team göra en ordentlig utvärdering?",
      "Vi behöver nog se en live-demo också av miljön, men det får vänta tills efter sommaren när alla är tillbaka",
      "Hur lång implementeringstid pratar vi realistiskt om? Ett år? Två år? Jag har hört att molnmigrationer ofta tar längre tid än planerat",
      "Okej, det här är intressant men komplext. Jag tar med mig materialet till ledningsgruppen och IT-teamet. Vi återkommer om några månader när vi utvärderat alla alternativ"
    ]
  },
  {
    id: 'powerplatform-quickwin',
    name: '🚀 Power Platform Quick Win',
    description: 'Snabb Power Platform-försäljning. Retail-företag som vill automatisera. Inhouse-konkurrent. Avslutad affär!',
    expectedTriggers: ['Power Platform', 'Power Automate', 'Inhouse', 'Automatisering', 'Avslutad affär'],
    phrases: [
      "Hej, jag heter Sofia Bergman och jag är verksamhetschef på TrendStyle Retail",
      "Vi är en modekedja med 45 butiker runt om i Sverige och totalt cirka 180 anställda",
      "Vi har tre akuta problem just nu: Först så tar manuella rapporter timmar varje dag att sammanställa",
      "För det andra gör vi mycket dubbelarbete - ekonomi och butikscheferna matar in samma data på olika ställen",
      "Och tredje problemet är att vi får felaktiga siffror ofta eftersom det är så mycket manuellt copy-paste mellan Excel-filer",
      "Det här kostar oss enormt mycket. Minst 10-15 timmar per vecka går åt till manuellt arbete, det är typ 2 heltidsanställda som vi slösar bort",
      "Plus att vi förlorar säkert 50 000 kronor per månad i felbeställningar eftersom våra lagerdata inte är uppdaterade i realtid",
      "Det här har varit ett problem i ungefär ett år nu, sedan vi öppnade 15 nya butiker och allt blev för mycket att hantera manuellt",
      "Vi har försökt lösa det på olika sätt. Först testade vi Zapier för automatisering men det var för tekniskt",
      "Sen sa vår IT-chef att han skulle bygga något eget, men han har inte hunnit och han har redan för mycket att göra",
      "Min drömlösning är ett system där butikscheferna kan rapportera in försäljning och lager direkt från sin mobil",
      "Sen ska det automatiskt flöda till ekonomisystemet och till våra dashboards utan att någon behöver röra Excel",
      "Vi mäter framgång i tid sparad och felfrekvens. Om vi kan minska manuellt arbete med 80% och minska fel med 90% är vi lyckliga",
      "Absolut måste vi ha: Integration med vårt kassasystem StorePoint och med Fortnox ekonomi. Och en mobilapp för butikscheferna",
      "Nice to have vore: AI som kan förutsäga lagerbehov baserat på tidigare försäljning, och integration med vårt lojalitetsprogram",
      "Det som skulle stoppa affären helt är om vi behöver byta ut vårt kassasystem. Det är för dyrt och för stort projekt",
      "Jag fattar det slutliga beslutet som verksamhetschef, men jag behöver ha med mig vår VD Lisa Holmberg på det här",
      "Sen måste vi även ha godkännande från IT-chefen tekniskt sett, och från ekonomichefen för budgeten",
      "Vår process är ganska enkel: Demo för mig och IT-chefen, sen presentation för VD, och sedan bara kör vi om alla säger ja",
      "Vi har 200 000 kronor avsatt för digitalisering och automatisering i årets budget, så pengarna finns redan",
      "Tidslinjen drivs av att Q4 är vår högsäsong och vi MÅSTE ha detta på plats innan november när julhandeln börjar",
      "Vi har tittat på olika alternativ: Zapier kändes för komplicerat, Make.com också, och som sagt ville IT bygga något eget",
      "Viktigast för oss är enkelhet och snabb implementation. Vi har inte tid att vänta sex månader på ett IT-projekt",
      "Vi har aldrig arbetat med Microsoft Power Platform förut, men vi är redan Microsoft 365-kunder så det känns tryggt",
      "Min största oro är att det ska bli för tekniskt och att våra butikschefer inte kan använda det. De är inte tech-savvy",
      "Vi behöver integration med StorePoint kassasystem, Fortnox ekonomisystem, och Power BI för rapportering",
      "Det kommer vara 45 butikschefer som använder mobilappen, plus 10 personer på huvudkontoret som jobbar med data",
      "Berörda avdelningar är: Alla butiker naturligtvis, ekonomi, IT, och inköp som också behöver lagerdata",
      "Vi har inga specifika compliance-krav mer än GDPR eftersom vi hanterar kunddata från vårt lojalitetsprogram",
      "Vår utrullningsplan är att börja med 5 pilotbutiker i Stockholmsområdet först, köra i två veckor, sedan rulla ut till alla 45 butiker",
      "Hur snabbt kan ni få igång något? Vi blöder pengar på ineffektiviteten just nu",
      "Vad kostar det? Vi har alltså 200 000 kronor budgeterat så det får inte gå över det",
      "Perfekt! Det är ju inom budgeten. Och tre veckor implementeringstid är fantastiskt snabbt",
      "Kan ni börja nästa vecka? Vi har redan Microsoft 365 så användarna är vana vid Microsoft-verktyg",
      "Ja, låt oss göra det! Skicka över avtalet så skriver jag på direkt. Och så fixar vi ett kickoff-möte",
      "Kan ni också inkludera utbildning för våra butikschefer i priset? De behöver handledning",
      "Underbart! Jag ser redan framför mig hur mycket tid och pengar vi kommer spara när det här är på plats",
      "Tack så mycket! Äntligen en lösning som inte tar månader att implementera och som är enkel att använda. Vi kör!"
    ]
  },
  {
    id: 'security-compliance',
    name: '🔒 Security & Compliance Focus',
    description: 'Finansföretag med strikta säkerhetskrav. Mycket frågor om compliance. Skeptisk men intresserad.',
    expectedTriggers: ['Security', 'Compliance', 'GDPR', 'ISO', 'Behöver tänka'],
    phrases: [
      "God dag, jag heter Linda Karlsson och jag är CISO på Nordic Finance Solutions",
      "Vi är en finansiell tjänsteleverantör med 150 anställda",
      "Vi hanterar mycket känslig kunddata och måste följa både GDPR och Finansinspektionens krav",
      "Just nu kör vi mycket lokalt på egna servrar för att ha full kontroll",
      "Men vårt management vill att vi ska modernisera och titta på molnlösningar",
      "Jag är mycket skeptisk. Hur kan ni garantera att vår data är säker i molnet?",
      "Vilka certifieringar har ni? Vi behöver minst ISO 27001, ISO 27018 och SOC 2",
      "Var ligger era datacenter? Kan vi specificera att data måste stanna i Sverige?",
      "Vad händer om ni får en dataintrång? Vilka är era SLA:er?",
      "Vi konkurrerade med AWS också, men vi föredrar europeiska leverantörer",
      "Hur fungerar er kryptering? Både in transit och at rest?",
      "Kan vi ha våra egna krypteringsnycklar? Vi vill inte att Microsoft har tillgång",
      "Vilka loggnings- och audit-möjligheter finns?",
      "Vad kostar era enterprise-planer med de högsta säkerhetsnivåerna?",
      "Okej, det låter faktiskt bättre än jag trodde. Men jag måste gräva djupare",
      "Kan ni fixa ett möte med era säkerhetsarkitekter? Jag vill gå igenom tekniska detaljer",
      "Vi har också Fortinet som security-partner. Integrerar ni med dem?",
      "Jag behöver också se er compliance-dokumentation innan vi kan gå vidare",
      "Skicka över allt material så går jag igenom det med vårt säkerhetsteam",
      "Vi återkommer inom en månad när vi har utvärderat allt"
    ]
  },
  {
    id: 'price-sensitive',
    name: '💰 Price-Sensitive Negotiation',
    description: 'Mycket fokus på pris och licensmodeller. Stor prispress. Låg sannolikhet men möjlig.',
    expectedTriggers: ['Pris', 'Budget', 'Licensiering', 'För dyrt', 'Behöver tänka'],
    phrases: [
      "Hej, jag heter Robert Ek och jag är inköpschef på BudgetTech AB",
      "Vi är ett logistikföretag med 200 anställda och mycket snäva marginaler",
      "Vi har tittat på att uppgradera från våra gamla Office 2016-licenser",
      "Men priserna på Microsoft 365 känns helt vansinniga ärligt talat",
      "Vi betalar ingenting idag för Office. Varför ska vi börja betala varje månad?",
      "Vi har kollat på Google Workspace också. De är betydligt billigare",
      "OpenOffice och LibreOffice är ju gratis. Varför kan vi inte köra det?",
      "Vad är egentligen skillnaden mellan Business Basic, Standard och Premium?",
      "Måste alla ha samma licens eller kan vi mixa?",
      "Kan vi få volymrabatt? 200 användare borde ge något",
      "Vad kostar det per år totalt? Jag behöver exakta siffror för budgeten",
      "Finns det några dolda kostnader? Implementation, support, training?",
      "Det blir ju över en miljon per år! Det har vi inte budget för",
      "Kan ni matcha Google Workspace pris? Annars blir det svårt",
      "Vi behöver också spara pengar på Teams Phone istället för vårt Telia-abonnemang",
      "Om vi tar ett treårsavtal, finns det bättre priser då?",
      "Okej, om ni kan ge oss 15% rabatt så kan jag nog sälja in det till ledningen",
      "Jag måste ha det skriftligt och gå igenom det med ekonomichefen",
      "Skicka ett detaljerat prisförslag med alla eventuella extrakostnader",
      "Vi återkommer om några veckor när vi har gått igenom allt"
    ]
  },
  {
    id: 'startup-fasttrack',
    name: '🚀 Startup Fast Track',
    description: 'Snabbväxande startup med begränsad budget men snabba beslut. Hög sannolikhet.',
    expectedTriggers: ['Startup', 'Skalning', 'Budget', 'Snabbt', 'Avslutad affär'],
    phrases: [
      "Hey! Jag heter Emma Lindberg och jag är CTO på GrowthTech Solutions",
      "Vi är en SaaS-startup som just fått in Series A-finansiering på 50 miljoner",
      "Vi har vuxit från 8 till 35 personer på tre månader och ska vara 80 till årsskiftet",
      "Just nu är det totalt kaos. Folk använder Slack, Google Meet, Zoom, Notion, allt möjligt",
      "Vi behöver standardisera på EN plattform innan det blir helt omöjligt",
      "Vi kör mest Google Workspace idag, men Teams verkar ha mer features",
      "Vi behöver videosamtal, chat, fildelning, projekthantering - allt i ett",
      "Säkerhet är också viktigt nu när vi växer. GDPR och sånt",
      "Kan vi få startup-rabatter? Vi har begränsad budget för IT just nu",
      "Hur snabbt kan vi komma igång? Vi vill rulla ut nästa vecka om möjligt",
      "Funkar det bra för tech-bolag? Vi har många utvecklare som är picky",
      "Kan man integrera med GitHub, Jira, och alla dev-tools?",
      "Vad kostar det för 50 användare med alla funktioner?",
      "Okej det är rimligt. Vi har budget för det",
      "Kan ni hjälpa oss migrera från Google Workspace? Vi har en del dokument",
      "Perfect! Vi vill köra ett pilot-projekt med 10 personer först",
      "Om det funkar bra rullar vi ut till alla inom två veckor",
      "Hur fungerar supporten? Vi jobbar ofta sent och helger",
      "Deal! Skicka avtal så skriver jag på idag. Vi vill komma igång direkt",
      "Awesome! Tack för hjälpen, exakt vad vi behöver"
    ]
  },
  {
    id: 'education-sector',
    name: '🎓 Education Sector',
    description: 'Skola/högskola med begränsad budget och specifika utbildningsbehov. Medel sannolikhet.',
    expectedTriggers: ['Education', 'Student', 'Budget', 'Utbildning', 'Bokat möte'],
    phrases: [
      "Hej, mitt namn är Karin Bergström och jag är IT-chef på Framtidens Gymnasium",
      "Vi är en friskola med cirka 600 elever och 80 lärare",
      "Vi använder en blandning av Google Workspace och gamla Office-licenser",
      "Det fungerar dåligt. Eleverna är förvirrade och lärarna klagar",
      "Vi behöver en enhetlig lösning för både undervisning och administration",
      "Finns det särskilda utbildningslicenser med rabatterade priser?",
      "Vi har väldigt begränsad budget - kommunbidraget räcker knappt",
      "Vad ingår i Microsoft 365 Education? Kan eleverna använda det hemma också?",
      "Vi behöver Teams för distansundervisning, det har blivit superviktigt",
      "Kan vi få OneNote för pedagogiskt arbete? Lärarna vill digitalisera",
      "Hur fungerar säkerheten för minderåriga elever? Vi måste följa skollagen",
      "Vad kostar det för 600 elever och 80 lärare per år?",
      "Google Workspace Education är ju gratis. Varför ska vi betala för Microsoft?",
      "Men om vi får bättre funktioner och support kan det vara värt det",
      "Kan ni komma och visa för vår lärarkår? De måste vara med på beslutet",
      "Vi har också IT-support från AddQ. Kan de hjälpa oss med deployment?",
      "Hur lång implementeringstid? Vi vill ha det klart till höstterminens start",
      "Okej, låt oss boka ett möte i augusti med rektorn och pedagogisk ledning",
      "Skicka ett förslag med priser och implementation-plan",
      "Tack för hjälpen! Vi återkommer efter vårt interna möte"
    ]
  }
];

/**
 * Hämta ett demo-script baserat på ID
 */
export const getDemoScript = (scriptId: string): DemoScript => {
  const script = DEMO_SCRIPTS.find(s => s.id === scriptId);
  return script || DEMO_SCRIPTS[0]; // Default till första scriptet
};

/**
 * Hämta alla tillgängliga demo-scripts
 */
export const getAllDemoScripts = (): DemoScript[] => {
  return DEMO_SCRIPTS;
};
