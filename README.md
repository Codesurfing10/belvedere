# Belvedere

Pre-Arrival Supply Ordering platform for vacation rentals — built with Next.js 15, Tailwind CSS, Prisma, and NextAuth.

## Live Demo

The static demo is deployed on GitHub Pages at:  
**https://codesurfing10.github.io/belvedere/**

> **Note:** GitHub Pages serves a static export of the UI only.  
> API routes (database, auth, orders) require a backend server with Postgres and Redis.  
> Pages that call the API will show loading or empty states on the static demo.

## Getting Started (local development)

```bash
# 1. Install dependencies
pnpm install

# 2. Copy the example env file and fill in your values
cp .env.example .env.local

# 3. Generate the Prisma client
pnpm db:generate

# 4. Run database migrations and seed
pnpm db:migrate
pnpm db:seed

# 5. Start the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## GitHub Pages Deployment

Deployment is automated via the **Deploy to GitHub Pages** workflow  
(`.github/workflows/deploy.yml`).  

Every push to `main` triggers a build and deploys the static export to GitHub Pages.  
You can also trigger it manually from the **Actions** tab.

### Manual deploy steps

```bash
pnpm install
pnpm db:generate
pnpm build          # generates the static site in ./out
```

Then upload the `out/` folder to any static host (Vercel, Netlify, S3, etc.)  
or commit it to a `gh-pages` branch.

## Statistics Dashboard

Navigate to **/statistics** (or click **Statistics** in the navbar) to view the platform activity dashboard.

It displays:

| Widget | Description |
|--------|-------------|
| KPI cards | Total properties, reservations, orders, average manager rating |
| Monthly Reservations chart | 12-month line chart with 3-month moving average and IQR-based anomaly highlighting |
| Monthly Revenue chart | 12-month line chart with trendline and anomaly highlighting |
| Top Supply Categories | Bar chart of orders by product category |

### Updating the stats data

Edit **`public/stats.json`** and commit the change.  
The GitHub Actions workflow will rebuild and redeploy automatically.

```json
{
  "kpis": { "totalProperties": 42, ... },
  "monthlyReservations": [{ "month": "Jan", "count": 29 }, ...],
  "monthlyRevenue": [{ "month": "Jan", "amount": 5400 }, ...],
  "topCategories": [{ "name": "Toiletries", "orders": 87 }, ...]
}
```

## Mobile App (Flutter)

A Flutter app for iOS and Android lives under [`mobile/`](./mobile/README.md).  
It replicates the core Belvedere flows — Sign In, Owner Dashboard, Marketplace, and Statistics — by consuming the Next.js backend API.

```bash
cd mobile
flutter pub get
flutter run --dart-define=API_BASE_URL=http://localhost:3000   # iOS Simulator
# Android emulator: API_BASE_URL=http://10.0.2.2:3000
```

See [`mobile/README.md`](./mobile/README.md) for full setup instructions.

## Tech Stack

- **Framework**: Next.js 15 (App Router, static export for GitHub Pages)
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL via Prisma ORM
- **Auth**: NextAuth.js (JWT)
- **Queue**: BullMQ + Redis
- **Charts**: Custom SVG (no extra dependency)
- **Mobile**: Flutter (iOS + Android)
