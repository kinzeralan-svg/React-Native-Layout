# Wellness Wallet

A mobile app that links your fitness activity to your finances. Lock funds in a wallet, stay active, and unlock money as you hit your daily health goals.

---

## Requirements

- [Node.js](https://nodejs.org/) v18+
- [pnpm](https://pnpm.io/) v9+ — install with `npm install -g pnpm`
- [PostgreSQL](https://www.postgresql.org/) database (or use Replit's built-in DB)
- [Expo Go](https://expo.dev/go) app on your phone (for mobile testing)

---

## Project Structure

```
/
├── artifacts/
│   ├── api-server/     # Express REST API (Node.js + TypeScript)
│   └── mobile/         # Expo React Native app
├── lib/
│   ├── db/             # Drizzle ORM schema + migrations
│   ├── api-spec/       # OpenAPI spec
│   └── api-client-react/ # Auto-generated API hooks
└── pnpm-workspace.yaml
```

---

## Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

Create a `.env` file in `artifacts/api-server/`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/wellness_wallet
SESSION_SECRET=your_secret_key_here
PORT=8080
```

> On Replit, `DATABASE_URL` is already set automatically.

### 3. Run database migrations

```bash
pnpm --filter @workspace/db run migrate
```

---

## Running the app

You need to start **two** processes in separate terminals:

### Terminal 1 — API Server

```bash
pnpm --filter @workspace/api-server run dev
```

The API will be available at `http://localhost:8080`.

### Terminal 2 — Mobile App (Expo)

```bash
pnpm --filter @workspace/mobile run dev
```

This opens the Expo dev server. You'll see a QR code in the terminal.

- **On your phone:** Scan the QR code with the Expo Go app (iOS/Android)
- **In the browser:** Open the URL shown as "Web is waiting on..."

---

## Authentication

Email verification is enabled but SMTP is not required. When registering:

1. Enter any email and password
2. On the verification screen, enter **any 6-digit code** (e.g. `123456`)
3. You'll be redirected to the wallet setup screen

> In production, you'd connect an SMTP provider (SendGrid, Resend, etc.) and send real codes.

---

## Key Features

| Screen | Description |
|---|---|
| **Home** | Activity progress, streak tracker, quick actions |
| **Wallet** | Balance, locked/unlocked funds, transaction history |
| **Activity** | Steps log, workout tracking, calendar view |
| **Rewards** | Daily goals, weekly challenges, badges |
| **Settings** | Notifications, profile editing, plan info |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile | Expo (React Native), Expo Router |
| Backend | Express 5, TypeScript |
| Database | PostgreSQL, Drizzle ORM |
| Auth | JWT-style session tokens, AsyncStorage |
| Styling | StyleSheet, LinearGradient, Expo Vector Icons |

---

## Useful Commands

```bash
# Type-check all packages
pnpm run typecheck

# Run DB migrations
pnpm --filter @workspace/db run migrate

# Regenerate API client from OpenAPI spec
pnpm --filter @workspace/api-spec run generate
```
