# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.
This is a full-stack Wellness Wallet mobile app built with Expo (React Native) and Express backend.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Mobile**: Expo (React Native) with Expo Router

## App Features

- Authentication: Login, Register, Email Verification
- Wallet Setup: Lock amount, period selection, goals
- Home Screen: Progress tracker, streak, activity stats, quick actions
- Wallet Screen: Balance, locked/unlocked funds, bonus points, transaction history
- Activity Screen: Steps tracking, workout logging, calendar view, connected apps
- Rewards Screen: Daily goals, weekly challenges, badges, partner discounts
- Settings Screen: Profile editing, notification toggles, tracking apps, plan info
- Edit Profile Screen: Update name, email, password, delete account

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── mobile/             # Expo React Native app
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Mobile App Colors

Teal/turquoise primary color (#4ECDC4), dark navy background (#1A1A2E), clean white cards.
Gradient: teal to blue-green for hero sections, dark navy gradients for wallet card.

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

## DB Schema

- users: authentication + profile + session token
- wallets: balance, locked/unlocked funds, bonus points
- wallet_transactions: history of unlocks, bonuses, withdrawals
- activity: daily steps, minutes, calories, streak tracking
- challenges: user-joined challenges
- notification_settings: per-user notification preferences

## Authentication Flow

Simple token-based auth. Token stored in AsyncStorage on device.
Email verification with 6-digit code (logged to console in development).
After verification → wallet setup → main app.
