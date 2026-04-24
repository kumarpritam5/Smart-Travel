# Smart Travel 🎒✨

Smart Travel is a professional-grade, offline-first mobile application designed to simplify journey tracking and expense management. Built with **React Native** and a **Node.js/PostgreSQL** backend, it provides a seamless experience for travelers to record routes, manage multi-category expenses in Rupees (₹), and sync data securely across devices.

## 🚀 Key Features

- **Offline-First Architecture**: Local SQLite database ensures the app works perfectly without internet; data syncs automatically when reconnected.
- **Silent GPS Tracking**: Real-time route recording in the background without intrusive app redirects.
- **Smart Expense Management**: Categorize spending, track payment methods, and view live totals in ₹.
- **Pre-Trip Setup**: Optional starting and destination point configuration before you hit the road.
- **Post-Trip Refinement**: Detailed views to edit timestamps, coordinates, and trip metadata.
- **Cloud Sync**: Securely backup your journeys to a centralized PostgreSQL database.
- **Dual-Mode UI**: Full support for both Light and Dark modes with a premium, modern aesthetic.

## 🛠 Tech Stack

### Frontend
![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-443E38?style=for-the-badge)
![React Navigation](https://img.shields.io/badge/React_Navigation-6C47FF?style=for-the-badge)
![Expo Location](https://img.shields.io/badge/Expo_Location-000020?style=for-the-badge&logo=expo)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

### 🗄 Database
*Local*:
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)

*Remote*
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

### ⚙️ Build & Deployment
![EAS](https://img.shields.io/badge/EAS_Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![Render](https://img.shields.io/badge/Render-000000?style=for-the-badge&logo=render&logoColor=white)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- Expo Go app on your phone (for development)
- PostgreSQL instance (Supabase or local)

### Installation

1. **Clone the repo**:
   ```bash
   git clone https://github.com/kumarpritam5/Smart-Travel.git
   cd Smart-Travel
   ```

2. **Setup Backend**:
   ```bash
   cd backend
   npm install
   # Create a .env file based on .env.example
   npx prisma db push
   npm run dev
   ```

3. **Setup Mobile**:
   ```bash
   cd ../mobile
   npm install
   # Create a .env file based on .env.example
   npx expo start
   ```

## ⚙️ Environment Variables

### Backend (`/backend/.env`)
```bash
DATABASE_URL="postgresql://user:pass@host:5432/dbname"
PORT=3000
JWT_SECRET="your_secret_key"
```

### Mobile (`/mobile/.env`)
```bash
EXPO_PUBLIC_API_URL="https://your-backend-url.onrender.com"
```

## 📈 Deployment

The app is optimized for deployment on **Render** (Backend) ![Render](https://img.shields.io/badge/Render-000000?style=for-the-badge&logo=render&logoColor=white) and **EAS** (Mobile APK) ![EAS](https://img.shields.io/badge/EAS_Expo-000020?style=for-the-badge&logo=expo&logoColor=white)

## 🤝 Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
