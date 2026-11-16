-- Schema and Security Policies for GetFinance applications

-- 1. Create applications table (if not exists)
create table if not exists public.applications (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  reference text not null,
  loan_type text not null,
  country text not null,
  status text not null default 'draft',
  draft jsonb not null default '{}'::jsonb,
  decision text,
  decision_detail jsonb,
  submitted_at timestamptz,
  updated_at text not null default timezone('utc'::text, now())::text
);

-- 2. Grant permissions on schema and table to authenticated users
grant usage on schema public to authenticated;
grant select, insert, update, delete on table public.applications to authenticated;

-- 3. Enable Row Level Security (RLS)
alter table public.applications enable row level security;

-- 4. Create RLS Policies for authenticated users
drop policy if exists "Users can select own applications" on public.applications;
create policy "Users can select own applications"
  on public.applications for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own applications" on public.applications;
create policy "Users can insert own applications"
  on public.applications for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own applications" on public.applications;
create policy "Users can update own applications"
  on public.applications for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own applications" on public.applications;
create policy "Users can delete own applications"
  on public.applications for delete
  to authenticated
  using (auth.uid() = user_id);
