# Supabase Database Migration Plan

## 🎯 **Goal: Make Supabase Schema Match Working Code**

Your Supabase database should match what your working code expects, not the other way around.

## 🔍 **Current State Analysis**

### What Your Code Expects (Working Structure)
```sql
-- Profiles table with separate emergency contact fields
CREATE TABLE profiles (
  id uuid PRIMARY KEY,
  email text,
  first_name text,
  last_name text,
  phone_number text,
  role text,
  emergency_contact_name text,      -- ✅ Separate fields
  emergency_contact_number text,   -- ✅ Separate fields
  emergency_contact_email text,    -- ✅ Separate fields
  bio text,
  -- ... other fields
);

-- Reviews table with count_words function
CREATE TABLE reviews (
  -- ... other fields
  comment text NOT NULL CHECK (count_words(comment) >= 5),  -- ✅ Function exists
  -- ... other fields
);

-- Function definition
CREATE OR REPLACE FUNCTION count_words(text_input TEXT)
RETURNS INTEGER AS $$
BEGIN
  IF text_input IS NULL OR trim(text_input) = '' THEN
    RETURN 0;
  END IF;
  RETURN array_length(string_to_array(trim(text_input), ' '), 1);
END;
$$ LANGUAGE plpgsql;
```

### What Your Supabase Export Shows (Problematic Structure)
```sql
-- Profiles table with old emergency contact field
CREATE TABLE profiles (
  id uuid PRIMARY KEY,
  email text,
  role text,
  emergency_contact text,          -- ❌ Old single field
  -- ... other fields
  first_name text,
  last_name text,
  phone_number text,
  emergency_contact_name text,      -- ❌ Duplicate fields
  emergency_contact_number text,    -- ❌ Duplicate fields
  emergency_contact_email text,    -- ❌ Duplicate fields
  -- ... other fields
);
```

## 🚨 **The Problem**

Your Supabase database has **both** old and new field structures:
- `emergency_contact` (old, single field)
- `emergency_contact_name/number/email` (new, separate fields)

This creates confusion and potential data inconsistency.

## 🔧 **Migration Strategy**

### Step 1: Data Migration (if needed)
If you have data in the old `emergency_contact` field, migrate it to the new separate fields:

```sql
-- Check if old field has data
SELECT id, emergency_contact 
FROM profiles 
WHERE emergency_contact IS NOT NULL 
AND emergency_contact != '';

-- If data exists, migrate it (example - adjust based on your data format)
UPDATE profiles 
SET 
  emergency_contact_name = split_part(emergency_contact, '|', 1),
  emergency_contact_number = split_part(emergency_contact, '|', 2),
  emergency_contact_email = split_part(emergency_contact, '|', 3)
WHERE emergency_contact IS NOT NULL 
AND emergency_contact != '';
```

### Step 2: Remove Old Field
After data migration, remove the old field:

```sql
-- Remove the old emergency_contact field
ALTER TABLE profiles DROP COLUMN IF EXISTS emergency_contact;
```

### Step 3: Ensure Function Exists
Make sure the `count_words` function exists:

```sql
-- Create or replace the count_words function
CREATE OR REPLACE FUNCTION count_words(text_input TEXT)
RETURNS INTEGER AS $$
BEGIN
  IF text_input IS NULL OR trim(text_input) = '' THEN
    RETURN 0;
  END IF;
  RETURN array_length(string_to_array(trim(text_input), ' '), 1);
END;
$$ LANGUAGE plpgsql;
```

### Step 4: Verify Structure
Run this query to verify your database structure matches your code:

```sql
-- Check profiles table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Check if count_words function exists
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name = 'count_words';
```

## 📋 **Migration Checklist**

### Before Migration
- [ ] **Backup your database** - Always backup before schema changes
- [ ] **Test in staging** - Don't run migrations directly in production
- [ ] **Check for data** - Verify if old fields contain important data
- [ ] **Plan rollback** - Know how to undo changes if needed

### During Migration
- [ ] **Run data migration** - Move data from old fields to new fields
- [ ] **Remove old fields** - Drop the old `emergency_contact` field
- [ ] **Create functions** - Ensure `count_words` function exists
- [ ] **Test functionality** - Verify all features work

### After Migration
- [ ] **Run validation** - Use `npm run validate-schema`
- [ ] **Test all features** - Profile editing, messaging, reviews
- [ ] **Update documentation** - Ensure schema docs are accurate
- [ ] **Export new schema** - Get clean export for future reference

## 🚀 **Recommended Approach**

### Option 1: Gradual Migration (Recommended)
1. **Keep both fields temporarily** - Don't break existing functionality
2. **Update code to use new fields** - Ensure all code uses separate fields
3. **Migrate data** - Move data from old to new fields
4. **Remove old field** - After confirming everything works
5. **Clean up** - Remove any references to old field

### Option 2: Direct Migration (Faster but Riskier)
1. **Backup database** - Full backup before changes
2. **Run migration script** - Data migration + field removal
3. **Test immediately** - Verify everything works
4. **Rollback if needed** - Use backup if issues occur

## ⚠️ **Important Considerations**

### Data Safety
- **Always backup before migrations**
- **Test in staging environment first**
- **Have rollback plan ready**
- **Verify data integrity after migration**

### Code Compatibility
- **Ensure all code uses new field structure**
- **Update any hardcoded field references**
- **Test all API endpoints**
- **Verify frontend functionality**

### Team Communication
- **Notify team before migration**
- **Schedule maintenance window if needed**
- **Have support ready during migration**
- **Document any issues encountered**

## 🎯 **Expected Outcome**

After successful migration:
- ✅ **Clean database schema** - No duplicate or conflicting fields
- ✅ **Consistent with code** - Database matches what code expects
- ✅ **No confusion** - Clear field structure
- ✅ **Future-proof** - Easier to maintain and extend

## 📞 **Next Steps**

1. **Review this plan** with your team
2. **Choose migration approach** (gradual vs direct)
3. **Create migration scripts** based on your data
4. **Test in staging** before production
5. **Execute migration** during low-traffic period
6. **Validate results** using our validation tools

Remember: **The goal is to make your Supabase database match your working code, not the other way around!**
