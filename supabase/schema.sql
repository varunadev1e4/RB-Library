-- ============================================================
-- Community Library — Supabase Schema
-- Run this in the Supabase SQL Editor (in order)
-- ============================================================

-- ─── Extensions ──────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Profiles (extends auth.users) ───────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text unique not null,
  role        text not null default 'user' check (role in ('admin', 'user')),
  created_at  timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Anyone can read profiles (needed for username check on signup)
create policy "Profiles are publicly readable"
  on public.profiles for select using (true);

-- Users can only update their own profile (role changes handled by admin via service key or separate policy)
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Allow insert during signup (auth user must exist)
create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Admin can update any profile (for role promotion/demotion)
-- Note: Admins bypass RLS through the service role in production.
-- For client-side admin operations, use the anon key with the policy below:
create policy "Admins can update all profiles"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ─── Books ───────────────────────────────────────────────────
create table if not exists public.books (
  id             uuid primary key default uuid_generate_v4(),
  title          text not null,
  author         text not null,
  description    text,
  category       text,
  location_code  text,
  created_at     timestamptz default now()
);

alter table public.books enable row level security;

-- Everyone (logged in) can read books
create policy "Authenticated users can read books"
  on public.books for select using (auth.role() = 'authenticated');

-- Only admins can insert/update/delete
create policy "Admins can manage books"
  on public.books for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ─── User Books (reading tracker) ────────────────────────────
create table if not exists public.user_books (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  book_id     uuid not null references public.books(id) on delete cascade,
  status      text not null check (status in ('to_read', 'reading', 'completed')),
  summary     text,
  updated_at  timestamptz default now(),
  unique (user_id, book_id)
);

alter table public.user_books enable row level security;

-- Users can only read/write their own reading records
create policy "Users manage their own reading records"
  on public.user_books for all using (auth.uid() = user_id);

-- ─── Events ──────────────────────────────────────────────────
create table if not exists public.events (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  description text,
  date        timestamptz not null,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz default now()
);

alter table public.events enable row level security;

-- Everyone authenticated can read events
create policy "Authenticated users can read events"
  on public.events for select using (auth.role() = 'authenticated');

-- Only admins can manage events
create policy "Admins can manage events"
  on public.events for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ─── Event RSVPs ─────────────────────────────────────────────
create table if not exists public.event_rsvps (
  id        uuid primary key default uuid_generate_v4(),
  event_id  uuid not null references public.events(id) on delete cascade,
  user_id   uuid not null references public.profiles(id) on delete cascade,
  status    text not null check (status in ('going', 'not_going')),
  unique (event_id, user_id)
);

alter table public.event_rsvps enable row level security;

-- Users manage their own RSVPs
create policy "Users manage their own RSVPs"
  on public.event_rsvps for all using (auth.uid() = user_id);

-- Everyone can read RSVP counts (for display)
create policy "Anyone can read RSVPs"
  on public.event_rsvps for select using (auth.role() = 'authenticated');

-- ─── Indexes ─────────────────────────────────────────────────
create index if not exists idx_profiles_username      on public.profiles(username);
create index if not exists idx_books_title            on public.books(title);
create index if not exists idx_books_author           on public.books(author);
create index if not exists idx_books_category         on public.books(category);
create index if not exists idx_user_books_user        on public.user_books(user_id);
create index if not exists idx_user_books_status      on public.user_books(status);
create index if not exists idx_events_date            on public.events(date);
create index if not exists idx_event_rsvps_event      on public.event_rsvps(event_id);

-- ─── Sample Data (optional — comment out for production) ─────
insert into public.books (title, author, description, category, location_code) values
  ('The Alchemist',           'Paulo Coelho',      'A philosophical novel about a young shepherd boy who travels from his homeland in Spain to the Egyptian desert in search of treasure.',                     'Fiction',     'A01'),
  ('Sapiens',                 'Yuval Noah Harari', 'A brief history of humankind from the Stone Age through the modern era, exploring how biology and history shaped our society.',                            'Non-Fiction',  'B12'),
  ('Atomic Habits',           'James Clear',       'An easy and proven way to build good habits and break bad ones, backed by science and case studies.',                                                     'Non-Fiction',  'B04'),
  ('The Great Gatsby',        'F. Scott Fitzgerald','A portrait of the Jazz Age in all of its decadence and excess, capturing the spirit of an era.',                                                          'Fiction',     'A08'),
  ('Thinking, Fast and Slow', 'Daniel Kahneman',   'A groundbreaking tour of the mind and explains the two systems that drive the way we think.',                                                             'Non-Fiction',  'B15'),
  ('Dune',                    'Frank Herbert',     'Set in the distant future amidst a feudal interstellar society, following the son of a noble family that takes control of a desert planet.',              'Fiction',     'A22'),
  ('A Brief History of Time', 'Stephen Hawking',   'A landmark volume in science writing, explaining the nature of space and time, the role of God in creation, and the history of cosmological theories.',  'Science',     'C03'),
  ('1984',                    'George Orwell',     'A dystopian novel set in a totalitarian society where independent thinking is a thoughtcrime.',                                                           'Fiction',     'A11'),
  ('Man''s Search for Meaning','Viktor Frankl',    'A powerful account of survival in Nazi death camps and its lessons for spiritual survival.',                                                               'Philosophy',  'D07'),
  ('The Lean Startup',        'Eric Ries',         'How today''s entrepreneurs use continuous innovation to create radically successful businesses.',                                                          'Technology',  'E02')
on conflict do nothing;
