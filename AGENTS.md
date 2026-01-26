# Agent Guidelines for Ramp Dashboard

## Project Overview
Next.js 15 dashboard for Ramp expense management. Deployed on Vercel (Pro plan).

## Tech Stack
- Next.js 15 (App Router), React 19, TypeScript
- TailwindCSS for styling
- AG Grid for data tables
- Ramp API integration (OAuth 2.0)

## Key Directories
```
src/app/           # Pages and API routes
src/app/api/       # API endpoints (ramp/, cron/)
src/components/    # React components
src/lib/           # Utilities, API clients
public/            # Static assets
```

## Commands
```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run lint       # ESLint
```

## Environment Variables
See `.env.example` for required vars. Demo mode works without Ramp credentials.

## Conventions
- Use TypeScript strictly
- Follow existing component patterns
- API routes go in `src/app/api/`
- Keep components in `src/components/`

## Coordination Rules
To avoid conflicts when multiple agents work in parallel:
1. **Claim your area** - State which files/features you're working on
2. **Avoid shared files** - Don't edit the same file simultaneously
3. **Use feature branches** - Branch from main, merge via PR
4. **Small, focused changes** - One feature per branch

## Testing Changes
Always run `npm run build` before committing to catch type errors.

## Deployment
Push to `main` triggers Vercel deploy. Cron job runs daily at 6am UTC.
