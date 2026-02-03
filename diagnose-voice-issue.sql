-- Diagnostic queries to understand why voice_name doesn't update
-- Run these in Supabase SQL Editor

-- 1. Check if voice_name column exists
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'training_scenarios'
  AND column_name = 'voice_name';

-- 2. Check all RLS policies on training_scenarios
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  CASE WHEN qual IS NOT NULL THEN 'Has USING clause' ELSE 'No USING clause' END as using_check,
  CASE WHEN with_check IS NOT NULL THEN 'Has WITH CHECK clause' ELSE 'No WITH CHECK clause' END as with_check_clause
FROM pg_policies
WHERE tablename = 'training_scenarios'
ORDER BY cmd, policyname;

-- 3. Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'training_scenarios';

-- 4. Try a manual update (will show if it's a permissions issue)
-- Uncomment and run this to test:
/*
UPDATE training_scenarios
SET voice_name = 'sv-SE-MattiasNeural'
WHERE id = '966612ca-ddab-4db7-b976-cea477e66dfb'
  AND user_id = auth.uid();

-- Then verify:
SELECT id, name, voice_name
FROM training_scenarios
WHERE id = '966612ca-ddab-4db7-b976-cea477e66dfb';
*/

-- 5. Check for triggers that might interfere
SELECT
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'training_scenarios';
