# Nabeng-SBA — School Management System

Vite project structure (same idea as Nabeng Invoice):

```
nabeng-sba/
  index.html          Landing
  system.html         Staff / admin app
  student.html        Student portal
  about.html
  contact.html
  src/                Private source (bundled on build)
    main-system.js
    app.js
    style.css
  public/             Public assets (logos)
  dist/               Production output only (created by build)
```

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

Deploy **only what the host builds into `dist/`**. Do not upload `src/` as the public site root.

## Deploy on Render

1. Push this folder to GitHub (without `node_modules`).
2. Render → **New** → **Static Site**
3. Connect the GitHub repo
4. Settings:
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
5. Deploy

Live URLs will look like:
- `https://your-service.onrender.com/`
- `https://your-service.onrender.com/system.html`
- `https://your-service.onrender.com/student.html`

## Deploy on Vercel

1. Import the GitHub repo in Vercel
2. Framework: Vite
3. Build: `npm run build`
4. Output: `dist`

## Supabase

After deploy, add your live URL in Supabase → Authentication → URL configuration.

Subscription columns on `schools` (optional but recommended):

```sql
alter table schools
  add column if not exists subscription_status text,
  add column if not exists subscription_plan text,
  add column if not exists subscription_ends_at timestamptz,
  add column if not exists trial_ends_at timestamptz,
  add column if not exists last_payment_ref text;
```


## Source layout (like Nabeng Invoice)

```
src/
  main-system.js          Entry — imports modules
  runtime.js              Config, state, Supabase bridge
  style.css
  components/
    sidebar.js
  modules/
    subscription.js       Paystack termly/yearly
    shell.js              Sidebar / mobile menu
    wire.js               window.* API for HTML onclick
    app-core.js           Main application logic (classic global script)
```

`app-core.js` is loaded as a classic script after `runtime.js` so existing globals keep working. New features should be added as ES modules under `modules/` (subscription is the template).
