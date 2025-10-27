# Database Schema Documentation

## ⚠️ CRITICAL: Schema File Rules

**NEVER update `database_schema.sql` to match Supabase exports without validation!**

### Why This Matters
- Your Supabase exports may show transitional states (old + new fields)
- Your working code expects specific field structures
- Schema mismatches break the entire application

### The Golden Rule
**The schema file should match what your WORKING CODE expects, not what Supabase exports show.**

## Current Working Schema Structure

### Profiles Table (CRITICAL FIELDS)
```sql
-- ✅ CORRECT - What your code expects:
emergency_contact_name TEXT,
emergency_contact_number TEXT, 
emergency_contact_email TEXT,

-- ❌ WRONG - What Supabase export might show:
emergency_contact TEXT,
```

### Reviews Table
```sql
-- ✅ CORRECT - Must have count_words function:
comment TEXT NOT NULL CHECK (count_words(comment) >= 5),

-- ✅ REQUIRED - Function definition:
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

## Validation Process

### Before Any Schema Changes:
1. **Run validation**: `node validate-schema.js`
2. **Test locally**: Ensure all features work
3. **Deploy to staging**: Test in production-like environment
4. **Only then deploy**: To production

### Schema Update Checklist:
- [ ] Validation script passes
- [ ] All API endpoints work
- [ ] Profile editing works
- [ ] Messaging works
- [ ] Reviews work
- [ ] No JavaScript errors in console

## Common Mistakes to Avoid

1. **Don't trust Supabase exports blindly** - they may show transitional states
2. **Don't remove functions** that your code depends on (like `count_words`)
3. **Don't change field names** without updating all code references
4. **Don't change data types** without ensuring compatibility

## Emergency Recovery

If schema changes break the site:
1. **Revert immediately**: `git reset --hard <previous-working-commit>`
2. **Force push**: `git push origin <branch> --force`
3. **Redeploy**: `vercel --prod`
4. **Validate**: Run validation script

## Files to Never Touch Without Validation

- `database_schema.sql` - Core schema definition
- `app/profile/edit/page.js` - Profile field expectations
- `app/api/messages/route.js` - Message field expectations
- `app/api/community/profiles/route.js` - Profile query expectations

Remember: **Working code is the source of truth, not schema exports!**
