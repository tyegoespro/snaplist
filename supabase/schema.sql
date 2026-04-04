-- SnapList Database Schema
-- Run this in your Supabase SQL Editor

-- Profiles (extends Supabase auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  plan text default 'free' check (plan in ('free', 'pro', 'seller')),
  listings_this_month int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Listings
create table listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  title text,
  description text,
  price decimal(10,2),
  condition text check (condition in ('new', 'like_new', 'good', 'fair', 'poor')),
  category text,
  shipping_preference text default 'ship',
  status text default 'draft' check (status in ('draft', 'active', 'sold', 'expired', 'deleted')),
  ai_data jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Listing photos
create table listing_photos (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references listings(id) on delete cascade not null,
  storage_path text not null,
  display_order int default 0,
  created_at timestamptz default now()
);

-- Connected marketplace accounts
create table platform_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  platform text not null check (platform in ('ebay', 'facebook', 'mercari', 'offerup', 'poshmark')),
  access_token text,
  refresh_token text,
  platform_user_id text,
  status text default 'active' check (status in ('active', 'expired', 'revoked')),
  connected_at timestamptz default now(),
  unique(user_id, platform)
);

-- Cross-posted listings tracking
create table platform_listings (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references listings(id) on delete cascade not null,
  platform text not null,
  platform_listing_id text,
  platform_url text,
  status text default 'pending' check (status in ('pending', 'active', 'sold', 'error', 'expired')),
  error_message text,
  platform_data jsonb,
  posted_at timestamptz default now()
);

-- RLS policies
alter table profiles enable row level security;
alter table listings enable row level security;
alter table listing_photos enable row level security;
alter table platform_connections enable row level security;
alter table platform_listings enable row level security;

create policy "Users can read own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

create policy "Users can CRUD own listings" on listings for all using (auth.uid() = user_id);

create policy "Users can CRUD own listing photos" on listing_photos for all
  using (listing_id in (select id from listings where user_id = auth.uid()));

create policy "Users can CRUD own connections" on platform_connections for all using (auth.uid() = user_id);

create policy "Users can CRUD own platform listings" on platform_listings for all
  using (listing_id in (select id from listings where user_id = auth.uid()));

-- Storage bucket for listing photos
insert into storage.buckets (id, name, public) values ('listing-photos', 'listing-photos', true);

create policy "Users can upload listing photos" on storage.objects for insert
  with check (bucket_id = 'listing-photos' and auth.role() = 'authenticated');

create policy "Users can read listing photos" on storage.objects for select
  using (bucket_id = 'listing-photos');

create policy "Users can delete own photos" on storage.objects for delete
  using (bucket_id = 'listing-photos' and auth.uid()::text = (storage.foldername(name))[1]);
