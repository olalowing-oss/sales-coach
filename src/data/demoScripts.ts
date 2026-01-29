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
      "Vi är ett medelstort byggföretag med cirka 250 anställda",
      "Just nu använder vi en blandning av olika verktyg. Teams har vi för möten",
      "Men vi har också Google Workspace för mail och dokument, vilket är lite rörigt faktiskt",
      "Det största problemet vi har är att hitta dokument och information. Folk sparar saker överallt",
      "Vi har också problem med samarbete mellan projekt. Mycket information försvinner mellan teamen",
      "Vi har tittat på olika lösningar, men Atea visade oss något för ett par månader sen som var för dyrt",
      "Vårt avtal med Google löper ut om tre månader så vi måste bestämma oss snart",
      "Berätta mer om Microsoft 365 och vad ni kan erbjuda",
      "Copilot låter intressant! Kan det hjälpa oss att hitta information snabbare?",
      "Hur fungerar integrationen mellan Teams och SharePoint?",
      "Vi har också säkerhetskrav från våra kunder. Uppfyller ni GDPR och ISO-standarder?",
      "Vad skulle detta kosta för oss? Vi har budget på omkring 500 000 kronor per år",
      "Det låter faktiskt bättre än vad Atea erbjöd. De kunde inte lösa dokumentproblemet",
      "Kan ni visa en demo för hela ledningsgruppen nästa vecka? Vi är fem personer",
      "Perfekt! Vi vill verkligen komma igång så snabbt som möjligt",
      "Skicka över en offert så diskuterar vi det internt",
      "Tack så mycket! Det här känns som precis vad vi behöver för att effektivisera vårt arbete"
    ]
  },
  {
    id: 'azure-complex',
    name: '⚡ Azure Migration Challenge',
    description: 'Komplex Azure-migration med säkerhets- och kostnadsbekymmer. AWS-konkurrent. Behöver tänka på det.',
    expectedTriggers: ['Azure', 'AWS', 'Security', 'Pris', 'Compliance', 'Behöver tänka'],
    phrases: [
      "God morgon! Jag heter Erik Lundström, CTO på Nordic Manufacturing Group",
      "Vi är ett tillverkningsföretag med 400 medarbetare och fabriker i tre länder",
      "Just nu kör vi allt on-premise. Har våra egna servrar här i källaren sedan 15 år tillbaka",
      "Men nu börjar det bli ohållbart. Gammalt, dyrt att underhålla, och vi kan inte skala upp snabbt nog",
      "Vi har tittat lite på molnlösningar, och AWS verkar ju vara branschstandard",
      "Accenture har också varit här och pratat om AWS-migration. De hade imponerande referenser",
      "Men jag har hört att det kan bli jättedyrt med molnet, särskilt när man väl är inlåst",
      "Vårt största problem är säkerheten. Vi har ISO 27001-krav och mycket känslig produktdata",
      "Kan ni verkligen garantera att data inte lämnar EU? Det är kritiskt för oss",
      "Vi har också haft ett intrång för tre år sen, så ledningen är mycket nervösa för säkerhet",
      "Vad är skillnaden mellan Azure och AWS egentligen? AWS känns mer beprövat",
      "Och hur mycket kostar det? Vi har ingen aning om vad det här landar på",
      "Vår IT-chef är skeptisk. Han litar inte på Microsoft efter dåliga erfarenheter av Office 2010",
      "Det här låter intressant, men vi måste diskutera det internt först",
      "Kan ni skicka någon teknisk dokumentation så kan vårt team utvärdera det?",
      "Vi behöver nog se en demo också, men det får vänta tills efter sommaren",
      "Hur lång implementeringstid pratar vi om? Ett år? Två år?",
      "Okej, jag tar med mig det här till ledningsgruppen. Vi återkommer om några månader"
    ]
  },
  {
    id: 'powerplatform-quickwin',
    name: '🚀 Power Platform Quick Win',
    description: 'Snabb Power Platform-försäljning. Retail-företag som vill automatisera. Inhouse-konkurrent. Avslutad affär!',
    expectedTriggers: ['Power Platform', 'Power Automate', 'Inhouse', 'Automatisering', 'Avslutad affär'],
    phrases: [
      "Hej, jag heter Sofia Bergman och jag är verksamhetschef på TrendStyle Retail",
      "Vi är en modekedja med 45 butiker runt om i Sverige, totalt cirka 180 anställda",
      "Vi har ett akut problem med våra manuella processer. Det tar timmar varje dag",
      "Varje morgon måste vi manuellt sammanställa försäljningsrapporter från alla butiker i Excel",
      "Sen ska det skickas till ekonomi, som gör om allting igen i sitt system. Totalt kaos!",
      "Vi tappar säkert 10-15 timmar i veckan bara på dubbelarbete och copy-paste",
      "Vår IT-chef säger att han kan bygga något eget, men han har redan för mycket att göra",
      "Jag har hört talas om Power Platform och automatisering. Kan det hjälpa oss?",
      "Vi behöver kunna koppla ihop vårt kassasystem med ekonomisystemet och Power BI",
      "Och gärna någon app där butikscheferna kan rapportera in lagerstatusändringar direkt",
      "Hur snabbt kan ni få igång något? Vi blöder pengar på ineffektiviteten just nu",
      "Vad kostar det? Vi har 200 000 kronor budgeterat för digitalisering i år",
      "Perfekt! Det är ju inom budgeten. Och tre veckor implementeringstid är fantastiskt",
      "Kan ni börja nästa vecka? Vi har redan Microsoft 365 så användarna är vana vid det",
      "Ja, låt oss göra det! Skicka över avtalet så skriver jag på direkt",
      "Kan ni också inkludera utbildning för våra butikschefer? De är inte så tech-savvy",
      "Underbart! Jag ser redan framför mig hur mycket tid vi kommer spara",
      "Tack! Äntligen en lösning som inte tar månader att implementera. Vi kör!"
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
