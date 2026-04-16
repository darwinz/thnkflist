import { Link, useParams } from "react-router-dom";
import { moodGlyph } from "./moods";

function groupLabel(iso) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(d, today)) return "Today";
  if (sameDay(d, yesterday)) return "Yesterday";

  const thisYear = d.getFullYear() === today.getFullYear();
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: thisYear ? undefined : "numeric",
  });
}

function entryLabel(list) {
  if (list.title && list.title.trim()) return list.title;
  const d = new Date(list.$createdAt);
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

const HistoryRail = ({ lists, itemsByListId = {} }) => {
  const { listId } = useParams();

  if (!lists || lists.length === 0) {
    return (
      <p className="text-sm text-gray-500 px-2">
        Your past lists will appear here.
      </p>
    );
  }

  const groups = [];
  let currentGroup = null;
  for (const list of lists) {
    const label = groupLabel(list.$createdAt);
    if (!currentGroup || currentGroup.label !== label) {
      currentGroup = { label, entries: [] };
      groups.push(currentGroup);
    }
    currentGroup.entries.push(list);
  }

  return (
    <nav aria-label="List history" className="space-y-6">
      {groups.map((g) => (
        <div key={g.label}>
          <h3 className="text-xs uppercase tracking-wide text-gray-400 mb-2 px-2">
            {g.label}
          </h3>
          <ul className="space-y-1">
            {g.entries.map((list) => {
              const active = list.$id === listId;
              const count = itemsByListId[list.$id] ?? null;
              return (
                <li key={list.$id}>
                  <Link
                    to={`/lists/${list.$id}`}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm ${
                      active
                        ? "bg-gray-900 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span aria-hidden="true" className="w-5 text-center">
                      {list.mood ? moodGlyph(list.mood) : "•"}
                    </span>
                    <span className="flex-1 truncate">{entryLabel(list)}</span>
                    {count !== null && (
                      <span
                        className={`text-xs ${
                          active ? "text-gray-300" : "text-gray-400"
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
};

export default HistoryRail;
