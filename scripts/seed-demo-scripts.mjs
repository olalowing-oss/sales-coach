import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const CURRENT_USER_ID = '75004a8c-5e9f-413a-9c89-0affbd0eaa33'; // ola@lowing.eu
const M365_PRODUCT_ID = '9e4293ba-72a2-4bde-bb72-ffc813ac6d1f';

const demoScripts = [
  {
    user_id: CURRENT_USER_ID,
    product_id: M365_PRODUCT_ID,
    name: 'Microsoft 365 - Grundläggande Demo',
    description: 'En komplett genomgång av Microsoft 365 för småföretag och medelstora företag',
    duration_minutes: 45,
    target_audience: 'IT-chefer, VD:ar, verksamhetschefer i SMB-segment',
    opening_hook: 'Tänk dig att alla dina medarbetare kan arbeta var som helst, när som helst, med full säkerhet och alla verktyg de behöver - allt i en enda plattform. Det är precis vad Microsoft 365 gör möjligt.',
    key_talking_points: [
      'Komplett produktivitetsplattform med Office-appar, Teams, och molnlagring',
      'Säkerhet i världsklass med inbyggd hotidentifiering och dataskydd',
      'Flexibel licensmodell som skalar med företagets behov',
      'Kostnadsbesparing genom minskad IT-overhead och färre verktyg',
      'Sömlös integration mellan alla tjänster för maximalt värde'
    ],
    demo_flow: [
      {
        id: '1',
        title: 'Introduktion och behov',
        description: 'Förstå kundens nuvarande situation och utmaningar',
        talkingPoints: [
          'Vilka verktyg använder ni idag för kommunikation och samarbete?',
          'Vilka är era största utmaningar med nuvarande lösning?',
          'Hur många användare och på vilka enheter arbetar de?',
          'Finns det specifika säkerhetskrav eller compliance-behov?'
        ],
        expectedQuestions: [
          'Vad kostar Microsoft 365?',
          'Hur skiljer det sig från gamla Office-licenser?',
          'Måste alla ha samma licens?'
        ],
        tips: [
          'Lyssna aktivt och notera smärtpunkter',
          'Anpassa demon baserat på deras svar',
          'Fokusera på business value, inte tekniska detaljer'
        ]
      },
      {
        id: '2',
        title: 'Teams - Kommunikation och samarbete',
        description: 'Visa hur Teams revolutionerar arbetssättet',
        talkingPoints: [
          'Chat, video och samtalstelefoni i en app',
          'Kanaler för projekt och team med strukturerad information',
          'Möten med inspelning, transkribering och AI-sammanfattning',
          'Integration med alla Office-dokument - redigera direkt i Teams',
          'Extern samarbete med kunder och partners'
        ],
        expectedQuestions: [
          'Kan vi behålla våra telefonnummer med Teams Phone?',
          'Hur fungerar det för distansarbete?',
          'Kan externa gäster delta i möten?'
        ],
        tips: [
          'Visa ett live-möte om möjligt',
          'Demonstrera samredigering av dokument',
          'Nämn att Teams ersätter både Zoom och Slack'
        ]
      },
      {
        id: '3',
        title: 'Produktivitetsappar - Office och mer',
        description: 'Visa värdet av molnbaserade Office-appar',
        talkingPoints: [
          'Alltid senaste versionen av Word, Excel, PowerPoint, Outlook',
          'Arbeta från vilken enhet som helst - PC, Mac, mobil, surfplatta',
          'Realtidssamarbete på samma dokument samtidigt',
          'OneDrive för automatisk backup och delning',
          'Versionhantering och återställning av dokument'
        ],
        expectedQuestions: [
          'Fungerar det offline?',
          'Kan vi fortfarande använda desktop-apparna?',
          'Hur mycket molnlagring ingår?'
        ],
        tips: [
          'Visa samredigering med flera användare live',
          'Demonstrera att arbeta från mobilen',
          'Nämn 1TB OneDrive per användare'
        ]
      },
      {
        id: '4',
        title: 'Säkerhet och compliance',
        description: 'Adressera säkerhetsfrågor och visa styrkan',
        talkingPoints: [
          'Multi-faktor autentisering och conditional access',
          'Advanced Threat Protection mot phishing och malware',
          'Data Loss Prevention - förhindra läckage av känslig information',
          'Compliance med GDPR, ISO 27001, och svenska regler',
          'Data lagras i EU (Sverige och Nederländerna)'
        ],
        expectedQuestions: [
          'Vad händer om Microsoft får ett dataintrång?',
          'Kan vi kontrollera var data lagras?',
          'Uppfyller ni våra compliance-krav?'
        ],
        tips: [
          'Använd Security Center för att visa säkerhetsnivå',
          'Nämn Microsofts investeringar i säkerhet (1 miljard dollar/år)',
          'Ha compliance-dokumentation redo att skicka'
        ]
      },
      {
        id: '5',
        title: 'SharePoint och automatisering',
        description: 'Visa dokumenthantering och processautomatisering',
        talkingPoints: [
          'Centraliserad dokumentlagring med kraftfull sökning',
          'Intranät och nyhetsflöden för intern kommunikation',
          'Metadata och innehållstyper för strukturerad information',
          'Power Automate för att automatisera repetitiva uppgifter',
          'Integration med befintliga system via API'
        ],
        expectedQuestions: [
          'Kan vi migrera våra filer från vår gamla servrar?',
          'Hur fungerar sökningen?',
          'Är det svårt att sätta upp?'
        ],
        tips: [
          'Visa ett konkret exempel på ett automatiserat arbetsflöde',
          'Demonstrera sökning över alla dokument',
          'Nämn att migration är en del av implementeringen'
        ]
      },
      {
        id: '6',
        title: 'Priser och licensmodeller',
        description: 'Förklara prisstruktur och skapa värdeproposition',
        talkingPoints: [
          'Business Basic (60 kr/user/mån) - webbappar och Teams',
          'Business Standard (125 kr/user/mån) - desktop-appar inkluderade',
          'Business Premium (220 kr/user/mån) - avancerad säkerhet',
          'Flexibel månadsbetalning eller årlig rabatt',
          'Inkluderat: support, uppdateringar, säkerhet, backup'
        ],
        expectedQuestions: [
          'Finns det volymrabatter?',
          'Kan vi mixa olika licenser?',
          'Vad händer om vi vill säga upp?'
        ],
        tips: [
          'Jämför med kostnad för flera separata verktyg (Zoom + Dropbox + osv)',
          'Räkna på TCO inkl minskad IT-tid',
          'Nämn att priset inkluderar allt - inga dolda kostnader'
        ]
      },
      {
        id: '7',
        title: 'Implementation och support',
        description: 'Beskriv hur vi hjälper kunden komma igång',
        talkingPoints: [
          'Snabb uppsättning - kan köra pilotprojekt inom en vecka',
          'Migration av data från gamla system',
          'Utbildning för administratörer och slutanvändare',
          'Löpande support via telefon, mail och chatt',
          'Dedikerad kundansvarig för större kunder'
        ],
        expectedQuestions: [
          'Hur lång tid tar implementeringen?',
          'Vad händer med våra befintliga filer?',
          'Vilken support ingår?'
        ],
        tips: [
          'Föresla en pilotgrupp först för att minimera risk',
          'Nämn tidigare framgångsrika implementeringar',
          'Var tydlig med vad som ingår vs kostar extra'
        ]
      },
      {
        id: '8',
        title: 'Avslutning och nästa steg',
        description: 'Säkra commitment och tydliga nästa steg',
        talkingPoints: [
          'Sammanfatta de viktigaste fördelarna baserat på deras behov',
          'Adressera eventuella kvarstående invändningar',
          'Föreslå konkreta nästa steg - pilotstudie eller offert',
          'Boka uppföljningsmöte',
          'Skicka uppföljningsmaterial och referenser'
        ],
        expectedQuestions: [
          'Kan vi testa först?',
          'Hur lång bindningstid?',
          'Vad händer om vi inte är nöjda?'
        ],
        tips: [
          'Alltid fråga: "Vad behöver ni för att fatta beslut?"',
          'Erbjud en kostnadsfri pilotperiod på 30 dagar',
          'Boka nästa möte innan ni avslutar'
        ]
      }
    ],
    common_questions: [
      {
        question: 'Vad är skillnaden mellan Microsoft 365 och gamla Office-licenser?',
        answer: 'Microsoft 365 är en komplett molnlösning med alltid uppdaterade Office-appar, Teams, OneDrive, säkerhetsfunktioner och support - allt till ett förutsägbart månadspris. Gamla Office-licenser är bara desktop-appar utan molntjänster, uppdateringar eller support.',
        category: 'Allmänt'
      },
      {
        question: 'Kan vi använda Microsoft 365 offline?',
        answer: 'Ja! Desktop-apparna (Word, Excel, osv) fungerar fullt ut offline. Filer synkas automatiskt när du är online igen. Du kan också göra filer tillgängliga offline i OneDrive och Teams.',
        category: 'Tekniskt'
      },
      {
        question: 'Vad händer med våra filer om vi säger upp?',
        answer: 'Du har full tillgång till att exportera all data före uppsägning. Vi hjälper till med dataexport om behövs. Ingen data raderas omedelbart - du har en grace period för att säkerställa att allt är exporterat.',
        category: 'Policy'
      },
      {
        question: 'Måste alla användare ha samma licens?',
        answer: 'Nej! Du kan mixa olika licensnivåer. Till exempel kan kontorsanställda ha Business Standard medan fabriksarbetare har Business Basic. Detta ger maximal kostnadseffektivitet.',
        category: 'Licensiering'
      },
      {
        question: 'Uppfyller Microsoft 365 GDPR-kraven?',
        answer: 'Ja, absolut. Microsoft 365 är GDPR-compliant och data lagras i EU-datacenter (Sverige och Nederländerna). Vi är också ISO 27001, ISO 27018, och SOC 2 certifierade. Dokumentation kan skickas på begäran.',
        category: 'Säkerhet & Compliance'
      },
      {
        question: 'Hur lång implementeringstid behöver vi räkna med?',
        answer: 'För små och medelstora företag tar en grundimplementation 2-4 veckor. En pilotgrupp kan köras inom en vecka. Större företag med komplex migration kan ta 2-3 månader beroende på omfång.',
        category: 'Implementation'
      }
    ],
    objection_handling: [
      {
        objection: 'Det är för dyrt jämfört med Google Workspace',
        response: 'Bra att du jämför! Tittar man på priset isolerat kan Google se billigare ut. Men Microsoft 365 inkluderar desktop-apparna (Word, Excel, PowerPoint) som Google inte har, plus Teams Phone som ersätter telefonabonnemang. Räknar man in alla verktyg du får och den IT-tid du sparar blir Microsoft 365 ofta mer kostnadseffektivt. Ska vi räkna på er totala kostnad tillsammans?'
      },
      {
        objection: 'Vi är nöjda med våra nuvarande verktyg',
        response: 'Det är superbra att ha verktyg som fungerar! Får jag fråga - hur många olika verktyg använder ni totalt för mail, chat, video, fildelning och telefoni? (Vänta på svar) Och hur mycket tid går åt till att växla mellan dessa och hålla allt synkat? Microsoft 365 handlar inte om att ersätta något som fungerar, utan att samla allt på ett ställe så era medarbetare blir mer produktiva. Skulle ni vara intresserade av att se hur mycket tid ni kan spara?'
      },
      {
        objection: 'Vi behöver tänka på det',
        response: 'Absolut, det är ett viktigt beslut som ska vara väl genomtänkt. För att hjälpa er i beslutsprocessen - vad är de viktigaste frågorna ni behöver svar på? (Vänta på svar) Perfekt! Jag kan hjälpa er med det. Vad sägs om att jag skickar över (specifik info de behöver) och så bokar vi ett kort uppföljningssamtal nästa vecka? Passar torsdag kl 10?'
      },
      {
        objection: 'Vår IT-chef säger att vi kan bygga något liknande själva',
        response: 'Er IT-chef har helt rätt i att mycket går att bygga själv - ni har säkert kompetenta utvecklare! Frågan är om det är bästa användningen av deras tid. Microsoft investerar över 1 miljard dollar årligen bara i säkerhet, plus tusentals utvecklare som bygger nya funktioner. Skulle ni istället vilja att era IT-resurser fokuserar på det som verkligen differentierar er verksamhet? Plus - vad händer om den person som byggt systemet slutar?'
      },
      {
        objection: 'Vi är oroliga för säkerheten i molnet',
        response: 'Säkerhetsoro är helt legitim och jag uppskattar att ni tar det på allvar! Sanningen är att Microsofts datacenter troligen har bättre säkerhet än vad de flesta företag kan ha lokalt. Ni får multi-faktor autentisering, kryptering, hotidentifiering i realtid, och backups automatiskt. Plus - om er lokala server i källaren brinner upp eller får ett ransomware-angrepp, vad är er återhämtningsplan då? Skulle ni vilja se vår säkerhetsöversikt så kan vi gå igenom exakt hur era data skyddas?'
      },
      {
        objection: 'Vi har kontrakt med [annan leverantör] som inte går ut än',
        response: 'Smart att ni håller koll på era kontrakt! När går det ut? (Vänta på svar) Okej, det ger oss faktiskt god tid att planera. Många av våra kunder kör en pilotgrupp med Microsoft 365 parallellt för att testa, så när kontraktet går ut kan ni göra en smidig övergång. Skulle ni vara intresserade av att köra en liten pilot med 10-20 användare redan nu för att se hur det funkar för er?'
      }
    ],
    success_criteria: [
      'Kunden förstår de tre viktigaste värdefördelarna för just deras verksamhet',
      'Alla tekniska och säkerhetsfrågor är besvarade till kundnöjdhet',
      'Prisnivå och licensmodell är tydlig och accepterad',
      'Kunden ser Microsoft 365 som en lösning på sina nuvarande utmaningar',
      'Nästa steg är bokade (uppföljningsmöte, pilot, eller offert)'
    ],
    next_steps: [
      'Skicka sammanfattning från mötet med de viktigaste punkterna',
      'Mejla ut prisjämförelse baserad på deras specifika behov',
      'Dela relevanta kundcase från liknande företag/bransch',
      'Boka uppföljningsmöte eller teknisk djupdykning',
      'Föreslå pilotprojekt med tydlig tidplan och scope',
      'Skicka offert om kunden är redo'
    ],
    is_active: true
  },
  {
    user_id: CURRENT_USER_ID,
    product_id: M365_PRODUCT_ID,
    name: 'Microsoft Copilot - AI för produktivitet',
    description: 'Fokuserad demo av Microsoft Copilot och AI-funktioner i M365',
    duration_minutes: 30,
    target_audience: 'Knowledge workers, chefer, analytiker, ekonomiavdelningar',
    opening_hook: 'Vad skulle du kunna åstadkomma om du fick tillbaka 10 timmar i veckan? Microsoft Copilot är din AI-assistent som sammanfattar möten, skriver utkast, analyserar data och hittar information - så du kan fokusera på det som verkligen skapar värde.',
    key_talking_points: [
      'Copilot i alla Office-appar - Word, Excel, PowerPoint, Outlook, Teams',
      'Automatisk mötessammanfattning och action items från Teams',
      'Skapa presentationer från dokument på sekunder',
      'Analysera Excel-data och skapa insikter med naturligt språk',
      'Sök och sammanfatta information över alla dina dokument och chattar'
    ],
    demo_flow: [
      {
        id: '1',
        title: 'Introduktion - AI i arbetslivet',
        description: 'Sätt scenen för hur AI förändrar produktivitet',
        talkingPoints: [
          'Hur mycket tid spenderar ni på administration vs värdeskapande arbete?',
          'Hur ofta missar ni viktig information som ligger spretat i mail, Teams och dokument?',
          'Copilot är inte en chatbot - det är en AI-assistent som förstår DITT arbete och DIN data'
        ],
        expectedQuestions: [
          'Vad är skillnaden mellan Copilot och ChatGPT?',
          'Kan Copilot läsa våra konfidentiella dokument?',
          'Kostar det extra?'
        ],
        tips: [
          'Fokusera på tidsbesparing och värdeskapande',
          'Adressera datasäkerhet direkt - ingen data lämnar er tenant'
        ]
      },
      {
        id: '2',
        title: 'Copilot i Teams - Aldrig missa ett möte',
        description: 'Visa mötessammanfattning och catch-up',
        talkingPoints: [
          'Automatisk transkribering av alla möten på svenska',
          'AI-genererad sammanfattning med action items',
          'Ställ frågor om vad som sades i mötet',
          'Catch up på möten du missade på 2 minuter',
          'Översätt sammanfattningar till valfritt språk'
        ],
        expectedQuestions: [
          'Fungerar det på svenska?',
          'Vad händer med inspelningarna?',
          'Kan gäster utanför företaget använda det?'
        ],
        tips: [
          'Visa ett riktigt exempel på en mötessammanfattning',
          'Demonstrera att ställa follow-up frågor till Copilot'
        ]
      },
      {
        id: '3',
        title: 'Copilot i Word - Från idé till dokument',
        description: 'Skriva, redigera och sammanfatta dokument',
        talkingPoints: [
          'Skapa första utkast från prompts eller befintliga dokument',
          'Sammanfatta långa dokument till key points',
          'Omformulera text till olika toner (formell, informell, koncis)',
          'Ställ frågor om dokumentinnehåll',
          'Generera innehållsförteckning och sammanfattningar automatiskt'
        ],
        expectedQuestions: [
          'Skriver Copilot allt åt mig?',
          'Hur kontrollerar jag kvaliteten?',
          'Kan den arbeta med våra mallar?'
        ],
        tips: [
          'Betona att Copilot är en assistent - DU har kontrollen',
          'Visa hur man itererar och förbättrar utgånger'
        ]
      },
      {
        id: '4',
        title: 'Copilot i Excel - Data till insikter',
        description: 'Analysera och visualisera data med naturligt språk',
        talkingPoints: [
          'Ställ frågor om din data i klartext - "Vilken månad hade högst försäljning?"',
          'Skapa avancerade formler utan att kunna Excel-syntax',
          'Generera pivottabeller och diagram automatiskt',
          'Identifiera trender och avvikelser i data',
          'Formatera och strukturera data intelligent'
        ],
        expectedQuestions: [
          'Fungerar det med stora dataset?',
          'Kan den arbeta med våra befintliga Excel-filer?',
          'Ersätter detta Power BI?'
        ],
        tips: [
          'Ha ett konkret exempel med försäljningsdata eller liknande',
          'Visa hur icke-Excel-experter kan få insights'
        ]
      },
      {
        id: '5',
        title: 'Copilot i PowerPoint - Presentationer på minuter',
        description: 'Från dokument eller idé till presentation',
        talkingPoints: [
          'Skapa hel presentation från ett Word-dokument',
          'Generera slides från outline eller prompts',
          'Omvandla text till professionell bildlayout',
          'Föreslå bilder och ikoner baserat på innehåll',
          'Sammanfatta långa presentationer till executive summary'
        ],
        expectedQuestions: [
          'Kan den använda vår företagsmall?',
          'Hur ser bilderna ut - stockphotos?',
          'Kan jag ändra efteråt?'
        ],
        tips: [
          'Visa processen från tomt dokument till färdig presentation',
          'Betona tidsbesparing - från timmar till minuter'
        ]
      },
      {
        id: '6',
        title: 'Copilot i Outlook - Email-hantering',
        description: 'Hantera inbox mer effektivt',
        talkingPoints: [
          'Sammanfatta långa mailtrådar till key points',
          'Generera svar baserat på mailkontext',
          'Omformulera mail till olika toner',
          'Coaching för bättre mailskrivande',
          'Prioritera mail baserat på innehåll'
        ],
        expectedQuestions: [
          'Skickar Copilot mail automatiskt?',
          'Kan mottagaren se att AI hjälpt till?',
          'Fungerar det med externa mail?'
        ],
        tips: [
          'Klargör att DU alltid granskar innan du skickar',
          'Visa hur man sparar tid på mail-ping-pong'
        ]
      },
      {
        id: '7',
        title: 'Microsoft 365 Copilot Chat - Din företags-AI',
        description: 'Sök och analysera över all företagsdata',
        talkingPoints: [
          'En fråga - svar från alla källor (mail, Teams, SharePoint, OneDrive)',
          'Hitta den där filen eller informationen du vet finns någonstans',
          'Förbered inför möten genom att sammanfatta relevant kontext',
          'Skapa status-rapporter baserat på alla dina aktiviteter',
          'Få rekommendationer baserat på företagets kunskapsbas'
        ],
        expectedQuestions: [
          'Ser Copilot ALLT jag har tillgång till?',
          'Kan andra se mina Copilot-frågor?',
          'Lagras mina frågor och svar?'
        ],
        tips: [
          'Demonstrera en komplex fråga som kräver data från flera källor',
          'Betona datasäkerhet - Copilot respekterar alla permissions'
        ]
      },
      {
        id: '8',
        title: 'Pris och implementering',
        description: 'Investering och ROI för Copilot',
        talkingPoints: [
          'Microsoft 365 Copilot: 360 kr/user/månad (kräver M365 E3/E5 eller Business Standard/Premium)',
          'Copilot räknas som en extra medarbetare - vad skulle en assistent kosta?',
          'Typisk ROI: 10+ timmar sparade per vecka per användare',
          'Börja med pilotgrupp för att mäta impact',
          'Enkel aktivering - ingen installation behövs'
        ],
        expectedQuestions: [
          'Måste alla ha Copilot-licens?',
          'Kan vi testa först?',
          'Vad är verklig ROI?'
        ],
        tips: [
          'Räkna på ROI: 10h/vecka * 500kr/h = 5000kr/vecka besparad',
          'Föreslå pilot med 10-20 power users först',
          'Ha customer success stories redo'
        ]
      }
    ],
    common_questions: [
      {
        question: 'Vad är skillnaden mellan Copilot och ChatGPT?',
        answer: 'ChatGPT är en generell AI som tränats på internet-data. Microsoft 365 Copilot är din företags-AI som arbetar med DIN data (mail, dokument, chattar) och förstår din kontext. Copilot respekterar alla säkerhetsinställningar och permissions - data lämnar aldrig er tenant. Plus, Copilot är integrerad direkt i alla appar du redan använder.',
        category: 'Allmänt'
      },
      {
        question: 'Är det säkert att låta AI läsa våra konfidentiella dokument?',
        answer: 'Ja, Copilot använder samma säkerhet och permissions som resten av M365. Den kan bara se vad DU har tillgång till. Data används för att svara på dina frågor men lämnar aldrig er tenant och tränar inte Microsofts AI-modeller. Allt är GDPR-compliant och data lagras i EU.',
        category: 'Säkerhet'
      },
      {
        question: 'Fungerar Copilot på svenska?',
        answer: 'Ja! Copilot stöder över 40 språk inklusive svenska. Den kan transkribera möten på svenska, skriva och sammanfatta på svenska, och till och med översätta mellan språk. Kvaliteten på svenska är mycket bra.',
        category: 'Språk'
      },
      {
        question: 'Hur mycket tid sparar man verkligen med Copilot?',
        answer: 'Enligt Microsofts studier sparar användare i genomsnitt 10+ timmar per vecka. 70% säger att de blir mer produktiva och 68% att de förbättrat kvaliteten på sitt arbete. Det varierar såklart beroende på roll - knowledge workers som arbetar mycket med dokument, mail och möten ser störst effekt.',
        category: 'ROI'
      },
      {
        question: 'Kan vi börja med bara några användare?',
        answer: 'Absolut! Vi rekommenderar faktiskt att börja med en pilotgrupp på 10-20 power users. Låt dem testa i 30 dagar, mät resultat, samla feedback. Sedan kan ni rulla ut till fler användare baserat på faktiska resultat. Detta minimerar risk och visar ROI innan större investering.',
        category: 'Implementation'
      },
      {
        question: 'Ersätter Copilot våra anställda?',
        answer: 'Nej, Copilot är ett verktyg som förstärker era medarbetare, inte ersätter dem. Tänk på det som en assistent som hanterar tidskrävande uppgifter så era anställda kan fokusera på kreativitet, strategi och mänsklig interaktion. Det frigör tid från administration till värdeskapande.',
        category: 'Allmänt'
      }
    ],
    objection_handling: [
      {
        objection: '360 kr/user/månad är för dyrt',
        response: 'Jag förstår att det ser ut som en stor kostnad. Låt oss räkna på det tillsammans: Om Copilot sparar bara 2 timmar i veckan per användare, och en timme kostar 500 kr, så är det 1000 kr/vecka eller cirka 4000 kr/månad i sparat värde - för en kostnad på 360 kr. Det är över 10x ROI. Ska vi räkna på vad det skulle betyda för just era användare?'
      },
      {
        objection: 'AI gör säkert många fel, vi kan inte lita på det',
        response: 'Utmärkt poäng att ta upp! Copilot är en assistent, inte en beslutsfattare. Precis som du granskar när en kollega skickar dig ett utkast, bör du granska vad Copilot skapar. Det spännande är att Copilot blir bättre ju mer specifik du är med dina prompts. Och även om den gör misstag ibland, sparar den så mycket tid att nettoresultatet är enormt positivt. Vill du se hur vi tränar användare att arbeta effektivt med Copilot?'
      },
      {
        objection: 'Våra medarbetare lär sig aldrig att använda AI',
        response: 'Det är en vanlig oro! Men Copilot är faktiskt mycket lättare än många tror. Det är som att chatta med en kollega - du skriver vad du vill ha på svenska, inget kodande eller komplicerade kommandon. Vi har sett 60-åringar bli power users på två veckor. Plus, vi inkluderar utbildning och har färdiga guider. Skulle ni vara intresserade av att se vårt utbildningsprogram?'
      },
      {
        objection: 'Vi vill vänta tills tekniken är mer mogen',
        response: 'Jag förstår viljan att vänta tills tekniken är beprövad. Men här är det spännande: Microsoft 365 Copilot används redan av över 1 miljon användare globalt, inklusive stora svenska företag som Volvo och Ericsson. Tekniken är här nu och era konkurrenter implementerar redan. Frågan är inte om ni ska adoptera AI, utan när. Varje månad ni väntar förlorar ni hundratals timmar i produktivitet. Vad sägs om att köra en liten pilot för att se faktiska resultat innan fullt commitment?'
      }
    ],
    success_criteria: [
      'Kunden förstår hur Copilot fungerar i deras dagliga arbetsflöde',
      'ROI är tydligt demonstrerat med konkreta exempel',
      'Säkerhetsfrågor är adresserade och kunden känner sig trygg',
      'Kunden ser Copilot som en kompetitiv fördel, inte bara en kostnad',
      'Pilot eller proof-of-concept är bokat'
    ],
    next_steps: [
      'Skicka ROI-kalkyl baserad på kundens användarprofil och timkostnad',
      'Dela kundcase från liknande företag/bransch som implementerat Copilot',
      'Föreslå pilotgrupp med 10-20 användare i 30 dagar',
      'Boka teknisk workshop för att visa avancerade use cases',
      'Skicka Microsoft Copilot säkerhetsdokumentation',
      'Uppföljningsmöte efter 2 veckor för att diskutera pilotresultat'
    ],
    is_active: true
  },
  {
    user_id: CURRENT_USER_ID,
    product_id: M365_PRODUCT_ID,
    name: 'Teams Phone - Moderna telefonilösningen',
    description: 'Demo av Microsoft Teams Phone som ersättning för traditionell telefonväxel',
    duration_minutes: 30,
    target_audience: 'IT-chefer, COO, verksamhetschefer som vill modernisera telefoni',
    opening_hook: 'Vad om er telefoni kostade hälften, fungerade var som helst, och var integrerad direkt i appen ni redan använder för möten och chat? Det är Teams Phone - er kompletta telefonilösning i molnet.',
    key_talking_points: [
      'Komplett växelfunktionalitet i Teams - inget extra hårdvara behövs',
      'Behåll era befintliga telefonnummer och växla sömlöst',
      'Ring från mobil, dator eller bordstelefonapparat - samma nummer överallt',
      'Kraftfull routing, kösystem och automatiska svarare',
      'Spara 30-50% jämfört med traditionella telefonilösningar'
    ],
    demo_flow: [
      {
        id: '1',
        title: 'Introduktion - Utmaningar med traditionell telefoni',
        description: 'Identifiera kundens problem med nuvarande lösning',
        talkingPoints: [
          'Hur fungerar er telefoni idag? Har ni en lokal växel eller molnlösning?',
          'Vilka utmaningar har ni - kostnad, flexibilitet, support?',
          'Hur många som behöver ringa/ta emot samtal?',
          'Fungerar det bra för distansarbete och hemarbete?'
        ],
        expectedQuestions: [
          'Kan vi behålla våra telefonnummer?',
          'Vad kostar det jämfört med vad vi har idag?',
          'Behöver vi ny hårdvara?'
        ],
        tips: [
          'Notesera deras nuvarande kostnad för telefoni',
          'Fråga om de har problem med distansarbete'
        ]
      },
      {
        id: '2',
        title: 'Grundfunktionalitet - Ring från Teams',
        description: 'Visa hur man ringer och tar emot samtal',
        talkingPoints: [
          'Ring direkt från Teams-appen på dator eller mobil',
          'Samma vy för chat, video och telefonsamtal',
          'Samtalskontroller: håll, överför, konferens, inspelning',
          'Samtalhistorik och voicemail integrerat',
          'Ring till både interna kollegor och externa nummer'
        ],
        expectedQuestions: [
          'Vad händer om internet går ner?',
          'Kan man använda vanliga telefoner?',
          'Fungerar det utomlands?'
        ],
        tips: [
          'Gör ett test-samtal live om möjligt',
          'Visa hur enkelt det är att växla mellan chat och samtal'
        ]
      },
      {
        id: '3',
        title: 'Växelfunktioner - Auto attendant och köer',
        description: 'Visa avancerade växelfunktioner',
        talkingPoints: [
          'Auto attendant: "Tryck 1 för försäljning, 2 för support..."',
          'Köhantering med väntemusik och position i kö',
          'Routing baserat på tid, tillgänglighet, kompetens',
          'Ring-groups för avdelningar',
          'Delegation och sekreterarfunktioner'
        ],
        expectedQuestions: [
          'Kan vi ha olika växelmeddelanden beroende på tid?',
          'Hur hanterar vi samtal utanför kontorstid?',
          'Kan vi se statistik på samtal?'
        ],
        tips: [
          'Visa ett exempel på auto attendant-konfiguration',
          'Nämn att allt konfigureras i webben - inget hårdvaruprogrammering'
        ]
      },
      {
        id: '4',
        title: 'Hårdvara - Telefoner och headsets',
        description: 'Vilken hårdvara som fungerar och rekommenderas',
        talkingPoints: [
          'Inget krav på hårdvara - fungerar med dator och headset',
          'Certifierade Teams-telefoner från Poly, Yealink, Audiocodes',
          'Konferenstelefoner för mötesrum',
          'Trådlösa headsets med Teams-certifiering',
          'Plug-and-play installation via USB'
        ],
        expectedQuestions: [
          'Måste vi köpa nya telefoner?',
          'Vad kostar telefonerna?',
          'Kan vi använda våra gamla headsets?'
        ],
        tips: [
          'Visa en Teams-certifierad telefon om du har tillgång',
          'Betona att hårdvara är valfritt - många klarar sig bara med headset'
        ]
      },
      {
        id: '5',
        title: 'Mobilitet - Ring från vilken enhet som helst',
        description: 'Flexibilitet för moderna arbetssätt',
        talkingPoints: [
          'Teams-appen i mobilen - samma nummer som på kontoret',
          'Växla samtal mellan enheter medan pågående',
          'Fungerar på vilken dator som helst - hemarbete, hotell, etc',
          'Parkera samtal och plocka upp från annan enhet',
          'Geografisk flexibilitet - ring från utlandet'
        ],
        expectedQuestions: [
          'Kostar det extra att ringa från mobilen?',
          'Syns mitt privatnummer när jag ringer från mobilen?',
          'Fungerar det offline?'
        ],
        tips: [
          'Demonstrera ring från mobil-appen',
          'Nämn att det är WIFI-samtal - ingen mobilkostnad'
        ]
      },
      {
        id: '6',
        title: 'Integration och produktivitet',
        description: 'Hur Teams Phone integrerar med arbetflödet',
        talkingPoints: [
          'Ring direkt från Outlook-kontakter eller kalendern',
          'Samtalsinspelning och transkribering med Copilot',
          'Integration med CRM-system (Dynamics, Salesforce)',
          'Skärmdelning under telefonsamtal',
          'Uppgradera samtal till videomöte med ett klick'
        ],
        expectedQuestions: [
          'Kan vi spela in samtal?',
          'Fungerar det med vårt CRM?',
          'Hur söker man i samtalhistorik?'
        ],
        tips: [
          'Visa ett samtal som uppgraderas till video',
          'Nämn compliance och juridik för inspelning'
        ]
      },
      {
        id: '7',
        title: 'Priser och migration',
        description: 'Kostnad och implementering',
        talkingPoints: [
          'Teams Phone Standard: ~90 kr/user/månad',
          'Inkluderar obegränsade samtal inom Sverige',
          'Nummerportabilitet - behåll era nummer',
          'Enkel migration från befintlig växel',
          'Spara 30-50% jämfört med traditionell telefoni'
        ],
        expectedQuestions: [
          'Vad ingår i priset?',
          'Kostar utlandssamtal extra?',
          'Hur lång tid tar migrationen?'
        ],
        tips: [
          'Räkna på total kostnad inklusive hårdvara och support',
          'Jämför med deras nuvarande månadsabonnemang'
        ]
      },
      {
        id: '8',
        title: 'Implementation och support',
        description: 'Hur vi hjälper er komma igång',
        talkingPoints: [
          'Nummerportabilitet - vi fixar tekniken',
          'Konfiguration av växel och köer',
          'Utbildning för användare och administratörer',
          'Testperiod för att säkerställa kvalitet',
          'Löpande support via Microsoft och partner'
        ],
        expectedQuestions: [
          'Hur lång tid tar det att komma igång?',
          'Vad händer om något går fel?',
          'Vilken support ingår?'
        ],
        tips: [
          'Föreslå pilotavdelning först för att minimera risk',
          'Ha en tydlig projektplan redo att dela'
        ]
      }
    ],
    common_questions: [
      {
        question: 'Kan vi behålla våra befintliga telefonnummer?',
        answer: 'Ja, absolut! Vi hjälper er med nummerportering från er nuvarande operatör till Teams Phone. Det tar vanligtvis 2-4 veckor och ni behåller alla era befintliga nummer - både växelnummer och direktnummer.',
        category: 'Migration'
      },
      {
        question: 'Vad händer om internet går ner?',
        answer: 'Teams Phone kräver internetanslutning. Om kontorets internet går ner kan användare fortfarande ringa via Teams-appen i mobilen via 4G/5G. För kritiska användare kan vi sätta upp redundans med backup-internetlinje eller möjlighet till vidarekoppling till mobilnummer.',
        category: 'Tekniskt'
      },
      {
        question: 'Måste vi köpa nya telefoner?',
        answer: 'Nej, det är valfritt. Många användare är nöjda med att ringa via Teams på datorn med headset. Men om ni vill ha fysiska telefoner finns Teams-certifierade telefoner från 1500 kr/st (Yealink, Poly, Audiocodes). De är plug-and-play via USB.',
        category: 'Hårdvara'
      },
      {
        question: 'Hur blir ljudkvaliteten jämfört med traditionell telefoni?',
        answer: 'Teams Phone använder HD-ljud vilket ofta är BÄTTRE än traditionell telefoni. Förutsatt att ni har stabil internetanslutning (5 Mbps rekommenderat) får ni kristallklart ljud. Microsoft har datacenter i Sverige vilket ger låg latens och hög kvalitet.',
        category: 'Tekniskt'
      },
      {
        question: 'Kan vi spela in samtal?',
        answer: 'Ja, samtalsinspelning är möjligt och följer svenska regler (samtycke krävs). Inspelningar sparas i Teams/SharePoint och kan transkriberas med Copilot. Perfekt för kundtjänst, support eller utbildningssyfte.',
        category: 'Funktioner'
      },
      {
        question: 'Vad kostar det att ringa utomlands?',
        answer: 'Teams Phone Standard inkluderar obegränsade samtal inom Sverige. För utlandssamtal finns Calling Plan International (~200 kr/user/månad) med 120 minuter till 196 länder, eller pay-per-use. Många kunder sparar enormt på utlandssamtal jämfört med traditionella operatörer.',
        category: 'Pris'
      }
    ],
    objection_handling: [
      {
        objection: 'Vår nuvarande växellösning fungerar bra',
        response: 'Det är bra att ni har en fungerande lösning! Får jag fråga - hur hanterar den distansarbete? Kan era användare ringa från hemmet med samma nummer? (Vänta på svar) Och hur mycket betalar ni per månad totalt? Teams Phone handlar inte bara om att fungera, utan om att ge er flexibilitet för moderna arbetssätt OCH spara pengar. Skulle ni vara intresserade av att se en kostnadsjämförelse?'
      },
      {
        objection: 'Vi är oroliga för ljudkvaliteten',
        response: 'Det är en legitim oro! Gamla VoIP-lösningar hade ofta dålig kvalitet. Men Teams Phone använder Microsofts globala nätverk med datacenter i Sverige. Vi kan garantera HD-ljudkvalitet och uptime på 99.9%. Vill ni göra ett testsamtal nu så kan ni höra kvaliteten själva? Vi kan också köra en 30-dagars pilot så era användare testar i verkligheten.'
      },
      {
        objection: 'Det blir för dyrt att byta ut alla våra telefoner',
        response: 'Jag förstår helt - hårdvara kan bli en stor kostnad. Men här är det bra: ni behöver faktiskt inte köpa nya telefoner. De flesta användare är nöjda med Teams på datorn + ett headset. För de som verkligen vill ha bordstelefon kan vi börja med 10-20 st för reception och ledning. Sedan kan ni rulla ut till fler över tid. Plus - vi sparar ofta mer på månadskostnaden än vad hårdvaran kostar första året.'
      },
      {
        objection: 'Implementeringen låter komplicerad',
        response: 'Det kan kännas överväldigande, men vi har gjort det här hundratals gånger. En typisk implementation för 50-200 användare tar 4-6 veckor från beslut till go-live. Vi hanterar nummerportering, konfigurerar växel och köer, utbildar era användare. Ni behöver mest bestämma vilka nummer som ska gå vart. Skulle ni vilja se vår projektplan så ser ni exakt vad som händer när?'
      }
    ],
    success_criteria: [
      'Kunden förstår kostnadsbesparing vs nuvarande lösning',
      'Flexibiliteten för distans/hemarbete är tydlig',
      'Tekniska frågor om kvalitet och backup är adresserade',
      'Migration och nummerportabilitet är förklarad',
      'Nästa steg är bokat - demo, pilot eller offert'
    ],
    next_steps: [
      'Skicka kostnadsjämförelse baserad på nuvarande telefoniabonnemang',
      'Dela teknisk dokumentation om ljudkvalitet och SLA',
      'Föreslå 30-dagars pilot med 10-20 användare',
      'Boka tekniskt möte för att gå igenom nummerportabilitet',
      'Skicka kundcase från liknande företag som migrerat',
      'Uppföljningsmöte efter 2 veckor för beslut'
    ],
    is_active: true
  }
];

async function seedDemoScripts() {
  try {
    console.log('🌱 Laddar demo-scripts till databasen...\n');
    console.log(`User:    ${CURRENT_USER_ID} (ola@lowing.eu)`);
    console.log(`Product: ${M365_PRODUCT_ID} (M365)`);
    console.log(`Antal scripts: ${demoScripts.length}\n`);

    for (const script of demoScripts) {
      console.log(`📝 Skapar: "${script.name}"...`);

      const { data, error } = await supabase
        .from('demo_scripts')
        .insert(script)
        .select()
        .single();

      if (error) {
        console.error(`   ❌ Fel: ${error.message}`);
        throw error;
      }

      console.log(`   ✅ Skapat med ID: ${data.id}`);
    }

    console.log('\n🎉 KLART!');
    console.log(`${demoScripts.length} demo-scripts har laddats in i databasen.`);
    console.log('\n💡 Nästa steg:');
    console.log('1. Gå till Demo Admin i appen');
    console.log('2. Välj M365 som produkt');
    console.log('3. Du bör nu se alla demo-scripts!');

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

seedDemoScripts();
