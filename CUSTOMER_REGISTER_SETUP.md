# Customer Register MVP - Setup Instructions

## 📋 Overview

This guide explains how to apply the database migration and set up the Customer Register MVP feature.

## 🗄️ Database Migration

### Step 1: Apply the Migration

You have two options to apply the migration:

#### Option A: Supabase Dashboard (Recommended)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `jiphhmofozuewfdnjfjy`
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the contents of `/supabase/migrations/20260201_create_customer_register.sql`
6. Paste into the SQL editor
7. Click **Run** (or press Cmd/Ctrl + Enter)
8. Verify success: You should see "Success. No rows returned"

#### Option B: Supabase CLI

```bash
# Make sure you're in the project directory
cd /Users/ola/Documents/SalesCoach/b3-sales-coach

# Apply the migration
npx supabase db push --db-url "postgresql://postgres.jiphhmofozuewfdnjfjy:Husman65!@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"
```

### Step 2: Verify Migration

After applying the migration, verify the tables were created:

```sql
-- Run this in Supabase SQL Editor to verify
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('accounts', 'contacts', 'interactions', 'questionnaire_answers')
ORDER BY table_name;
```

You should see all 4 tables listed.

### Step 3: Verify call_sessions Update

```sql
-- Verify new columns were added to call_sessions
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'call_sessions'
  AND column_name IN ('account_id', 'contact_id', 'interaction_id')
ORDER BY column_name;
```

You should see the 3 new foreign key columns.

---

## 🎯 What Was Created

### New Tables

1. **accounts** - Companies/Organizations
   - Stores company information
   - Links to user who owns the account
   - Auto-calculates data completeness (0-100%)

2. **contacts** - Contact persons at companies
   - Linked to accounts
   - Supports primary contact and decision maker flags

3. **interactions** - All customer interactions
   - Tracks calls, meetings, emails, demos, etc.
   - Links to both accounts and contacts
   - Stores outcome and follow-up actions

4. **questionnaire_answers** - Persistent questionnaire data
   - Stores all 25 questionnaire answers
   - Tracks source (manual, AI auto-fill, live analysis)
   - Supports versioning for future updates
   - Links to both accounts and call sessions

### Updated Tables

- **call_sessions** - Added foreign keys:
  - `account_id` - Links to accounts table
  - `contact_id` - Links to contacts table
  - `interaction_id` - Links to interactions table

---

## 🔐 Security

All tables have Row Level Security (RLS) enabled with policies that ensure:
- Users can only see their own data
- Users can create, update, and delete their own records
- No cross-user data access

---

## 📊 Database Features

### Auto-Update Triggers

- `updated_at` columns automatically update on record changes
- `data_completeness` on accounts auto-calculates when records are saved

### Indexes

All tables have optimized indexes for:
- Foreign key lookups
- Common queries (by status, date, etc.)
- Full-text search readiness

### Helper Functions

- `calculate_account_completeness(account_uuid)` - Calculates data completeness percentage
- `update_account_completeness()` - Trigger function that auto-updates completeness

---

## 🧪 Testing the Migration

After applying the migration, test that everything works:

### Test 1: Create an Account

```sql
INSERT INTO accounts (user_id, company_name, industry, company_size)
VALUES (
  auth.uid(), -- Your user ID
  'Test Company AB',
  'Technology',
  '51-200'
);
```

### Test 2: Verify Data Completeness

```sql
SELECT company_name, data_completeness
FROM accounts
WHERE user_id = auth.uid();
```

You should see a completeness percentage calculated automatically.

### Test 3: Create a Contact

```sql
INSERT INTO contacts (
  account_id,
  user_id,
  first_name,
  last_name,
  role,
  is_primary,
  is_decision_maker
)
SELECT
  id,
  auth.uid(),
  'Anna',
  'Andersson',
  'VD',
  true,
  true
FROM accounts
WHERE company_name = 'Test Company AB'
LIMIT 1;
```

### Test 4: Verify RLS Policies

```sql
-- This should only show YOUR accounts, not other users'
SELECT * FROM accounts;
SELECT * FROM contacts;
SELECT * FROM interactions;
SELECT * FROM questionnaire_answers;
```

---

## 🚀 Next Steps

After the migration is applied:

1. ✅ Database schema is ready
2. ✅ API endpoints are created (`/api/save-questionnaire-answers`, `/api/load-questionnaire-answers`)
3. ⏳ Frontend integration (auto-save, account selector, dashboard) - In progress

---

## ⚠️ Troubleshooting

### Error: "relation already exists"

If you see this error, the migration was already applied. You can skip it or drop the tables first:

```sql
DROP TABLE IF EXISTS questionnaire_answers CASCADE;
DROP TABLE IF EXISTS interactions CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
```

Then re-run the migration.

### Error: "column already exists" for call_sessions

If the foreign key columns already exist on call_sessions:

```sql
ALTER TABLE call_sessions DROP COLUMN IF EXISTS account_id;
ALTER TABLE call_sessions DROP COLUMN IF EXISTS contact_id;
ALTER TABLE call_sessions DROP COLUMN IF EXISTS interaction_id;
```

Then re-run the migration.

### Verify Supabase Service Role Key

Make sure your `.env` file has the correct `SUPABASE_SERVICE_ROLE_KEY`:

```bash
# Should be in .env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📚 Documentation

For more details, see:
- `KUNDDATA_ARKITEKTUR.md` - Current architecture analysis
- `KUNDREGISTER_DESIGN.md` - Complete design specification
- `/supabase/migrations/20260201_create_customer_register.sql` - Full migration SQL

---

## ✅ Migration Checklist

- [ ] Backed up database (recommended)
- [ ] Applied migration via Supabase Dashboard or CLI
- [ ] Verified all 4 tables created successfully
- [ ] Verified call_sessions has new foreign keys
- [ ] Tested creating an account
- [ ] Tested RLS policies work correctly
- [ ] Restarted backend server (`npm run dev:full`)
- [ ] Ready to implement frontend features!

---

**Created:** 2026-02-01
**Status:** Ready to apply
