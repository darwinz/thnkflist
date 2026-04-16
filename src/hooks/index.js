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

// ── all user's lists (history) ──────────────────────────────────────────
export const useLists = (userId) => {
  const [state, dispatch] = useReducer(fetchReducer("lists"), {
    isLoading: false,
    isError: false,
    lists: [],
  });
  const [bump, setBump] = useState(0);
  const refresh = useCallback(() => setBump((n) => n + 1), []);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      dispatch({ type: FetchState.FETCH_INIT });
      try {
        const docs = await api.listAllListsForUser(userId);
        if (!cancelled)
          dispatch({ type: FetchState.FETCH_SUCCESS, payload: docs });
      } catch (e) {
        if (!cancelled) dispatch({ type: FetchState.FETCH_FAILURE });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, bump]);

  return [state, refresh];
};

// ── single list + its items ─────────────────────────────────────────────
export const useList = (listId) => {
  const [state, setState] = useState({
    isLoading: false,
    isError: false,
    list: null,
    items: [],
  });
  const [bump, setBump] = useState(0);
  const refresh = useCallback(() => setBump((n) => n + 1), []);

  useEffect(() => {
    if (!listId) {
      setState({ isLoading: false, isError: false, list: null, items: [] });
      return;
    }
    let cancelled = false;
    (async () => {
      setState((s) => ({ ...s, isLoading: true, isError: false }));
      try {
        const [list, items] = await Promise.all([
          api.getList(listId),
          api.listItems(listId),
        ]);
        if (cancelled) return;
        setState({
          isLoading: false,
          isError: false,
          list,
          items: items.documents,
        });
      } catch {
        if (!cancelled)
          setState((s) => ({ ...s, isLoading: false, isError: true }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [listId, bump]);

  return [state, refresh];
};

// ── newest list (for "current list" convenience) ────────────────────────
export const useCurrentList = (userId) => {
  const [state, setState] = useState({
    isLoading: true,
    isError: false,
    currentListId: null,
  });
  const [bump, setBump] = useState(0);
  const refresh = useCallback(() => setBump((n) => n + 1), []);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      setState((s) => ({ ...s, isLoading: true, isError: false }));
      try {
        const page = await api.listLists(userId, { limit: 1 });
        if (cancelled) return;
        setState({
          isLoading: false,
          isError: false,
          currentListId: page.documents[0]?.$id ?? null,
        });
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

// ── analytics source: every list + item for the user ────────────────────
export const useStats = (userId) => {
  const [state, setState] = useState({
    isLoading: true,
    isError: false,
    lists: [],
    items: [],
  });

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
  }, [userId]);

  return [state];
};
