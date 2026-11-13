# GetFinance

An online loan application platform: personal, home and business loans, with a guided
10-step application, document upload, eligibility checks and e-signature.

> Demonstration project. Rates, decisions and verifications are illustrative.

## Tech stack

Next.js (App Router), React, TypeScript, Tailwind CSS, react-hook-form, zod.
Tests: Vitest (unit) and Playwright (end-to-end, accessibility).

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run lint` | Check code style |
| `npm test` | Run unit tests |
| `npm run e2e` | Run end-to-end tests |