import { useCallback, useEffect, useReducer, useState } from "react";
import api from "../api/api";

export const FetchState = {
  FETCH_INIT: 0,
  FETCH_SUCCESS: 1,
  FETCH_FAILURE: 2,
};

function fetchReducer(key) {
  return (state, action) => {
    switch (action.type) {
      case FetchState.FETCH_INIT:
        return { ...state, isLoading: true, isError: false };
      case FetchState.FETCH_SUCCESS:
        return {
          ...state,
          isLoading: false,
          isError: false,
          [key]: action.payload,
        };
      case FetchState.FETCH_FAILURE:
        return { ...state, isLoading: false, isError: true };
      default:
        return state;
    }
  };
}

// ── user/session ────────────────────────────────────────────────────────
export const useUser = () => {
  const [state, dispatch] = useReducer(fetchReducer("user"), {
    isLoading: true,
    isError: false,
    user: null,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      dispatch({ type: FetchState.FETCH_INIT });
      try {
        const account = await api.getAccount();
        if (!cancelled)
          dispatch({ type: FetchState.FETCH_SUCCESS, payload: account });
      } catch {
        if (!cancelled)
          dispatch({ type: FetchState.FETCH_SUCCESS, payload: null });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return [state, dispatch];
};

// ── analytics source: every list + item for the user ────────────────────
export const useStats = (userId) => {
  const [state, setState] = useState({
    isLoading: true,
    isError: false,
    lists: [],
    items: [],
  });
  const [bump, setBump] = useState(0);
  const refresh = useCallback(() => setBump((n) => n + 1), []);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      setState((s) => ({ ...s, isLoading: true, isError: false }));
      try {
        const [lists, items] = await Promise.all([
          api.listAllListsForUser(userId),
          api.listAllItemsForUser(userId),
        ]);
        if (!cancelled)
          setState({ isLoading: false, isError: false, lists, items });
      } catch {
        if (!cancelled)
          setState((s) => ({ ...s, isLoading: false, isError: true }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, bump]);

  return [state, refresh];
};

// ── dashboard source: lists + items grouped by listId ───────────────────
// One fetch powers both the active editor and the past-list cards' counts
// and previews, so we don't N+1 items per past card.
export const useDashboard = (userId) => {
  const [state, setState] = useState({
    isLoading: true,
    isError: false,
    lists: [],
    itemsByListId: {},
  });
  const [bump, setBump] = useState(0);
  const refresh = useCallback(() => setBump((n) => n + 1), []);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      setState((s) => ({ ...s, isLoading: true, isError: false }));
      try {
        const [lists, items] = await Promise.all([
          api.listAllListsForUser(userId),
          api.listAllItemsForUser(userId),
        ]);
        if (cancelled) return;
        const itemsByListId = {};
        for (const it of items) {
          if (!itemsByListId[it.listId]) itemsByListId[it.listId] = [];
          itemsByListId[it.listId].push(it);
        }
        // Sort items inside each list by position (ascending).
        Object.values(itemsByListId).forEach((arr) =>
          arr.sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),
        );
        setState({ isLoading: false, isError: false, lists, itemsByListId });
      } catch {
        if (!cancelled)
          setState((s) => ({ ...s, isLoading: false, isError: true }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, bump]);

  return [state, refresh];
};
