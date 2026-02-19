# Safar Go

## Overview

Safar Go is a premium luxury travel booking mobile app built with Expo (React Native) for the frontend and Express.js for the backend. It connects customers with drivers for inter-city travel bookings across Indian destinations (Ayodhya, Varanasi, Lucknow, Agra, Mathura, Prayagraj). The app operates as a car-hire/travel service with three user roles: customers, drivers, and admins.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (Expo / React Native)

- **Framework**: Expo SDK 54 with React Native 0.81, new architecture enabled, React 19
- **Routing**: expo-router with file-based routing. The `app/` directory contains route groups organized by user role:
  - `app/index.tsx` — Welcome/splash screen with auto-redirect based on authenticated user's role
  - `app/auth.tsx` — Combined login/registration screen with role selection and quick demo login
  - `app/customer/` — Customer flow with tab navigation (Home, Bookings, Profile), plus destination detail and booking screens
  - `app/driver/` — Driver flow with tab navigation (Dashboard, Earnings, Profile)
  - `app/admin/` — Admin dashboard with tab navigation (Dashboard, Drivers, Manage)
  - `app/destination/[id].tsx` — Destination detail screen with booking flow
  - `app/booking/create.tsx` — Booking form presented as modal
- **State Management**: React Context for auth (`contexts/AuthContext.tsx`), theme (`contexts/ThemeContext.tsx`), and data (`contexts/DataContext.tsx`). Data persistence via AsyncStorage.
- **Styling**: React Native `StyleSheet` with a custom theme system. **White/light theme is the default**, with dark mode available via toggle in Profile (persisted in AsyncStorage). Gold accent color (`#C5A55A`) is the brand color. Fonts are Playfair Display (headings) and Poppins (body) via `@expo-google-fonts`.
- **Tab bars**: Support for native iOS tab bars via `expo-router/unstable-native-tabs` with `expo-glass-effect` detection, falling back to classic tab layout on other platforms
- **Animations**: `react-native-reanimated` for enter animations (FadeInDown, FadeInUp)
- **Haptic feedback**: `expo-haptics` used on button presses and interactions (guarded by platform check for web)

### Backend (Express.js)

- **Runtime**: Node.js with Express 5, TypeScript. Dev server runs with `tsx`, production build uses `esbuild`
- **Entry point**: `server/index.ts` — sets up CORS, JSON parsing, and serves landing page
- **Routes**: `server/routes.ts` — placeholder for API endpoints (app uses AsyncStorage for data)

### Data Layer

- **Local storage**: AsyncStorage for user sessions, bookings, favorites, and theme preferences
- **Seed data**: `constants/data.ts` contains destination info, sample bookings, sample drivers
- **Demo accounts**: customer@safargo.com, driver@safargo.com, admin@safargo.com (any password)

### Build & Deploy

- **Dev mode**: Two processes — `expo:dev` for the Expo dev server and `server:dev` for the Express backend
- **Production**: `expo:static:build` runs a custom build script, then `server:build` bundles the server with esbuild
- **Port**: The Express server runs on port 5000, Expo on port 8081
