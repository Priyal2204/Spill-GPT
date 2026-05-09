-- Create confessions table to store anonymous confession sessions
create table if not exists public.confessions (
  id uuid primary key default gen_random_uuid(),
  confession text not null,
  mood text not null,
  ai_response text,
  gif_url text,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.confessions enable row level security;

-- Allow anyone to insert (anonymous confessions)
create policy "Anyone can insert confessions"
  on public.confessions for insert
  with check (true);

-- Allow anyone to read their own session data (no auth needed for this app)
create policy "Anyone can read confessions"
  on public.confessions for select
  using (true);
