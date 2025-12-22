# Castle Door Conservation App

A Progressive Web App (PWA) for managing heritage door conservation at medieval Irish castles. Uses AI vision to analyze doors, manage multi-level approvals, track materials/costs, and coordinate work via email.

## Features

- **Photo Capture & AI Analysis**: Take photos of doors and get instant conservation assessments using Claude Vision
- **Conservation Plans**: AI-generated work descriptions, materials lists, and cost estimates
- **Multi-Level Approval Workflow**: Site Surveyor → Conservation Officer → Budget Holder
- **Materials Catalog**: Pre-loaded with Irish heritage suppliers and conservation-grade materials
- **Email Notifications**: Automated emails for approvals and work assignments
- **PWA**: Install on your phone, works offline

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **AI**: Claude Vision API (via Edge Functions)
- **Email**: Resend API

## Setup

### 1. Clone and Install

```bash
cd castle-door-conservation
npm install
```

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy your project URL and anon key
3. Create `.env` from the example:

```bash
cp .env.example .env
```

4. Add your Supabase credentials to `.env`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run Database Migration

In Supabase SQL Editor, run the contents of:
- `supabase/migrations/001_initial_schema.sql`

### 4. Create Storage Bucket

In Supabase Storage, create a bucket called `door-photos` with public access.

### 5. Deploy Edge Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Login and link project
supabase login
supabase link --project-ref your-project-ref

# Set secrets
supabase secrets set ANTHROPIC_API_KEY=your-anthropic-key
supabase secrets set RESEND_API_KEY=your-resend-key

# Deploy functions
supabase functions deploy analyze-door
supabase functions deploy send-email
```

### 6. Run Development Server

```bash
npm run dev
```

## Project Structure

```
src/
├── components/
│   ├── ui/          # Reusable UI components
│   ├── camera/      # Photo capture
│   ├── layout/      # Header, Navigation
│   └── ...
├── pages/           # Route components
├── hooks/           # React Query hooks
├── services/        # API clients
├── types/           # TypeScript types
└── lib/             # Utilities
supabase/
├── migrations/      # Database schema
└── functions/       # Edge functions
```

## User Roles

| Role | Permissions |
|------|-------------|
| Surveyor | Create assessments, view all |
| Conservation Officer | Approve conservation plans |
| Budget Holder | Approve budgets, assign work |
| Contractor | View assignments, mark complete |
| Admin | Full access |

## License

Private - For castle conservation use only.
