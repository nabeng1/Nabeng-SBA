# Nabeng-SBA (Vite)

Source is private under `src/`. Deploy only the built `dist/` folder (same idea as Nabeng Invoice).

## Structure
```
nabeng-sba/
  index.html          Landing
  system.html         Teacher/Admin system
  student.html        Student portal
  about.html
  contact.html
  src/
    main-system.js    Vite entry for system
    app.js            App logic (not published raw)
    style.css
  public/             Public static assets (logos)
  dist/               Production build output
```

## Develop
```bash
npm install
npm run dev
```
Open the URL Vite prints (system opens by default).

## Production build
```bash
npm run build
```
Upload **only** the `dist/` folder to your host.

Do **not** upload `src/`, `node_modules/`, or raw `app.js` to public hosting.

## Subscription (Paystack — same account as Invoice)
- Termly: GHS 100 · 16 weeks
- Yearly: GHS 280 · 12 months

SQL on `schools`:
```sql
alter table schools
  add column if not exists subscription_status text,
  add column if not exists subscription_plan text,
  add column if not exists subscription_ends_at timestamptz,
  add column if not exists trial_ends_at timestamptz,
  add column if not exists last_payment_ref text;
```
