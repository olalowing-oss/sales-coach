# Aktivera Email/Password Autentisering i Supabase

För att aktivera inloggning och registrering i Sales Coach behöver du aktivera Email Authentication i Supabase Dashboard.

## Steg 1: Aktivera Email Provider

1. Gå till [Supabase Dashboard](https://supabase.com/dashboard)
2. Välj ditt projekt: **jiphhmofozuewfdnjfjy**
3. Klicka på **Authentication** i vänstermenyn
4. Klicka på **Providers**
5. Leta upp **Email** i listan
6. Se till att följande är aktiverat:
   - ✅ **Enable Email provider**
   - ✅ **Confirm email** (om du vill att användare måste verifiera sin email)

## Steg 2: Konfigurera Email Settings (valfritt)

Under **Authentication → Settings → Email Templates** kan du anpassa:
- Verifieringsmail
- Återställ lösenord-mail
- Välkomstmail

## Steg 3: Testa Autentiseringen

1. Starta appen: `npm run dev`
2. Gå till http://localhost:3002/
3. Du ska nu se login-skärmen
4. Klicka på **Registrera**
5. Ange email och lösenord (minst 6 tecken)
6. Klicka **Skapa konto**

Om **Confirm email** är aktiverat:
- Kolla din email för verifieringslänk
- Klicka på länken för att aktivera kontot
- Logga sedan in med dina uppgifter

Om **Confirm email** är INTE aktiverat:
- Kontot skapas direkt
- Du loggas in automatiskt

## Vad händer efter inloggning?

Efter inloggning:
1. Användaren sparas i Supabase `auth.users` tabellen
2. All data (samtal, coaching-data) kopplas till användaren via `user_id`
3. RLS (Row Level Security) säkerställer att användare bara ser sin egen data
4. Logout-knappen visas i headern (klicka på användarnamnet)

## Troubleshooting

### "Invalid login credentials"
- Kontrollera att Email provider är aktiverad
- Om email-verifiering krävs, kolla om du verifierat din email

### "Email not confirmed"
- Kolla spam-mappen för verifieringsmail från Supabase
- I Supabase Dashboard → Authentication → Users, klicka på användaren och välj "Confirm email" manuellt

### Användare ser inte sin data
- Kontrollera att RLS-policies är rätt konfigurerade
- Kör SQL-filen `fix-rls-policies.sql` i SQL Editor om nödvändigt

## Nästa steg

För produktionsmiljö:
1. Sätt upp en egen email-provider (SMTP)
2. Anpassa email-templates med ditt företags branding
3. Lägg till "Glömt lösenord"-funktion
4. Överväg att lägga till OAuth (Google, Microsoft, etc.)
