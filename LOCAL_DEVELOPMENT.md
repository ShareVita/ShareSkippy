# 🚀 Local Development Setup Guide

Welcome to the ShareSkippy development team! This guide will help you get the project running on your computer. Don't worry if you're new to this - we'll walk through everything step by step! 🌟

## 📋 Prerequisites

Before you start, make sure you have these installed on your computer:

1. **Node.js** (version 20.11.1 or higher)
   - Check if you have it: `node --version`
   - Download from: https://nodejs.org/

2. **Git** (for version control)
   - Check if you have it: `git --version`
   - Download from: https://git-scm.com/

3. **A code editor** (we recommend VS Code)
   - Download from: https://code.visualstudio.com/

## 🎯 Step 1: Clone the Repository

```bash
# Clone the repo to your computer
git clone https://github.com/YOUR_USERNAME/ShareSkippy.git

# Navigate into the project folder
cd ShareSkippy
```

## 📦 Step 2: Install Dependencies

This will download all the packages the project needs:

```bash
npm install
```

This might take a few minutes. Grab a coffee! ☕

## 🔐 Step 3: Set Up Environment Variables

Environment variables are like secret configuration settings for your app.

1. **Copy the example file:**

   ```bash
   cp .env.example .env.local
   ```

2. **Fill in the values in `.env.local`:**
   - Ask your team lead for the development credentials
   - Or use your own Supabase/Resend accounts for testing

**IMPORTANT:** Never share `.env.local` or commit it to Git! It contains secrets.

## 🗄️ Step 4: Set Up Supabase

We use Supabase for our database. You have two options:

### Option A: Use Shared Development Database (Recommended for Beginners)

Ask your team lead for:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Add these to your `.env.local` file.

### Option B: Use Your Own Supabase Project (For Testing)

1. Go to https://supabase.com and create a free account
2. Create a new project
3. Go to Settings → API
4. Copy the URL and keys to your `.env.local`
5. Run the database migrations (see database setup below)

## 📧 Step 5: Email Setup (Optional for Most Features)

If you need to test email functionality:

1. Sign up at https://resend.com (free tier available)
2. Get your API key
3. Add `RESEND_API_KEY` to `.env.local`

Most features work without this!

## 🚀 Step 6: Start the Development Server

```bash
npm run dev
```

Your app should now be running at **http://localhost:3000** 🎉

Open this URL in your browser to see the app!

## ✅ Step 7: Verify Everything Works

Run these commands to make sure everything is set up correctly:

```bash
# Check code formatting
npm run format:check

# Check for code quality issues
npm run lint

# Run TypeScript checks
npm run typecheck

# Run tests
npm test
```

If all of these pass ✅, you're ready to code!

## 🛠️ Daily Development Workflow

### 1. Before You Start Coding

```bash
# Make sure you have the latest code
git pull origin main

# Install any new dependencies
npm install
```

### 2. Create a New Branch

**NEVER code directly on the `main` branch!** Always create a feature branch:

```bash
# Create and switch to a new branch
git checkout -b feature/your-feature-name

# Examples:
# git checkout -b feature/add-dark-mode
# git checkout -b fix/login-bug
```

### 3. Make Your Changes

- Write your code
- Test it locally: `npm run dev`
- Make sure it works!

### 4. Test Your Code

Before committing, run all checks:

```bash
# Run all quality checks at once
npm run validate
```

This runs:

- Prettier (formatting)
- ESLint (code quality)
- TypeScript (type checking)
- Jest (tests)

Fix any errors before proceeding!

### 5. Commit Your Changes

```bash
# Stage your changes
git add .

# Commit with a clear message
git commit -m "Add feature: description of what you did"
```

**Note:** Pre-commit hooks will automatically run linting and formatting!

### 6. Push and Create a Pull Request

```bash
# Push your branch to GitHub
git push origin feature/your-feature-name
```

Then:

1. Go to GitHub
2. Click "Compare & pull request"
3. Fill in the PR template
4. Request a review from a team member
5. Wait for CI checks to pass ✅

## 🧪 Testing

### Writing Tests

We use Jest and React Testing Library. Example test:

```javascript
// __tests__/components/MyComponent.test.js
import { render, screen } from '@testing-library/react';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (great for development!)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## 🐛 Common Issues & Solutions

### Issue: `npm install` fails

**Solution:** Make sure you're using Node.js 20.11.1:

```bash
node --version
```

If not, install the correct version using nvm or download from nodejs.org

### Issue: Port 3000 is already in use

**Solution:** Kill the process using port 3000:

```bash
# On Mac/Linux:
lsof -ti:3000 | xargs kill -9

# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

### Issue: Environment variables not loading

**Solution:**

1. Make sure you have `.env.local` (not `.env`)
2. Restart the dev server: `npm run dev`
3. Check for typos in variable names

### Issue: Database connection errors

**Solution:**

1. Check your Supabase credentials in `.env.local`
2. Make sure your Supabase project is active
3. Ask your team lead to verify your access

### Issue: ESLint errors blocking commit

**Solution:**

```bash
# Auto-fix most issues
npm run lint:fix

# Format all files
npm run format
```

## 📚 Useful Commands Reference

| Command             | What It Does                         |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Start development server             |
| `npm run build`     | Build for production                 |
| `npm run lint`      | Check code quality                   |
| `npm run lint:fix`  | Fix code quality issues              |
| `npm run format`    | Format all files                     |
| `npm run typecheck` | Check TypeScript types               |
| `npm test`          | Run tests                            |
| `npm run validate`  | Run all checks (use before pushing!) |

## 🤝 Getting Help

Stuck? Don't worry! Here's what to do:

1. **Check this guide first** - most common issues are covered
2. **Search existing GitHub issues** - someone might have had the same problem
3. **Ask in the team chat** - we're here to help!
4. **Create a GitHub issue** - if it's a bug or unclear documentation

## 📖 Learning Resources

New to Next.js, React, or web development? Check these out:

- **Next.js:** https://nextjs.org/learn
- **React:** https://react.dev/learn
- **TypeScript:** https://www.typescriptlang.org/docs/
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Supabase:** https://supabase.com/docs

## 🎉 You're Ready!

Congratulations! You're all set up and ready to contribute. Remember:

- 🌿 Always work on a feature branch
- ✅ Run `npm run validate` before pushing
- 💬 Ask questions when you're stuck
- 🚀 Have fun coding!

Welcome to the team! 🎊
