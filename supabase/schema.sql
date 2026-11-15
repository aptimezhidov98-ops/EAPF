create extension if not exists pgcrypto;
create type public.content_status as enum ('draft','review','approved','published','archived');
create table public.content_items (
 id uuid primary key default gen_random_uuid(),
 slug text unique not null,
 title text not null,
 content_type text not null,
 body jsonb not null default '{}'::jsonb,
 status public.content_status not null default 'draft',
 version integer not null default 1,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table public.evidence_sources (
 id uuid primary key default gen_random_uuid(),
 title text not null,
 source_type text,
 doi text,
 pmid text,
 url text,
 publication_date date,
 created_at timestamptz not null default now()
);
create table public.evidence_claims (
 id uuid primary key default gen_random_uuid(),
 content_item_id uuid not null references public.content_items(id) on delete cascade,
 source_id uuid references public.evidence_sources(id),
 claim text not null,
 evidence_level text,
 reviewer_note text,
 created_at timestamptz not null default now()
);
create table public.content_versions (
 id uuid primary key default gen_random_uuid(),
 content_item_id uuid not null references public.content_items(id) on delete cascade,
 version integer not null,
 snapshot jsonb not null,
 change_note text,
 created_at timestamptz not null default now(),
 unique(content_item_id, version)
);
alter table public.content_items enable row level security;
alter table public.evidence_sources enable row level security;
alter table public.evidence_claims enable row level security;
alter table public.content_versions enable row level security;
create policy "published content is readable" on public.content_items for select using (status = 'published');
create policy "sources readable" on public.evidence_sources for select using (true);
create policy "claims readable" on public.evidence_claims for select using (exists(select 1 from public.content_items c where c.id = content_item_id and c.status = 'published'));
create policy "versions readable for published content" on public.content_versions for select using (exists(select 1 from public.content_items c where c.id = content_item_id and c.status = 'published'));