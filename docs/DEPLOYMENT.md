# Deployment Guide - Sales Coach

Denna guide visar hur du deployar Sales Coach till Netlify från GitHub.

## 🚀 Snabbstart: Deploy till Netlify

### Steg 1: Skapa Netlify-konto

1. Gå till [netlify.com](https://www.netlify.com/)
2. Klicka **Sign Up** och logga in med GitHub
3. Ge Netlify tillgång till dina GitHub-repos

### Steg 2: Importera projektet från GitHub

1. På Netlify Dashboard, klicka **Add new site** → **Import an existing project**
2. Välj **GitHub**
3. Sök efter och välj: `olalowing-oss/sales-coach`
4. Netlify kommer automatiskt hitta:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18` (från netlify.toml)

### Steg 3: Konfigurera Environment Variables

**VIKTIGT:** Lägg till dina Supabase och Azure-nycklar som environment variables:

1. I Netlify Dashboard, gå till **Site settings** → **Environment variables**
2. Klicka **Add a variable** och lägg till följande:

```bash
# Azure Speech Service
VITE_AZURE_SPEECH_KEY=your-azure-key-here
VITE_AZURE_SPEECH_REGION=swedencentral

# Supabase
VITE_SUPABASE_URL=https://jiphhmofozuewfdnjfjy.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

**OBS:** Använd samma nycklar som i din `.env` fil!

### Steg 4: Deploy!

1. Klicka **Deploy site**
2. Netlify kommer:
   - Klona repot från GitHub
   - Installera dependencies (`npm install`)
   - Köra build (`npm run build`)
   - Deploya till CDN

3. Efter några minuter får du en URL som: `https://your-site-name.netlify.app`

---

## ⚙️ Konfiguration

### Automatisk Deploy från GitHub

Netlify är nu kopplad till din GitHub repo. Varje gång du pushar till `main` branch:
1. Netlify detekterar ändringen automatiskt
2. Kör build och deploy
3. Din site uppdateras inom några minuter

### Custom Domain (valfritt)

För att använda din egen domän (t.ex. `salescoach.com`):

1. I Netlify Dashboard → **Domain management**
2. Klicka **Add custom domain**
3. Följ instruktionerna för DNS-konfiguration
4. Netlify hanterar automatiskt SSL-certifikat via Let's Encrypt

---

## 🔒 Säkerhet

### Environment Variables

**ALDRIG** committa känsliga nycklar till GitHub! Använd alltid Netlify's environment variables:

- ✅ Säkra: Environment variables i Netlify Dashboard
- ❌ INTE säkra: Hårdkodade nycklar i koden
- ❌ INTE säkra: `.env` fil i repot (är gitignored, men var försiktig!)

### CORS och Supabase

Om du får CORS-fel:
1. Gå till Supabase Dashboard → **Project Settings** → **API**
2. Under **CORS Configuration**, lägg till:
   ```
   https://your-site-name.netlify.app
   ```

### Content Security Policy

`netlify.toml` innehåller säkerhetsheaders som:
- Förhindrar clickjacking (X-Frame-Options)
- Skyddar mot MIME-sniffing
- Begränsar referrer information
- Tillåter mikrofon-access (för Azure Speech)

---

## 🐛 Troubleshooting

### Build misslyckas

**Problem:** "Command failed: npm run build"

**Lösning:**
1. Kolla Netlify build logs
2. Testa lokalt: `npm run build`
3. Kontrollera att alla dependencies finns i `package.json`

### Environment Variables fungerar inte

**Problem:** Appen kan inte hitta Supabase/Azure nycklar

**Lösning:**
1. Dubbelkolla att variabelnamnen börjar med `VITE_`
2. Verifiera att nycklarna är korrekta
3. Efter att ha lagt till/ändrat env vars: trigga en ny deploy

### 404 på routes

**Problem:** Direkta URL:er (t.ex. `/login`) ger 404

**Lösning:**
- Detta borde funka med `netlify.toml` redirects
- Om inte, lägg till `_redirects` fil i `public/`:
  ```
  /*    /index.html   200
  ```

### Mikrofon fungerar inte

**Problem:** Azure Speech kan inte komma åt mikrofonen

**Lösning:**
1. Använd HTTPS (Netlify ger detta automatiskt)
2. Kolla webbläsarens mikrofon-permissions
3. Vissa äldre webbläsare stödjer inte Web Audio API

---

## 📊 Monitoring & Analytics

### Netlify Analytics

1. I Netlify Dashboard → **Analytics**
2. Se sidvisningar, laddningstider, populära sidor
3. Kostar $9/månad (valfritt)

### Supabase Metrics

1. I Supabase Dashboard → **Database**
2. Se antal queries, response times, databas-storlek
3. Gratis för upp till 500MB data

---

## 🔄 CI/CD Pipeline

Din deployment pipeline ser ut så här:

```
Developer → Git Push → GitHub → Webhook → Netlify
                                          ↓
                                    npm install
                                          ↓
                                    npm run build
                                          ↓
                                    Deploy to CDN
                                          ↓
                                    Live på Internet! 🎉
```

---

## 💡 Tips för Produktion

### 1. Aktivera Email Authentication
Se [SETUP_AUTH.md](SETUP_AUTH.md) för instruktioner

### 2. Konfigurera Supabase RLS
Se [SUPABASE_SETUP.md](SUPABASE_SETUP.md) för databas-setup

### 3. Sätt upp Error Tracking
Överväg att integrera:
- **Sentry** för error tracking
- **LogRocket** för session replay
- **Google Analytics** för användaranalys

### 4. Optimize Build
I `vite.config.ts`, aktivera:
```typescript
export default defineConfig({
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true // Ta bort console.logs i produktion
      }
    }
  }
})
```

### 5. Preview Deployments
Netlify skapar automatiskt preview-deploys för varje Pull Request!

---

## 🎯 Nästa Steg

1. ✅ Deploy till Netlify
2. ⚙️ Konfigurera environment variables
3. 🔒 Aktivera email authentication i Supabase
4. 🗄️ Kör SQL-schema i Supabase
5. 🧪 Testa att skapa användare och spara samtal
6. 🌐 (Valfritt) Konfigurera custom domain
7. 📈 (Valfritt) Sätt upp analytics

---

## 📞 Support

Om du stöter på problem:
- **Netlify Support:** https://docs.netlify.com/
- **Supabase Docs:** https://supabase.com/docs
- **GitHub Issues:** https://github.com/olalowing-oss/sales-coach/issues
