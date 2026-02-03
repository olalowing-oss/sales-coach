-- Fix RLS policy to allow updating voice_name
-- Run this in Supabase SQL Editor

-- First, check existing UPDATE policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'training_scenarios' AND cmd = 'UPDATE';

-- Drop existing UPDATE policy if it exists
DROP POLICY IF EXISTS "Users can update their scenarios" ON training_scenarios;
DROP POLICY IF EXISTS "Users can update scenarios" ON training_scenarios;

-- Create new UPDATE policy that allows all fields including voice_name
CREATE POLICY "Users can update their scenarios"
  ON training_scenarios
  FOR UPDATE
  USING (
    user_id = auth.uid()
    OR
    auth.uid() IN (
      SELECT user_id FROM user_products
      WHERE product_id = training_scenarios.product_id
        AND is_active = true
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    OR
    auth.uid() IN (
      SELECT user_id FROM user_products
      WHERE product_id = training_scenarios.product_id
        AND is_active = true
    )
  );

-- Verify the policy was created
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'training_scenarios' AND cmd = 'UPDATE';
