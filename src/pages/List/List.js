import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import api from "../../api/api";
import { FetchState, useDashboard } from "../../hooks";
import LayoutLibrary from "../../design/LayoutLibrary";
import LayoutDesk from "../../design/LayoutDesk";
import LayoutAlmanac from "../../design/LayoutAlmanac";
import SettingsPanel from "../../design/SettingsPanel";
import { useThemePrefs } from "../../design/theme";

const EmptyState = ({ onCreate, prefs }) => (
  <div
    style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      background: "var(--paper)",
      textAlign: "center",
    }}
  >
    <div style={{ maxWidth: 480 }}>
      <h1
        style={{
          font: "300 56px/1.05 var(--font-serif)",
          letterSpacing: "-0.03em",
          color: "var(--ink)",
          margin: 0,
        }}
      >
        small things,
        <br />
        <span style={{ fontStyle: "italic", color: "var(--ink-soft)" }}>kept.</span>
      </h1>
      <p
        style={{
          font: "italic 400 15px/1.6 var(--font-serif)",
          color: "var(--ink-soft)",
          marginTop: 20,
        }}
      >
        Start a new list to begin. Make as many as you like — one today, another
        tomorrow, two an hour apart.
      </p>
      <button
        type="button"
        onClick={onCreate}
        style={{
          marginTop: 28,
          font: "500 14px/1 var(--font-sans)",
          padding: "12px 22px",
          borderRadius: "var(--r-full)",
          background: "var(--ink)",
          color: "var(--paper)",
          border: 0,
          cursor: "pointer",
        }}
      >
        ＋ Start a new list
      </button>
      <div style={{ marginTop: 24, font: "400 12px/1 var(--font-sans)", color: "var(--ink-mute)" }}>
        layout: {prefs.layout}
      </div>
    </div>
  </div>
);

const List = ({ user, dispatch }) => {
  const navigate = useNavigate();
  const { listId: paramListId } = useParams();
  const [{ isLoading, isError, lists, itemsByListId }, refresh] = useDashboard(user.$id);
  const [prefs, setPrefs] = useThemePrefs();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const selectedId = paramListId ?? lists[0]?.$id ?? null;
  const selected = lists.find((l) => l.$id === selectedId) || null;
  const items = selectedId ? itemsByListId[selectedId] ?? [] : [];

  // If we navigated to /lists and a list exists, canonicalize the URL once.
  useEffect(() => {
    if (!paramListId && lists.length > 0) {
      navigate(`/lists/${lists[0].$id}`, { replace: true });
    }
  }, [paramListId, lists, navigate]);

  const handleLogout = async () => {
    dispatch({ type: FetchState.FETCH_INIT });
    try {
      await api.deleteCurrentSession();
      dispatch({ type: FetchState.FETCH_SUCCESS, payload: null });
    } catch {
      dispatch({ type: FetchState.FETCH_FAILURE });
    }
  };

  const handleNew = async () => {
    if (creating) return;
    setCreating(true);
    try {
      const list = await api.createList(user.$id);
      refresh();
      navigate(`/lists/${list.$id}`);
    } catch (e) {
      console.warn("create list failed", e);
    } finally {
      setCreating(false);
    }
  };

  const handleSelect = (id) => {
    navigate(`/lists/${id}`);
  };

  const handleShowStats = () => navigate("/stats");

  const updateList = async (patch) => {
    if (!selectedId) return;
    try {
      await api.updateList(selectedId, patch);
      refresh();
    } catch (e) {
      console.warn("list update failed", e);
    }
  };

  const addItem = async (content) => {
    if (!selectedId) return;
    try {
      await api.createItem(user.$id, selectedId, content);
      refresh();
    } catch (e) {
      console.warn("add item failed", e);
    }
  };

  const updateItem = async (itemId, content) => {
    try {
      await api.updateItem(itemId, { content });
      refresh();
    } catch (e) {
      console.warn("item update failed", e);
    }
  };

  const removeItem = async (itemId) => {
    try {
      await api.deleteItem(itemId);
      refresh();
    } catch (e) {
      console.warn("item delete failed", e);
    }
  };

  if (isLoading && lists.length === 0) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--paper)",
        }}
      >
        <div style={{ font: "italic 400 14px/1 var(--font-serif)", color: "var(--ink-mute)" }}>
          loading…
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--paper)",
          padding: 24,
        }}
      >
        <div
          style={{
            font: "400 14px/1.5 var(--font-sans)",
            color: "var(--ink-soft)",
            textAlign: "center",
          }}
        >
          Couldn't load your lists.
          <br />
          <button
            type="button"
            onClick={refresh}
            style={{
              marginTop: 12,
              font: "500 13px/1 var(--font-sans)",
              padding: "8px 14px",
              borderRadius: "var(--r-full)",
              background: "var(--ink)",
              color: "var(--paper)",
              border: 0,
              cursor: "pointer",
            }}
          >
            retry
          </button>
        </div>
      </div>
    );
  }

  if (lists.length === 0) {
    return (
      <>
        <EmptyState onCreate={handleNew} prefs={prefs} />
        {settingsOpen && (
          <SettingsPanel prefs={prefs} setPrefs={setPrefs} onClose={() => setSettingsOpen(false)} />
        )}
      </>
    );
  }

  if (paramListId && lists.length > 0 && !selected && !isLoading) {
    return <Navigate to={`/lists/${lists[0].$id}`} replace />;
  }

  const editorProps = selected
    ? {
        list: selected,
        items,
        bodyType: prefs.bodyType,
        moodTreatment: prefs.moodTreatment,
        onTitleChange: (v) => updateList({ title: v }),
        onMoodChange: (v) => updateList({ mood: v }),
        onNoteChange: (v) => updateList({ note: v }),
        onAddItem: addItem,
        onUpdateItem: updateItem,
        onRemoveItem: removeItem,
      }
    : null;

  const layoutProps = {
    lists,
    itemsByListId,
    selectedId,
    onSelect: handleSelect,
    onNew: handleNew,
    onShowStats: handleShowStats,
    onLogout: handleLogout,
    onOpenSettings: () => setSettingsOpen(true),
    editorProps,
  };

  const Layout =
    prefs.layout === "desk"
      ? LayoutDesk
      : prefs.layout === "almanac"
        ? LayoutAlmanac
        : LayoutLibrary;

  return (
    <>
      <Layout {...layoutProps} />
      {settingsOpen && (
        <SettingsPanel
          prefs={prefs}
          setPrefs={setPrefs}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </>
  );
};

export default List;
