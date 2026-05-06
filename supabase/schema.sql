-- ============================================================
-- Community Library — Supabase Schema  (v2 — with trigger fix)
-- Run this entire file in Supabase SQL Editor.
--
-- BEFORE running this, make sure you have:
--   Supabase → Authentication → Email
--     ✅ Disable "Enable email confirmations"
-- ============================================================

-- ─── Extensions ──────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Profiles ────────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text unique not null,
  role        text not null default 'user' check (role in ('admin', 'user')),
  created_at  timestamptz default now()
);

alter table public.profiles enable row level security;

-- Public read (needed for username uniqueness check before signup)
create policy "profiles_select_all"
  on public.profiles for select using (true);

-- Users insert/update their own row
create policy "profiles_insert_own"
  on public.profiles for insert with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update using (auth.uid() = id);

-- Admins can update any profile (for promote/demote)
create policy "profiles_admin_update"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ─── Auto-create profile on auth.users insert ────────────────
--
-- This trigger fires AFTER a new auth user is created, so the
-- profile insert runs under the service role (bypasses RLS),
-- solving the "no session yet" race condition.
--
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer          -- runs as postgres, bypasses RLS
set search_path = public
as $$
declare
  v_username text;
  v_role     text;
  v_count    int;
begin
  -- Read username from signup metadata (passed via options.data)
  v_username := coalesce(
    new.raw_user_meta_data->>'username',
    'user_' || substr(replace(new.id::text, '-', ''), 1, 8)
  );

  -- First user ever → admin; everyone else → user
  select count(*) into v_count from public.profiles;
  v_role := case when v_count = 0 then 'admin' else 'user' end;

  insert into public.profiles (id, username, role)
  values (new.id, v_username, v_role)
  on conflict (id) do nothing;   -- safe if the JS fallback already inserted

  return new;
end;
$$;

-- Drop old trigger if re-running this script
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

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

create policy "books_select_auth"
  on public.books for select using (auth.role() = 'authenticated');

create policy "books_all_admin"
  on public.books for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ─── User Books ───────────────────────────────────────────────
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

create policy "user_books_own"
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

create policy "events_select_auth"
  on public.events for select using (auth.role() = 'authenticated');

create policy "events_all_admin"
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

create policy "rsvps_own"
  on public.event_rsvps for all using (auth.uid() = user_id);

create policy "rsvps_select_auth"
  on public.event_rsvps for select using (auth.role() = 'authenticated');

-- ─── Indexes ─────────────────────────────────────────────────
create index if not exists idx_profiles_username  on public.profiles(username);
create index if not exists idx_books_title        on public.books(title);
create index if not exists idx_books_author       on public.books(author);
create index if not exists idx_books_category     on public.books(category);
create index if not exists idx_user_books_user    on public.user_books(user_id);
create index if not exists idx_user_books_status  on public.user_books(status);
create index if not exists idx_events_date        on public.events(date);
create index if not exists idx_event_rsvps_event  on public.event_rsvps(event_id);

-- ─── Sample Books ─────────────────────────────────────────────
insert into public.books (title, author, description, category, location_code) values
  ('The Alchemist',            'Paulo Coelho',        'A philosophical novel about a young shepherd who travels from Spain to the Egyptian desert in search of treasure.',                                    'Fiction',      'A01'),
  ('Sapiens',                  'Yuval Noah Harari',   'A brief history of humankind from the Stone Age through the modern era.',                                                                             'Non-Fiction',  'B12'),
  ('Atomic Habits',            'James Clear',         'A proven framework for building good habits and breaking bad ones.',                                                                                   'Non-Fiction',  'B04'),
  ('The Great Gatsby',         'F. Scott Fitzgerald', 'A portrait of the Jazz Age in all its decadence and excess.',                                                                                         'Fiction',      'A08'),
  ('Thinking, Fast and Slow',  'Daniel Kahneman',     'A groundbreaking tour of the two systems that drive the way we think.',                                                                               'Non-Fiction',  'B15'),
  ('Dune',                     'Frank Herbert',       'Set in the distant future, following the son of a noble family that takes control of a desert planet.',                                                'Fiction',      'A22'),
  ('A Brief History of Time',  'Stephen Hawking',     'A landmark science book explaining the nature of space, time, and cosmological theories.',                                                             'Science',      'C03'),
  ('1984',                     'George Orwell',       'A dystopian novel set in a totalitarian society where independent thinking is a thoughtcrime.',                                                       'Fiction',      'A11'),
  ('Man''s Search for Meaning','Viktor Frankl',       'A powerful account of survival in Nazi death camps and its lessons for spiritual survival.',                                                           'Philosophy',   'D07'),
  ('The Lean Startup',         'Eric Ries',           'How entrepreneurs use continuous innovation to create radically successful businesses.',                                                               'Technology',   'E02')
on conflict do nothing;
