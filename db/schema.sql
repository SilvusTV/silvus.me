-- PostgreSQL schema draft

create table if not exists portfolio_entries (
  id bigserial primary key,
  type varchar(32) not null check (type in ('project', 'event', 'experience', 'skill')),
  title varchar(180) not null,
  summary text not null,
  context text,
  stack jsonb not null default '[]'::jsonb,
  impact_metrics jsonb not null default '{}'::jsonb,
  start_date date,
  end_date date,
  highlighted boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists portfolio_entries_title_key on portfolio_entries (title);
create index if not exists portfolio_entries_sort_idx on portfolio_entries (highlighted desc, sort_order asc, start_date desc);

create table if not exists blog_posts (
  id bigserial primary key,
  title varchar(220) not null,
  slug varchar(220) not null unique,
  excerpt text not null,
  content text not null,
  tags jsonb not null default '[]'::jsonb,
  published_at timestamptz,
  binance_symbol varchar(32),
  binance_embed_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blog_posts_published_idx on blog_posts (published_at desc nulls last);

create table if not exists contact_inquiries (
  id bigserial primary key,
  name varchar(120) not null,
  email varchar(255) not null,
  subject varchar(255),
  message text not null,
  source_page varchar(120),
  related_post_slug varchar(220),
  sent_at timestamptz,
  status varchar(32) not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contact_inquiries_created_idx on contact_inquiries (created_at desc);
create index if not exists contact_inquiries_status_idx on contact_inquiries (status);
