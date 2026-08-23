-- Allow public (anon) to read positions and user_roles
-- so the Office Bearers page works without requiring login.

-- Positions: shows custom titles (Vice-Chair, Treasurer, etc.)
CREATE POLICY IF NOT EXISTS "positions public read" ON public.positions
  FOR SELECT TO anon
  USING (true);

-- User roles: shows role-based members (counsellor, chair, secretary, society_chair)
-- Only role + society columns are exposed — no personal data.
CREATE POLICY IF NOT EXISTS "user_roles public read for office bearers" ON public.user_roles
  FOR SELECT TO anon
  USING (true);
