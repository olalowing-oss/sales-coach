-- Simple fix: Ensure UPDATE policy exists for training_scenarios
-- Run this in Supabase SQL Editor

-- Drop any existing UPDATE policies
DROP POLICY IF EXISTS "Users can update their scenarios" ON training_scenarios;
DROP POLICY IF EXISTS "Users can update scenarios" ON training_scenarios;
DROP POLICY IF EXISTS "Users can update their own scenarios" ON training_scenarios;

-- Create a simple UPDATE policy
CREATE POLICY "Users can update their own scenarios"
  ON training_scenarios
  FOR UPDATE
  USING (user_id = auth.uid());

-- Test the update works
-- UPDATE training_scenarios
-- SET voice_name = 'sv-SE-MattiasNeural'
-- WHERE id = '966612ca-ddab-4db7-b976-cea477e66dfb';

-- Verify
-- SELECT id, name, voice_name FROM training_scenarios
-- WHERE id = '966612ca-ddab-4db7-b976-cea477e66dfb';
