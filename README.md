# InNextGen Lean ERP

Production-oriented Lean ERP web app for InNextGen. The mock data has been removed; the app reads and writes live data through Supabase.

## Current modules

- CRM & Sales Pipeline: create leads, update pipeline stage, delete leads.
- Projects & Milestones: create projects, create milestones, update milestone status.
- Freelance / Partner Roster: create partner profiles and assign partners to projects.
- Finance & Billing: create invoices and approve them.
- Document & Asset Management: store SOPs, code snippets, prompts, blueprints, templates, and links.
- Automation Events: records operational events that n8n or Make can consume later.

## Database setup

1. Create a Supabase project.
2. Open Supabase SQL Editor.
3. Run [supabase/schema.sql](supabase/schema.sql).
4. Enable Email/Password in Supabase Auth.
5. Create your first user from the app sign-up screen or from Supabase Auth.

The schema starts empty by design. No seed data or demo records are inserted.

## Environment variables

Create `.env.local` for local development and add the same values to Vercel project environment variables:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Optional future automation endpoints:

```bash
VITE_N8N_WEBHOOK_URL=
VITE_MAKE_WEBHOOK_URL=
```

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run lint
npm run build
```

## Vercel deployment

- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

CLI deploy:

```bash
npx vercel --prod
```

## Security note

The included RLS policies allow any authenticated workspace user to read and write ERP records. Before inviting external users or clients, tighten the policies with organization membership and role-based permissions.
