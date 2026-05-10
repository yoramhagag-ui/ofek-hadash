-- =====================================================
-- אופק חדש – Supabase Migration
-- הרץ ב-Supabase SQL Editor (בסדר הזה)
-- =====================================================

-- 1. לוח זמנים יומי
create table if not exists daily_schedule (
  id            uuid primary key default gen_random_uuid(),
  block_name    text not null,
  icon          text default '⭐',
  offset_mins   integer not null,
  duration_mins integer not null,
  category      text,
  color         text default '#C8853A',
  is_active     boolean default true,
  created_at    timestamp default now()
);

-- נתוני ברירת מחדל
insert into daily_schedule (block_name, icon, offset_mins, duration_mins, category, color) values
  ('בלוק ריכוך',    '🌅', 0,   60,  'morning',   '#7B6D57'),
  ('כבוד עצמי',     '🪥', 60,  25,  'hygiene',   '#4A7FA5'),
  ('תנועה גופנית',  '🏋️', 85,  40,  'exercise',  '#276749'),
  ('ארוחת בוקר',    '🥣', 130, 20,  'nutrition', '#C8853A'),
  ('לימוד AI',       '🧠', 150, 135, 'learning',  '#2B6CB0'),
  ('ארוחת צהריים',  '🍽️', 285, 30,  'nutrition', '#C8853A'),
  ('מנוחת צהריים',  '😴', 315, 90,  'rest',      '#553C9A'),
  ('פעילות אחה"צ',  '🚶', 405, 40,  'exercise',  '#276749'),
  ('לימוד המשך',    '💻', 445, 90,  'learning',  '#2B6CB0'),
  ('ערב משפחתי',    '👨‍👩‍👧‍👦', 540, 120, 'family',    '#553C9A'),
  ('שגרת לילה',     '🌙', 660, 60,  'sleep',     '#7B6D57')
on conflict do nothing;

-- 2. יומן יומי
create table if not exists daily_log (
  id         uuid primary key default gen_random_uuid(),
  date       date not null default current_date,
  block_id   uuid references daily_schedule(id) on delete cascade,
  completed  boolean default false,
  score      integer check (score between 0 and 100),
  notes      text,
  created_at timestamp default now(),
  unique(date, block_id)
);

-- 3. יומן עישון
create table if not exists cigarette_log (
  id          uuid primary key default gen_random_uuid(),
  logged_at   timestamptz default now(),
  count_today integer default 0
);

-- 4. יומן פעילות גופנית
create table if not exists exercise_log (
  id            uuid primary key default gen_random_uuid(),
  date          date not null default current_date,
  type          text,
  duration_mins integer,
  pain_level    integer check (pain_level between 0 and 10),
  created_at    timestamp default now()
);

-- 5. משימות
create table if not exists tasks (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  due_date    date,
  due_time    time,
  recurrence  text default 'once',
  completed   boolean default false,
  created_at  timestamp default now()
);

-- 6. היסטוריית צ'אט
create table if not exists chat_history (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  role       text check (role in ('user', 'assistant')),
  content    text not null
);

-- 7. הגדרות
create table if not exists settings (
  id    uuid primary key default gen_random_uuid(),
  key   text unique not null,
  value text not null
);

insert into settings (key, value) values
  ('wake_hour',          '5'),
  ('wake_minute',        '0'),
  ('voice_enabled',      'true'),
  ('voice_volume',       '0.8'),
  ('target_cigarettes',  '20')
on conflict (key) do nothing;

-- =====================================================
-- Row Level Security (RLS) – אפשר לאחר מכן
-- =====================================================
-- alter table daily_schedule enable row level security;
-- alter table daily_log       enable row level security;
-- alter table tasks            enable row level security;
-- alter table settings         enable row level security;
