-- ============================================================
-- Migration 001 — Five new features
-- Run this in Supabase SQL Editor AFTER the base schema.sql
-- ============================================================

-- ─── 1. Star ratings ──────────────────────────────────────────
-- Add rating column to existing user_books table
ALTER TABLE public.user_books
  ADD COLUMN IF NOT EXISTS rating smallint
  CONSTRAINT rating_range CHECK (rating BETWEEN 1 AND 5);

-- View: average rating per book
CREATE OR REPLACE VIEW public.book_avg_ratings AS
SELECT
  book_id,
  ROUND(AVG(rating)::numeric, 1)  AS avg_rating,
  COUNT(rating)                    AS rating_count
FROM public.user_books
WHERE rating IS NOT NULL
GROUP BY book_id;

-- ─── 2. Wishlist requests ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.wishlist_requests (
  id          uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title       text        NOT NULL,
  author      text,
  note        text,
  status      text        NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending', 'approved', 'declined')),
  admin_note  text,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

ALTER TABLE public.wishlist_requests ENABLE ROW LEVEL SECURITY;

-- Users read/write their own requests
CREATE POLICY "wishlist_own"
  ON public.wishlist_requests FOR ALL
  USING (auth.uid() = user_id);

-- Admins read and update all requests
CREATE POLICY "wishlist_admin_select"
  ON public.wishlist_requests FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "wishlist_admin_update"
  ON public.wishlist_requests FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- ─── 3. Leaderboard views ─────────────────────────────────────
-- All-time leaderboard
CREATE OR REPLACE VIEW public.leaderboard_all_time AS
SELECT
  p.id,
  p.username,
  p.created_at                                                              AS joined_at,
  COALESCE(s.completed_count, 0)                                            AS completed_count,
  COALESCE(s.summary_count,   0)                                            AS summary_count,
  COALESCE(s.total_books,     0)                                            AS total_books,
  COALESCE(s.completed_count, 0) * 100 + COALESCE(s.summary_count, 0) * 50 AS xp
FROM public.profiles p
LEFT JOIN (
  SELECT
    user_id,
    COUNT(*)                                                        AS total_books,
    COUNT(CASE WHEN status = 'completed' THEN 1 END)                AS completed_count,
    COUNT(CASE WHEN summary IS NOT NULL AND summary <> '' THEN 1 END) AS summary_count
  FROM public.user_books
  GROUP BY user_id
) s ON s.user_id = p.id
ORDER BY xp DESC, completed_count DESC;

-- Current-month leaderboard
CREATE OR REPLACE VIEW public.leaderboard_monthly AS
SELECT
  p.id,
  p.username,
  COALESCE(s.completed_count, 0)                                            AS completed_count,
  COALESCE(s.summary_count,   0)                                            AS summary_count,
  COALESCE(s.completed_count, 0) * 100 + COALESCE(s.summary_count, 0) * 50 AS xp
FROM public.profiles p
LEFT JOIN (
  SELECT
    user_id,
    COUNT(CASE WHEN status = 'completed' THEN 1 END)                  AS completed_count,
    COUNT(CASE WHEN summary IS NOT NULL AND summary <> '' THEN 1 END)  AS summary_count
  FROM public.user_books
  WHERE updated_at >= date_trunc('month', now())
  GROUP BY user_id
) s ON s.user_id = p.id
ORDER BY xp DESC, completed_count DESC;

-- ─── 4. Analytics helper views ────────────────────────────────
-- Monthly signups (last 12 months)
CREATE OR REPLACE VIEW public.analytics_monthly_signups AS
SELECT
  TO_CHAR(date_trunc('month', created_at), 'Mon YY') AS month,
  date_trunc('month', created_at)                     AS month_date,
  COUNT(*)                                            AS count
FROM public.profiles
WHERE created_at >= now() - INTERVAL '12 months'
GROUP BY month_date, month
ORDER BY month_date;

-- Monthly books completed (last 12 months)
CREATE OR REPLACE VIEW public.analytics_monthly_completions AS
SELECT
  TO_CHAR(date_trunc('month', updated_at), 'Mon YY') AS month,
  date_trunc('month', updated_at)                     AS month_date,
  COUNT(*)                                            AS count
FROM public.user_books
WHERE status = 'completed'
  AND updated_at >= now() - INTERVAL '12 months'
GROUP BY month_date, month
ORDER BY month_date;

-- Top 10 most completed books
CREATE OR REPLACE VIEW public.analytics_top_books AS
SELECT
  b.title,
  b.author,
  COUNT(*) AS completed_count
FROM public.user_books ub
JOIN public.books b ON b.id = ub.book_id
WHERE ub.status = 'completed'
GROUP BY b.id, b.title, b.author
ORDER BY completed_count DESC
LIMIT 10;

-- Reading status distribution
CREATE OR REPLACE VIEW public.analytics_status_dist AS
SELECT status, COUNT(*) AS count
FROM public.user_books
GROUP BY status;

-- Grant SELECT on views to authenticated users (for admin dashboard)
GRANT SELECT ON public.book_avg_ratings           TO authenticated;
GRANT SELECT ON public.leaderboard_all_time       TO authenticated;
GRANT SELECT ON public.leaderboard_monthly        TO authenticated;
GRANT SELECT ON public.analytics_monthly_signups  TO authenticated;
GRANT SELECT ON public.analytics_monthly_completions TO authenticated;
GRANT SELECT ON public.analytics_top_books        TO authenticated;
GRANT SELECT ON public.analytics_status_dist      TO authenticated;

-- Index for wishlist
CREATE INDEX IF NOT EXISTS idx_wishlist_user   ON public.wishlist_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_status ON public.wishlist_requests(status);

-- Index for new arrivals (books.created_at)
CREATE INDEX IF NOT EXISTS idx_books_created_at ON public.books(created_at DESC);
