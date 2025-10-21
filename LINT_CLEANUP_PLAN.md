# 🧹 ESLint Cleanup Plan

## Current Status

As of the workflow setup, we have approximately:

- **300 total lint issues** across the codebase
- **101 errors** (critical issues)
- **199 warnings** (code quality improvements)

## 🎯 Strategy

Rather than blocking development to fix all issues at once, we'll adopt an **incremental cleanup approach**:

### Phase 1: Prevent New Issues ✅ (DONE)

- ✅ ESLint configured with comprehensive rules
- ✅ Pre-commit hooks catch issues before commit
- ✅ CI pipeline blocks PRs with lint errors
- ✅ All new code must pass linting

### Phase 2: Fix Critical Errors (In Progress)

Priority order for fixing errors:

1. **Accessibility Issues** (~15 errors)
   - `jsx-a11y/label-has-associated-control` - Forms missing proper labels
   - `jsx-a11y/anchor-is-valid` - Anchors used as buttons
   - `jsx-a11y/click-events-have-key-events` - Missing keyboard support
2. **Code Quality Errors** (~10 errors)
   - `prefer-const` - Variables that should be constants
   - `react/no-unescaped-entities` - HTML entities not escaped
3. **Next.js Best Practices** (~76 errors)
   - `@next/next/no-img-element` - Using `<img>` instead of `<Image />`

### Phase 3: Address Warnings (Ongoing)

These can be fixed over time as files are touched:

1. **Import Order** (~80 warnings)
   - Auto-fixable with `npm run lint:fix`
   - Not critical but improves consistency

2. **Unused Variables** (~40 warnings)
   - Clean up as you work on each file
   - Mark intentionally unused with `_` prefix

3. **React Hooks Dependencies** (~30 warnings)
   - Review each case carefully
   - Some may be intentional, others need fixing

4. **Console Statements** (~50 warnings)
   - Replace with proper logging in production code
   - Keep for debugging temporarily

## 📝 How to Contribute to Cleanup

### For New Code

All new code must pass linting with **zero errors**:

```bash
npm run lint
```

Pre-commit hooks will enforce this automatically.

### For Existing Files

When you edit an existing file, try to fix lint issues in that file:

1. **Check issues in your file:**

   ```bash
   npm run lint -- path/to/your/file.js
   ```

2. **Auto-fix what you can:**

   ```bash
   npm run lint:fix
   ```

3. **Manually fix remaining issues**

4. **Commit the cleanup separately:**
   ```bash
   git commit -m "chore: fix lint issues in MyComponent"
   ```

### Cleanup Sprints

We'll occasionally dedicate time to fixing lint issues:

- **Sprint 1:** Fix all accessibility errors (label, anchor issues)
- **Sprint 2:** Convert `<img>` to `<Image />`
- **Sprint 3:** Clean up unused variables
- **Sprint 4:** Fix import orders project-wide

## 🎓 Common Issues & How to Fix

### Issue 1: `label-has-associated-control`

**Problem:**

```jsx
// ❌ Bad
<label>
  Email
  <input type="text" />
</label>
```

**Solution:**

```jsx
// ✅ Good
<label htmlFor="email">
  Email
</label>
<input id="email" type="text" />
```

### Issue 2: `no-img-element`

**Problem:**

```jsx
// ❌ Bad
<img src="/photo.jpg" alt="Photo" />
```

**Solution:**

```jsx
// ✅ Good
import Image from 'next/image';

<Image src="/photo.jpg" alt="Photo" width={500} height={300} />;
```

### Issue 3: `prefer-const`

**Problem:**

```javascript
// ❌ Bad
let result = calculateTotal();
return result;
```

**Solution:**

```javascript
// ✅ Good
const result = calculateTotal();
return result;
```

### Issue 4: Unused Variables

**Problem:**

```javascript
// ❌ Bad
const { data, error } = await fetchData();
return data;
```

**Solution:**

```javascript
// ✅ Good - prefix with _ if intentionally unused
const { data, error: _error } = await fetchData();
return data;
```

### Issue 5: Import Order

**Problem:**

```javascript
// ❌ Bad
import { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
```

**Solution:**

```javascript
// ✅ Good - auto-fixable with lint:fix
import axios from 'axios';
import Link from 'next/link';
import { useState } from 'react';
```

## 📊 Tracking Progress

We'll track cleanup progress in GitHub Issues:

- Create issues for each cleanup sprint
- Label with `tech-debt` and `good first issue`
- Celebrate progress! 🎉

### Current Breakdown by Category

| Category           | Errors | Warnings | Priority    |
| ------------------ | ------ | -------- | ----------- |
| Accessibility      | 15     | 20       | High ⭐⭐⭐ |
| Image Optimization | 76     | 0        | Medium ⭐⭐ |
| Code Quality       | 10     | 50       | Medium ⭐⭐ |
| Import Order       | 0      | 80       | Low ⭐      |
| Unused Variables   | 0      | 40       | Low ⭐      |
| Console Statements | 0      | 50       | Low ⭐      |

## 🎯 Goals

- **Short term (1 month):** Fix all accessibility errors
- **Medium term (3 months):** Reduce errors to zero
- **Long term (6 months):** Reduce warnings by 50%

## 💡 Tips

1. **Don't try to fix everything at once** - Incremental progress is better
2. **Fix issues in files you're already working on** - Opportunistic cleanup
3. **Use `npm run lint:fix` liberally** - Auto-fix what you can
4. **Ask for help** - Some lint issues need discussion
5. **Keep PRs focused** - Separate cleanup commits from feature work

## 🚫 What NOT to Do

- ❌ Don't disable ESLint rules without discussion
- ❌ Don't commit `// eslint-disable` comments without good reason
- ❌ Don't let new code add to the technical debt
- ❌ Don't feel pressured to fix everything immediately

## ✅ Success Criteria

We'll know we're successful when:

- New code has zero lint errors
- Existing errors trend downward over time
- The team finds linting helpful, not annoying
- Code quality improves measurably

---

**Remember:** This is a marathon, not a sprint. Every fixed issue makes the codebase better! 🎉
