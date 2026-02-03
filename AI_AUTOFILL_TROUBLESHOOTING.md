# AI Auto-fill Troubleshooting Guide

## Problem
The AI auto-fill feature for the questionnaire is not working when testing with demo scripts.

## Root Causes Identified

### 1. Missing Anthropic API Key
The `.env` file contains a placeholder for `ANTHROPIC_API_KEY` but needs your actual API key.

**Fix:**
```bash
# Edit .env file and replace:
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here

# With your real Anthropic API key:
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Get your API key from: https://console.anthropic.com/

### 2. API Backend Not Running in Development
The `/api` folder contains Vercel serverless functions that need a backend server to run locally.

**Current state:**
- ✅ API file exists: `/api/extract-questionnaire-answers.ts`
- ❌ Vite proxy expects API at `http://localhost:3001` (see [vite.config.ts](vite.config.ts#L10-L13))
- ❌ No backend server running

**Solutions (choose ONE):**

#### Option A: Run with Vercel Dev (Recommended)
This simulates the Vercel serverless environment locally.

```bash
# Install Vercel CLI globally (if not already installed)
npm install -g vercel

# Run the project with Vercel dev server
npm run dev:vercel
```

This will:
- Start the Vite dev server for frontend
- Start Vercel's serverless function runtime for `/api` endpoints
- Handle API requests properly

#### Option B: Run API Server Separately
Use the existing `server.mjs` to run the API backend.

```bash
# Terminal 1: Run frontend
npm run dev

# Terminal 2: Run API backend
npm run dev:api
```

Or run both together:
```bash
npm run dev:full
```

Check [server.mjs](server.mjs) to ensure it imports and serves the questionnaire API endpoint.

## Debugging Steps

### 1. Check Browser Console
Open the demo script test and check the browser console (F12) for debug messages:

**Expected output when working:**
```
[AI Auto-fill Debug] Segments count: 5 Panel visible: true
[AI Auto-fill] 🚀 Triggering extraction (segment count is multiple of 5)
[AI Auto-fill] ✅ Starting extraction for 5 segments
[AI Auto-fill] Calling API endpoint...
[AI Auto-fill] API response status: 200
[AI Auto-fill] ✅ Extracted 3 answers
[AI Auto-fill] Filling question: current_challenges -> ...
```

**Common error messages:**

#### "Failed to fetch" or "Network error"
- **Cause**: Backend server not running
- **Fix**: Use `npm run dev:vercel` or `npm run dev:full`

#### "API error: 500 Server configuration error"
- **Cause**: `ANTHROPIC_API_KEY` missing or invalid
- **Fix**: Add valid API key to `.env` file

#### "API error: 404 Not Found"
- **Cause**: API endpoint not accessible
- **Fix**: Ensure backend server is running on port 3001

### 2. Check Network Tab
Open browser DevTools → Network tab → Filter by "Fetch/XHR"

Look for requests to `/api/extract-questionnaire-answers`:
- **Status 200**: API working correctly
- **Status 404**: Backend not running
- **Status 500**: Server error (check backend logs)
- **CORS error**: CORS headers not set (API file should handle this)

### 3. Test API Directly
Test the API endpoint manually:

```bash
# Make sure backend is running first
# Then test with curl:

curl -X POST http://localhost:3001/api/extract-questionnaire-answers \
  -H "Content-Type: application/json" \
  -d '{
    "transcriptText": "Kund: Vi har stora problem med dokumenthantering. Vi är 250 anställda och har 500k budget.",
    "existingAnswers": {}
  }'
```

**Expected response:**
```json
{
  "extractedAnswers": [
    {
      "questionId": "current_challenges",
      "answer": "Problem med dokumenthantering",
      "confidence": "high",
      "sourceQuote": "Vi har stora problem med dokumenthantering"
    },
    {
      "questionId": "user_count",
      "answer": "250 anställda",
      "confidence": "high"
    },
    {
      "questionId": "budget_status",
      "answer": "Ja, 500k SEK",
      "confidence": "high"
    }
  ]
}
```

### 4. Verify Environment Variables
Check that all required environment variables are set:

```bash
# Check if ANTHROPIC_API_KEY is set
cat .env | grep ANTHROPIC_API_KEY

# Should output something like:
# ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Common Issues

### Issue 1: "Waiting for next trigger point. Current: 3 Next trigger at: 5"
**Symptom**: Console shows segments are being created but extraction never triggers.

**Cause**: The auto-fill only triggers at segment counts that are multiples of 5 (5, 10, 15, 20...) to avoid excessive API calls.

**Fix**:
- Wait until 5 segments are created (demo script should create enough phrases)
- OR temporarily change the trigger condition in [SalesCoach.tsx](src/components/SalesCoach.tsx#L294-L296):

```typescript
// Change from:
if (segments.length > 0 && segments.length % 5 === 0) {

// To (trigger every 3 segments):
if (segments.length >= 3) {
```

### Issue 2: "Panel visible: false"
**Symptom**: Console shows "Panel visible: false" even though you can see the questionnaire.

**Cause**: The questionnaire panel toggle is OFF.

**Fix**:
1. Click "Samtal" button in header
2. Click "Visa kundfrågor" to toggle it ON
3. Status should show "PÅ" (green text)

### Issue 3: No segments being created
**Symptom**: Console shows "Segments count: 0" even during demo playback.

**Cause**: Demo mode might not be running or segments not being added to store.

**Fix**:
1. Ensure you're in demo/mock mode (check if Azure key is configured)
2. Check that `useMockSpeechRecognition` is being used
3. Verify `addFinalTranscript` is being called (check [sessionStore.ts](src/store/sessionStore.ts#L178))

### Issue 4: API returns empty array
**Symptom**: API call succeeds (200 OK) but returns `{ extractedAnswers: [] }`

**Possible causes:**
- Transcript text is too short or doesn't contain customer information
- All questions are already answered
- Claude couldn't extract any information with high enough confidence

**Fix**:
- Check the transcript content being sent to the API
- Ensure demo script contains rich customer information
- Check API logs for Claude's reasoning

## Testing Checklist

Before testing, ensure:

- [ ] `.env` contains valid `ANTHROPIC_API_KEY`
- [ ] Backend server is running (`npm run dev:vercel` or `npm run dev:full`)
- [ ] Browser console is open (F12) to see debug messages
- [ ] Questionnaire panel is visible (toggle is ON)
- [ ] Demo script selected is "Copilot Success Story" (has rich customer data)

**Test procedure:**
1. Navigate to app homepage
2. Click "Samtal" → "Visa kundfrågor" (turn ON)
3. Click "Samtal" → "Samtal" (start call view)
4. Click microphone button to start demo
5. Watch browser console for debug messages
6. Wait for 5 segments to be created
7. Check if questionnaire fields are being filled with purple "AI-ifylld" badges

## Production Deployment

When deploying to Vercel:

1. **Add environment variable** in Vercel Dashboard:
   - Go to Project Settings → Environment Variables
   - Add `ANTHROPIC_API_KEY` with your API key
   - Apply to Production, Preview, and Development environments

2. **No code changes needed** - the `/api` folder works automatically on Vercel

3. **Test in preview deployment** before promoting to production

## Additional Resources

- **Anthropic API Docs**: https://docs.anthropic.com/
- **Vercel Functions Docs**: https://vercel.com/docs/functions
- **AI Auto-fill Documentation**: [AI_QUESTIONNAIRE_AUTOFILL.md](AI_QUESTIONNAIRE_AUTOFILL.md)

## Still Not Working?

If you've followed all steps and it still doesn't work:

1. **Check server logs** for errors (in terminal running `dev:vercel` or `dev:api`)
2. **Check browser console** for complete error stack traces
3. **Test API directly** with curl command above
4. **Verify Anthropic API key** is valid and has credits
5. **Check if demo script is actually running** (should see transcript appearing)

---

**Last Updated**: 2026-02-01
**Status**: Debugging in progress
