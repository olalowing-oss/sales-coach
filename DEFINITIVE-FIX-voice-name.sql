-- DEFINITIVE FIX för voice_name UPDATE problem
-- Detta kommer garanterat att fixa problemet
-- Kör detta i Supabase SQL Editor

-- Steg 1: Kolla nuvarande status
SELECT 'Current UPDATE policies:' as step;
SELECT policyname, cmd, qual::text as using_clause, with_check::text as with_check_clause
FROM pg_policies
WHERE tablename = 'training_scenarios' AND cmd = 'UPDATE';

-- Steg 2: TA BORT ALLA UPDATE policies (för att börja rent)
SELECT 'Dropping all UPDATE policies...' as step;
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'training_scenarios' AND cmd = 'UPDATE'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON training_scenarios', pol.policyname);
        RAISE NOTICE 'Dropped policy: %', pol.policyname;
    END LOOP;
END $$;

-- Steg 3: Skapa EN NY simpel UPDATE policy
SELECT 'Creating new UPDATE policy...' as step;
CREATE POLICY "allow_user_update_scenarios"
ON training_scenarios
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Steg 4: Verifiera att policyn skapades
SELECT 'Verification - New UPDATE policy:' as step;
SELECT policyname, cmd, roles, permissive
FROM pg_policies
WHERE tablename = 'training_scenarios' AND cmd = 'UPDATE';

-- Steg 5: Testa uppdateringen direkt (uncomment för att testa)
/*
UPDATE training_scenarios
SET voice_name = 'sv-SE-MattiasNeural'
WHERE id = '966612ca-ddab-4db7-b976-cea477e66dfb'
  AND user_id = auth.uid();

-- Verifiera:
SELECT id, name, voice_name
FROM training_scenarios
WHERE id = '966612ca-ddab-4db7-b976-cea477e66dfb';
*/

SELECT 'Done! Try updating voice_name again in the UI.' as step;
