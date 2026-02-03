import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// TARGET USER - det konto du är inloggad med
const TARGET_USER_ID = '72f242c2-2dd3-441b-9183-0fe4854f29b4';
const TARGET_PRODUCT_ID = 'ce52ccee-0cfe-48ed-b785-3679e01c2409'; // M365 (nya)

// Triggers data från localStorage
const TRIGGERS_DATA = {
  "price": {
    "keywords": [
      "dyrt",
      "för dyrt",
      "billigare",
      "budget",
      "kostnad",
      "pris",
      "investering",
      "har inte råd",
      "kostar för mycket",
      "för dyr licens",
      "licenspris",
      "spara pengar",
      "kostnadseffektivt",
      "billigare alternativ",
      "gratisalternativ",
      "open source",
      "freeware",
      "inte värt pengarna",
      "ROI",
      "payback"
    ],
    "response": "objection",
    "category": "price",
    "productId": null
  },
  "timing": {
    "keywords": [
      "senare",
      "inte nu",
      "nästa år",
      "Q1",
      "Q2",
      "Q3",
      "Q4",
      "inte prioriterat",
      "vänta",
      "ring tillbaka",
      "har inte tid",
      "efter sommaren",
      "efter jul",
      "nästa budgetår",
      "framtiden",
      "kanske senare",
      "om ett halvår",
      "om ett år",
      "avvaktar",
      "måste tänka på det",
      "behöver fundera",
      "tar det sen"
    ],
    "response": "objection",
    "category": "timing",
    "productId": null
  },
  "competition": {
    "keywords": [
      "annan leverantör",
      "redan avtal",
      "ramavtal",
      "upphandling",
      "andra konsulter",
      "annat bolag",
      "vår partner",
      "befintlig leverantör",
      "nuvarande avtal",
      "byter inte",
      "nöjda med",
      "LOU",
      "offentlig upphandling",
      "avropsavtal"
    ],
    "response": "objection",
    "category": "competition",
    "productId": null
  },
  "need": {
    "keywords": [
      "behöver inte",
      "fungerar bra",
      "har redan",
      "klarar oss",
      "inte aktuellt",
      "ingen nytta",
      "ser inget behov",
      "nöjda som det är",
      "varför byta",
      "löser inget problem",
      "hype",
      "buzzword",
      "mode"
    ],
    "response": "objection",
    "category": "need",
    "productId": null
  },
  "trust": {
    "keywords": [
      "litar inte på",
      "osäkra på",
      "moget nog",
      "fungerar det verkligen",
      "hört dåligt om",
      "dåliga erfarenheter",
      "bränt oss",
      "misslyckade projekt",
      "referens",
      "bevis",
      "bevisa"
    ],
    "response": "objection",
    "category": "trust",
    "productId": null
  },
  "atea": {
    "keywords": [
      "Atea",
      "atea",
      "ATEA"
    ],
    "response": "battlecard",
    "category": null,
    "productId": null
  },
  "tieto": {
    "keywords": [
      "Tieto",
      "TietoEVRY",
      "tieto",
      "tietoevry",
      "EVRY"
    ],
    "response": "battlecard",
    "category": null,
    "productId": null
  },
  "cgi": {
    "keywords": [
      "CGI",
      "cgi",
      "Logica"
    ],
    "response": "battlecard",
    "category": null,
    "productId": null
  },
  "knowit": {
    "keywords": [
      "Knowit",
      "knowit",
      "Know IT"
    ],
    "response": "battlecard",
    "category": null,
    "productId": null
  },
  "accenture": {
    "keywords": [
      "Accenture",
      "accenture"
    ],
    "response": "battlecard",
    "category": null,
    "productId": null
  },
  "capgemini": {
    "keywords": [
      "Capgemini",
      "capgemini",
      "Cap Gemini"
    ],
    "response": "battlecard",
    "category": null,
    "productId": null
  },
  "softronic": {
    "keywords": [
      "Softronic",
      "softronic"
    ],
    "response": "battlecard",
    "category": null,
    "productId": null
  },
  "addq": {
    "keywords": [
      "AddQ",
      "addq",
      "Add Q"
    ],
    "response": "battlecard",
    "category": null,
    "productId": null
  },
  "inhouse": {
    "keywords": [
      "inhouse",
      "in-house",
      "egen IT",
      "vår IT-avdelning",
      "egna resurser",
      "internt",
      "själva",
      "vår personal",
      "anställa",
      "rekrytera"
    ],
    "response": "battlecard",
    "category": null,
    "productId": null
  },
  "google_workspace": {
    "keywords": [
      "Google Workspace",
      "Google Drive",
      "Google Docs",
      "Google Meet",
      "Gmail företag"
    ],
    "response": "battlecard",
    "category": null,
    "productId": null
  },
  "slack": {
    "keywords": [
      "Slack",
      "slack"
    ],
    "response": "battlecard",
    "category": null,
    "productId": null
  },
  "zoom": {
    "keywords": [
      "Zoom",
      "zoom",
      "Zoom Meetings"
    ],
    "response": "battlecard",
    "category": null,
    "productId": null
  },
  "aws": {
    "keywords": [
      "AWS",
      "Amazon Web Services",
      "amazon cloud"
    ],
    "response": "battlecard",
    "category": null,
    "productId": null
  },
  "teams": {
    "keywords": [
      "Teams",
      "Microsoft Teams",
      "videosamtal",
      "videomöte",
      "collaboration",
      "teamsmöte",
      "teams-möte",
      "teamschat",
      "teams-chat",
      "Teams Phone",
      "telefoni i Teams",
      "Teams Rooms",
      "mötesrum"
    ],
    "response": "offer",
    "category": null,
    "productId": null
  },
  "sharepoint": {
    "keywords": [
      "SharePoint",
      "sharepoint",
      "SP Online",
      "SPO",
      "intranät",
      "intranet",
      "medarbetarportal",
      "företagsportal",
      "dokumenthantering",
      "fildelning",
      "versionshantering",
      "samarbetsyta",
      "teamsite",
      "kommunikationssajt"
    ],
    "response": "offer",
    "category": null,
    "productId": null
  },
  "onedrive": {
    "keywords": [
      "OneDrive",
      "onedrive",
      "One Drive",
      "molnlagring",
      "filsynk",
      "personlig lagring"
    ],
    "response": "offer",
    "category": null,
    "productId": null
  },
  "exchange": {
    "keywords": [
      "Exchange",
      "exchange",
      "Exchange Online",
      "EXO",
      "Outlook",
      "mail",
      "e-post",
      "mailserver",
      "kalender",
      "delad kalender",
      "mötesbokning",
      "rumsbokningssystem",
      "mailmigrering",
      "mailflyttning"
    ],
    "response": "offer",
    "category": null,
    "productId": null
  },
  "viva": {
    "keywords": [
      "Viva",
      "Microsoft Viva",
      "Viva Engage",
      "Viva Learning",
      "Viva Insights",
      "Viva Goals",
      "Viva Connections",
      "Viva Topics",
      "medarbetarengagemang",
      "employee experience",
      "EX",
      "Yammer"
    ],
    "response": "offer",
    "category": null,
    "productId": null
  },
  "planner": {
    "keywords": [
      "Planner",
      "Microsoft Planner",
      "Project",
      "Microsoft Project",
      "projekthantering",
      "uppgiftshantering",
      "tasks",
      "To Do",
      "projektplanering",
      "Gantt",
      "resursplanering"
    ],
    "response": "offer",
    "category": null,
    "productId": null
  },
  "loop": {
    "keywords": [
      "Loop",
      "Microsoft Loop",
      "loop component",
      "loop-komponent",
      "samarbetsdokument",
      "realtidssamarbete"
    ],
    "response": "offer",
    "category": null,
    "productId": null
  },
  "copilot": {
    "keywords": [
      "Copilot",
      "copilot",
      "Co-pilot",
      "Microsoft Copilot",
      "M365 Copilot",
      "Copilot för Microsoft 365",
      "AI-assistent",
      "AI assistent",
      "Microsoft AI"
    ],
    "response": "offer",
    "category": null,
    "productId": null
  },
  "copilot_word": {
    "keywords": [
      "Copilot i Word",
      "skriva dokument med AI",
      "AI-skrivande",
      "generera dokument",
      "automatisk text"
    ],
    "response": "offer",
    "category": null,
    "productId": null
  },
  "copilot_excel": {
    "keywords": [
      "Copilot i Excel",
      "AI i Excel",
      "automatisk analys",
      "dataanalys med AI",
      "formelhjälp"
    ],
    "response": "offer",
    "category": null,
    "productId": null
  },
  "copilot_powerpoint": {
    "keywords": [
      "Copilot i PowerPoint",
      "skapa presentation med AI",
      "AI-presentationer",
      "automatisk presentation"
    ],
    "response": "offer",
    "category": null,
    "productId": null
  },
  "copilot_outlook": {
    "keywords": [
      "Copilot i Outlook",
      "AI-mail",
      "mailsammanfattning",
      "automatiska mailsvar"
    ],
    "response": "offer",
    "category": null,
    "productId": null
  },
  "copilot_teams": {
    "keywords": [
      "Copilot i Teams",
      "mötessammanfattning",
      "AI i möten",
      "transkribering",
      "Intelligent Recap",
      "mötesanteckningar"
    ],
    "response": "offer",
    "category": null,
    "productId": null
  },
  "generative_ai": {
    "keywords": [
      "generativ AI",
      "GenAI",
      "generative AI",
      "gen AI",
      "ChatGPT",
      "chatgpt",
      "GPT",
      "GPT-4",
      "OpenAI",
      "språkmodell",
      "LLM",
      "large language model",
      "AI-strategi",
      "AI strategi"
    ],
    "response": "offer",
    "category": null,
    "productId": null
  },
  "copilot_studio": {
    "keywords": [
      "Copilot Studio",
      "bygga egen copilot",
      "anpassad AI",
      "chattbot",
      "chatbot",
      "virtuell agent",
      "AI-bot",
      "Power Virtual Agents",
      "PVA",
      "konversations-AI"
    ],
    "response": "offer",
    "category": null,
    "productId": null
  },
  "ai_builder": {
    "keywords": [
      "AI Builder",
      "AI-modell",
      "dokumentbehandling med AI",
      "formulärbearbetning",
      "objektdetektering",
      "textklassificering"
    ],
    "response": "offer",
    "category": null,
    "productId": null
  },
  "powerplatform": {
    "keywords": [
      "Power Platform",
      "power platform",
      "Power-plattformen",
      "low-code",
      "no-code",
      "citizen developer",
      "medborgarutvecklare"
    ],
    "response": "offer",
    "category": null,
    "productId": null
  },
  "powerapps": {
    "keywords": [
      "Power Apps",
      "PowerApps",
      "power apps",
      "canvas app",
      "model-driven app",
      "mobilapp",
      "egen app",
      "skapa app",
      "bygga app",
      "applikationsutveckling",
      "affärsapplikation",
      "internverktyg"
    ],
    "response": "offer",
    "category": null,
    "productId": null
  },
  "powerautomate": {
    "keywords": [
      "Power Automate",
      "PowerAutomate",
      "power automate",
      "Flow",
      "Microsoft Flow",
      "arbetsflöde",
      "workflow",
      "automatisering",
      "automatisera",
      "RPA",
      "robotisering",
      "desktop flow",
      "molnflöde",
      "cloud flow",
      "processautomation",
      "automation"
    ],
    "response": "offer",
    "category": null,
    "productId": null
  },
  "powerbi": {
    "keywords": [
      "Power BI",
      "PowerBI",
      "power bi",
      "PBI",
      "rapportering",
      "dashboard",
      "instrumentpanel",
      "datavisualisering",
      "BI",
      "business intelligence",
      "analys",
      "KPI",
      "nyckeltal",
      "datadrivet"
    ],
    "response": "offer",
    "category": null,
    "productId": null
  },
  "powerpages": {
    "keywords": [
      "Power Pages",
      "PowerPages",
      "power pages",
      "extern portal",
      "kundportal",
      "självbetjäning",
      "webbportal",
      "hemsida",
      "partner portal"
    ],
    "response": "offer",
    "category": null,
    "productId": null
  },
  "dataverse": {
    "keywords": [
      "Dataverse",
      "dataverse",
      "Common Data Service",
      "CDS",
      "datamodell",
      "affärsdata",
      "dataplattform"
    ],
    "response": "offer",
    "category": null,
    "productId": null
  },
  "azure": {
    "keywords": [
      "Azure",
      "azure",
      "Microsoft Azure",
      "molnet",
      "cloud",
      "moln",
      "molntjänster",
      "cloudtjänster",
      "IaaS",
      "PaaS",
      "SaaS"
    ],
    "response": "offer",
    "category": null,
    "productId": null
  },
  "azure_migration": {
    "keywords": [
      "migration",
      "migrering",
      "molnflytt",
      "cloud migration",
      "flytta till Azure",
      "lift and shift",
      "modernisering",
      "datacenter",
      "on-prem",
      "on-premise",
      "hybrid"
    ],
    "response": "offer",
    "category": null,
    "productId": null
  },
  "azure_infra": {
    "keywords": [
      "Azure VM",
      "virtuella maskiner",
      "Virtual Machines",
      "Azure Storage",
      "lagring",
      "blob storage",
      "Azure Networking",
      "virtuellt nätverk",
      "VNet",
      "load balancer",
      "ExpressRoute",
      "VPN"
    ],
    "response": "offer",
    "category": null,
    "productId": null
  },
  "azure_apps": {
    "keywords": [
      "App Service",
      "Web App",
      "Azure Functions",
      "serverless",
      "Logic Apps",
      "Container Apps",
      "Kubernetes",
      "AKS",
      "Docker",
      "container",
      "microservices",
      "mikrotjänster"
    ],
    "response": "offer",
    "category": null,
    "productId": null
  },
  "azure_data": {
    "keywords": [
      "Azure SQL",
      "SQL Database",
      "Cosmos DB",
      "CosmosDB",
      "Synapse",
      "Azure Synapse",
      "Data Factory",
      "Databricks",
      "datalager",
      "data warehouse",
      "data lake",
      "datasjö",
      "ETL",
      "dataintegration"
    ],
    "response": "offer",
    "category": null,
    "productId": null
  },
  "azure_ai": {
    "keywords": [
      "Azure AI",
      "Azure Machine Learning",
      "Azure ML",
      "Cognitive Services",
      "Azure OpenAI",
      "Azure OpenAI Service",
      "AI-tjänster",
      "maskininlärning",
      "ML"
    ],
    "response": "offer",
    "category": null,
    "productId": null
  },
  "azure_devops": {
    "keywords": [
      "Azure DevOps",
      "DevOps",
      "ADO",
      "Azure Boards",
      "Azure Repos",
      "Azure Pipelines",
      "CI/CD",
      "GitHub Actions",
      "automatisk deploy",
      "deployment"
    ],
    "response": "offer",
    "category": null,
    "productId": null
  },
  "security": {
    "keywords": [
      "säkerhet",
      "security",
      "cybersäkerhet",
      "cybersecurity",
      "IT-säkerhet",
      "informationssäkerhet"
    ],
    "response": "offer",
    "category": null,
    "productId": null
  },
  "defender": {
    "keywords": [
      "Defender",
      "Microsoft Defender",
      "Defender for Endpoint",
      "Defender for Office",
      "Defender for Identity",
      "Defender for Cloud",
      "XDR",
      "EDR",
      "antivirus",
      "malware",
      "hotskydd"
    ],
    "response": "offer",
    "category": null,
    "productId": null
  },
  "sentinel": {
    "keywords": [
      "Sentinel",
      "Microsoft Sentinel",
      "SIEM",
      "SOAR",
      "säkerhetsövervakning",
      "hotdetektering",
      "incident response",
      "SOC",
      "Security Operations"
    ],
    "response": "offer",
    "category": null,
    "productId": null
  },
  "security_copilot": {
    "keywords": [
      "Security Copilot",
      "Copilot for Security",
      "säkerhets-AI",
      "AI-säkerhet",
      "hotanalys med AI"
    ],
    "response": "offer",
    "category": null,
    "productId": null
  },
  "entra": {
    "keywords": [
      "Entra",
      "Entra ID",
      "Microsoft Entra",
      "Azure AD",
      "Azure Active Directory",
      "identitet",
      "identitetshantering",
      "IAM",
      "Identity",
      "SSO",
      "single sign-on",
      "MFA",
      "multifaktor",
      "tvåfaktorsautentisering",
      "lösenordsfri",
      "passwordless",
      "Conditional Access",
      "villkorsstyrd åtkomst"
    ],
    "response": "offer",
    "category": null,
    "productId": null
  },
  "intune": {
    "keywords": [
      "Intune",
      "Microsoft Intune",
      "Endpoint Manager",
      "MEM",
      "MDM",
      "MAM",
      "enhetshantering",
      "mobile device management",
      "BYOD",
      "Autopilot",
      "Windows Autopilot",
      "deployment"
    ],
    "response": "offer",
    "category": null,
    "productId": null
  },
  "purview": {
    "keywords": [
      "Purview",
      "Microsoft Purview",
      "Compliance",
      "dataklassificering",
      "sensitivity labels",
      "känslighetsetiketter",
      "DLP",
      "Data Loss Prevention",
      "dataläckage",
      "Information Protection",
      "AIP",
      "eDiscovery",
      "retention",
      "arkivering",
      "GDPR",
      "dataskydd"
    ],
    "response": "offer",
    "category": null,
    "productId": null
  },
  "phishing": {
    "keywords": [
      "phishing",
      "nätfiske",
      "ransomware",
      "utpressningsvirus",
      "spam",
      "skräppost",
      "virus",
      "hackare",
      "hackat",
      "intrång",
      "dataintrång",
      "läcka",
      "dataläcka"
    ],
    "response": "offer",
    "category": null,
    "productId": null
  },
  "zerotrust": {
    "keywords": [
      "Zero Trust",
      "zero trust",
      "nolltillit",
      "segmentering",
      "microsegmentation",
      "least privilege"
    ],
    "response": "offer",
    "category": null,
    "productId": null
  },
  "chaos": {
    "keywords": [
      "rörigt",
      "kaotiskt",
      "stökigt",
      "ostrukturerat",
      "svårt att hitta",
      "hittar inte",
      "letar",
      "söker hela tiden",
      "oordning",
      "version",
      "vilken version",
      "dubbletter",
      "kopior överallt"
    ],
    "response": "solution",
    "category": null,
    "productId": null
  },
  "frustration": {
    "keywords": [
      "frustrerade",
      "problem med",
      "fungerar inte",
      "missnöjda",
      "tar för lång tid",
      "långsamt",
      "krångligt",
      "irriterande",
      "trött på",
      "hatar",
      "slösar tid"
    ],
    "response": "solution",
    "category": null,
    "productId": null
  },
  "productivity": {
    "keywords": [
      "produktivitet",
      "effektivitet",
      "effektivisera",
      "spara tid",
      "tidsbrist",
      "administrativa uppgifter",
      "manuellt arbete",
      "repetitiva uppgifter"
    ],
    "response": "solution",
    "category": null,
    "productId": null
  },
  "collaboration_issues": {
    "keywords": [
      "samarbete",
      "samarbeta",
      "kommunikation",
      "silos",
      "isolerat",
      "jobbar i silos",
      "vet inte vad andra gör",
      "transparens"
    ],
    "response": "solution",
    "category": null,
    "productId": null
  },
  "remote_work": {
    "keywords": [
      "distansarbete",
      "hemarbete",
      "hybrid",
      "hybridarbete",
      "jobba hemifrån",
      "remote",
      "distribuerade team"
    ],
    "response": "solution",
    "category": null,
    "productId": null
  },
  "interest": {
    "keywords": [
      "låter intressant",
      "berätta mer",
      "hur fungerar",
      "kan ni hjälpa",
      "vad kostar det",
      "vill veta mer",
      "intresserad",
      "nyfiken",
      "skulle vilja se",
      "demo",
      "visa mig",
      "presentation",
      "proof of concept",
      "POC",
      "pilot",
      "test",
      "när kan ni börja",
      "hur snabbt",
      "nästa steg"
    ],
    "response": "expand",
    "category": null,
    "productId": null
  },
  "buying_signals": {
    "keywords": [
      "beslut",
      "besluta",
      "budget godkänd",
      "fått budget",
      "ledningen vill",
      "styrelsen har sagt",
      "måste lösa",
      "behöver hjälp",
      "söker partner",
      "letar efter leverantör",
      "upphandlar",
      "offert",
      "prisförslag",
      "anbud"
    ],
    "response": "expand",
    "category": null,
    "productId": null
  },
  "urgency": {
    "keywords": [
      "bråttom",
      "snabbt",
      "akut",
      "genast",
      "omgående",
      "deadline",
      "måste vara klart",
      "tidspress"
    ],
    "response": "expand",
    "category": null,
    "productId": null
  }
};

async function importTriggers() {
  try {
    console.log('🚀 Importerar triggers till databasen...\n');
    console.log(`Target user: ${TARGET_USER_ID}`);
    console.log(`Target product: ${TARGET_PRODUCT_ID}\n`);

    const triggerCount = Object.keys(TRIGGERS_DATA).length;
    console.log(`📦 Hittade ${triggerCount} triggers att importera\n`);

    if (triggerCount === 0) {
      console.error('❌ Ingen trigger data! Uppdatera TRIGGERS_DATA i scriptet.');
      console.log('\nFör att få din trigger data:');
      console.log('1. Öppna browser console (F12)');
      console.log('2. Kör: JSON.stringify(JSON.parse(localStorage.getItem("b3-coaching-data")).state.triggerPatterns, null, 2)');
      console.log('3. Kopiera outputen och klistra in i TRIGGERS_DATA i detta script');
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (const [triggerId, triggerData] of Object.entries(TRIGGERS_DATA)) {
      try {
        const dbTrigger = {
          id: triggerId,
          user_id: TARGET_USER_ID,
          keywords: triggerData.keywords || [],
          response_type: triggerData.response || 'solution',
          category: triggerData.category || null,
          product_id: TARGET_PRODUCT_ID  // Use target product ID, not the old one
        };

        // Use upsert to avoid duplicates
        const { error } = await supabase
          .from('trigger_patterns')
          .upsert(dbTrigger, { onConflict: 'id' });

        if (error) {
          console.error(`❌ Fel vid sparande av trigger "${triggerId}":`, error.message);
          errorCount++;
        } else {
          console.log(`✅ Sparade trigger: ${triggerId}`);
          successCount++;
        }
      } catch (error) {
        console.error(`❌ Exception för trigger "${triggerId}":`, error);
        errorCount++;
      }
    }

    console.log(`\n🎉 FÄRDIG!`);
    console.log(`✅ Importerade: ${successCount} triggers`);
    if (errorCount > 0) {
      console.log(`❌ Misslyckades: ${errorCount} triggers`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

importTriggers();
