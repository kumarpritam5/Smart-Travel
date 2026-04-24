---
description: Final deployment guide for Smart Travel Expense App (Backend + Mobile)
---

# Smart Travel Expense App — Deployment Workflow

## Prerequisites
- Node.js 18+ installed
- PostgreSQL database (Neon, Supabase, or local)
- Expo account (`npx expo login`)
- EAS CLI installed: `npm install -g eas-cli`

---

## Step 1: Backend Deployment (Railway / Render / VPS)

### 1a. Set Environment Variables on your host:
```
DATABASE_URL=postgresql://user:password@host:5432/dbname
PORT=3000
JWT_SECRET=your_super_secret_key
```

### 1b. Push the Prisma schema to production DB:
```bash
cd backend
npx prisma db push
```

### 1c. Build & Start the server:
```bash
npm run build   # if tsconfig has "outDir": "dist"
node dist/index.js
```
Or use a process manager:
```bash
npm install -g pm2
pm2 start dist/index.js --name travel-backend
pm2 save
```

> Make sure your server is bound to `0.0.0.0` (already done in `src/index.ts`).
> Open port 3000 in your firewall/security group.

---

## Step 2: Update Mobile Environment

Edit `mobile/.env`:
```
EXPO_PUBLIC_API_URL=https://your-production-domain.com
```
Replace with your actual server URL (e.g., Railway/Render public URL).

---

## Step 3: Build Android APK with EAS

### 3a. Configure EAS (first time only):
```bash
cd mobile
eas build:configure
```

### 3b. Build a development APK (for testing on real device):
```bash
eas build --platform android --profile preview
```

### 3c. Build production AAB (for Google Play Store):
```bash
eas build --platform android --profile production
```

Download the `.apk` or `.aab` from the Expo dashboard link provided.

---

## Step 4: Install APK on Device (for testing)

```bash
adb install path/to/app.apk
```
Or scan the QR code from the EAS build dashboard.

---

## Step 5: Verify Everything Works

- [ ] Login creates a user in PostgreSQL
- [ ] Start Trip shows map and GPS tracking
- [ ] Add Expense shows instantly on ActiveTripScreen
- [ ] End Trip saves to Recent Trips list and refreshes Dashboard
- [ ] Trip Details shows correct end time and GPS
- [ ] Delete Trip removes from list instantly
- [ ] Sync button uploads local SQLite → PostgreSQL

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `Network Error` | Ensure `EXPO_PUBLIC_API_URL` points to your live server and port 3000 is open |
| `Prisma migration failed` | Run `npx prisma db push` after schema changes |
| `EAS build fails` | Run `eas whoami` to confirm login, check `eas.json` |
| Data not refreshing | Ensure `useFocusEffect` hooks are in DashboardScreen and ActiveTripScreen |
