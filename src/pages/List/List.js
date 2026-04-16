import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import api from "../../api/api";
import {
  FetchState,
  useCurrentList,
  useList,
  useLists,
} from "../../hooks";
import Alert from "../Alert/Alert";
import HistoryRail from "./HistoryRail";
import ListHeader from "./ListHeader";
import ListItem from "./ListItem";
import ListItemInput from "./ListItemInput";
import NewListButton from "./NewListButton";

const TopNav = ({ onLogout }) => (
  <header className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-gray-100">
    <Link to="/lists" className="text-xl font-bold tracking-tight">
      Thnkflist
    </Link>
    <div className="flex items-center gap-3">
      <Link
        to="/stats"
        className="text-sm font-medium text-gray-700 hover:text-gray-900"
      >
        Stats
      </Link>
      <button
        type="button"
        onClick={onLogout}
        className="text-sm font-medium text-gray-700 hover:text-gray-900"
      >
        Log out
      </button>
    </div>
  </header>
);

const EmptyState = ({ userId, onCreated }) => (
  <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 gap-4">
    <h1 className="text-3xl md:text-4xl font-semibold">
      Start your first list
    </h1>
    <p className="text-gray-600 max-w-md">
      A gratitude list is a short collection of things you're thankful for right
      now. Make as many as you like — one today, another tomorrow, two an hour
      apart.
    </p>
    <NewListButton userId={userId} onCreated={onCreated} />
  </div>
);

const List = ({ user, dispatch }) => {
  const { listId: paramListId } = useParams();
  const [listsState, refreshLists] = useLists(user.$id);
  const [currentState, refreshCurrent] = useCurrentList(user.$id);

  const listId = paramListId ?? currentState.currentListId;
  const [detailState, refreshDetail] = useList(listId);

  const [showHistory, setShowHistory] = useState(false);

  // Preload item counts for the rail so each entry can show "(N)".
  const itemsByListId = Object.fromEntries(
    (listsState.lists ?? []).map((l) => [l.$id, undefined]),
  );

  const refreshAll = () => {
    refreshLists();
    refreshDetail();
    refreshCurrent();
  };

  const handleLogout = async () => {
    dispatch({ type: FetchState.FETCH_INIT });
    try {
      await api.deleteCurrentSession();
      dispatch({ type: FetchState.FETCH_SUCCESS, payload: null });
    } catch {
      dispatch({ type: FetchState.FETCH_FAILURE });
    }
  };

  const handleDeleteList = async () => {
    if (!detailState.list) return;
    const ok = window.confirm("Delete this list and all its items?");
    if (!ok) return;
    await api.deleteList(detailState.list.$id);
    refreshAll();
  };

  const noLists =
    !listsState.isLoading && (listsState.lists ?? []).length === 0;

  const hasChosenList = Boolean(paramListId);

  // Canonicalize /lists to /lists/:currentListId once we know it.
  if (
    !hasChosenList &&
    currentState.currentListId &&
    currentState.currentListId !== listId
  ) {
    return <Navigate to={`/lists/${currentState.currentListId}`} replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav onLogout={handleLogout} />

      <div className="flex-1 flex">
        {/* Center pane */}
        <main className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-4 md:px-8 py-8">
          {listsState.isError && (
            <Alert color="red" message="Couldn't load your lists." />
          )}

          {noLists ? (
            <EmptyState userId={user.$id} onCreated={refreshAll} />
          ) : !listId ? (
            <div className="flex-1" />
          ) : detailState.isError ? (
            <Alert color="red" message="Couldn't load this list." />
          ) : !detailState.list ? (
            <div className="text-gray-500">Loading…</div>
          ) : (
            <>
              <ListHeader list={detailState.list} onChange={refreshLists} />

              <section className="mt-6">
                <ListItemInput
                  userId={user.$id}
                  listId={detailState.list.$id}
                  onAdded={refreshDetail}
                />
                <ul>
                  {detailState.items.map((item) => (
                    <ListItem
                      key={item.$id}
                      item={item}
                      onChanged={refreshDetail}
                    />
                  ))}
                </ul>
              </section>

              <div className="mt-10 flex items-center gap-3">
                <NewListButton
                  userId={user.$id}
                  onCreated={refreshAll}
                />
                <button
                  type="button"
                  onClick={handleDeleteList}
                  className="text-sm text-gray-500 hover:text-red-600"
                >
                  Delete this list
                </button>
              </div>
            </>
          )}

          <button
            type="button"
            onClick={() => setShowHistory(true)}
            className="md:hidden fixed bottom-4 right-4 py-2 px-4 rounded-full shadow-md bg-gray-900 text-white text-sm"
            aria-label="Open history"
          >
            History
          </button>
        </main>

        {/* History rail (desktop) */}
        <aside className="hidden md:block w-64 border-l border-gray-100 px-3 py-8 overflow-y-auto">
          <HistoryRail
            lists={listsState.lists ?? []}
            itemsByListId={itemsByListId}
          />
        </aside>

        {/* History drawer (mobile) */}
        {showHistory && (
          <div className="md:hidden fixed inset-0 z-30 flex">
            <div
              className="flex-1 bg-black/40"
              onClick={() => setShowHistory(false)}
              aria-hidden="true"
            />
            <aside className="w-72 bg-white border-l border-gray-100 px-3 py-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="text-sm font-semibold">History</h2>
                <button
                  type="button"
                  onClick={() => setShowHistory(false)}
                  aria-label="Close history"
                  className="text-gray-500"
                >
                  ✕
                </button>
              </div>
              <HistoryRail
                lists={listsState.lists ?? []}
                itemsByListId={itemsByListId}
              />
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

export default List;
