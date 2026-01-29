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
