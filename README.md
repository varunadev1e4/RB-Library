# 📚 Community Library

A full-stack community library management PWA built with **React + Vite + TailwindCSS + Supabase**.

## Features

- 🔐 **PIN Authentication** — Username + 6-digit PIN (no email required)
- 📚 **Book Library** — Search, filter by category, view shelf locations
- 📖 **Reading Tracker** — Track books as To Read / Reading / Completed
- 📝 **Summaries** — Write and edit personal book summaries
- 📅 **Events** — RSVP to library events (Going / Not Going)
- 👤 **User Profiles** — Reading stats and progress
- ⚙️ **Admin Panel** — Manage books, events, and user roles
- 📱 **Mobile-First** — Sidebar on desktop, bottom nav on mobile

---

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React 18, Vite, TailwindCSS         |
| Routing     | React Router v6                     |
| State       | Zustand (with persistence)          |
| Backend     | Supabase (Auth + PostgreSQL + RLS)  |
| Fonts       | Playfair Display, Lora, DM Sans     |

---

## Quick Setup

### 1. Clone and install

```bash
git clone <your-repo>
cd community-library
npm install
```

### 2. Create a Supabase project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click **New Project**
3. Choose a name, password, and region (Mumbai / ap-south-1 recommended for India)
4. Wait for the project to be provisioned (~2 minutes)

### 3. Set up the database

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Paste the contents of `supabase/schema.sql`
4. Click **Run**

This creates all tables, RLS policies, indexes, and sample book data.

### 4. Configure environment variables

```bash
cp .env.example .env
```

Fill in your values from Supabase → Settings → API:

```env
VITE_SUPABASE_URL=https://abcdefgh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

### 5. Configure Supabase Auth settings

In Supabase dashboard → **Authentication → Settings**:

- **Disable email confirmation** (since we use fake emails internally)
  - Toggle off "Enable email confirmations"
- Set **Site URL** to `http://localhost:3000` (for development)

### 6. Start development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Authentication System

The app uses Supabase Auth with a custom approach:

- **Internal email**: `username@community-library.local` (hidden from users)
- **Password**: The 6-digit PIN (hashed by Supabase Auth)
- Users only see username + PIN fields

**First registered user automatically becomes Admin.**

---

## Roles

| Role  | Capabilities                                    |
|-------|-------------------------------------------------|
| user  | Browse books, track reading, RSVP events        |
| admin | All user capabilities + manage books/events/users |

Admins can promote/demote other users from the Admin Panel.

---

## Project Structure

```
src/
├── components/
│   ├── layout/        # Layout, Sidebar, BottomNav
│   ├── ui/            # Reusable UI primitives
│   ├── books/         # BookCard
│   └── events/        # EventCard
├── pages/
│   ├── auth/          # Login, Signup
│   ├── admin/         # AdminPanel
│   ├── Home.jsx       # Events + RSVP
│   ├── SearchBooks.jsx
│   ├── BookDetail.jsx
│   ├── MyBooks.jsx    # Reading tracker tabs
│   ├── Summaries.jsx
│   └── Profile.jsx
├── store/
│   └── useAuthStore.js  # Zustand auth state
├── lib/
│   ├── supabase.js
│   └── utils.js
└── App.jsx            # Routes + ProtectedRoute
```

---

## Deployment

### Vercel (recommended)

```bash
npm install -g vercel
vercel
```

Set the same environment variables in Vercel dashboard → Project → Settings → Environment Variables.

Update Supabase Auth → Settings → Site URL to your production URL.

### Netlify

```bash
npm run build
# Drag and drop the `dist/` folder to Netlify
```

Add a `_redirects` file in `public/`:
```
/*  /index.html  200
```

---

## Environment Variables

| Variable                  | Description                       |
|---------------------------|-----------------------------------|
| `VITE_SUPABASE_URL`       | Your Supabase project URL         |
| `VITE_SUPABASE_ANON_KEY`  | Your Supabase anonymous/public key |

---

## Database Schema

```
profiles       — Users (extends auth.users), roles
books          — Library catalogue
user_books     — Reading status + summaries per user
events         — Library events
event_rsvps    — RSVP records per user per event
```

All tables have Row Level Security (RLS) enabled.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes
4. Push and open a Pull Request

---

## License

MIT — Free to use and modify for community or commercial purposes.
