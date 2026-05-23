import { createClient } from "@supabase/supabase-js";

// One module-level client. supabase-js persists its session to localStorage
// and rehydrates on import, so the auth state survives page reloads.
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);

// ── Adapters ───────────────────────────────────────────────────────────
// The design components read $id, $createdAt, userId, listId — the Appwrite
// document shape. Map Supabase rows into that shape so the rest of the app
// can stay oblivious to the swap. This is a temporary shim; a follow-up
// PR will rename across the design layer.
const adaptList = (row) =>
  row && {
    $id: row.id,
    $createdAt: row.created_at,
    userId: row.user_id,
    title: row.title,
    note: row.note,
    mood: row.mood,
  };

const adaptItem = (row) =>
  row && {
    $id: row.id,
    $createdAt: row.created_at,
    listId: row.list_id,
    userId: row.user_id,
    content: row.content,
    position: row.position,
  };

const adaptUser = (user) =>
  user && {
    $id: user.id,
    email: user.email,
    name: user.user_metadata?.name ?? null,
  };

const throwOn = (result) => {
  if (result.error) throw result.error;
  return result;
};

// ── Implementation ─────────────────────────────────────────────────────
const api = {
  // ── auth ─────────────────────────────────────────────────────────────
  createAccount: async (email, password, name) => {
    const { data } = throwOn(
      await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      }),
    );
    return adaptUser(data.user);
  },

  getAccount: async () => {
    const { data } = await supabase.auth.getUser();
    return adaptUser(data.user);
  },

  createSession: async (email, password) => {
    const { data } = throwOn(
      await supabase.auth.signInWithPassword({ email, password }),
    );
    return data.session;
  },

  createOAuth2Session: async (provider, successUrl, failureUrl) => {
    const redirectTo =
      successUrl ??
      (typeof window !== "undefined"
        ? `${window.location.origin}/lists`
        : undefined);
    // Supabase signals failure via query params on the redirect target; the
    // Login page already reads `?error=oauth_failed` so we accept the same
    // contract here. `failureUrl` is unused — Supabase redirects to the same
    // URL on both success and failure, with the error encoded.
    void failureUrl;
    return throwOn(
      await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo },
      }),
    );
  },

  deleteCurrentSession: async () => {
    throwOn(await supabase.auth.signOut());
  },

  // ── lists ────────────────────────────────────────────────────────────
  createList: async (userId, { title, note, mood } = {}) => {
    const { data } = throwOn(
      await supabase
        .from("lists")
        .insert({
          user_id: userId,
          title: title ?? null,
          note: note ?? null,
          mood: mood ?? null,
        })
        .select()
        .single(),
    );
    return adaptList(data);
  },

  updateList: async (listId, patch) => {
    const { data } = throwOn(
      await supabase
        .from("lists")
        .update(patch)
        .eq("id", listId)
        .select()
        .single(),
    );
    return adaptList(data);
  },

  deleteList: async (listId) => {
    throwOn(await supabase.from("lists").delete().eq("id", listId));
    // items are removed by ON DELETE CASCADE on items.list_id — no manual loop.
  },

  // ── items ────────────────────────────────────────────────────────────
  createItem: async (userId, listId, content) => {
    // Position is "next after the highest existing" — the app, not the DB,
    // owns this invariant (mirrors the Appwrite impl).
    const { data: tail } = await supabase
      .from("items")
      .select("position")
      .eq("list_id", listId)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();
    const nextPosition = tail ? tail.position + 1 : 0;

    const { data } = throwOn(
      await supabase
        .from("items")
        .insert({
          list_id: listId,
          user_id: userId,
          content,
          position: nextPosition,
        })
        .select()
        .single(),
    );
    return adaptItem(data);
  },

  updateItem: async (itemId, patch) => {
    const { data } = throwOn(
      await supabase
        .from("items")
        .update(patch)
        .eq("id", itemId)
        .select()
        .single(),
    );
    return adaptItem(data);
  },

  deleteItem: async (itemId) => {
    throwOn(await supabase.from("items").delete().eq("id", itemId));
  },

  // ── analytics ────────────────────────────────────────────────────────
  listAllItemsForUser: async (userId) => {
    // RLS already restricts to the caller; the explicit user_id filter is
    // defense-in-depth + makes the query plan stable.
    const { data } = throwOn(
      await supabase
        .from("items")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
    );
    return (data ?? []).map(adaptItem);
  },

  listAllListsForUser: async (userId) => {
    const { data } = throwOn(
      await supabase
        .from("lists")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
    );
    return (data ?? []).map(adaptList);
  },
};

export default api;
