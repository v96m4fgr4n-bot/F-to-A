# F-to-A Tutoring CRM

A simple, MVP-level CRM for managing a tutoring business. Built with Next.js, TypeScript, and SQLite.

## Features

- **Student Management**: Store and manage student profiles with contact information
- **Session Scheduling**: Schedule and track tutoring sessions
- **Billing**: Record and track payments from students
- **Progress Tracking**: Keep notes on student progress and performance

## Getting Started

### Prerequisites
- Node.js 16+ (or use `fnm`, `nvm`)
- npm or yarn

### Installation

```bash
npm install
```

### Database Setup

The database is automatically initialized on first run. It creates a SQLite database at `data/tutoring.db`.

### Running Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/
├── api/              # API routes
│   ├── students/     # Student CRUD endpoints
│   ├── sessions/     # Session CRUD endpoints
│   ├── payments/     # Payment CRUD endpoints
│   └── progress-notes/ # Progress notes endpoints
├── students/         # Student pages
├── sessions/         # Sessions page
├── billing/          # Billing page
└── dashboard/        # Dashboard page

lib/
└── db.ts            # Database initialization and connection
```

## Building for Production

```bash
npm run build
npm start
```

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Framework**: Next.js 14
- **Database**: SQLite (better-sqlite3)
- **Styling**: Tailwind CSS
- **Validation**: Zod (optional)