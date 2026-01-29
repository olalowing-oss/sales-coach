import { Offer, Battlecard, ObjectionHandler, CaseStudy, TriggerPattern } from '../types';

// === TRIGGER-MÖNSTER ===
// Utökad version med detaljerade triggers för hela Microsoft-stacken
export const TRIGGER_PATTERNS: Record<string, TriggerPattern> = {

  // ============================================
  // 🚨 INVÄNDNINGAR (OBJECTIONS) - High Priority
  // ============================================

  // Prisinvändningar
  price: {
    keywords: [
      'dyrt', 'för dyrt', 'billigare', 'budget', 'kostnad', 'pris', 'investering',
      'har inte råd', 'kostar för mycket', 'för dyr licens', 'licenspris',
      'spara pengar', 'kostnadseffektivt', 'billigare alternativ', 'gratisalternativ',
      'open source', 'freeware', 'inte värt pengarna', 'ROI', 'payback'
    ],
    response: 'objection',
    category: 'price'
  },

  // Tidsinvändningar
  timing: {
    keywords: [
      'senare', 'inte nu', 'nästa år', 'Q1', 'Q2', 'Q3', 'Q4',
      'inte prioriterat', 'vänta', 'ring tillbaka', 'har inte tid',
      'efter sommaren', 'efter jul', 'nästa budgetår', 'framtiden',
      'kanske senare', 'om ett halvår', 'om ett år', 'avvaktar',
      'måste tänka på det', 'behöver fundera', 'tar det sen'
    ],
    response: 'objection',
    category: 'timing'
  },

  // Konkurrensinvändningar
  competition: {
    keywords: [
      'annan leverantör', 'redan avtal', 'ramavtal', 'upphandling', 'andra konsulter',
      'annat bolag', 'vår partner', 'befintlig leverantör', 'nuvarande avtal',
      'byter inte', 'nöjda med', 'LOU', 'offentlig upphandling', 'avropsavtal'
    ],
    response: 'objection',
    category: 'competition'
  },

  // Behövs inte
  need: {
    keywords: [
      'behöver inte', 'fungerar bra', 'har redan', 'klarar oss', 'inte aktuellt',
      'ingen nytta', 'ser inget behov', 'nöjda som det är', 'varför byta',
      'löser inget problem', 'hype', 'buzzword', 'mode'
    ],
    response: 'objection',
    category: 'need'
  },

  // Trust / Skepticism
  trust: {
    keywords: [
      'litar inte på', 'osäkra på', 'moget nog', 'fungerar det verkligen',
      'hört dåligt om', 'dåliga erfarenheter', 'bränt oss', 'misslyckade projekt',
      'referens', 'bevis', 'bevisa'
    ],
    response: 'objection',
    category: 'trust'
  },

  // ============================================
  // ⚔️ BATTLECARDS (KONKURRENTER) - High Priority
  // ============================================

  atea: {
    keywords: ['Atea', 'atea', 'ATEA'],
    response: 'battlecard'
  },
  tieto: {
    keywords: ['Tieto', 'TietoEVRY', 'tieto', 'tietoevry', 'EVRY'],
    response: 'battlecard'
  },
  cgi: {
    keywords: ['CGI', 'cgi', 'Logica'],
    response: 'battlecard'
  },
  knowit: {
    keywords: ['Knowit', 'knowit', 'Know IT'],
    response: 'battlecard'
  },
  accenture: {
    keywords: ['Accenture', 'accenture'],
    response: 'battlecard'
  },
  capgemini: {
    keywords: ['Capgemini', 'capgemini', 'Cap Gemini'],
    response: 'battlecard'
  },
  softronic: {
    keywords: ['Softronic', 'softronic'],
    response: 'battlecard'
  },
  addq: {
    keywords: ['AddQ', 'addq', 'Add Q'],
    response: 'battlecard'
  },
  inhouse: {
    keywords: [
      'inhouse', 'in-house', 'egen IT', 'vår IT-avdelning', 'egna resurser',
      'internt', 'själva', 'vår personal', 'anställa', 'rekrytera'
    ],
    response: 'battlecard'
  },

  // Alternativa plattformar
  google_workspace: {
    keywords: ['Google Workspace', 'Google Drive', 'Google Docs', 'Google Meet', 'Gmail företag'],
    response: 'battlecard'
  },
  slack: {
    keywords: ['Slack', 'slack'],
    response: 'battlecard'
  },
  zoom: {
    keywords: ['Zoom', 'zoom', 'Zoom Meetings'],
    response: 'battlecard'
  },
  aws: {
    keywords: ['AWS', 'Amazon Web Services', 'amazon cloud'],
    response: 'battlecard'
  },

  // ============================================
  // 💼 M365 ERBJUDANDEN - Medium Priority
  // ============================================

  // Teams & Collaboration
  teams: {
    keywords: [
      'Teams', 'Microsoft Teams', 'videosamtal', 'videomöte', 'collaboration',
      'teamsmöte', 'teams-möte', 'teamschat', 'teams-chat',
      'Teams Phone', 'telefoni i Teams', 'Teams Rooms', 'mötesrum'
    ],
    response: 'offer'
  },

  // SharePoint & Content
  sharepoint: {
    keywords: [
      'SharePoint', 'sharepoint', 'SP Online', 'SPO',
      'intranät', 'intranet', 'medarbetarportal', 'företagsportal',
      'dokumenthantering', 'fildelning', 'versionshantering',
      'samarbetsyta', 'teamsite', 'kommunikationssajt'
    ],
    response: 'offer'
  },

  // OneDrive
  onedrive: {
    keywords: [
      'OneDrive', 'onedrive', 'One Drive',
      'molnlagring', 'filsynk', 'personlig lagring'
    ],
    response: 'offer'
  },

  // Outlook & Exchange
  exchange: {
    keywords: [
      'Exchange', 'exchange', 'Exchange Online', 'EXO',
      'Outlook', 'mail', 'e-post', 'mailserver',
      'kalender', 'delad kalender', 'mötesbokning', 'rumsbokningssystem',
      'mailmigrering', 'mailflyttning'
    ],
    response: 'offer'
  },

  // Viva Suite
  viva: {
    keywords: [
      'Viva', 'Microsoft Viva', 'Viva Engage', 'Viva Learning',
      'Viva Insights', 'Viva Goals', 'Viva Connections', 'Viva Topics',
      'medarbetarengagemang', 'employee experience', 'EX', 'Yammer'
    ],
    response: 'offer'
  },

  // Planner & Project
  planner: {
    keywords: [
      'Planner', 'Microsoft Planner', 'Project', 'Microsoft Project',
      'projekthantering', 'uppgiftshantering', 'tasks', 'To Do',
      'projektplanering', 'Gantt', 'resursplanering'
    ],
    response: 'offer'
  },

  // Loop
  loop: {
    keywords: [
      'Loop', 'Microsoft Loop', 'loop component', 'loop-komponent',
      'samarbetsdokument', 'realtidssamarbete'
    ],
    response: 'offer'
  },

  // ============================================
  // 🤖 COPILOT & AI - High/Medium Priority
  // ============================================

  // Copilot för M365
  copilot: {
    keywords: [
      'Copilot', 'copilot', 'Co-pilot', 'Microsoft Copilot',
      'M365 Copilot', 'Copilot för Microsoft 365',
      'AI-assistent', 'AI assistent', 'Microsoft AI'
    ],
    response: 'offer'
  },

  // Copilot specifika funktioner
  copilot_word: {
    keywords: [
      'Copilot i Word', 'skriva dokument med AI', 'AI-skrivande',
      'generera dokument', 'automatisk text'
    ],
    response: 'offer'
  },
  copilot_excel: {
    keywords: [
      'Copilot i Excel', 'AI i Excel', 'automatisk analys',
      'dataanalys med AI', 'formelhjälp'
    ],
    response: 'offer'
  },
  copilot_powerpoint: {
    keywords: [
      'Copilot i PowerPoint', 'skapa presentation med AI',
      'AI-presentationer', 'automatisk presentation'
    ],
    response: 'offer'
  },
  copilot_outlook: {
    keywords: [
      'Copilot i Outlook', 'AI-mail', 'mailsammanfattning',
      'automatiska mailsvar'
    ],
    response: 'offer'
  },
  copilot_teams: {
    keywords: [
      'Copilot i Teams', 'mötessammanfattning', 'AI i möten',
      'transkribering', 'Intelligent Recap', 'mötesanteckningar'
    ],
    response: 'offer'
  },

  // Generativ AI & ChatGPT-relaterat
  generative_ai: {
    keywords: [
      'generativ AI', 'GenAI', 'generative AI', 'gen AI',
      'ChatGPT', 'chatgpt', 'GPT', 'GPT-4', 'OpenAI',
      'språkmodell', 'LLM', 'large language model',
      'AI-strategi', 'AI strategi'
    ],
    response: 'offer'
  },

  // Copilot Studio (tidigare Power Virtual Agents)
  copilot_studio: {
    keywords: [
      'Copilot Studio', 'bygga egen copilot', 'anpassad AI',
      'chattbot', 'chatbot', 'virtuell agent', 'AI-bot',
      'Power Virtual Agents', 'PVA', 'konversations-AI'
    ],
    response: 'offer'
  },

  // AI Builder
  ai_builder: {
    keywords: [
      'AI Builder', 'AI-modell', 'dokumentbehandling med AI',
      'formulärbearbetning', 'objektdetektering', 'textklassificering'
    ],
    response: 'offer'
  },

  // ============================================
  // ⚡ POWER PLATFORM - Medium Priority  
  // ============================================

  // Power Platform generellt
  powerplatform: {
    keywords: [
      'Power Platform', 'power platform', 'Power-plattformen',
      'low-code', 'no-code', 'citizen developer', 'medborgarutvecklare'
    ],
    response: 'offer'
  },

  // Power Apps
  powerapps: {
    keywords: [
      'Power Apps', 'PowerApps', 'power apps',
      'canvas app', 'model-driven app', 'mobilapp',
      'egen app', 'skapa app', 'bygga app', 'applikationsutveckling',
      'affärsapplikation', 'internverktyg'
    ],
    response: 'offer'
  },

  // Power Automate
  powerautomate: {
    keywords: [
      'Power Automate', 'PowerAutomate', 'power automate',
      'Flow', 'Microsoft Flow', 'arbetsflöde', 'workflow',
      'automatisering', 'automatisera', 'RPA', 'robotisering',
      'desktop flow', 'molnflöde', 'cloud flow',
      'processautomation', 'automation'
    ],
    response: 'offer'
  },

  // Power BI
  powerbi: {
    keywords: [
      'Power BI', 'PowerBI', 'power bi', 'PBI',
      'rapportering', 'dashboard', 'instrumentpanel',
      'datavisualisering', 'BI', 'business intelligence',
      'analys', 'KPI', 'nyckeltal', 'datadrivet'
    ],
    response: 'offer'
  },

  // Power Pages
  powerpages: {
    keywords: [
      'Power Pages', 'PowerPages', 'power pages',
      'extern portal', 'kundportal', 'självbetjäning',
      'webbportal', 'hemsida', 'partner portal'
    ],
    response: 'offer'
  },

  // Dataverse
  dataverse: {
    keywords: [
      'Dataverse', 'dataverse', 'Common Data Service', 'CDS',
      'datamodell', 'affärsdata', 'dataplattform'
    ],
    response: 'offer'
  },

  // ============================================
  // ☁️ AZURE - Medium Priority
  // ============================================

  // Azure generellt
  azure: {
    keywords: [
      'Azure', 'azure', 'Microsoft Azure', 'molnet', 'cloud', 'moln',
      'molntjänster', 'cloudtjänster', 'IaaS', 'PaaS', 'SaaS'
    ],
    response: 'offer'
  },

  // Migration
  azure_migration: {
    keywords: [
      'migration', 'migrering', 'molnflytt', 'cloud migration',
      'flytta till Azure', 'lift and shift', 'modernisering',
      'datacenter', 'on-prem', 'on-premise', 'hybrid'
    ],
    response: 'offer'
  },

  // Azure Infrastructure
  azure_infra: {
    keywords: [
      'Azure VM', 'virtuella maskiner', 'Virtual Machines',
      'Azure Storage', 'lagring', 'blob storage',
      'Azure Networking', 'virtuellt nätverk', 'VNet',
      'load balancer', 'ExpressRoute', 'VPN'
    ],
    response: 'offer'
  },

  // Azure App Services
  azure_apps: {
    keywords: [
      'App Service', 'Web App', 'Azure Functions', 'serverless',
      'Logic Apps', 'Container Apps', 'Kubernetes', 'AKS',
      'Docker', 'container', 'microservices', 'mikrotjänster'
    ],
    response: 'offer'
  },

  // Azure Data
  azure_data: {
    keywords: [
      'Azure SQL', 'SQL Database', 'Cosmos DB', 'CosmosDB',
      'Synapse', 'Azure Synapse', 'Data Factory', 'Databricks',
      'datalager', 'data warehouse', 'data lake', 'datasjö',
      'ETL', 'dataintegration'
    ],
    response: 'offer'
  },

  // Azure AI/ML
  azure_ai: {
    keywords: [
      'Azure AI', 'Azure Machine Learning', 'Azure ML',
      'Cognitive Services', 'Azure OpenAI', 'Azure OpenAI Service',
      'AI-tjänster', 'maskininlärning', 'ML'
    ],
    response: 'offer'
  },

  // Azure DevOps
  azure_devops: {
    keywords: [
      'Azure DevOps', 'DevOps', 'ADO', 'Azure Boards',
      'Azure Repos', 'Azure Pipelines', 'CI/CD',
      'GitHub Actions', 'automatisk deploy', 'deployment'
    ],
    response: 'offer'
  },

  // ============================================
  // 🔒 SECURITY & COMPLIANCE - High/Medium Priority
  // ============================================

  // Security generellt
  security: {
    keywords: [
      'säkerhet', 'security', 'cybersäkerhet', 'cybersecurity',
      'IT-säkerhet', 'informationssäkerhet'
    ],
    response: 'offer'
  },

  // Microsoft Defender
  defender: {
    keywords: [
      'Defender', 'Microsoft Defender', 'Defender for Endpoint',
      'Defender for Office', 'Defender for Identity', 'Defender for Cloud',
      'XDR', 'EDR', 'antivirus', 'malware', 'hotskydd'
    ],
    response: 'offer'
  },

  // Microsoft Sentinel
  sentinel: {
    keywords: [
      'Sentinel', 'Microsoft Sentinel', 'SIEM', 'SOAR',
      'säkerhetsövervakning', 'hotdetektering', 'incident response',
      'SOC', 'Security Operations'
    ],
    response: 'offer'
  },

  // Security Copilot
  security_copilot: {
    keywords: [
      'Security Copilot', 'Copilot for Security',
      'säkerhets-AI', 'AI-säkerhet', 'hotanalys med AI'
    ],
    response: 'offer'
  },

  // Entra (Azure AD)
  entra: {
    keywords: [
      'Entra', 'Entra ID', 'Microsoft Entra', 'Azure AD', 'Azure Active Directory',
      'identitet', 'identitetshantering', 'IAM', 'Identity',
      'SSO', 'single sign-on', 'MFA', 'multifaktor',
      'tvåfaktorsautentisering', 'lösenordsfri', 'passwordless',
      'Conditional Access', 'villkorsstyrd åtkomst'
    ],
    response: 'offer'
  },

  // Intune / Endpoint Manager
  intune: {
    keywords: [
      'Intune', 'Microsoft Intune', 'Endpoint Manager', 'MEM',
      'MDM', 'MAM', 'enhetshantering', 'mobile device management',
      'BYOD', 'Autopilot', 'Windows Autopilot', 'deployment'
    ],
    response: 'offer'
  },

  // Purview (Compliance)
  purview: {
    keywords: [
      'Purview', 'Microsoft Purview', 'Compliance',
      'dataklassificering', 'sensitivity labels', 'känslighetsetiketter',
      'DLP', 'Data Loss Prevention', 'dataläckage',
      'Information Protection', 'AIP', 'eDiscovery',
      'retention', 'arkivering', 'GDPR', 'dataskydd'
    ],
    response: 'offer'
  },

  // Phishing & threats
  phishing: {
    keywords: [
      'phishing', 'nätfiske', 'ransomware', 'utpressningsvirus',
      'spam', 'skräppost', 'virus', 'hackare', 'hackat',
      'intrång', 'dataintrång', 'läcka', 'dataläcka'
    ],
    response: 'offer'
  },

  // Zero Trust
  zerotrust: {
    keywords: [
      'Zero Trust', 'zero trust', 'nolltillit',
      'segmentering', 'microsegmentation', 'least privilege'
    ],
    response: 'offer'
  },

  // ============================================
  // 🔧 PROBLEMSIGNALER (SOLUTIONS) - Medium Priority
  // ============================================

  chaos: {
    keywords: [
      'rörigt', 'kaotiskt', 'stökigt', 'ostrukturerat', 'svårt att hitta',
      'hittar inte', 'letar', 'söker hela tiden', 'oordning',
      'version', 'vilken version', 'dubbletter', 'kopior överallt'
    ],
    response: 'solution'
  },

  frustration: {
    keywords: [
      'frustrerade', 'problem med', 'fungerar inte', 'missnöjda',
      'tar för lång tid', 'långsamt', 'krångligt', 'irriterande',
      'trött på', 'hatar', 'slösar tid'
    ],
    response: 'solution'
  },

  productivity: {
    keywords: [
      'produktivitet', 'effektivitet', 'effektivisera',
      'spara tid', 'tidsbrist', 'administrativa uppgifter',
      'manuellt arbete', 'repetitiva uppgifter'
    ],
    response: 'solution'
  },

  collaboration_issues: {
    keywords: [
      'samarbete', 'samarbeta', 'kommunikation',
      'silos', 'isolerat', 'jobbar i silos',
      'vet inte vad andra gör', 'transparens'
    ],
    response: 'solution'
  },

  remote_work: {
    keywords: [
      'distansarbete', 'hemarbete', 'hybrid', 'hybridarbete',
      'jobba hemifrån', 'remote', 'distribuerade team'
    ],
    response: 'solution'
  },

  // ============================================
  // 🎯 INTRESSESIGNALER (EXPAND) - High Priority
  // ============================================

  interest: {
    keywords: [
      'låter intressant', 'berätta mer', 'hur fungerar', 'kan ni hjälpa',
      'vad kostar det', 'vill veta mer', 'intresserad', 'nyfiken',
      'skulle vilja se', 'demo', 'visa mig', 'presentation',
      'proof of concept', 'POC', 'pilot', 'test',
      'när kan ni börja', 'hur snabbt', 'nästa steg'
    ],
    response: 'expand'
  },

  buying_signals: {
    keywords: [
      'beslut', 'besluta', 'budget godkänd', 'fått budget',
      'ledningen vill', 'styrelsen har sagt', 'måste lösa',
      'behöver hjälp', 'söker partner', 'letar efter leverantör',
      'upphandlar', 'offert', 'prisförslag', 'anbud'
    ],
    response: 'expand'
  },

  urgency: {
    keywords: [
      'bråttom', 'snabbt', 'akut', 'genast', 'omgående',
      'deadline', 'måste vara klart', 'tidspress'
    ],
    response: 'expand'
  }
};

// === B3:S ERBJUDANDEN ===
export const OFFERS: Offer[] = [
  // ============================================
  // 🤖 COPILOT & AI
  // ============================================
  {
    id: 'copilot-readiness',
    name: 'Copilot Readiness Assessment',
    shortDescription: 'Kartläggning av er organisations mognad för Microsoft Copilot',
    fullDescription: 'Vi utvärderar er nuvarande M365-miljö, datastruktur och användarvanor för att identifiera hur ni kan maximera nyttan av Copilot. Inkluderar teknisk granskning, användarintervjuer och en konkret handlingsplan.',
    deliverables: [
      'Teknisk bedömning av M365-miljön',
      'Dataklassificeringsöversikt',
      'Användarmognadsanalys',
      'Prioriterad roadmap för Copilot-implementation',
      'ROI-kalkyl för Copilot-investering'
    ],
    duration: '2-3 dagar',
    priceRange: { min: 35000, max: 55000, unit: 'fixed' },
    targetAudience: ['IT-chefer', 'CDO', 'Verksamhetsutvecklare'],
    relatedCases: ['stena-copilot', 'telenor-ai']
  },
  {
    id: 'copilot-rollout',
    name: 'Copilot Rollout & Adoption',
    shortDescription: 'Full implementation av Microsoft 365 Copilot',
    fullDescription: 'Komplett utrullning av Copilot inklusive licenshantering, teknisk konfiguration, användarutbildning och change management. Vi säkerställer att ni får maximal nytta från dag ett.',
    deliverables: [
      'Licensplanering och aktivering',
      'Teknisk konfiguration och policyer',
      'Pilotgrupp med 20-50 användare',
      'Utbildningspaket (workshops + e-learning)',
      'Adoption-mätning och KPI:er',
      '30 dagars support efter go-live'
    ],
    duration: '4-8 veckor',
    priceRange: { min: 80000, max: 200000, unit: 'fixed' },
    targetAudience: ['IT-chefer', 'HR', 'Change Managers'],
    relatedCases: ['stena-copilot']
  },
  {
    id: 'copilot-studio',
    name: 'Copilot Studio Workshop',
    shortDescription: 'Bygg egna AI-assistenter med Copilot Studio',
    fullDescription: 'Lär er bygga anpassade copilots för era specifika verksamhetsbehov. Vi identifierar användningsfall, bygger en pilot och utbildar ert team att vidareutveckla lösningen.',
    deliverables: [
      'Identifiering av 3-5 användningsfall',
      'Fungerande pilot-copilot',
      'Integration med era datakällor',
      'Utbildning för 5-10 utvecklare',
      'Best practices-dokumentation'
    ],
    duration: '2-3 veckor',
    priceRange: { min: 60000, max: 120000, unit: 'fixed' },
    targetAudience: ['Verksamhetsutvecklare', 'IT', 'Kundservice'],
    relatedCases: []
  },
  {
    id: 'ai-strategy',
    name: 'AI-strategi för verksamheten',
    shortDescription: 'Utveckla en hållbar AI-strategi för hela organisationen',
    fullDescription: 'Vi hjälper er ta fram en övergripande AI-strategi som täcker teknikval, governance, kompetens och etik. Strategin förankras med ledningen och resulterar i en konkret handlingsplan.',
    deliverables: [
      'Nulägesanalys av AI-mognad',
      'Omvärldsbevakning och trendanalys',
      'AI-vision och målbild',
      'Governance-ramverk för AI',
      'Prioriterad roadmap med business cases',
      'Ledningspresentation'
    ],
    duration: '3-4 veckor',
    priceRange: { min: 100000, max: 200000, unit: 'fixed' },
    targetAudience: ['VD', 'CDO', 'CTO', 'Ledningsgrupp'],
    relatedCases: []
  },

  // ============================================
  // 💼 M365 & MODERN WORKPLACE
  // ============================================
  {
    id: 'modern-workplace',
    name: 'Modern Workplace Workshop',
    shortDescription: 'Strukturera er M365-miljö för effektivt samarbete',
    fullDescription: 'En workshop där vi tillsammans kartlägger era samarbetsbehov och designar en strukturerad Teams- och SharePoint-miljö. Fokus på governance, användaradoption och långsiktig förvaltning.',
    deliverables: [
      'Nulägesanalys av samarbetsmönster',
      'Teams-struktur och namnkonventioner',
      'SharePoint-informationsarkitektur',
      'Governance-ramverk',
      'Utbildningsplan för användare'
    ],
    duration: '2 dagar workshop + 2 dagar implementation',
    priceRange: { min: 45000, max: 75000, unit: 'fixed' },
    targetAudience: ['IT-ansvariga', 'HR', 'Kommunikationschefer'],
    relatedCases: ['ziklo-teams']
  },
  {
    id: 'teams-governance',
    name: 'Teams Governance & Lifecycle',
    shortDescription: 'Få kontroll över er Teams-miljö',
    fullDescription: 'Vi implementerar automatiserad governance för Teams med livscykelhantering, namnkonventioner, arkivering och gästpolicyer. Resultatet är en välordnad miljö som sköter sig själv.',
    deliverables: [
      'Teams-skapandepolicyer',
      'Automatisk livscykelhantering',
      'Gäståtkomst-policyer',
      'Namnkonventioner med enforcing',
      'Arkiverings- och raderingsautomation',
      'Admin-dashboard för övervakning'
    ],
    duration: '2-4 veckor',
    priceRange: { min: 50000, max: 100000, unit: 'fixed' },
    targetAudience: ['IT-administratörer', 'IT-chefer'],
    relatedCases: ['ziklo-teams']
  },
  {
    id: 'sharepoint-intranet',
    name: 'SharePoint Intranät',
    shortDescription: 'Modernt intranät baserat på SharePoint Online',
    fullDescription: 'Vi designar och bygger ett modernt, användarvänligt intranät i SharePoint Online. Fokus på medarbetarkommunikation, nyheter, sökning och integration med övriga M365-tjänster.',
    deliverables: [
      'UX-design och wireframes',
      'Startsida med nyhetsflöde',
      'Avdelnings- och projektsidor',
      'Sökoptimering',
      'Mobilvänlig design',
      'Administratörsutbildning'
    ],
    duration: '4-8 veckor',
    priceRange: { min: 80000, max: 200000, unit: 'fixed' },
    targetAudience: ['Kommunikation', 'HR', 'IT'],
    relatedCases: []
  },
  {
    id: 'viva-suite',
    name: 'Microsoft Viva Implementation',
    shortDescription: 'Employee Experience med Viva-sviten',
    fullDescription: 'Vi implementerar relevanta Viva-moduler för att förbättra medarbetarupplevelsen - från Viva Connections för kommunikation till Viva Insights för välmående och produktivitet.',
    deliverables: [
      'Behovsanalys och modulval',
      'Viva Connections-konfiguration',
      'Viva Insights-uppsättning',
      'Integration med befintliga system',
      'Utbildning för HR och ledare'
    ],
    duration: '3-6 veckor',
    priceRange: { min: 60000, max: 150000, unit: 'fixed' },
    targetAudience: ['HR', 'Kommunikation', 'Ledning'],
    relatedCases: []
  },
  {
    id: 'm365-assessment',
    name: 'M365 Health Check',
    shortDescription: 'Genomlysning av er Microsoft 365-miljö',
    fullDescription: 'Vi gör en djupgående teknisk och funktionell genomlysning av er M365-miljö. Resultatet är en prioriterad lista med förbättringsområden och quick wins.',
    deliverables: [
      'Säkerhetsgranskning (Secure Score)',
      'Licensoptimering',
      'Funktionsutnyttjande-analys',
      'Governance-bedömning',
      'Prioriterad förbättringslista',
      'Executive summary för ledning'
    ],
    duration: '3-5 dagar',
    priceRange: { min: 35000, max: 60000, unit: 'fixed' },
    targetAudience: ['IT-chefer', 'CTO'],
    relatedCases: []
  },

  // ============================================
  // ⚡ POWER PLATFORM
  // ============================================
  {
    id: 'power-platform',
    name: 'Power Platform Kickstart',
    shortDescription: 'Kom igång med low-code och automatisera processer',
    fullDescription: 'Vi identifierar lämpliga användningsområden, bygger pilotappar/flöden och utbildar era medarbetare att själva utveckla lösningar.',
    deliverables: [
      'Processanalys och möjlighetskartläggning',
      '2-3 pilotappar eller automatiseringar',
      'Center of Excellence-ramverk',
      'Citizen developer-utbildning',
      'Governance och säkerhetsmodell'
    ],
    duration: '4-6 veckor',
    priceRange: { min: 75000, max: 150000, unit: 'fixed' },
    targetAudience: ['Verksamhetsutvecklare', 'IT', 'Processägare'],
    relatedCases: ['telenor-automation']
  },
  {
    id: 'power-apps-development',
    name: 'Power Apps Applikationsutveckling',
    shortDescription: 'Skräddarsydda affärsappar med Power Apps',
    fullDescription: 'Vi bygger anpassade affärsapplikationer i Power Apps baserat på era specifika behov. Canvas apps för mobilanvändning eller model-driven apps för komplexa datamodeller.',
    deliverables: [
      'Kravspecifikation',
      'UX/UI-design',
      'Fungerande applikation',
      'Dataverse-datamodell (vid behov)',
      'Integration med befintliga system',
      'Dokumentation och utbildning'
    ],
    duration: '4-12 veckor beroende på komplexitet',
    priceRange: { min: 80000, max: 300000, unit: 'fixed' },
    targetAudience: ['Verksamhetsutvecklare', 'IT', 'Avdelningschefer'],
    relatedCases: []
  },
  {
    id: 'power-automate-rpa',
    name: 'Processautomation med Power Automate',
    shortDescription: 'Automatisera manuella processer och arbetsflöden',
    fullDescription: 'Vi identifierar och automatiserar tidskrävande manuella processer med Power Automate. Från enkla molnflöden till avancerad RPA med desktop flows.',
    deliverables: [
      'Processanalys och prioritering',
      '5-10 automatiserade flöden',
      'RPA-botar för legacy-system (vid behov)',
      'Felhantering och övervakning',
      'Utbildning för processägare'
    ],
    duration: '4-8 veckor',
    priceRange: { min: 60000, max: 180000, unit: 'fixed' },
    targetAudience: ['Processägare', 'IT', 'Ekonomi'],
    relatedCases: ['telenor-automation']
  },
  {
    id: 'power-bi-implementation',
    name: 'Power BI Implementation',
    shortDescription: 'Datadriven verksamhet med Power BI',
    fullDescription: 'Vi implementerar Power BI från grunden eller optimerar er befintliga miljö. Fokus på självbetjänings-BI, datamodellering och effektiva dashboards för beslutsfattare.',
    deliverables: [
      'Datamodell och datakällor',
      '3-5 dashboards/rapporter',
      'Row-level security',
      'Utbildning för rapportskapare',
      'Governance-ramverk',
      'Premium-kapacitet (vid behov)'
    ],
    duration: '4-8 veckor',
    priceRange: { min: 70000, max: 200000, unit: 'fixed' },
    targetAudience: ['Ekonomi', 'Ledning', 'IT', 'Controllers'],
    relatedCases: []
  },
  {
    id: 'power-platform-coe',
    name: 'Power Platform Center of Excellence',
    shortDescription: 'Bygg en hållbar Power Platform-organisation',
    fullDescription: 'Vi hjälper er etablera ett Center of Excellence för Power Platform med governance, utbildning, support och mätning. Säkerställer långsiktig framgång med citizen development.',
    deliverables: [
      'CoE Starter Kit-implementation',
      'Governance-policyer och DLP',
      'Miljöstrategi (dev/test/prod)',
      'Champion-program',
      'KPI:er och mätning',
      'Support-processer'
    ],
    duration: '6-10 veckor',
    priceRange: { min: 100000, max: 250000, unit: 'fixed' },
    targetAudience: ['IT-chefer', 'CDO', 'Verksamhetsutveckling'],
    relatedCases: ['telenor-automation']
  },

  // ============================================
  // ☁️ AZURE
  // ============================================
  {
    id: 'azure-migration',
    name: 'Azure Migration Assessment',
    shortDescription: 'Planera er flytt till Azure med en gedigen analys',
    fullDescription: 'Vi inventerar era befintliga system och applikationer, bedömer molnmognad och tar fram en detaljerad migrationsplan med kostnadsberäkning.',
    deliverables: [
      'Applikationsinventering',
      'Molnmognadsbedömning per system',
      'Migrationsplan med tidplan',
      'TCO-analys: on-prem vs Azure',
      'Säkerhetsrekommendationer'
    ],
    duration: '3-5 dagar beroende på miljöstorlek',
    priceRange: { min: 50000, max: 120000, unit: 'fixed' },
    targetAudience: ['IT-chefer', 'CTO', 'Infrastrukturansvariga'],
    relatedCases: ['stena-azure']
  },
  {
    id: 'azure-landing-zone',
    name: 'Azure Landing Zone',
    shortDescription: 'Etablera en säker och skalbar Azure-grund',
    fullDescription: 'Vi designar och implementerar er Azure Landing Zone enligt Microsofts Cloud Adoption Framework. En stabil grund för alla framtida Azure-resurser.',
    deliverables: [
      'Management Group-struktur',
      'Subscription-design',
      'Nätverksarkitektur (hub-spoke)',
      'Identity och access management',
      'Policy och governance',
      'Kostnadshantering (Cost Management)'
    ],
    duration: '4-8 veckor',
    priceRange: { min: 100000, max: 250000, unit: 'fixed' },
    targetAudience: ['IT-chefer', 'Molnarkitekter', 'Infrastruktur'],
    relatedCases: []
  },
  {
    id: 'azure-optimization',
    name: 'Azure Cost Optimization',
    shortDescription: 'Minska era Azure-kostnader utan att kompromissa',
    fullDescription: 'Vi analyserar er Azure-miljö och identifierar kostnadsbesparingar. Genomsnittlig besparing: 20-40% genom right-sizing, reservationer och arkitekturförbättringar.',
    deliverables: [
      'Kostnadsanalys per resursgrupp',
      'Right-sizing-rekommendationer',
      'Reservations- och Savings Plans-plan',
      'Taggningsstrategi',
      'FinOps-processer',
      'Kvartalsvis uppföljning (tillval)'
    ],
    duration: '2-4 veckor',
    priceRange: { min: 40000, max: 80000, unit: 'fixed' },
    targetAudience: ['IT-chefer', 'Ekonomi', 'FinOps'],
    relatedCases: []
  },
  {
    id: 'azure-devops',
    name: 'Azure DevOps Implementation',
    shortDescription: 'Modern CI/CD och utvecklingsplattform',
    fullDescription: 'Vi implementerar Azure DevOps för effektiv mjukvaruutveckling. Från planering och kodhantering till automatiserade pipelines och deployment.',
    deliverables: [
      'Azure DevOps-organisation och projekt',
      'Git-repositories med branching-strategi',
      'CI/CD-pipelines',
      'Testautomation-integration',
      'Artefakthantering',
      'Utbildning för utvecklare'
    ],
    duration: '3-6 veckor',
    priceRange: { min: 60000, max: 150000, unit: 'fixed' },
    targetAudience: ['Utvecklingschefer', 'DevOps-team', 'IT'],
    relatedCases: []
  },
  {
    id: 'azure-data-platform',
    name: 'Azure Data Platform',
    shortDescription: 'Modern dataplattform i Azure',
    fullDescription: 'Vi designar och bygger en modern dataplattform med Azure Synapse, Data Factory och Power BI. Samla, transformera och analysera data från alla era källor.',
    deliverables: [
      'Dataarkitektur-design',
      'Data Lake-implementation',
      'ETL/ELT-pipelines',
      'Data warehouse (Synapse)',
      'Power BI-rapporter',
      'Data governance'
    ],
    duration: '8-16 veckor',
    priceRange: { min: 150000, max: 500000, unit: 'fixed' },
    targetAudience: ['CDO', 'Data-team', 'IT', 'Ekonomi'],
    relatedCases: []
  },

  // ============================================
  // 🔒 SECURITY & COMPLIANCE
  // ============================================
  {
    id: 'security-copilot',
    name: 'Security Copilot Implementation',
    shortDescription: 'Implementera Microsoft Security Copilot för snabbare hothantering',
    fullDescription: 'Vi hjälper er implementera Security Copilot och integrera det med er befintliga säkerhetsmiljö. Inkluderar konfiguration, promptbibliotek och utbildning av säkerhetsteamet.',
    deliverables: [
      'Security Copilot-konfiguration',
      'Integration med Defender & Sentinel',
      'Anpassade promptbooks för ert team',
      'Utbildning för SOC-analytiker',
      'Playbooks för vanliga incidenttyper'
    ],
    duration: '2-4 veckor',
    priceRange: { min: 80000, max: 200000, unit: 'fixed' },
    targetAudience: ['CISO', 'Säkerhetschefer', 'SOC-ledare'],
    relatedCases: ['bank-security']
  },
  {
    id: 'security-assessment',
    name: 'Microsoft 365 Security Assessment',
    shortDescription: 'Säkerhetsgenomgång av er M365-miljö',
    fullDescription: 'Vi gör en djupgående säkerhetsgranskning av er Microsoft 365-miljö baserat på Microsoft Secure Score och branschstandarder. Resultatet är en prioriterad åtgärdslista.',
    deliverables: [
      'Secure Score-analys',
      'Identitets- och åtkomstkontroll',
      'Dataskydd och DLP',
      'Hotskydd (Defender-sviten)',
      'Prioriterade åtgärder (Quick Wins)',
      'Executive summary'
    ],
    duration: '3-5 dagar',
    priceRange: { min: 40000, max: 70000, unit: 'fixed' },
    targetAudience: ['IT-chefer', 'CISO', 'IT-säkerhet'],
    relatedCases: ['bank-security']
  },
  {
    id: 'defender-suite',
    name: 'Microsoft Defender Implementation',
    shortDescription: 'Komplett hotskydd med Defender-sviten',
    fullDescription: 'Vi implementerar Microsoft Defender XDR för endpoint, Office 365, identitet och molnappar. Ett enhetligt hotskydd med automatiserad respons.',
    deliverables: [
      'Defender for Endpoint (EDR)',
      'Defender for Office 365',
      'Defender for Identity',
      'Defender for Cloud Apps',
      'Automatiserade incident response-regler',
      'SOC-processer och runbooks'
    ],
    duration: '4-8 veckor',
    priceRange: { min: 80000, max: 200000, unit: 'fixed' },
    targetAudience: ['IT-säkerhet', 'CISO', 'IT-chefer'],
    relatedCases: ['bank-security']
  },
  {
    id: 'sentinel-siem',
    name: 'Microsoft Sentinel SIEM/SOAR',
    shortDescription: 'Molnbaserad säkerhetsövervakning',
    fullDescription: 'Vi implementerar Microsoft Sentinel som er centrala SIEM-plattform. Samla loggar från alla källor, detektera hot och automatisera respons.',
    deliverables: [
      'Sentinel workspace-design',
      'Data connectors för alla källor',
      'Anpassade analytics rules',
      'Automatiserade playbooks',
      'Dashboards och workbooks',
      'Integration med ticketsystem'
    ],
    duration: '6-12 veckor',
    priceRange: { min: 100000, max: 300000, unit: 'fixed' },
    targetAudience: ['CISO', 'SOC-team', 'IT-säkerhet'],
    relatedCases: ['bank-security']
  },
  {
    id: 'entra-identity',
    name: 'Microsoft Entra Identity Modernization',
    shortDescription: 'Modern identitets- och åtkomsthantering',
    fullDescription: 'Vi moderniserar er identitetshantering med Microsoft Entra. SSO, MFA, Conditional Access och identitetsstyrning för säker och smidig åtkomst.',
    deliverables: [
      'Entra ID-konfiguration',
      'Conditional Access-policyer',
      'MFA-utrullning',
      'SSO för SaaS-appar',
      'Privileged Identity Management',
      'Access Reviews'
    ],
    duration: '4-8 veckor',
    priceRange: { min: 70000, max: 180000, unit: 'fixed' },
    targetAudience: ['IT-chefer', 'IT-säkerhet', 'IAM-ansvariga'],
    relatedCases: []
  },
  {
    id: 'intune-endpoint',
    name: 'Intune Endpoint Management',
    shortDescription: 'Modern enhetshantering med Intune',
    fullDescription: 'Vi implementerar Microsoft Intune för att hantera och säkra alla era enheter - Windows, Mac, iOS och Android. Inkluderar Autopilot för zero-touch deployment.',
    deliverables: [
      'Intune-konfiguration',
      'Device compliance-policyer',
      'App-distribution',
      'Windows Autopilot',
      'Conditional Access-integration',
      'Self-service och Company Portal'
    ],
    duration: '4-8 veckor',
    priceRange: { min: 60000, max: 150000, unit: 'fixed' },
    targetAudience: ['IT-ansvariga', 'Endpoint-team', 'IT-säkerhet'],
    relatedCases: []
  },
  {
    id: 'purview-compliance',
    name: 'Microsoft Purview Compliance',
    shortDescription: 'Dataskydd och regelefterlevnad',
    fullDescription: 'Vi implementerar Microsoft Purview för dataklassificering, informationsskydd och compliance. Uppfyll GDPR och branschkrav med automatiserade kontroller.',
    deliverables: [
      'Dataklassificeringsschema',
      'Sensitivity labels',
      'DLP-policyer',
      'Retention och arkivering',
      'eDiscovery-uppsättning',
      'Compliance-rapporter'
    ],
    duration: '4-8 veckor',
    priceRange: { min: 70000, max: 180000, unit: 'fixed' },
    targetAudience: ['Compliance', 'Juridik', 'IT-säkerhet', 'DPO'],
    relatedCases: ['ziklo-teams']
  },
  {
    id: 'zero-trust',
    name: 'Zero Trust Architecture',
    shortDescription: 'Implementera Zero Trust-säkerhetsmodell',
    fullDescription: 'Vi hjälper er implementera en Zero Trust-arkitektur med Microsoft-teknologier. Verifiera explicit, använd minsta behörighet och anta intrång.',
    deliverables: [
      'Zero Trust-mognadsbedömning',
      'Identitets-pelare (Entra)',
      'Enhets-pelare (Intune)',
      'Nätverks-pelare (segmentering)',
      'Data-pelare (Purview)',
      'Roadmap för full implementation'
    ],
    duration: '8-16 veckor',
    priceRange: { min: 150000, max: 400000, unit: 'fixed' },
    targetAudience: ['CISO', 'IT-chefer', 'Säkerhetsarkitekter'],
    relatedCases: ['bank-security']
  }
];

// === BATTLECARDS ===
export const BATTLECARDS: Battlecard[] = [
  // ============================================
  // IT-KONSULTBOLAG
  // ============================================
  {
    id: 'vs-atea',
    competitor: 'Atea',
    theirStrengths: [
      'Stor organisation med bred närvaro',
      'Starka hårdvaruavtal',
      'Välkänt varumärke',
      'Kan leverera helhetslösningar inkl. hårdvara'
    ],
    theirWeaknesses: [
      'Generalister - inte specialiserade på Microsoft',
      'Ofta juniorare konsulter på Microsoft-uppdrag',
      'Långsamma beslutsprocesser som stor organisation',
      'Fokus på volym snarare än kvalitet'
    ],
    ourAdvantages: [
      '100% fokus på Microsoft - det är allt vi gör',
      'Seniora konsulter med djup expertis',
      'Snabba beslut och flexibel leverans',
      'Starkare partnerskap med Microsoft (se certifieringar)'
    ],
    talkingPoints: [
      '"Vi är specialister, inte generalister. Microsoft är det enda vi gör."',
      '"Våra konsulter har i snitt 8+ års erfarenhet av Microsoft-plattformen."',
      '"Som mindre bolag är vi snabbare och mer flexibla i leveransen."'
    ],
    commonObjections: [
      'Atea är större och tryggare',
      'Vi har redan avtal med Atea'
    ]
  },
  {
    id: 'vs-tieto',
    competitor: 'TietoEVRY',
    theirStrengths: [
      'Stor nordisk närvaro',
      'Stark inom offentlig sektor',
      'Bred tjänsteportfölj',
      'Långa kundrelationer'
    ],
    theirWeaknesses: [
      'Mycket stora projekt = byråkratiskt',
      'Microsoft är en av många plattformar',
      'Komplexa prismodeller',
      'Kan vara svåra att nå rätt person'
    ],
    ourAdvantages: [
      'Snabbare uppstart och leverans',
      'Dedikerad Microsoft-expertis',
      'Direktkontakt med experter, inte projektledare',
      'Mer prisvärt för Microsoft-specifika projekt'
    ],
    talkingPoints: [
      '"För rena Microsoft-projekt får ni djupare expertis och snabbare leverans hos oss."',
      '"Vi kan komplettera TietoEVRY på Microsoft-sidan av era projekt."',
      '"Ni pratar direkt med våra experter, inte mellanhänder."'
    ],
    commonObjections: [
      'Vi har ramavtal med TietoEVRY',
      'De känner vår verksamhet'
    ]
  },
  {
    id: 'vs-cgi',
    competitor: 'CGI',
    theirStrengths: [
      'Global närvaro',
      'Starka inom systemutveckling',
      'Långa avtal med stora kunder',
      'Bred teknisk kompetens'
    ],
    theirWeaknesses: [
      'Stora projekt med hög overhead',
      'Ofta offshore-resurser',
      'Microsoft är inte deras kärnkompetens',
      'Kan vara svårt att få seniora resurser'
    ],
    ourAdvantages: [
      'Lokala, seniora Microsoft-experter',
      'Ingen offshore - alla i Sverige',
      'Microsoft-certifieringar på toppnivå',
      'Snabbare och mer agilt arbetssätt'
    ],
    talkingPoints: [
      '"Alla våra konsulter sitter i Sverige och pratar svenska."',
      '"Vi fokuserar helt på Microsoft - det är vår spetskompetens."',
      '"För Microsoft 365 och Azure-projekt är vi det naturliga valet."'
    ],
    commonObjections: [
      'CGI har fler resurser',
      'Vi vill ha en leverantör för allt'
    ]
  },
  {
    id: 'vs-knowit',
    competitor: 'Knowit',
    theirStrengths: [
      'Stark inom digitalisering och UX',
      'Bra varumärke i Sverige',
      'Bred kompetens',
      'Fokus på innovation'
    ],
    theirWeaknesses: [
      'Microsoft är en av många plattformar',
      'Starkare på design än infrastruktur',
      'Kan sakna djup i Azure och M365',
      'Varierad kvalitet mellan dotterbolag'
    ],
    ourAdvantages: [
      'Djupare Microsoft-specifik expertis',
      'Starkare på infrastruktur och säkerhet',
      'Microsoft Partner-certifieringar',
      'Fokuserad leveransorganisation'
    ],
    talkingPoints: [
      '"Knowit är duktiga på design - vi är duktiga på Microsoft-plattformen."',
      '"För M365, Azure och Copilot är vi specialisterna."',
      '"Vi kan samarbeta med Knowit på projekt som kräver båda kompetenserna."'
    ],
    commonObjections: [
      'Knowit förstår verksamheten bättre',
      'Vi vill ha UX och teknik från samma leverantör'
    ]
  },
  {
    id: 'vs-accenture',
    competitor: 'Accenture',
    theirStrengths: [
      'Globalt varumärke',
      'Enorma resurser',
      'Starka ledningskonsulter',
      'Kan ta stora transformationsprojekt'
    ],
    theirWeaknesses: [
      'Mycket dyra',
      'Ofta juniora resurser på implementation',
      'Långa säljcykler',
      'Fokus på stora, långa avtal'
    ],
    ourAdvantages: [
      'Betydligt mer kostnadseffektiva',
      'Seniora resurser hela vägen',
      'Snabbare uppstart',
      'Mer personlig service'
    ],
    talkingPoints: [
      '"För Microsoft-implementation får ni samma kvalitet till halva priset."',
      '"Vi har seniora experter på plats, inte konsulter som lär sig på ert projekt."',
      '"Accenture är bra på strategi - vi är bra på att faktiskt leverera Microsoft-lösningar."'
    ],
    commonObjections: [
      'Accenture är en tryggare partner',
      'Vi behöver global kapacitet'
    ]
  },
  {
    id: 'vs-capgemini',
    competitor: 'Capgemini',
    theirStrengths: [
      'Global leveranskapacitet',
      'Stark inom outsourcing',
      'Bred teknisk kompetens',
      'Långa kundrelationer'
    ],
    theirWeaknesses: [
      'Mycket offshore-beroende',
      'Kan vara långsamma att reagera',
      'Microsoft är en av många plattformar',
      'Komplexa avtalsstrukturer'
    ],
    ourAdvantages: [
      'Lokala experter - inga språkbarriärer',
      'Snabbare och mer agil leverans',
      'Microsoft är vår kärnkompetens',
      'Enklare att komma igång'
    ],
    talkingPoints: [
      '"För Microsoft-projekt i Sverige är vi snabbare och enklare att jobba med."',
      '"Alla våra resurser är lokala - inga tidszoner eller språkproblem."',
      '"Vi kan komplettera Capgemini på Microsoft-specifika behov."'
    ],
    commonObjections: [
      'Vi har globalt avtal med Capgemini',
      'De hanterar all vår IT'
    ]
  },
  {
    id: 'vs-inhouse',
    competitor: 'Egen IT-avdelning / Inhouse',
    theirStrengths: [
      'Känner verksamheten väl',
      'Alltid tillgängliga',
      'Ingen upphandling krävs',
      'Bygger intern kompetens'
    ],
    theirWeaknesses: [
      'Begränsad tid för strategiska projekt',
      'Svårt att hänga med i Microsofts snabba utveckling',
      'Risk för ensidig kompetens',
      'Resursbrist vid toppar'
    ],
    ourAdvantages: [
      'Fräscha perspektiv utifrån',
      'Djup specialistkompetens inom M365/Azure',
      'Erfarenheter från många liknande projekt',
      'Avlastar er IT för drift så de kan fokusera på utveckling'
    ],
    talkingPoints: [
      '"Vi kompletterar er IT-avdelning, vi ersätter dem inte."',
      '"Vi ser lösningar från andra kunder som kan passa er."',
      '"Er IT kan fokusera på kärnverksamheten medan vi driver projektet."'
    ],
    commonObjections: [
      'Vi vill bygga egen kompetens',
      'Konsulter är för dyra'
    ]
  },

  // ============================================
  // ALTERNATIVA PLATTFORMAR
  // ============================================
  {
    id: 'vs-google-workspace',
    competitor: 'Google Workspace',
    theirStrengths: [
      'Enklare gränssnitt',
      'Lägre ingångspris',
      'Bra för startups/små företag',
      'Stark på samarbete i dokument'
    ],
    theirWeaknesses: [
      'Sämre integration med enterprise-system',
      'Begränsade säkerhetsfunktioner',
      'Svagare offline-funktionalitet',
      'Mindre funktionsrik för stora organisationer',
      'Ingen motsvarighet till Copilot, Power Platform, Azure'
    ],
    ourAdvantages: [
      'Microsoft 365 har djupare enterprise-funktioner',
      'Bättre säkerhet och compliance',
      'Power Platform för automation utan kod',
      'Copilot för AI-assistans',
      'Azure för molninfrastruktur'
    ],
    talkingPoints: [
      '"Google Workspace är bra för små team, men för enterprise behöver ni Microsoft 365."',
      '"Med Microsoft får ni Copilot, Power Platform och Azure i samma ekosystem."',
      '"Säkerhet och compliance är betydligt starkare i Microsoft-stacken."'
    ],
    commonObjections: [
      'Google är enklare att använda',
      'Google är billigare'
    ]
  },
  {
    id: 'vs-slack',
    competitor: 'Slack',
    theirStrengths: [
      'Bra användarupplevelse',
      'Starkt varumärke',
      'Bra för utvecklarteam',
      'Många integrationer'
    ],
    theirWeaknesses: [
      'Bara chat - ingen komplett produktivitetssvit',
      'Dyrt per användare för enterprise',
      'Ägs nu av Salesforce (lock-in)',
      'Ingen dokumenthantering, mail, kalender etc.'
    ],
    ourAdvantages: [
      'Teams ingår i M365 - ingen extra kostnad',
      'Komplett plattform: chat, möten, filer, appar',
      'Integration med Office-dokumenten',
      'Copilot-integration'
    ],
    talkingPoints: [
      '"Med Teams får ni allt Slack gör plus mycket mer, utan extra kostnad om ni har M365."',
      '"Teams integrerar sömlöst med era Word, Excel och PowerPoint-dokument."',
      '"Copilot i Teams ger er AI-assistans som Slack inte kan matcha."'
    ],
    commonObjections: [
      'Våra utvecklare älskar Slack',
      'Teams är för rörigt'
    ]
  },
  {
    id: 'vs-aws',
    competitor: 'Amazon Web Services (AWS)',
    theirStrengths: [
      'Största molnleverantören',
      'Flest tjänster',
      'Mogen plattform',
      'Stark på serverless och containers'
    ],
    theirWeaknesses: [
      'Komplex prismodell',
      'Svårare att förstå kostnader',
      'Ingen integration med M365',
      'Kräver ofta mer DevOps-kompetens'
    ],
    ourAdvantages: [
      'Azure integrerar sömlöst med M365',
      'Entra ID fungerar överallt',
      'Microsoft-support och partnerekosystem',
      'Hybrid-scenarier med Azure Arc',
      'B3 är Microsoft-specialister'
    ],
    talkingPoints: [
      '"Om ni redan har M365 är Azure det naturliga valet - allt integrerar."',
      '"Med Azure får ni samma identitet överallt via Entra ID."',
      '"Vi är Microsoft-specialister - Azure är vår hemmaplan."'
    ],
    commonObjections: [
      'AWS är störst',
      'Våra utvecklare föredrar AWS'
    ]
  },
  {
    id: 'vs-zoom',
    competitor: 'Zoom',
    theirStrengths: [
      'Enkelt att använda',
      'Bra videokvalitet',
      'Välkänt varumärke',
      'Fungerar utan installation'
    ],
    theirWeaknesses: [
      'Bara videomöten - ingen komplett plattform',
      'Extra kostnad utöver M365',
      'Säkerhetsproblem historiskt',
      'Ingen integration med Office-dokument'
    ],
    ourAdvantages: [
      'Teams ingår i M365',
      'Komplett samarbetsplattform',
      'Copilot för mötessammanfattningar',
      'Teams Rooms för mötesrum'
    ],
    talkingPoints: [
      '"Teams ger er videomöten plus allt annat - chat, filer, appar - utan extra kostnad."',
      '"Copilot i Teams sammanfattar möten automatiskt."',
      '"Ni slipper hantera ännu ett verktyg och ännu en leverantör."'
    ],
    commonObjections: [
      'Zoom är enklare',
      'Alla vet hur Zoom fungerar'
    ]
  }
];

// === INVÄNDNINGSHANTERING ===
export const OBJECTION_HANDLERS: ObjectionHandler[] = [
  {
    id: 'too-expensive',
    objection: 'Det är för dyrt',
    triggers: ['dyrt', 'för dyrt', 'kostar för mycket', 'budget'],
    category: 'price',
    responses: {
      short: 'Jag förstår att investeringen känns stor. Kan jag fråga - vad kostar det er idag att INTE lösa det här problemet?',
      detailed: 'Jag hör dig. Låt mig visa hur andra kunder räknat på det här. Stena Line räknade på att varje medarbetare sparade 2 timmar i veckan efter vår Teams-implementation. Med 500 användare blev det snabbt en positiv ROI. Ska jag göra en liknande kalkyl för er?',
      followUpQuestions: [
        'Vad är ert största tidstjuvar idag?',
        'Hur mycket tid lägger ni på att leta efter information?',
        'Vad kostar det när ett projekt blir försenat?'
      ]
    }
  },
  {
    id: 'bad-timing',
    objection: 'Det passar inte just nu',
    triggers: ['inte nu', 'senare', 'nästa år', 'har inte tid', 'ring tillbaka'],
    category: 'timing',
    responses: {
      short: 'Jag förstår att det är mycket just nu. Vad är det som gör att det inte passar?',
      detailed: 'Det förstår jag helt. Många av våra kunder kände likadant innan de insåg hur mycket tid de faktiskt förlorade. Om jag kunde visa hur ni kan spara tid redan första veckan - skulle det vara värt 30 minuter?',
      followUpQuestions: [
        'Vad är det som tar mest tid just nu?',
        'När tror du att det skulle passa bättre?',
        'Vad behöver hända för att det ska bli prioriterat?'
      ]
    }
  },
  {
    id: 'have-contract',
    objection: 'Vi har redan avtal med annan leverantör',
    triggers: ['ramavtal', 'redan avtal', 'annan leverantör', 'upphandling'],
    category: 'competition',
    responses: {
      short: 'Jag förstår. Är det ett exklusivt avtal, eller finns det utrymme för specialistkompetens?',
      detailed: 'Det är vanligt. Många av våra kunder har ramavtal för generell IT men anlitar oss för specialistuppdrag inom Microsoft. Vi kan ofta komplettera er befintliga leverantör på de områden där vi har djupare expertis.',
      followUpQuestions: [
        'Hur nöjda är ni med Microsoft-kompetensen hos nuvarande leverantör?',
        'Finns det områden där ni saknar expertis idag?',
        'När går ert nuvarande avtal ut?'
      ]
    }
  },
  {
    id: 'works-fine',
    objection: 'Det fungerar bra som det är',
    triggers: ['fungerar bra', 'behöver inte', 'klarar oss', 'inte aktuellt'],
    category: 'need',
    responses: {
      short: 'Det är bra att höra! Får jag fråga - har ni redan börjat titta på hur Copilot kan förbättra det ytterligare?',
      detailed: 'Förstår jag. Samtidigt ser vi att företag som "fungerar bra" ofta har störst potential. De som kämpar med grunderna har inte tid för nästa steg. Hur ser ni på AI och automation framöver?',
      followUpQuestions: [
        'Vad är nästa steg i er digitalisering?',
        'Hur hänger ni med i Microsofts nya funktioner?',
        'Har ni mätt er produktivitet jämfört med andra i branschen?'
      ]
    }
  },
  {
    id: 'send-email',
    objection: 'Skicka ett mail så tittar jag på det',
    triggers: ['skicka mail', 'mejla', 'skicka information', 'titta på det senare'],
    category: 'timing',
    responses: {
      short: 'Absolut, jag gör det! Men mail försvinner lätt. Kan vi boka 15 minuter nästa vecka så jag kan visa er specifikt vad som skulle passa er?',
      detailed: 'Det kan jag göra. Men ärligt talat - 90% av alla mail hamnar i papperskorgen. Om jag istället kunde visa er en kort demo på 15 minuter, anpassad efter just er situation - skulle det vara möjligt?',
      followUpQuestions: [
        'Vad skulle du vilja se i mailet?',
        'Hur brukar ni utvärdera nya leverantörer?',
        'Finns det någon annan jag borde inkludera i mailet?'
      ]
    }
  }
];

// === KUNDCASE ===
export const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'stena-copilot',
    customer: 'Stena Line',
    industry: 'Transport & Logistik',
    challenge: 'Behövde effektivisera administrativa processer och frigöra tid för kärnverksamheten.',
    solution: 'Implementerade Microsoft Copilot för 200 användare med fokus på dokumenthantering och möteseffektivisering.',
    results: [
      '40% kortare tid för mötesförberedelser',
      '2 timmar/vecka sparat per användare',
      '85% nöjda användare efter 3 månader'
    ],
    quote: 'Copilot har förändrat hur våra team arbetar. Det som tog timmar tar nu minuter.',
    isPublic: true
  },
  {
    id: 'ziklo-teams',
    customer: 'Ziklo Bank',
    industry: 'Bank & Finans',
    challenge: 'Kaotisk Teams-miljö med hundratals team utan struktur, svårt att hitta information.',
    solution: 'Modern Workplace Workshop följt av implementation av governance-ramverk och ny Teams-struktur.',
    results: [
      '60% färre team (konsoliderat dubbletter)',
      '75% snabbare att hitta rätt information',
      'Compliance-godkänd struktur för finanssektorn'
    ],
    quote: 'Äntligen ordning och reda! Våra medarbetare hittar nu det de söker på första försöket.',
    isPublic: true
  },
  {
    id: 'telenor-automation',
    customer: 'Telenor Sverige',
    industry: 'Telekom',
    challenge: 'Manuella processer för kundrapportering som tog 40 timmar per månad.',
    solution: 'Power Platform Kickstart med Power Automate-flöden för automatisk rapportgenerering.',
    results: [
      'Från 40 timmar till 2 timmar per månad',
      '95% minskning av manuella fel',
      '10 nya automatiseringar byggda av interna "citizen developers"'
    ],
    isPublic: true
  }
];

// === HJÄLPFUNKTIONER ===

export const findOfferByTopic = (topic: string): Offer | undefined => {
  const topicLower = topic.toLowerCase();
  return OFFERS.find(offer =>
    offer.name.toLowerCase().includes(topicLower) ||
    offer.shortDescription.toLowerCase().includes(topicLower) ||
    offer.deliverables.some(d => d.toLowerCase().includes(topicLower))
  );
};

export const findBattlecardByCompetitor = (competitor: string): Battlecard | undefined => {
  const compLower = competitor.toLowerCase();
  return BATTLECARDS.find(bc =>
    bc.competitor.toLowerCase().includes(compLower)
  );
};

export const findObjectionHandler = (text: string): ObjectionHandler | undefined => {
  const textLower = text.toLowerCase();
  return OBJECTION_HANDLERS.find(handler =>
    handler.triggers.some(trigger => textLower.includes(trigger))
  );
};

export const findRelevantCase = (industry?: string, topic?: string): CaseStudy | undefined => {
  if (industry) {
    const match = CASE_STUDIES.find(c =>
      c.industry.toLowerCase().includes(industry.toLowerCase()) && c.isPublic
    );
    if (match) return match;
  }

  if (topic) {
    const match = CASE_STUDIES.find(c =>
      c.solution.toLowerCase().includes(topic.toLowerCase()) && c.isPublic
    );
    if (match) return match;
  }

  // Returnera ett slumpmässigt publikt case
  const publicCases = CASE_STUDIES.filter(c => c.isPublic);
  return publicCases[Math.floor(Math.random() * publicCases.length)];
};
