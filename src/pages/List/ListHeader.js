import { useEffect, useState } from "react";
import api from "../../api/api";
import { MOOD_OPTIONS, moodGlyph } from "./moods";

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const ListHeader = ({ list, onChange }) => {
  const [title, setTitle] = useState(list.title ?? "");
  const [note, setNote] = useState(list.note ?? "");
  const [mood, setMood] = useState(list.mood ?? "");

  useEffect(() => {
    setTitle(list.title ?? "");
    setNote(list.note ?? "");
    setMood(list.mood ?? "");
  }, [list.$id, list.title, list.note, list.mood]);

  const save = async (patch) => {
    try {
      await api.updateList(list.$id, patch);
      onChange?.();
    } catch (e) {
      // non-fatal; leave values and log
      // eslint-disable-next-line no-console
      console.warn("list update failed", e);
    }
  };

  return (
    <header className="space-y-3">
      <div className="text-sm text-gray-500">{formatDate(list.$createdAt)}</div>
      <input
        className="w-full text-3xl md:text-4xl font-semibold bg-transparent border-0 border-b border-transparent focus:border-gray-300 focus:ring-0 px-0"
        type="text"
        value={title}
        placeholder="Untitled list"
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => {
          if ((list.title ?? "") !== title) save({ title: title || null });
        }}
        maxLength={120}
      />
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden="true">
          {moodGlyph(mood)}
        </span>
        <input
          className="flex-1 text-sm bg-transparent border-0 border-b border-transparent focus:border-gray-300 focus:ring-0 px-0"
          type="text"
          list="mood-options"
          value={mood}
          placeholder="mood (e.g. calm, grateful)"
          onChange={(e) => setMood(e.target.value)}
          onBlur={() => {
            if ((list.mood ?? "") !== mood) save({ mood: mood || null });
          }}
          maxLength={40}
        />
        <datalist id="mood-options">
          {MOOD_OPTIONS.map((m) => (
            <option key={m.value} value={m.value} />
          ))}
        </datalist>
      </div>
      <textarea
        className="w-full text-sm text-gray-700 bg-transparent border-0 focus:ring-0 resize-none px-0"
        rows={2}
        value={note}
        placeholder="Add a note (optional)"
        onChange={(e) => setNote(e.target.value)}
        onBlur={() => {
          if ((list.note ?? "") !== note) save({ note: note || null });
        }}
        maxLength={1000}
      />
    </header>
  );
};

export default ListHeader;
