-- Follow-up hardening that addresses three Supabase advisors flagged on the
-- prod project after applying the initial migration:
--
--   1. function_search_path_mutable — touch_updated_at had no search_path
--      pinned; a search-path attack on a malicious schema could shadow
--      built-ins. Pin it explicitly to an empty path (the function only uses
--      `now()`, which is in pg_catalog and always resolvable without a
--      search_path).
--
--   2/3. anon_security_definer_function_executable +
--        authenticated_security_definer_function_executable —
--        claim_legacy_data() is `security definer` so it can rewrite rows on
--        behalf of any user, and Supabase exposes it via `/rest/v1/rpc/` to
--        anon + authenticated by default. We only want this function to run
--        from the auth.users INSERT trigger, never as an RPC. Revoke EXECUTE
--        on all paths.
--
-- The remaining INFO advisor (legacy_user_map has RLS enabled with no
-- policies) is intentional: only the service role writes to that table; no
-- policies = no PostgREST access, which is exactly what we want.

alter function public.touch_updated_at() set search_path = '';

revoke execute on function public.claim_legacy_data() from public;
revoke execute on function public.claim_legacy_data() from anon;
revoke execute on function public.claim_legacy_data() from authenticated;
