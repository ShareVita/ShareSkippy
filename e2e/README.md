# 🎭 E2E Tests with Playwright

This directory contains end-to-end (E2E) tests that verify the application works correctly from a user's perspective.

## 📖 What are E2E Tests?

E2E tests simulate real user interactions with your application:

- Clicking buttons
- Filling out forms
- Navigating between pages
- Checking that the right content appears

They're different from unit tests because they test the whole application, not just individual pieces.

## 🚀 Running E2E Tests

### Run all tests (headless mode)

```bash
npm run test:e2e
```

### Run tests with UI (see what's happening)

```bash
npm run test:e2e:ui
```

### Run tests in a specific browser

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Debug a test

```bash
npx playwright test --debug
```

## ✍️ Writing E2E Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test('test description', async ({ page }) => {
  // 1. Navigate to a page
  await page.goto('/');

  // 2. Interact with elements
  await page.click('button[type="submit"]');
  await page.fill('input[name="email"]', 'test@example.com');

  // 3. Check the results
  await expect(page.locator('.success-message')).toBeVisible();
});
```

### Common Actions

```typescript
// Navigation
await page.goto('/path');
await page.goBack();
await page.reload();

// Clicking
await page.click('button');
await page.locator('button').click();

// Typing
await page.fill('input', 'text');
await page.type('input', 'text', { delay: 100 });

// Selecting
await page.selectOption('select', 'value');
await page.check('input[type="checkbox"]');

// Waiting
await page.waitForSelector('.element');
await page.waitForLoadState('networkidle');
await page.waitForURL('**/path');

// Assertions
await expect(page).toHaveTitle('Title');
await expect(page).toHaveURL('url');
await expect(page.locator('button')).toBeVisible();
await expect(page.locator('button')).toHaveText('Click me');
```

### Finding Elements

```typescript
// By role (preferred - most accessible)
await page.getByRole('button', { name: 'Submit' });
await page.getByRole('link', { name: 'Home' });

// By label (for form inputs)
await page.getByLabel('Email address');

// By placeholder
await page.getByPlaceholder('Enter your name');

// By text
await page.getByText('Welcome!');

// By test ID (for elements without good semantic markup)
await page.getByTestId('submit-button');

// By CSS selector (use sparingly)
await page.locator('button.primary');
```

### Test Organization

```typescript
test.describe('Feature Name', () => {
  // Runs before each test in this describe block
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('test 1', async ({ page }) => {
    // Test code
  });

  test('test 2', async ({ page }) => {
    // Test code
  });
});
```

## 🎯 Best Practices

1. **Use semantic selectors** - Prefer `getByRole`, `getByLabel` over CSS selectors
2. **Test user flows** - Test complete user journeys, not just isolated actions
3. **Keep tests independent** - Each test should work on its own
4. **Use descriptive names** - Test names should clearly describe what they test
5. **Don't test implementation details** - Test what users see, not how it works internally
6. **Add data-testid sparingly** - Only when no better selector exists

### Good Test Example

```typescript
test('user can sign up successfully', async ({ page }) => {
  // Navigate to signup page
  await page.goto('/signup');

  // Fill in the form
  await page.getByLabel('Email').fill('user@example.com');
  await page.getByLabel('Password').fill('SecurePass123!');
  await page.getByLabel('Confirm Password').fill('SecurePass123!');

  // Submit the form
  await page.getByRole('button', { name: 'Sign Up' }).click();

  // Verify success
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByText('Welcome!')).toBeVisible();
});
```

## 📊 Viewing Test Results

After running tests, you can view the HTML report:

```bash
npx playwright show-report
```

This opens an interactive report showing:

- Which tests passed/failed
- Screenshots of failures
- Videos of test runs
- Detailed traces for debugging

## 🐛 Debugging Failed Tests

### 1. Run in UI mode

```bash
npm run test:e2e:ui
```

### 2. Run in debug mode

```bash
npx playwright test --debug
```

### 3. View trace

```bash
npx playwright show-trace trace.zip
```

### 4. Take screenshots

```typescript
await page.screenshot({ path: 'screenshot.png' });
```

## 📚 Learn More

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright Debugging](https://playwright.dev/docs/debug)
- [Locator Guide](https://playwright.dev/docs/locators)

## 🎉 Tips for Beginners

- Start with simple tests (like checking if a page loads)
- Use `.only` to run a single test: `test.only('my test', ...)`
- Use `.skip` to skip a test: `test.skip('my test', ...)`
- Run tests often to catch issues early
- Ask for help if you're stuck - E2E testing can be tricky!
