-- Enable required extensions
create extension if not exists "uuid-ossp";

-- 1) Quiz Sessions (PII)
create table if not exists quiz_sessions (
  session_id uuid primary key default uuid_generate_v4(),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  consent boolean not null default false,
  consent_at timestamptz,
  consent_text_version text,
  nome text,
  email text,
  answers jsonb default '{}'::jsonb,
  flags jsonb default '{}'::jsonb,
  quiz_version text default 'v1',
  utm jsonb default '{}'::jsonb,
  created_ip inet,
  experiment_key text,
  variant_key text,
  experiment_version text,
  assigned_at timestamptz,
  assignment_method text
);

create index on quiz_sessions (email);
create index on quiz_sessions (started_at);

-- 2) Checkout Intents (idempotent per session)
create table if not exists checkout_intents (
  id bigserial primary key,
  session_id uuid not null references quiz_sessions(session_id) on delete cascade,
  variant text,
  provider text not null default 'stripe',
  provider_checkout_id text,
  status text not null default 'created', -- created|redirected|failed
  created_at timestamptz not null default now(),
  unique (session_id)
);

-- 3) Stripe Checkout map
create table if not exists stripe_checkout (
  checkout_id text primary key, -- cs_...
  session_id uuid not null references quiz_sessions(session_id) on delete cascade,
  price_id text,
  amount int,
  currency text default 'BRL',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index on stripe_checkout (session_id);

-- 4) Webhook events (idempotent)
create table if not exists webhook_events (
  event_id text primary key,    -- evt_...
  type text not null,
  received_at timestamptz not null default now(),
  payload jsonb not null,
  processed_at timestamptz,
  processing_error text
);

-- 5) Payments (source of truth)
create table if not exists payments (
  payment_id text primary key, -- prefer Stripe payment_intent id
  checkout_id text not null references stripe_checkout(checkout_id) on delete cascade,
  session_id uuid not null references quiz_sessions(session_id) on delete cascade,
  status text not null, -- succeeded|refunded|failed
  amount int not null,
  currency text not null default 'BRL',
  customer_email text,
  fulfilled_at timestamptz
);
create index on payments (session_id);
create index on payments (checkout_id);

-- 6) Users & enrollments (fulfillment)
create table if not exists users_app (
  user_id bigserial primary key,
  email text unique not null,
  nome text,
  created_at timestamptz not null default now(),
  last_login_at timestamptz
);

create table if not exists enrollments (
  enrollment_id bigserial primary key,
  user_id bigint not null references users_app(user_id) on delete cascade,
  product_code text not null default 'desafio_7_dias',
  origin_session_id uuid references quiz_sessions(session_id) on delete set null,
  payment_id text references payments(payment_id) on delete set null,
  status text not null default 'active', -- active|revoked|refunded
  fulfilled_at timestamptz not null default now(),
  unique (user_id, product_code)
);

-- 7) Magic links (hashed tokens)
create table if not exists magic_links (
  token_hash text primary key,
  user_id bigint not null references users_app(user_id) on delete cascade,
  expires_at timestamptz not null,
  used_at timestamptz
);
create index on magic_links (user_id, expires_at);

-- 8) Email log
create table if not exists email_log (
  id bigserial primary key,
  user_id bigint references users_app(user_id) on delete set null,
  to_email text not null,
  template text not null,
  provider text,
  message_id text,
  sent_at timestamptz not null default now(),
  meta jsonb default '{}'::jsonb
);
create index on email_log (user_id, sent_at);

-- 9) Product events (non-PII telemetry)
create table if not exists product_events (
  id bigserial primary key,
  session_id uuid not null,
  event text not null,
  ts timestamptz not null default now(),
  detail jsonb default '{}'::jsonb
);
create index on product_events (session_id, ts);
create index on product_events (event, ts);

-- RLS ON
alter table quiz_sessions enable row level security;
alter table checkout_intents enable row level security;
alter table stripe_checkout enable row level security;
alter table webhook_events enable row level security;
alter table payments enable row level security;
alter table users_app enable row level security;
alter table enrollments enable row level security;
alter table magic_links enable row level security;
alter table email_log enable row level security;
alter table product_events enable row level security;
