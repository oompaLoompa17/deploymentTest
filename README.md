# Todo App – Next.js + TypeScript + Supabase

A simple todo application built with **Next.js (App Router)**, **TypeScript**, and **Supabase** (Auth + Postgres).

This project is designed as practice for deploying the same app to **Vercel** and **Azure**.

## Features

- Email/password authentication (Supabase Auth)
- Create, complete, and delete todos
- Row Level Security so users only see their own data
- Server Components + Client Components pattern
- Cookie-based session handling with `@supabase/ssr`

## Prerequisites

- Node.js 18+
- A free [Supabase](https://supabase.com) account
- A free [Vercel](https://vercel.com) account (for first deployment)
- An [Azure](https://azure.microsoft.com) account (for second deployment)

---

## 1. Local Setup

### 1.1 Clone / download this project

```bash
cd todo-app
npm install
```

### 1.2 Create a Supabase project

1. Go to [https://supabase.com](https://supabase.com) → New Project
2. Choose a name, database password, and region
3. Wait until the project is ready

### 1.3 Create the `todos` table

In the Supabase Dashboard → **SQL Editor**, run:

```sql
-- Create the todos table
create table public.todos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  completed boolean default false not null,
  created_at timestamptz default now() not null
);

-- Enable Row Level Security
alter table public.todos enable row level security;

-- Policies: users can only see / modify their own todos
create policy "Users can view own todos"
  on public.todos for select
  using (auth.uid() = user_id);

create policy "Users can insert own todos"
  on public.todos for insert
  with check (auth.uid() = user_id);

create policy "Users can update own todos"
  on public.todos for update
  using (auth.uid() = user_id);

create policy "Users can delete own todos"
  on public.todos for delete
  using (auth.uid() = user_id);
```

### 1.4 (Optional but recommended) Disable email confirmation for faster testing

Dashboard → **Authentication** → **Providers** → Email → turn **off** “Confirm email”.

### 1.5 Get your API keys

Dashboard → **Project Settings** → **API**

- Project URL → `NEXT_PUBLIC_SUPABASE_URL`
- `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 1.6 Environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and paste the two values.

### 1.7 Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up, add todos, sign out, etc.

---

## 2. Deploy to Vercel (Step-by-step)

### 2.1 Push the code to GitHub

```bash
git init
git add .
git commit -m "Initial todo app"
# Create a new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/todo-app.git
git branch -M main
git push -u origin main
```

### 2.2 Import project on Vercel

1. Go to [https://vercel.com/new](https://vercel.com/new)
2. Import the GitHub repository
3. Framework Preset: **Next.js** (auto-detected)
4. Root Directory: leave as `.`
5. **Environment Variables** – add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Click **Deploy**

### 2.3 After deployment

- Vercel gives you a URL like `https://todo-app-xxxx.vercel.app`
- Test sign-up / todos
- Future `git push` to `main` will automatically redeploy

### 2.4 (Optional) Custom domain

Vercel Dashboard → Project → Settings → Domains

---

## 3. Deploy to Azure (Azure Static Web Apps)

Azure Static Web Apps is the closest equivalent to Vercel for static + serverless Next.js apps.

### 3.1 Prerequisites

- Azure account (free tier is fine)
- Azure CLI or just use the Azure Portal + GitHub Actions (easiest)

### 3.2 Recommended path: Azure Portal + GitHub

1. Go to [Azure Portal](https://portal.azure.com) → **Create a resource** → search **Static Web App**
2. Click **Create**
3. Basics:
   - Subscription & Resource Group (create new if needed)
   - Name: e.g. `todo-app-swa`
   - Plan type: **Free**
   - Region: choose one close to you
   - Deployment source: **GitHub**
4. Sign in to GitHub and select:
   - Organization / User
   - Repository: your `todo-app` repo
   - Branch: `main`
5. Build Details:
   - Build Preset: **Next.js**
   - App location: `/`
   - Api location: leave empty (or `api` if you add API routes later)
   - Output location: leave default (`.next` is handled by the SWA Next.js support)
6. Review + Create → Create

Azure will create a GitHub Actions workflow (`.github/workflows/azure-static-web-apps-*.yml`) and start the first build.

### 3.3 Add environment variables on Azure

1. After the resource is created, open the Static Web App
2. Go to **Configuration** (or **Application settings**)
3. Add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Save

Trigger a new deployment (push an empty commit or re-run the GitHub Action).

### 3.4 Alternative: Azure App Service (full Node.js)

If you prefer a classic App Service:

1. Create a **Web App** (Linux, Node 20 LTS)
2. Deployment Center → GitHub → select repo
3. Or use `az webapp up`
4. Add the same environment variables under **Configuration** → **Application settings**
5. Make sure the startup command is `npm run start` (or configure for Next.js standalone output)

For pure learning, **Static Web Apps** is the better first choice because it is closer to Vercel’s model.

---

## 4. Useful commands

```bash
# Install deps
npm install

# Local development
npm run dev

# Production build (test before deploy)
npm run build
npm run start

# Lint
npm run lint
```

---

## Project structure

```
todo-app/
├── src/
│   ├── app/
│   │   ├── auth/signout/route.ts   # Sign-out handler
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx                # Main page (auth gate + todos)
│   ├── components/
│   │   ├── AuthForm.tsx
│   │   └── TodoList.tsx
│   ├── lib/supabase/
│   │   ├── client.ts               # Browser client
│   │   └── server.ts               # Server client
│   └── middleware.ts               # Session refresh
├── .env.example
├── package.json
└── README.md
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| “Invalid API key” | Double-check env vars (no extra spaces) |
| Todos not loading | Confirm RLS policies + `user_id` column |
| Auth redirect loops | Make sure middleware is present |
| Vercel build fails | Ensure `package.json` has correct Next.js version |
| Azure SWA 404 | Check build output location and that the GitHub Action succeeded |

Happy deploying! 🚀
