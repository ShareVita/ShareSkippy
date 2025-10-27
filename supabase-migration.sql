-- Supabase Database Migration Script
-- This script will clean up your Supabase database to match your working code

-- ⚠️ IMPORTANT: Run this in STAGING first, then production
-- ⚠️ BACKUP your database before running this script

-- Step 1: Check current state
-- Run this first to see what you have
SELECT 
  'Current profiles table structure:' as info,
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- Step 2: Check if old emergency_contact field has data
SELECT 
  'Data in old emergency_contact field:' as info,
  COUNT(*) as total_rows,
  COUNT(emergency_contact) as non_null_values
FROM profiles 
WHERE emergency_contact IS NOT NULL AND emergency_contact != '';

-- Step 3: Check if count_words function exists
SELECT 
  'count_words function status:' as info,
  routine_name, 
  routine_type
FROM information_schema.routines 
WHERE routine_name = 'count_words';

-- Step 4: Data migration (if needed)
-- Only run this if you have data in the old emergency_contact field
-- Adjust the parsing logic based on your data format

-- Example: If emergency_contact contains "Name|Phone|Email" format
/*
UPDATE profiles 
SET 
  emergency_contact_name = CASE 
    WHEN emergency_contact IS NOT NULL AND emergency_contact != '' 
    THEN split_part(emergency_contact, '|', 1)
    ELSE emergency_contact_name
  END,
  emergency_contact_number = CASE 
    WHEN emergency_contact IS NOT NULL AND emergency_contact != '' 
    THEN split_part(emergency_contact, '|', 2)
    ELSE emergency_contact_number
  END,
  emergency_contact_email = CASE 
    WHEN emergency_contact IS NOT NULL AND emergency_contact != '' 
    THEN split_part(emergency_contact, '|', 3)
    ELSE emergency_contact_email
  END
WHERE emergency_contact IS NOT NULL 
AND emergency_contact != '';
*/

-- Step 5: Create count_words function (if it doesn't exist)
CREATE OR REPLACE FUNCTION count_words(text_input TEXT)
RETURNS INTEGER AS $$
BEGIN
  IF text_input IS NULL OR trim(text_input) = '' THEN
    RETURN 0;
  END IF;
  RETURN array_length(string_to_array(trim(text_input), ' '), 1);
END;
$$ LANGUAGE plpgsql;

-- Step 6: Remove old emergency_contact field
-- ⚠️ Only run this after confirming data migration worked
-- ALTER TABLE profiles DROP COLUMN IF EXISTS emergency_contact;

-- Step 7: Verify final structure
SELECT 
  'Final profiles table structure:' as info,
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- Step 8: Test count_words function
SELECT 
  'Testing count_words function:' as info,
  count_words('This is a test sentence') as test_result;

-- Step 9: Verify no old field references
SELECT 
  'Checking for old field references:' as info,
  COUNT(*) as profiles_with_old_field
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'emergency_contact';

-- Expected result: 0 (field should be removed)
