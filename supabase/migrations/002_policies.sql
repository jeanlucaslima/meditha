-- RLS policies for Supabase tables
-- Default deny: no policies = no access

-- Server (service role) bypasses RLS automatically

-- Allow anonymous INSERT to product_events with minimal payload (optional)
-- This is for client-side telemetry only - no PII should be included
create policy pe_insert_anon on product_events
for insert
to anon
with check (true);

-- Optional: read access for specific use cases
-- For now, keep server-only access for all PII tables
-- If admin console is needed later, create dedicated role

-- Admin policies can be added here for specific roles:
-- create policy admin_read_all on quiz_sessions
-- for select
-- to authenticated
-- using (auth.jwt() ->> 'role' = 'admin');
